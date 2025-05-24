import express from 'express';
import authRoutes from './routes/authRoutes.js';
import authorRoutes from './routes/authorRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import './cron/emailReminder.js';
// import {sendReminders} from "./cron/emailReminder.js";
import cors from 'cors';
import url from 'url';
import { WebSocketServer } from 'ws';
import http from 'http';
import jwt from 'jsonwebtoken';
import prisma from './db/db.config.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/', authRoutes);
app.use('/', authorRoutes);
app.use('/', chatRoutes);
app.use('/api', paymentRoutes);
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map(); // key: WebSocket, value: { chatId, username }
// (async () => {
//     console.log('🚀 Примусовий запуск sendReminders для тестування...');
//     try {
//         await sendReminders();
//         console.log('✅ Примусовий запуск sendReminders завершено.');
//     } catch (error) {
//         console.error('❌ Помилка під час примусового запуску sendReminders:', error);
//     }
//     // Якщо ви використовуєте Prisma і цей скрипт має завершитися,
//     // а не бути частиною довготривалого сервера, можливо, знадобиться prisma.$disconnect();
// })();
wss.on('connection', (ws, req) => {
    const query = url.parse(req.url, true).query;
    const token = query.token;
    let decodedPayload;

    if (token) {
        try {
            decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {
            console.error('SERVER: Invalid token on connection:', e.message);
            ws.close(1008, "Invalid or expired token");
            return;
        }
    } else {
        ws.close(1008, "Token not provided");
        return;
    }

    const username = decodedPayload.name || 'Anonymous';
    const userId = Number(decodedPayload.id); // Завжди число

    if (!userId || isNaN(userId)) {
        console.error('SERVER: Token does not contain valid numeric userId');
        ws.close(1008, "Invalid token payload");
        return;
    }

    clients.set(ws, { chatId: null, username, userId });
    console.log(`SERVER: Client connected: ${username} (ID: ${userId})`);

    ws.on('message', async (data) => {
        let msgFromClient;
        try {
            msgFromClient = JSON.parse(data);
        } catch (e) {
            console.error('SERVER: Invalid JSON received:', data, e);
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON format.' }));
            return;
        }

        const senderInfo = clients.get(ws);
        if (!senderInfo) {
            console.error('SERVER: Message from an untracked client.');
            return;
        }
        console.log(`SERVER: Msg type '${msgFromClient.type}' from ${senderInfo.username}`, msgFromClient);


        switch (msgFromClient.type) {
            case 'join': {
                const rawChatId = msgFromClient.chatId;
                const numericChatId = rawChatId != null ? Number(rawChatId) : null;

                if (numericChatId != null && !isNaN(numericChatId)) {
                    senderInfo.chatId = numericChatId;
                    clients.set(ws, senderInfo);
                    console.log(`SERVER: Client ${senderInfo.username} (ID: ${senderInfo.userId}) joined chat ${numericChatId}`);
                    await broadcastUsersInChat(numericChatId); // Викликаємо оновлену функцію
                } else {
                    console.warn(`SERVER: Client ${senderInfo.username} sent join with invalid chatId: ${rawChatId}`);
                }
                break;
            }
            case 'newChatMessage': {
                const { chatId: rawChatId, text, messageType, fileUrl, fileName, fileType, fileSize } = msgFromClient;
                const currentChatId = Number(rawChatId);
                const currentSenderId = senderInfo.userId;
                const currentFileSize = fileSize != null ? parseInt(fileSize) : null;

                if (isNaN(currentChatId)) {
                    console.error(`SERVER: Invalid chatId for newChatMessage: ${rawChatId}`);
                    ws.send(JSON.stringify({ type: 'error', message: 'Invalid chatId.' }));
                    return;
                }
                try {
                    const savedDbMessage = await prisma.message.create({ // Ваш існуючий код для збереження
                        data: {
                            text: text || null,
                            messageType: messageType || 'text',
                            fileUrl: fileUrl || null,
                            fileName: fileName || null,
                            fileType: fileType || null,
                            fileSize: currentFileSize,
                            createdAt: new Date(),
                            chat: { connect: { id: currentChatId } },
                            sender: { connect: { id: currentSenderId } }
                        },
                        select: { /* ... ваш select ... */
                            id: true, text: true, createdAt: true, messageType: true,
                            fileUrl: true, fileName: true, fileType: true, fileSize: true,
                            chat: { select: { id: true } },
                            sender: { select: { id: true, name: true } }
                        }
                    });
                    const messageToBroadcast = { /* ... ваш messageToBroadcast ... */
                        type: 'chatMessage', id: savedDbMessage.id, text: savedDbMessage.text,
                        chatId: savedDbMessage.chat.id, author: savedDbMessage.sender.name,
                        authorId: savedDbMessage.sender.id, timestamp: savedDbMessage.createdAt.toISOString(),
                        messageType: savedDbMessage.messageType, fileUrl: savedDbMessage.fileUrl,
                        fileName: savedDbMessage.fileName, fileType: savedDbMessage.fileType,
                        fileSize: savedDbMessage.fileSize
                    };
                    for (const [clientWs, clientData] of clients.entries()) {
                        if (clientWs.readyState === WebSocket.OPEN && clientData.chatId === currentChatId) {
                            clientWs.send(JSON.stringify(messageToBroadcast));
                        }
                    }
                } catch (error) {
                    console.error('SERVER: Error saving/broadcasting newChatMessage:', error);
                    ws.send(JSON.stringify({ type: 'error', message: 'Could not process your message.' }));
                }
                break;
            }
            case 'userStartedTyping': { // Ваш існуючий обробник
                const { chatId: rawChatId } = msgFromClient;
                const numericChatId = Number(rawChatId);
                if (!isNaN(numericChatId) && senderInfo) {
                    const payload = { type: 'userTyping', chatId: numericChatId, userId: senderInfo.userId, username: senderInfo.username, isTyping: true };
                    for (const [clientWs, clientData] of clients.entries()) {
                        if (clientWs !== ws && clientWs.readyState === WebSocket.OPEN && clientData.chatId === numericChatId) {
                            clientWs.send(JSON.stringify(payload));
                        }
                    }
                }
                break;
            }
            case 'userStoppedTyping': { // Ваш існуючий обробник
                const { chatId: rawChatId } = msgFromClient;
                const numericChatId = Number(rawChatId);
                if (!isNaN(numericChatId) && senderInfo) {
                    const payload = { type: 'userTyping', chatId: numericChatId, userId: senderInfo.userId, username: senderInfo.username, isTyping: false };
                    for (const [clientWs, clientData] of clients.entries()) {
                        if (clientWs !== ws && clientWs.readyState === WebSocket.OPEN && clientData.chatId === numericChatId) {
                            clientWs.send(JSON.stringify(payload));
                        }
                    }
                }
                break;
            }
            default:
                console.log(`SERVER: Received unknown message type: '${msgFromClient.type}' from user ${senderInfo.username}.`);
                ws.send(JSON.stringify({ type: 'error', message: `Unknown message type: ${msgFromClient.type}`}));
        }
    });

    ws.on('close', async (code, reason) => { // Зроблено async
        const clientInfo = clients.get(ws);
        if (clientInfo) {
            console.log(`SERVER: Client ${clientInfo.username} (ID: ${clientInfo.userId}) disconnected. Code: ${code}`);
            const chatId = clientInfo.chatId; // chatId вже має бути числом
            clients.delete(ws);
            if (chatId != null) {
                await broadcastUsersInChat(chatId); // Оновити список користувачів для решти
            }
        } else {
            console.log(`SERVER: An untracked client disconnected.`);
        }
    });

    ws.on('error', (err) => {
        const clientInfo = clients.get(ws);
        console.error(`SERVER: WebSocket error for ${clientInfo ? clientInfo.username : 'unknown client'}:`, err);
    });
});

async function broadcastUsersInChat(chatIdToBroadcast) { // chatIdToBroadcast має бути числом
    if (chatIdToBroadcast == null) {
        console.warn("SERVER: broadcastUsersInChat called with null chatId.");
        return;
    }
    const numericChatId = Number(chatIdToBroadcast);

    try {
        // 1. Отримати всіх зареєстрованих учасників чату з бази даних
        const dbParticipants = await prisma.chatUser.findMany({
            where: { chatId: numericChatId },
            include: {
                user: { // Включаємо інформацію про користувача
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        // 2. Створити список усіх учасників з їх онлайн-статусом
        const allUsersWithStatus = dbParticipants.map(participant => {
            const dbUser = participant.user;
            let isUserOnlineInThisChat = false;

            // Перевірити, чи цей користувач є серед активних WebSocket клієнтів
            // і чи він приєднаний до поточного чату.
            for (const clientData of clients.values()) {
                if (clientData.userId === dbUser.id && clientData.chatId === numericChatId) {
                    isUserOnlineInThisChat = true;
                    break;
                }
            }
            return {
                userId: dbUser.id,
                username: dbUser.name || `User ${dbUser.id}`, // Використовуємо ім'я або ID
                isOnline: isUserOnlineInThisChat
            };
        });

        const payload = JSON.stringify({
            type: 'usersInChat',
            chatId: numericChatId,
            users: allUsersWithStatus
        });

        console.log(`SERVER: Broadcasting usersInChat for chat ${numericChatId}. Total mapped users: ${allUsersWithStatus.length}`);

        // 3. Надіслати цей повний список всім клієнтам, які зараз у цьому чаті
        for (const [clientWs, clientData] of clients.entries()) {
            if (clientData.chatId === numericChatId && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(payload);
            }
        }
    } catch (error) {
        console.error(`SERVER: Error in broadcastUsersInChat for chat ${numericChatId}:`, error);
    }
}
const port = process.env.PORT || 8081;
server.listen(port, () => console.log(`Listening on port ${port}`));
export default app;
