import { createApp } from './app';
import { inventoryCache } from './cache/inventoryCache';

const app = createApp();

const startServer = async () => {
  try {
    console.log('Starting server...');

    void inventoryCache.refresh();

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Error starting server: ', error);
    process.exit(1);
  }
};

startServer();
