import express from 'express';
import { getChats, getConversations, sendChat } from '../controllers/conversation.controller';
import auth from '../middleware/auth.middleware';
import upload from '../middleware/upload.middleware';

const router = express.Router();

// use auth middleware
router.use(auth);

router.get('/', getConversations);
router.get('/chats/:id', getChats);
router.post('/chat/send', upload.array('attachments', 5), sendChat);

const conversationRoute = router;
export default conversationRoute;
