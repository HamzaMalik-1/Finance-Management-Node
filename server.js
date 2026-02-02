import configuration from "./config/config.js"
import app from './app.js'
import { connectDB,sequelize } from './config/db.js';
import { User, Role,Modules,RoleHasPermission,UserSettings, Address, UserContact,Currency, Country, City } from './models/index.js';
// const {User}
const { PORT } = configuration;
// Database and server initialization
(async () => {
  try {
    await connectDB();
    const isDev = process.env.NODE_ENV !== 'production';
    await sequelize.sync({ alter: isDev }); 
    console.log(isDev ? '⚠️ Models synced with alter: true (Dev Mode)' : '✅ Models synced safely (Prod Mode)');
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Optional: Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1); // Exit with error code
  }
})();

// 