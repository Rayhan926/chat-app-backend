/* eslint-disable prettier/prettier */
import express from 'express';
import {
    acceptFriendRequest,
    getFriendRequests,
    sendFriendRequest
} from '../controllers/user.controller';
import auth from '../middleware/auth.middleware';

const router = express.Router();

router.use(auth);

router.post('/friend-request', auth, sendFriendRequest);
router.get('/friend-request', auth, getFriendRequests);
router.post('/friend-request/accept', auth, acceptFriendRequest);

const userRoute = router;
export default userRoute;
