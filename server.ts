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
        // Remove 55 prefix if it's a Brazilian number with 12+ digits
        if (cleanTo.startsWith('55') && cleanTo.length > 10) {
          cleanTo = cleanTo.substring(2);
        }
        
        // Handle token if it contains 'hashS=' prefix or similar
        const cleanToken = token.startsWith('hashS=') ? token.split('hashS=')[1] : token;

        const paths = [
          "/api/simpleSend.do",
          "/api/sendSms.do",
          "/api/sendEnviroment.do"
        ];

        let lastError = null;
        for (const path of paths) {
          for (const protocol of ["http", "https"]) {
            const apiUrl = `${protocol}://www.facilitamovel.com.br${path}`;
            try {
              console.log(`[REAL SMS] Trying Facilita API: ${apiUrl} (User: ${user}, Dest: ${cleanTo})`);
              const response = await axios.get(apiUrl, {
                params: {
                  user: user,
                  password: password,
                  destinatario: cleanTo,
                  msg: message,
                  externo: cleanToken
                },
                timeout: 8000 // Increased timeout
              });
              
              const responseData = String(response.data);
              console.log(`[REAL SMS] Facilita Response (${apiUrl}):`, responseData);
              
              // Facilita OK responses usually start with "OK;" or just "OK"
              if (responseData.toUpperCase().includes("OK") || responseData.toUpperCase().includes("SUCESSO")) {
                return res.json({ success: true, data: responseData });
              } else if (responseData.trim() !== "" && !responseData.includes("404")) {
                // If it's a non-empty, non-404 response, it's a specific API error (auth/balance)
                return res.json({ success: false, error: responseData });
              }
            } catch (error: any) {
              console.warn(`[REAL SMS] Endpoint ${apiUrl} failed:`, error.message);
              lastError = error;
            }
          }
        }
        
        return res.status(500).json({ 
          success: false, 
          error: "Não foi possível conectar com os servidores da Facilita Móvel. Verifique suas credenciais e saldo." 
        });
      }

      return res.status(501).json({ 
        success: false, 
        error: `A integração com ${provider} ainda não está ativa nesta versão (Apenas Facilita Móvel está funcional).` 
      });
      
    } catch (error: any) {
      console.error("Error sending SMS:", error.message);
      return res.status(500).json({ success: false, error: error.message });
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
