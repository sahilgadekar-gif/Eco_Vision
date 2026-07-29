const mongoose = require('mongoose');

/**
 * Connect to MongoDB.
 * Exits the process if connection fails.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 7+ no longer needs these flags, but keeping for compatibility
    });

    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️  MongoDB connection warning: ${error.message}`);
    console.log(`💡  Backend running in LocalStorage fallback mode. Start MongoDB daemon or set MONGO_URI in .env for database storage.`);
  }
};

module.exports = connectDB;
