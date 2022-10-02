/* eslint-disable prettier/prettier */
import express from 'express';
import { NODE_ENV } from '../config/contants';
import {
    acceptFriendRequest,
    cancelFriendRequest,
    getFriendRequests, removeAllFrineds, removeUsers, removeUserSocketId, sendFriendRequest,
    sentFriendRequests,
    updateUserSocketId
} from '../controllers/user.controller';
import auth from '../middleware/auth.middleware';

const router = express.Router();

if (NODE_ENV === 'developement') {
    router.get('/reset', removeAllFrineds);
    router.get('/remove', removeUsers);
}

router.post('/remove-socket-id', removeUserSocketId);

router.use(auth);

router.post('/friend-request', auth, sendFriendRequest);
router.get('/friend-request', auth, getFriendRequests);
router.post('/friend-request/accept', auth, acceptFriendRequest);
router.post('/friend-request/cancel', auth, cancelFriendRequest);
router.get('/friend-request/sent', sentFriendRequests);
router.post('/update-socket-id', updateUserSocketId);

const userRoute = router;
export default userRoute;
