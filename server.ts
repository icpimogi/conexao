import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import * as dotenv from "dotenv";
import fs from "fs";

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

  // Public config for frontend (handles build-time secret injection issues)
  app.get("/api/config", (req, res) => {
    res.json({
      supabaseUrl: process.env.VITE_SUPABASE_URL || "",
      supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || ""
    });
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve static files and handle SPA fallback
    // We use __dirname if available, or process.cwd() as fallback
    const distPath = path.resolve(process.cwd(), "dist");
    
    console.log(`[SERVER] Production config:`);
    console.log(` - distPath: ${distPath}`);
    
    // Serve static files (assets, images, etc)
    app.use(express.static(distPath));
    
    // SPA Fallback: ALL other routes should serve index.html
    // This handles page refreshes on sub-routes like /contatos
    app.get("*", (req, res) => {
      // Check if the request is for an API (which should have been handled above)
      if (req.url.startsWith('/api/')) {
        return res.status(404).json({ error: "API route not found" });
      }

      const indexPath = path.join(distPath, "index.html");
      
      // We read the file and inject the environment variables at runtime
      // This ensures that even if build-time injection failed, the frontend gets the keys
      fs.readFile(indexPath, 'utf8', (err, html) => {
        if (err) {
          console.error(`[SERVER] Error reading index.html:`, err);
          return res.status(500).send("Error loading app");
        }

        const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";

        const injectedHtml = html.replace(
          '<head>',
          `<head>
    <script>
      window.__RUNTIME_CONFIG__ = {
        VITE_SUPABASE_URL: "${supabaseUrl}",
        VITE_SUPABASE_ANON_KEY: "${supabaseKey}"
      };
    </script>`
        );

        res.send(injectedHtml);
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
