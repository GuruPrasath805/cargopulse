import app from './app';
import { config } from './config';
import { checkDatabaseConnection } from './db/prisma';

const startServer = async () => {
  // Check database connectivity
  await checkDatabaseConnection();

  app.listen(config.port, () => {
    console.log(`
========================================================================
   🚚 CARGOPULSE — SUPPLY CHAIN & LOGISTICS MANAGEMENT PLATFORM
========================================================================
   Backend API Server running at: http://localhost:${config.port}
   Health check:                  http://localhost:${config.port}/api/health
   Client CORS Origin:            ${config.clientUrl}
   Mode:                          ${config.nodeEnv.toUpperCase()}
========================================================================
    `);
  });
};

startServer().catch(err => {
  console.error('[CargoPulse Server Startup Failed]:', err);
  process.exit(1);
});
