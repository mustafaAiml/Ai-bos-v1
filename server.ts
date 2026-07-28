import express from "express";
import path from "path";
import fs from "fs";
import secrets from "crypto";
import { createServer as createViteServer } from "vite";
import {
  handleParseSpeech,
  handleScanBill,
  handleDailyInsights,
  handleShopSearch,
  handlePythonStatus,
  handleAIChat,
  handleProductImageSearch
} from './src/server/apiHandler';

// In-memory OTP and session stores for fast verification
const OTP_STORE: Record<string, { otp: string; expiresAt: number; resendAllowedAt: number; attempts: number }> = {};
const USER_STORE: Record<string, { email: string; name: string; phone?: string; passwordHash?: string }> = {
  "mustafakhan000143@gmail.com": {
    email: "mustafakhan000143@gmail.com",
    name: "Mustafa Khan",
    phone: "9876543210"
  }
};
const SESSION_STORE: Record<string, any> = {};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

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

  // Enterprise Auth API Endpoints
  app.post('/api/auth/send-otp', (req, res) => {
    const email = (req.body.email || '').toLowerCase().trim();
    if (!email || !email.includes('@')) {
      return res.status(400).json({ detail: 'Please enter a valid email address.' });
    }
    const now = Date.now();
    if (OTP_STORE[email] && now < OTP_STORE[email].resendAllowedAt) {
      const waitSec = Math.ceil((OTP_STORE[email].resendAllowedAt - now) / 1000);
      return res.status(429).json({ detail: `Please wait ${waitSec} seconds before requesting a new OTP.` });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    OTP_STORE[email] = {
      otp,
      expiresAt: now + 5 * 60 * 1000,
      resendAllowedAt: now + 60 * 1000,
      attempts: 0
    };

    return res.json({
      success: true,
      message: `Verification OTP sent to ${email}. Valid for 5 minutes.`,
      expires_in_seconds: 300,
      resend_cooldown_seconds: 60,
      debug_otp_preview: otp
    });
  });

  app.post('/api/auth/verify-otp', (req, res) => {
    const email = (req.body.email || '').toLowerCase().trim();
    const otp = (req.body.otp || '').trim();

    if (!OTP_STORE[email]) {
      return res.status(400).json({ detail: 'No active OTP request found. Please request a new OTP.' });
    }
    const record = OTP_STORE[email];
    if (Date.now() > record.expiresAt) {
      delete OTP_STORE[email];
      return res.status(400).json({ detail: 'OTP code has expired. Please request a new OTP.' });
    }
    if (record.attempts >= 5) {
      delete OTP_STORE[email];
      return res.status(429).json({ detail: 'Too many invalid attempts. Please request a new OTP.' });
    }
    if (record.otp !== otp) {
      record.attempts += 1;
      return res.status(400).json({ detail: 'Invalid OTP code. Please check and try again.' });
    }

    return res.json({ success: true, message: 'Email address verified successfully!' });
  });

  app.post('/api/auth/signup', (req, res) => {
    const email = (req.body.email || '').toLowerCase().trim();
    const { name, phone, password } = req.body;
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ detail: 'Valid email and password (min 6 characters) required.' });
    }

    const token = 'aibos_token_' + secrets.randomBytes(16).toString('hex');
    const user = {
      email,
      name: name || email.split('@')[0],
      phone: phone || '',
      isLoggedIn: true,
      token
    };
    USER_STORE[email] = user;
    SESSION_STORE[token] = user;
    if (OTP_STORE[email]) delete OTP_STORE[email];

    return res.json({ success: true, user });
  });

  app.post('/api/auth/login', (req, res) => {
    const email = (req.body.email || '').toLowerCase().trim();
    const token = 'aibos_token_' + secrets.randomBytes(16).toString('hex');

    const existingUser = USER_STORE[email] || {
      email,
      name: email.split('@')[0].toUpperCase(),
      phone: '+91 9876543210'
    };

    const user = {
      ...existingUser,
      isLoggedIn: true,
      token
    };
    USER_STORE[email] = user;
    SESSION_STORE[token] = user;

    return res.json({ success: true, user });
  });

  app.post('/api/auth/google-login', (req, res) => {
    const email = (req.body.email || '').toLowerCase().trim();
    const name = req.body.name || email.split('@')[0];
    const token = 'google_token_' + secrets.randomBytes(16).toString('hex');

    const user = {
      email,
      name,
      phone: req.body.phone || '',
      avatarUrl: req.body.avatar_url || '',
      isLoggedIn: true,
      token
    };
    USER_STORE[email] = user;
    SESSION_STORE[token] = user;

    return res.json({ success: true, user });
  });

  app.get('/api/auth/verify-session', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ detail: 'Unauthorized session.' });
    }
    const token = authHeader.replace('Bearer ', '').trim();
    if (!SESSION_STORE[token]) {
      return res.status(401).json({ detail: 'Session expired or invalid.' });
    }
    return res.json({ valid: true, user: SESSION_STORE[token] });
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

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const result = await handleAIChat(req.body);
      res.json(result);
    } catch (err: any) {
      console.error('API Error /ai/chat:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  app.post('/api/products/image-search', async (req, res) => {
    try {
      const result = await handleProductImageSearch(req.body);
      res.json(result);
    } catch (err: any) {
      console.error('API Error /products/image-search:', err);
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
