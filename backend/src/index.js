import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import paperRoutes from './routes/paperRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();
const PORT = parseInt(process.env.PORT) || 5000;

app.use(express.json({ limit: '1mb' }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

const authLimiter = rateLimit({
  windowMs: 10 * 60_000,
  limit: 20,
  standardHeaders: 'draft-7',
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), ts: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/collections', collectionRoutes);

app.use(notFound);
app.use(errorHandler);

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('MONGO_URI is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

connectDB(uri)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[server] http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
