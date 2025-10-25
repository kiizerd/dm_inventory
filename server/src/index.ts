import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import inventoryRoute from './routes/inventory';
import { inventoryCache } from './cache/inventoryCache';

const app = express();

app.use(
  express.json(),
  helmet(),
  cors({
    origin: process.env.CLIENT_ORIGIN || '*',
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/inventory', inventoryRoute);

const startServer = async () => {
  try {
    console.log('Starting server...');

    await inventoryCache.refresh();

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Error starting server: ', error);
    process.exit(1);
  }
};

startServer();
