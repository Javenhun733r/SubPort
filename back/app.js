import express from 'express';
import authRoutes from './routes/authRoutes.js';
import authorRoutes from './routes/authorRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';
const app = express();
app.use(cors());
app.use(express.json());
app.use('/', authRoutes);
app.use('/', authorRoutes);
app.use('/', chatRoutes);
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('New client connected');

    ws.on('message', (data) => {
        const message = JSON.parse(data);

        // Broadcast тільки в межах одного чату
        for (const client of clients) {
            if (client.readyState === ws.OPEN) {
                client.send(JSON.stringify(message));
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