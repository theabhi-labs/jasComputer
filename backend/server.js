import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose'; // ✅ Added missing import
import EnvValidator from './src/config/envValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment specific .env file
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : process.env.NODE_ENV === 'staging'
    ? '.env.staging'
    : '.env.development';

dotenv.config({ path: envFile }); // ✅ Fixed: actually loads the correct env file

// Validate environment variables
EnvValidator.validate();

import connectDB from './src/config/db.js';
import app from './src/app.js';

const PORT = process.env.PORT || 10000;

connectDB();

const server = app.listen(PORT, () => {
  console.log(`
  ════════════════════════════════════════════════════════════
  🚀 Coaching Management System Backend Started!
  ════════════════════════════════════════════════════════════
  📡 Server: http://localhost:${PORT}
  🌍 Environment: ${EnvValidator.get('NODE_ENV')}
  📅 Started: ${new Date().toLocaleString()}
  📁 Uploads: ${path.join(__dirname, 'uploads')}
  ════════════════════════════════════════════════════════════
  `);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n🛑 Received shutdown signal. Closing server...');

  server.close(async () => {
    console.log('✅ HTTP server closed');
    await mongoose.connection.close(); // ✅ Now works with the import above
    console.log('✅ Database connection closed');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  gracefulShutdown();
});