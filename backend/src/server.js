import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import toolRoutes from './routes/toolRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const isProd = process.env.NODE_ENV === 'production';

// --- Global middleware ---
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'student-tools-backend' });
});

// --- Temporary DB diagnostic (reports what the server actually loaded) ---
app.get('/api/health/db', async (req, res) => {
  const info = {
    host: process.env.DB_HOST || '(unset)',
    port: process.env.DB_PORT || '(unset)',
    user: process.env.DB_USER || '(unset)',
    name: process.env.DB_NAME || '(unset)',
    ssl: process.env.DB_SSL || '(unset)',
  };
  try {
    const pool = (await import('./config/db.js')).default;
    await pool.query('SELECT 1');
    res.json({ db: 'ok', ...info });
  } catch (e) {
    res.status(500).json({ db: 'error', code: e.code, message: e.message, ...info });
  }
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/tools', toolRoutes);

// --- In production, serve the built React app from the same server ---
if (isProd) {
  const dist = path.join(__dirname, '..', '..', 'frontend', 'dist');
  app.use(express.static(dist));
  // Any non-API route returns the SPA so client-side routing works.
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(dist, 'index.html'));
  });
}

// --- 404 (for unknown /api routes) + error handling ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   AI provider: ${process.env.AI_PROVIDER || 'mock'}`);
});
