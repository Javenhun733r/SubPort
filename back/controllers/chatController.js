import prisma from "../db/db.config.js";

export const createChat = async (req, res) => {
    const { name, userIds } = req.body;

    try {
        const userId = req.userId;
        const author = await prisma.author.findFirst({ where: { userId } });

        const chat = await prisma.chat.create({
            data: {
                name,
                creatorId: userId,
                authorId: author.id,
                participants: {
                    create: { userId }
                }
            }
        });

        res.status(201).json(chat);
    } catch (error) {
        console.error('Failed to create chat:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getUserChats = async (req, res) => {


    try {
        const userId = req.userId;
        const chats = await prisma.chat.findMany({
            where: {
                users: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                users: {
                    include: { user: true }
                }
            }
        });

        res.status(200).json(chats);
    } catch (error) {
        console.error('Failed to fetch chats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Controller для доступу до чату
export const getChatMessages = async (req, res) => {
    const { chatId, userId } = req.params;

    try {
        // Перевірка, чи користувач є учасником чату
        const chatUser = await prisma.chatUser.findUnique({
            where: {
                chatId_userId: {
                    chatId: parseInt(chatId),
                    userId: parseInt(userId)
                }
            }
        });

        if (!chatUser) {
            return res.status(403).json({ message: 'Доступ до цього чату заборонено' });
        }

        // Отримання повідомлень чату
        const messages = await prisma.message.findMany({
            where: {
                chatId: parseInt(chatId)
            },
            include: {
                sender: true
            }
        });

        return res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Сталася помилка при отриманні повідомлень' });
    }
};


export const sendMessage = async (req, res) => {
    const { chatId, senderId, text } = req.body;

    try {
        const message = await prisma.message.create({
            data: {
                text,
                chatId,
                senderId
            },
            include: { sender: true }
        });

        res.status(201).json(message);
    } catch (error) {
        console.error('Failed to send message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export async function deleteChat(req, res) {
    const chatId = parseInt(req.params.chatId);
    const userId = req.userId; // або звідки ти береш ID користувача (з JWT)

    try {
        // Отримай чат і перевір власника
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            select: { creatorId: true }
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        if (chat.creatorId !== userId) {
            return res.status(403).json({ error: 'You are not the creator of this chat' });
        }

        // Видаляємо пов’язані дані
        await prisma.message.deleteMany({ where: { chatId } });
        await prisma.chatUser.deleteMany({ where: { chatId } });

        // Видаляємо сам чат
        await prisma.chat.delete({ where: { id: chatId } });

        res.status(200).json({ message: 'Chat deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete chat' });
    }
}
export const addUserToChat = async (req, res) => {
    const { chatId } = req.params;
    const userIdToAdd = req.userId;

    try {
        const chat = await prisma.chat.findUnique({
            where: { id: parseInt(chatId) },
            include: { users: true }
        });

        if (!chat) return res.status(404).json({ error: 'Chat not found' });

        // перевірка, чи вже є такий учасник
        const exists = chat.users.find(u => u.userId === userIdToAdd);
        if (exists) return res.status(400).json({ error: 'User already in chat' });

        await prisma.chatUser.create({
            data: {
                chatId: parseInt(chatId),
                userId: userIdToAdd
            }
        });

        res.status(200).json({ message: 'User added to chat' });
    } catch (err) {
        console.error('Error adding user to chat:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};




