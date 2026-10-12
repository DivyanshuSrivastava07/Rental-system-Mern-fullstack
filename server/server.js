import './configs/dns.js'

import express from "express";
import mongoose from 'mongoose';
import "dotenv/config";
import cors from "cors";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

const app = express()

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URI) {
  console.warn('⚠️  MONGODB_URI not set. Set it in .env or environment variables for auth/tasks.');
}
if (!JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not set. Set it in .env or environment variables for auth.');
}


// Connect to MongoDB
const connectDB = async () => {
  if (!MONGO_URI) return false;
  try {
    if (!MONGO_URI.startsWith('mongodb+srv://')) {
      console.error('Invalid MongoDB URI. Must start with mongodb+srv://'); // mongodb:// for local setup
      return false;
    }
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    console.log('✅ MongoDB connected');
    const dbName = mongoose.connection.db?.databaseName;
    if (dbName) console.log(`📊 Database: ${dbName}`);
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    return false;
  }
};

// Routes
app.use('/api/user', userRouter)
app.use('/api/owner', ownerRouter)
app.use('/api/bookings', bookingRouter)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server on http://localhost:${PORT}`);
  const ok = await connectDB();
  if (!ok) console.warn('⚠️  MongoDB not connected. Set MONGODB_URI for auth/tasks.');
});
