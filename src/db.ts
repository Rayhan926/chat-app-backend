import mongoose from 'mongoose';

const connectDB = () => mongoose.connect(process.env.DB_URL!);
export default connectDB;
