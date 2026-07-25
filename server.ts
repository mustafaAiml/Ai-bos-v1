import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import {
  handleParseSpeech,
  handleScanBill,
  handleDailyInsights,
  handleShopSearch,
  handlePythonStatus
} from './src/server/apiHandler';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // Python Engine Status Endpoint
  app.get('/api/python/status', async (req, res) => {
    try {
      const status = await handlePythonStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ status: 'error', error: err.message });
    }
  });

  // API Endpoints using Python Agent + Gemini 2.5 Flash
  app.post('/api/ai/parse-speech', async (req, res) => {
    try {
      const result = await handleParseSpeech(req.body);
      res.json(result);
    } catch (err: any) {
      console.error('API Error /parse-speech:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  app.post('/api/ai/scan-bill', async (req, res) => {
    try {
      const result = await handleScanBill(req.body);
      res.json(result);
    } catch (err: any) {
      console.error('API Error /scan-bill:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  app.post('/api/ai/daily-insights', async (req, res) => {
    try {
      const result = await handleDailyInsights(req.body);
      res.json(result);
    } catch (err: any) {
      console.error('API Error /daily-insights:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  app.post('/api/shops/search', async (req, res) => {
    try {
      const result = await handleShopSearch(req.body.query, req.body.pincode);
      res.json(result);
    } catch (err: any) {
      console.error('API Error /shops/search:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // Serve static files if dist/index.html exists (production deployment)
  const distPath = path.join(process.cwd(), 'dist');
  const indexHtmlPath = path.join(distPath, 'index.html');

  if (fs.existsSync(indexHtmlPath)) {
    app.use(express.static(distPath));
    app.use((req, res) => {
      res.sendFile(indexHtmlPath);
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
