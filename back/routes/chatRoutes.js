import express from 'express';
import {
    createChat,
    getUserChats,
    getChatMessages,
    sendMessage, deleteChat, addUserToChat, uploadChatFile
} from '../controllers/chatController.js';
import {verifyToken} from "../middleware/verifyToken.js";
import uploadToMemory from "../middleware/multer.config.js";

const router = express.Router();

router.post('/chats',verifyToken, createChat);
router.get('/chats/user/', verifyToken, getUserChats);
router.get('/chats/:chatId/messages',verifyToken, getChatMessages);
router.post('/chats/:chatId/messages',verifyToken, sendMessage);
router.delete('/chats/:chatId',verifyToken, deleteChat);
router.post('/chats/:profileId/add-user', verifyToken, addUserToChat);
router.post('/upload-chat-file', verifyToken, uploadToMemory.single('file'), uploadChatFile);
export default router;
