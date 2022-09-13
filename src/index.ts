import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import connectDB from './db';
import authRoute from './routes/auth.route';
import conversationRoute from './routes/conversation.route';
import userRoute from './routes/user.route';
import { expressErrorMiddleware } from './utils';
// config dot env
dotenv.config();

// initialize app
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// config cors
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello');
});

// auth routes
app.use('/auth', authRoute);
// conversation routes
app.use('/conversations', conversationRoute);
// user routes
app.use('/user', userRoute);

// error middleware
app.use(expressErrorMiddleware);

const port = process.env.PORT || 8080;

connectDB().then(() => {
  console.log('Database connection successfull');
  app.listen(port, () => console.log(`Server running on port http://localhost:${port}`));
});
