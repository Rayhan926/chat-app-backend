import express from 'express';
import { getConversations } from '../controllers/conversation.controller';
import auth from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, getConversations);

const conversationRoute = router;
export default conversationRoute;
