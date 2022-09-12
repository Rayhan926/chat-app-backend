import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import connectDB from './db';
import authRoute from './routes/auth.route';
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
app.use(authRoute);

// error middleware
app.use(expressErrorMiddleware);

const port = process.env.PORT || 8080;

connectDB().then(() => {
  console.log('Database connection successfull');
  app.listen(port, () => console.log(`Server running on port http://localhost:${port}`));
});
