import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/sms/send", async (req, res) => {
    const { provider, config, to, message } = req.body;

    try {
      if (provider === 'facilita') {
        const { senderId: user, password, apiKey: token } = config;
        let cleanTo = to.replace(/\D/g, '');
        
        // Some Facilita accounts require the 55 (Brazil country code)
        // Others specifically DON'T want it if the API is configured for local.
        // We will try both if the first fails.
        const recipients = [cleanTo];
        if (cleanTo.length === 11 && !cleanTo.startsWith('55')) {
          recipients.push('55' + cleanTo);
        } else if (cleanTo.startsWith('55')) {
          recipients.push(cleanTo.slice(2));
        }
        
        const cleanToken = token ? (token.startsWith('hashS=') ? token.split('hashS=')[1] : token) : '';

        const endpoints = [
          "https://www.facilitamovel.com.br/api/simpleSend.do",
          "http://www.facilitamovel.com.br/api/simpleSend.do",
          "http://www.facilitamovel.com.br/api/sendSms.do"
        ];

        const facilitaErrors: Record<string, string> = {
          "01": "Usuário ou senha inválidos",
          "02": "Saldo insuficiente",
          "03": "Conta inativa ou bloqueada",
          "04": "Destinatário inválido",
          "05": "Mensagem vazia",
          "06": "Destinatário na blacklist",
          "07": "Destinatário inválido",
          "08": "Mensagem muito longa",
          "12": "Token/Hash inválido (externo)",
        };

        let lastFullError = "";

        for (const apiUrl of endpoints) {
          for (const dest of recipients) {
            try {
              console.log(`[FACILITA] Attempting ${apiUrl} for ${dest}`);
              const response = await axios.get(apiUrl, {
                params: {
                  user: user,
                  password: password,
                  destinatario: dest,
                  msg: message,
                  externo: cleanToken
                },
                timeout: 8000
              });
              
              const rData = String(response.data).trim();
              console.log(`[FACILITA] Response (${apiUrl}):`, rData);
              
              if (rData.toUpperCase().includes("OK") || rData.toUpperCase().includes("SUCESSO")) {
                return res.json({ success: true, data: rData });
              }
              
              // If we got a numeric error code, map it
              const errorCode = rData.split(';')[1] || rData;
              if (facilitaErrors[errorCode]) {
                lastFullError = facilitaErrors[errorCode];
              } else {
                lastFullError = `Erro Facilita: ${rData}`;
              }

            } catch (e: any) {
              console.warn(`[FACILITA] Attempt failed:`, e.message);
              lastFullError = e.message;
            }
          }
        }
        
        return res.status(400).json({ 
          success: false, 
          error: lastFullError || "Falha na comunicação com Facilita Móvel. Verifique saldo e credenciais." 
        });
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
