import mongoose from 'mongoose';
import { DB_URL } from './config/contants';

const connectDB = () => mongoose.connect(DB_URL!);
export default connectDB;
