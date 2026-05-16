import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

async function startServer() {
  const app = express();
  // PORT fixed to 3000 as per environment constraints
  const PORT = 3000;

  app.use(express.json());

  console.log(`[SERVER] Starting in ${process.env.NODE_ENV || 'development'} mode`);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Routes
  app.post("/api/sms/send", async (req, res) => {
    console.log(`[SERVER] POST /api/sms/send received`);
    const { provider, config, to, message } = req.body;

    try {
      if (provider === 'facilita') {
        const user = String(config.senderId || '').trim();
        const password = String(config.password || '').trim();
        
        if (!user || !password) {
          return res.status(400).json({ success: false, error: "Credenciais Facilita (Usuário/Senha) não configuradas." });
        }

        // 1. Accent removal (JSON doesn't strictly need XML escaping, but normalization is good)
        const cleanMessage = message.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // 2. Comprehensive Phone Number Normalization for Brazil (Facilita prefers DDD + Number, no country code)
        let cleanTo = String(to || '').replace(/\D/g, '');
        
        // Remove country code if present
        if (cleanTo.startsWith('55')) cleanTo = cleanTo.slice(2);
        // Remove leading zero
        if (cleanTo.startsWith('0')) cleanTo = cleanTo.slice(1);
        
        // Facilita Móvel REST URL (JSON)
        // Using https as requested by the user previously
        const restUrl = "https://www.facilitamovel.com.br/api/simpleSendJson.ft";

        const payload = {
          phone: cleanTo,
          message: cleanMessage
        };

        console.log(`[FACILITA REST] Sending to ${cleanTo} via ${restUrl}`);

        const axiosConfig = {
          headers: {
            'Content-Type': 'application/json',
            'user': user,
            'password': password
          },
          timeout: 20000,
          validateStatus: (status: number) => true
        };

        try {
          const response = await axios.post(restUrl, payload, axiosConfig);
          console.log(`[FACILITA REST] Response status: ${response.status}`, response.data);

          // Facilita REST returns simple strings or JSON depending on the endpoint.
          // For .ft (JSON endpoints), it should be JSON.
          const data = response.data;
          
          // According to general Facilita logic:
          // For REST, success usually returns a specific code or structure.
          // Based on common REST implementations for Facilita:
          if (response.status === 200 && (data === '5' || data === 5 || (typeof data === 'object' && !data.error))) {
            return res.json({ success: true, data: data });
          } else {
            return res.status(400).json({ 
              success: false, 
              error: `Erro Facilita: ${JSON.stringify(data)}` 
            });
          }
        } catch (err: any) {
          console.error(`[FACILITA REST ERROR]`, err.message);
          return res.status(500).json({ success: false, error: `Erro de conexão Facilita REST: ${err.message}` });
        }
      }

      if (provider === 'zenvia') {
        const { apiKey: token } = config;
        const response = await axios.post("https://api.zenvia.com/v2/channels/sms/messages", {
          from: "ConexaoApp",
          to: to.replace(/\D/g, ''),
          contents: [{ type: "text", text: message }]
        }, {
          headers: { 'X-API-TOKEN': token }
        });
        return res.json({ success: true, data: response.data });
      }

      return res.status(501).json({ 
        success: false, 
        error: `Provedor ${provider} ainda não implementado.` 
      });
      
    } catch (error: any) {
      console.error("[SMS ERROR]", error.response?.data || error.message);
      return res.status(500).json({ 
        success: false, 
        error: error.response?.data?.message || error.message 
      });
    }
  });

  // WhatsApp Sending
  app.post("/api/whatsapp/send", async (req, res) => {
    const { platform, config, to, message } = req.body;

    try {
      if (platform === 'official') {
        const { accessToken, phoneNumberId } = config;
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
        return res.json({ success: true, data: response.data });
      }

      // Simulated for Session/QR
      console.log(`[WHATSAPP SIM] Sending to ${to}: ${message}`);
      return res.json({ success: true, simulated: true });
    } catch (error: any) {
      console.error("[WHATSAPP ERROR]", error.response?.data || error.message);
      return res.status(500).json({ 
        success: false, 
        error: error.response?.data?.error?.message || error.message 
      });
    }
  });

  // Diagnostic endpoint
  app.get("/api/diagnostics", async (req, res) => {
    const rawUrl = process.env.VITE_SUPABASE_URL || "";
    const rawKey = process.env.VITE_SUPABASE_ANON_KEY || "";
    
    // Normalize URL exactly like in frontend
    const supabaseUrl = rawUrl.trim().replace(/^["']|["']$/g, '').replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
    const supabaseKey = rawKey.trim().replace(/^["']|["']$/g, '');
    
    const diagnostics = {
      supabase: {
        url_configured: !!supabaseUrl && !supabaseUrl.includes('placeholder'),
        key_configured: !!supabaseKey && supabaseKey.length > 20,
        url_format_ok: supabaseUrl?.startsWith('https://'),
        url_detected: supabaseUrl.substring(0, 15) + "...",
        key_prefix: supabaseKey ? supabaseKey.substring(0, 8) + '...' : 'n/a',
        key_suffix: supabaseKey ? '...' + supabaseKey.substring(supabaseKey.length - 5) : 'n/a',
        url_has_rest_v1: rawUrl.includes('/rest/v1'),
        url_has_spaces: rawUrl.length !== rawUrl.trim().length,
      },
      env: {
        node_env: process.env.NODE_ENV,
      }
    };

    let connectionTest = "Não testado";
    if (diagnostics.supabase.url_configured && diagnostics.supabase.key_configured) {
      try {
        // Test connection by fetching project info
        // We use the REST endpoint. Supabase requires the 'apikey' header AND 'Authorization: Bearer <key>'
        const testUrl = `${supabaseUrl}/rest/v1/`;
        console.log(`[SERVER] Diagnostic: Testing Supabase at ${supabaseUrl}`);
        
        const response = await axios.get(testUrl, { 
          timeout: 5000,
          params: { apikey: supabaseKey }, // Pass in query
          headers: { 
            'apikey': supabaseKey, // Pass in header
            'Authorization': `Bearer ${supabaseKey}` // Pass as bearer
          } 
        });
        
        connectionTest = response.status === 200 ? "✅ Conectado com sucesso!" : `⚠️ Status inesperado: ${response.status}`;
      } catch (err: any) {
        const status = err.response?.status;
        const msg = err.response?.data?.message || err.response?.data?.error || err.message;
        
        console.error(`[SERVER] Supabase Diagnostic Failed: ${status} - ${msg}`);

        if (status === 404) {
          connectionTest = `❌ Erro 404: Endereço não encontrado. Verifique se a URL "${supabaseUrl}" em Settings/Secrets está exatamente correta (deve terminar em .co ou .com, sem /rest/v1).`;
        } else if (status === 401 || status === 403) {
          connectionTest = `❌ Erro ${status}: Chave Anon inválida ou sem permissão para este projeto. Verifique se copiou a chave 'anon public' correta do projeto ${supabaseUrl.split('//')[1]?.split('.')[0]}.`;
        } else {
          connectionTest = `❌ Falha na conexão (${status || 'timeout'}): ${msg}`;
        }
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
    // Production: serve static files and handle SPA fallback
    const distPath = path.resolve(process.cwd(), "dist");
    console.log(`[SERVER] Serving static files from: ${distPath}`);
    
    app.use(express.static(distPath));
    
    // SPA Fallback: Send index.html for any request that doesn't match an API or static file
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      console.log(`[SERVER] SPA Fallback: Serving index.html for ${req.url}`);
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error(`[SERVER] Error sending index.html:`, err);
          res.status(500).send("Error loading the application. Please try again later.");
        }
      });
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Conexão ICPI is running on port ${PORT}`);
    console.log(`[SERVER] Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[SERVER] Static files path: ${path.resolve(process.cwd(), "dist")}`);
  });

  server.on('error', (err) => {
    console.error('[SERVER] Critical error starting server:', err);
  });
}

startServer().catch(err => {
  console.error("[SERVER] Failed to start server:", err);
});
