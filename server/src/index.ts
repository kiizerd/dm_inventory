import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import inventoryRoute from './routes/inventory';

const app = express();

// Security headers
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*',
  }),
);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/inventory', inventoryRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
