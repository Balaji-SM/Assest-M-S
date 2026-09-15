const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.log('[Database] MONGO_URI not provided; relying on Supabase database services.');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`[Database Warning] MongoDB connection failed (${error.message}). Continuing with Supabase services...`);
  }
};

module.exports = connectDB;

