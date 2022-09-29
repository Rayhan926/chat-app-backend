import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
// import formidableMiddleware from 'express-formidable';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import connectDB from './db';
import authRoute from './routes/auth.route';
import conversationRoute from './routes/conversation.route';
import userRoute from './routes/user.route';
import { expressErrorMiddleware } from './utils';

// initialize app
const app = express();

// config dot env
dotenv.config();

// config cors
app.use(cors());

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// http server
const httpServer = http.createServer(app);

// init io
const io = new Server(httpServer, {
  cors: {
    // origin: process.env.CLIENT_BASE_URL,
    origin: '*',
  },
});

app.use((req: any, res, next) => {
  req.io = io;
  next();
});

app.all('/', (req, res) => {
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
// socket on connection
io.on('connection', (socket) => {
  console.log(`New connection ${socket.id}`);

  socket.on('join', (data) => {
    socket.join(data.id);
    // axios
    //   .post(
    //     getApiFullPath('/user/update-socket-id'),
    //     {
    //       socketId: socket.id,
    //     },
    //     {
    //       headers: {
    //         authorization: data.token,
    //       },
    //     }
    //   )
    //   // .then((res) => console.log(res.data))
    //   .catch(console.log);
  });

  socket.on('saw-message', (data) => {
    socket.to(data?.sawUserId).emit('seen-messages', {
      seenBy: data?.sawBy,
    });
  });

  socket.on('typing', (data) => {
    socket.to(data?.to).emit('typing', {
      typingStatus: data?.typingStatus,
      from: data?.from,
    });
  });

  socket.on('disconnect', () => {
    // axios
    //   .post(getApiFullPath('/user/remove-socket-id'), {
    //     socketId: socket.id,
    //   })
    //   // .then((res) => console.log(res.data))
    //   .catch(console.log);
  });
});

connectDB().then(() => {
  console.log('Database connection successfull');
  httpServer.listen(port, () => console.log(`Server running on port http://localhost:${port}`));
});
