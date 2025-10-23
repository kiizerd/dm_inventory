import express from 'express';
import cors from 'cors';
import inventoryRoute from './routes/inventory';

const app = express();

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
