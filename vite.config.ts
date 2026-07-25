import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import {
  handleParseSpeech,
  handleScanBill,
  handleDailyInsights,
  handleShopSearch
} from './src/server/apiHandler';

function apiPlugin(): Plugin {
  return {
    name: 'api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          res.setHeader('Content-Type', 'application/json');

          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });

          req.on('end', async () => {
            try {
              const parsedBody = body ? JSON.parse(body) : {};

              if (req.url === '/api/ai/parse-speech') {
                const result = await handleParseSpeech(parsedBody);
                return res.end(JSON.stringify(result));
              } else if (req.url === '/api/ai/scan-bill') {
                const result = await handleScanBill(parsedBody);
                return res.end(JSON.stringify(result));
              } else if (req.url === '/api/ai/daily-insights') {
                const result = await handleDailyInsights(parsedBody);
                return res.end(JSON.stringify(result));
              } else if (req.url?.startsWith('/api/shops/search')) {
                const query = parsedBody.query || '';
                const result = await handleShopSearch(query, parsedBody.pincode);
                return res.end(JSON.stringify(result));
              }

              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Endpoint not found' }));
            } catch (err: any) {
              console.error('API Error:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
