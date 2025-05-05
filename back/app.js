import express from 'express';
import authRoutes from './routes/authRoutes.js';
import authorRoutes from './routes/authorRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import cors from 'cors';
import url from 'url';
import { WebSocketServer } from 'ws';
import http from 'http';
import jwt from 'jsonwebtoken';
import { sendMessage as sendMessageController } from './controllers/chatController.js';
const app = express();
app.use(cors());
app.use(express.json());
app.use('/', authRoutes);
app.use('/', authorRoutes);
app.use('/', chatRoutes);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map(); // key: WebSocket, value: { chatId, username }

wss.on('connection', (ws, req) => {
    const query = url.parse(req.url, true).query;
    const token = query.token;

    let username = 'Anonymous';
    let userId = null;
    if (token) {
        try {
            const decoded = jwt.decode(token);
            username = decoded.name || 'Anonymous';
            userId = decoded.id;
        } catch (e) {
            console.error('Invalid token:', e);
        }
    }

    clients.set(ws, { chatId: null, username, userId });
    console.log('New client connected');

    ws.on('message', async (data) => {
        let msg;
        try {
            msg = JSON.parse(data);
        } catch (e) {
            console.error('Invalid JSON:', data);
            return;
        }

        if (msg.type === 'join') {
            const { chatId } = msg;
            // Зберігаємо chatId та username в клієнті
            clients.set(ws, { chatId, username, userId });

            // Отримуємо повідомлення з чату після приєднання
            try {
                const messages = await getChatMessages({ params: { chatId }, userId }, {
                    status: (statusCode) => ({ json: (data) => ws.send(JSON.stringify(data)) })
                });
                // Надсилаємо повідомлення клієнту
                messages.forEach((message) => {
                    ws.send(JSON.stringify({
                        id: message.id,
                        text: message.text,
                        chatId: message.chatId,
                        author: message.sender.name, // Ім'я відправника
                    }));
                });
            } catch (error) {
                console.error('Error getting messages:', error);
            }
        }

        // Якщо це нове повідомлення, зберігаємо його в БД
        if (msg.text && msg.chatId && userId) {
            try {
                // Викликаємо ваш контролер для збереження повідомлення
                await sendMessageController({ body: { chatId: msg.chatId, text: msg.text }, userId: userId }, {
                    status: (statusCode) => ({ json: (data) => ws.send(JSON.stringify(data)) }) // Мокаємо відповіді сервера
                });
            } catch (error) {
                console.error('Error saving message:', error);
            }
        }

        // Транслюємо повідомлення всім учасникам цього чату
        for (const [client, info] of clients.entries()) {
            if (client.readyState === ws.OPEN && info.chatId === msg.chatId) {
                // Надсилаємо повідомлення з ім'ям користувача
                client.send(JSON.stringify({
                    ...msg,
                    author: info.username || 'Anonymous', // Використовуємо username з JWT або 'Anonymous'
                }));
            }
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });
});


const port = process.env.PORT || 8081;
server.listen(port, () => console.log(`Listening on port ${port}`));
export default app;
