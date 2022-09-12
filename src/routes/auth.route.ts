import express from 'express';
import { googleLogin } from '../controllers/auth.controller';

const authRoute = express.Router();

authRoute.post('/google-login', googleLogin);

export default authRoute;
