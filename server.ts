import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import * as dotenv from "dotenv";
import { createClient, User } from "@supabase/supabase-js";
import cron from "node-cron";

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Load environment variables from .env file
dotenv.config();

async function startServer() {
  const app = express();
  // PORT fixed to 3000 as per environment constraints
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' })); // Increase limit for large restores

  // Middleware for API Authentication
  const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: "Token de autorização ausente." });
    }

    try {
      const token = authHeader.split(' ')[1];
      const supabase = getSupabase();
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        throw new Error("Token inválido ou expirado.");
      }

      // Append user info to request
      req.user = user;
      next();
    } catch (err: any) {
      return res.status(401).json({ success: false, error: err.message });
    }
  };

  console.log(`[SERVER] Starting in ${process.env.NODE_ENV || 'development'} mode`);

  const getSupabase = () => {
    let supabaseUrl = process.env.VITE_SUPABASE_URL || "";
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
    if (supabaseUrl.endsWith('/rest/v1') || supabaseUrl.endsWith('/rest/v1/')) {
      supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '');
    }
    return createClient(supabaseUrl, supabaseKey);
  };

  const sendSMS = async (provider: string, config: any, to: string, message: string) => {
    if (provider === 'facilita') {
      const user = String(config.senderId || process.env.FACILITA_USER || '').trim();
      const password = String(config.password || process.env.FACILITA_PASSWORD || '').trim();
      
      if (!user || !password) throw new Error("Credenciais Facilita não configuradas.");

      const cleanMessage = message.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      let cleanTo = String(to || '').replace(/\D/g, '');
      if (cleanTo.startsWith('55')) cleanTo = cleanTo.slice(2);
      if (cleanTo.startsWith('0')) cleanTo = cleanTo.slice(1);
      
      const restUrl = "https://www.facilitamovel.com.br/api/simpleSendJson.ft";
      const payload = { phone: cleanTo, message: cleanMessage };

      const response = await axios.post(restUrl, payload, {
        headers: { 'user': user, 'password': password },
        timeout: 20000,
        validateStatus: () => true
      });

      if (response.status === 200 && (response.data === '5' || response.data === 5 || (typeof response.data === 'object' && !response.data.error))) {
        return response.data;
      } else {
        throw new Error(`Erro Facilita: ${JSON.stringify(response.data)}`);
      }
    }

    if (provider === 'zenvia') {
      const apiKey = config.apiKey || config.token || process.env.ZENVIA_TOKEN;
      if (!apiKey) throw new Error("API Key Zenvia não configurada.");
      
      const response = await axios.post("https://api.zenvia.com/v2/channels/sms/messages", {
        from: "ConexaoApp",
        to: to.replace(/\D/g, ''),
        contents: [{ type: "text", text: message }]
      }, {
        headers: { 'X-API-TOKEN': apiKey }
      });
      return response.data;
    }

    throw new Error(`Provedor ${provider} não suportado para SMS automático.`);
  };

  const sendWhatsApp = async (platform: string, config: any, to: string, message: string) => {
    if (platform === 'official') {
      const accessToken = config.accessToken || process.env.WHATSAPP_TOKEN;
      const phoneNumberId = config.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
      
      if (!accessToken || !phoneNumberId) throw new Error("Credenciais WhatsApp Oficial ausentes.");

      const response = await axios.post(
        `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: to.replace(/\D/g, ''),
          type: "text",
          text: { body: message }
        },
        {
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    }

    // Simulated/Session logic (MVP)
    console.log(`[WHATSAPP SIM] Sending to ${to}: ${message}`);
    return { success: true, simulated: true };
  };

  const checkBirthdays = async () => {
    console.log("[CRON] Checking birthdays...");
    const supabase = getSupabase();
    let sentCount = 0;
    
    try {
      // 1. Get enabled birthday automation
      const { data: automation, error: autoError } = await supabase
        .from('automations')
        .select('*')
        .eq('type', 'birthday')
        .eq('enabled', true)
        .single();

      if (autoError || !automation) {
        console.log("[CRON] No enabled birthday automation found.");
        return 0;
      }

      // 2. Find contacts with birthday today
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      const { data: contacts, error: contactError } = await supabase
        .from('contacts')
        .select('*');

      if (contactError || !contacts) {
        console.error("[CRON] Error fetching contacts:", contactError);
        return 0;
      }

      const birthdayContacts = contacts.filter(c => {
        if (!c.birth_date) return false;
        const bDate = new Date(c.birth_date);
        return (bDate.getUTCMonth() + 1 === month && bDate.getUTCDate() === day);
      });

      console.log(`[CRON] Found ${birthdayContacts.length} birthday(s) today.`);

      const configuraEnv = {
        facilita: {
          senderId: process.env.FACILITA_USER,
          password: process.env.FACILITA_PASSWORD
        },
        zenvia: {
          token: process.env.ZENVIA_TOKEN
        }
      };

      const waConfig = {
        accessToken: process.env.WHATSAPP_TOKEN,
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID
      };

      const waPlatform = (waConfig.accessToken && waConfig.phoneNumberId) ? 'official' : 'session';
      const smsProvider = (configuraEnv.facilita.senderId && configuraEnv.facilita.password) ? 'facilita' : 'zenvia';
      const currentSmsConfig = smsProvider === 'facilita' ? configuraEnv.facilita : configuraEnv.zenvia;

      for (const contact of birthdayContacts) {
        const message = automation.message_template.replace('{name}', contact.name);
        
        // WhatsApp
        if (automation.channel === 'whatsapp' || automation.channel === 'both') {
          try {
            await sendWhatsApp(waPlatform, waConfig, contact.phone, message);
            await supabase.from('activities').insert({
              contact_id: contact.id,
              type: 'whatsapp',
              status: 'sent',
              content: `[AUTO-BIRTHDAY] ${message}`
            });
            sentCount++;
          } catch (err: any) {
            console.error(`[CRON WA] Failed for ${contact.name}:`, err.message);
          }
        }

        // SMS
        if (automation.channel === 'sms' || automation.channel === 'both') {
          try {
            await sendSMS(smsProvider, currentSmsConfig, contact.phone, message);
            await supabase.from('activities').insert({
              contact_id: contact.id,
              type: 'sms',
              status: 'sent',
              content: `[AUTO-BIRTHDAY] ${message}`
            });
            sentCount++;
          } catch (err: any) {
            console.error(`[CRON SMS] Failed for ${contact.name}:`, err.message);
          }
        }
      }

      await supabase.from('automations').update({ last_run: new Date().toISOString() }).eq('id', automation.id);
      return sentCount;

    } catch (err: any) {
      console.error("[CRON ERROR]", err.message);
      return 0;
    }
  };

  // Schedule to run at 08:30 AM every day
  cron.schedule("30 8 * * *", () => {
    checkBirthdays();
  });

  // API Routes
  app.post("/api/automations/run-birthday", authenticate, async (req, res) => {
    try {
      const count = await checkBirthdays();
      res.json({ success: true, count });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/sms/send", authenticate, async (req, res) => {
    console.log(`[SERVER] POST /api/sms/send received from user ${req.user?.id}`);
    const { provider, config, to, message } = req.body;

    try {
      const data = await sendSMS(provider, config, to, message);
      res.json({ success: true, data });
    } catch (error: any) {
      console.error("[SMS ERROR]", error.response?.data || error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // WhatsApp Sending
  app.post("/api/whatsapp/send", authenticate, async (req, res) => {
    const { platform, config, to, message } = req.body;

    try {
      const data = await sendWhatsApp(platform, config, to, message);
      return res.json({ success: true, data });
    } catch (error: any) {
      console.error("[WHATSAPP ERROR]", error.response?.data || error.message);
      return res.status(500).json({ 
        success: false, 
        error: error.response?.data?.error?.message || error.message 
      });
    }
  });

  // Backup Endpoint
  app.get("/api/backup", authenticate, async (req, res) => {
    try {
      // Security Check: Only Master can backup
      const supabase = getSupabase();
      const { data: profile } = await supabase.from('users').select('role').eq('id', req.user?.id).single();
      if (profile?.role !== 'master') {
        return res.status(403).json({ success: false, error: "Acesso negado. Apenas Master pode realizar backups." });
      }

      const tables = ['branches', 'users', 'tags', 'contacts', 'activities', 'automations'];
      const backupData: Record<string, any[]> = {};

      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
          console.error(`Backup error for table ${table}:`, error);
          backupData[table] = [];
        } else {
          backupData[table] = data || [];
        }
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=backup-${new Date().toISOString().split('T')[0]}.json`);
      res.json({
        version: "1.0",
        timestamp: new Date().toISOString(),
        data: backupData
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Restore Endpoint
  app.post("/api/restore", authenticate, async (req, res) => {
    let { data: backupData } = req.body;
    if (!backupData) {
      return res.status(400).json({ success: false, error: "Dados de backup ausentes." });
    }

    // Handle full backup object structure { version, timestamp, data }
    if (backupData.data && !Array.isArray(backupData.data)) {
      backupData = backupData.data;
    }

    try {
      const supabase = getSupabase();
      
      // Security Check: Only Master can restore
      const { data: profile } = await supabase.from('users').select('role').eq('id', req.user?.id).single();
      if (profile?.role !== 'master') {
        return res.status(403).json({ success: false, error: "Acesso negado. Apenas Master pode restaurar dados." });
      }

      const tables = ['branches', 'users', 'tags', 'contacts', 'activities', 'automations'];
      const results: Record<string, any> = {};

      // Restore should probably follow an order if there are foreign keys
      // Usually: branches -> tags -> users -> contacts -> activities -> automations
      const order = ['branches', 'tags', 'users', 'contacts', 'activities', 'automations'];

      for (const table of order) {
        if (backupData[table] && Array.isArray(backupData[table])) {
          console.log(`Restoring table ${table} with ${backupData[table].length} records...`);
          
          // Using upsert to handle existing records
          const { error } = await supabase.from(table).upsert(backupData[table]);
          
          if (error) {
            results[table] = { success: false, error: error.message };
          } else {
            results[table] = { success: true, count: backupData[table].length };
          }
        }
      }

      res.json({ success: true, results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Diagnostic endpoint
  app.get("/api/diagnostics", async (req, res) => {
    let supabaseUrl = process.env.VITE_SUPABASE_URL || "";
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
    
    // Sanitize URL if it contains /rest/v1
    if (supabaseUrl.endsWith('/rest/v1') || supabaseUrl.endsWith('/rest/v1/')) {
      supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '');
    }
    
    const diagnostics = {
      supabase: {
        url_configured: !!supabaseUrl && !supabaseUrl.includes('placeholder'),
        key_configured: !!supabaseKey && supabaseKey.length > 20,
        url_format_ok: supabaseUrl?.startsWith('https://'),
        url: supabaseUrl.substring(0, 15) + "..." // Show start for verification
      },
      env: {
        node_env: process.env.NODE_ENV,
        facilita_configured: !!(process.env.FACILITA_USER && process.env.FACILITA_PASSWORD),
        zenvia_configured: !!process.env.ZENVIA_TOKEN,
        whatsapp_configured: !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
      }
    };

    let connectionTest = "Não testado";
    if (diagnostics.supabase.url_configured && diagnostics.supabase.key_configured) {
      try {
        // Test connection by fetching project info or just checking if the URL responds
        const response = await axios.get(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`, { timeout: 5000 });
        connectionTest = response.status === 200 ? "✅ Conectado com sucesso!" : `❌ Erro: Status ${response.status}`;
      } catch (err: any) {
        connectionTest = `❌ Falha na conexão: ${err.message}. Verifique se a URL e a Anon Key estão corretas.`;
      }
    }

    res.json({ ...diagnostics, connectionTest });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
