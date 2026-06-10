const mongoose = require('mongoose');
const startLiveClassCron = require('../utils/liveClassStatusCron');

// Import logger (optional)
let logger;
try {
  logger = require('../utils/logger');
} catch (error) {
  logger = {
    info: console.log,
    error: console.error,
  };
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`📦 MongoDB Connected: ${conn.connection.host}`);

     // ✅ START CRON HERE
    startLiveClassCron();

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.info('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;