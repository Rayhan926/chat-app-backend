import express from 'express';
import { sendFriendRequest } from '../controllers/friend.controller';
import auth from '../middleware/auth.middleware';

const router = express.Router();

router.post('/send-friend-request', auth, sendFriendRequest);

const userRoute = router;
export default userRoute;
