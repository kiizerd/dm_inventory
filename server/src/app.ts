import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import inventoryRoute from './routes/inventory';
import newInventoryRoute from './routes/newInventory';

// IPs to reject outright, e.g. confirmed scrapers. Comma-separated in env.
const BLOCKED_IPS = new Set(
  (process.env.BLOCKED_IPS || '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean),
);

export function createApp() {
  const app = express();

  // Railway sits behind a proxy; trust it so req.ip/X-Forwarded-For reflect the real client.
  app.set('trust proxy', 1);

  app.use(
    express.json(),
    helmet(),
    cors({
      origin: process.env.CLIENT_ORIGIN || '*',
    }),
  );

  app.use('/api/', (req, res, next) => {
    console.log(
      `[api] ${req.method} ${req.originalUrl} ip=${req.ip} origin=${req.get('origin') || '-'} referer=${req.get('referer') || '-'} ua=${req.get('user-agent') || '-'}`,
    );
    if (req.ip && BLOCKED_IPS.has(req.ip)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  });

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });

  app.use('/api/', limiter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/inventory', inventoryRoute);
  app.use('/api/new-inventory', newInventoryRoute);

  return app;
}
