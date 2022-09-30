import express from 'express';

const authRoute = express.Router();

authRoute.all('/', (req, res) => {
  res.send('Auth');
});

// authRoute.post('/google-login', googleLogin);

// authRoute.get('/get-user', auth, getUserController);

export default authRoute;
