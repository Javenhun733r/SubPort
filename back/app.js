import express from 'express';
import authRoutes from './routes/authRoutes.js';
import authorRoutes from './routes/authorRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import cors from 'cors';
import url from 'url';
import { WebSocketServer } from 'ws';
import http from 'http';
import jwt from 'jsonwebtoken';
const app = express();
app.use(cors());
app.use(express.json());
app.use('/', authRoutes);
app.use('/', authorRoutes);
app.use('/', chatRoutes);
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map(); // key: WebSocket, value: { chatId }

wss.on('connection', (ws, req) => {
    const query = url.parse(req.url, true).query;
    const token = query.token;

    let username = 'Anonymous';
    if (token) {
        try {
            const decoded = jwt.decode(token);
            username = decoded.name || 'Anonymous';
        } catch (e) {
            console.error('Invalid token:', e);
        }
    }

    clients.set(ws, { chatId: null, username });
    console.log('New client connected');

    ws.on('message', (data) => {
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
            clients.set(ws, { chatId, username });
        }

        // Транслюємо повідомлення всім учасникам цього чату
        for (const [client, info] of clients.entries()) {
            if (client.readyState === ws.OPEN && info.chatId === msg.chatId) {
                // Надсилаємо повідомлення з ім'ям користувача
                client.send(JSON.stringify({
                    ...msg,
                    author: info.username, // Використовуємо username з JWT
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