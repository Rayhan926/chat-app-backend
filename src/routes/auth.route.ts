import express from 'express';
import { googleLogin } from '../controllers/auth.controller';
import { getUserController } from '../controllers/user.controller';
import auth from '../middleware/auth.middleware';

const authRoute = express.Router();

authRoute.post('/google-login', googleLogin);

authRoute.get('/get-user', auth, getUserController);

export default authRoute;
