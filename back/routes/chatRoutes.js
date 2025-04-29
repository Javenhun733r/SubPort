import express from 'express';
import {
    createChat,
    getUserChats,
    getChatMessages,
    sendMessage, deleteChat, addUserToChat
} from '../controllers/chatController.js';
import {verifyToken} from "../middleware/verifyToken.js";

const router = express.Router();

router.post('/chats',verifyToken, createChat);
router.get('/chats/user/', verifyToken, getUserChats);
router.get('/chats/:chatId/messages', getChatMessages);
router.post('/chats/:chatId/messages', sendMessage);
router.delete('/chats/:chatId',verifyToken, deleteChat);
router.post('/chats/:chatId/add-user', verifyToken, addUserToChat);
export default router;
