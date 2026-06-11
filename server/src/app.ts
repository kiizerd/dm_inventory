import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import inventoryRoute from './routes/inventory';

export function createApp() {
  const app = express();

  app.use(
    express.json(),
    helmet(),
    cors({
      origin: process.env.CLIENT_ORIGIN || '*',
    }),
  );

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });

  app.use('/api/', limiter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/inventory', inventoryRoute);

  return app;
}
