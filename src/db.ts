import mongoose from 'mongoose';

// const connectDB = () => mongoose.connect(process.env.DB_URL!);
const connectDB = () =>
  mongoose.connect(
    'mongodb+srv://saymon:saymon@cluster0.rzqxyf6.mongodb.net/chat-app?retryWrites=true&w=majority'
  );
export default connectDB;
