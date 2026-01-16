import mongoose from 'mongoose';
 

export default async function connectDB() {
  try {
    await mongoose.connect("mongodb+srv://ragibnehalmahi50:maPUGc9SVGfevxA6@cluster0.k7pv1lg.mongodb.net/local-guide?retryWrites=true&w=majority&appName=Cluster0");
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error', err);
    process.exit(1);
  }
}
