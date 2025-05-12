import prisma from "../db/db.config.js";
import { BlobServiceClient } from "@azure/storage-blob";
const accountName = process.env.ACCOUNT_NAME; // Або ваше ім'я змінної, напр. ACCOUNT_NAME
const sasToken = process.env.SAS_TOKEN;       // Або SAS_TOKEN
const chatContainerName = process.env.CONTAINER_NAME_CHAT;
let containerClient;

if (accountName && sasToken && chatContainerName) {
    try {
        const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net/?${sasToken}`);
        containerClient = blobServiceClient.getContainerClient(chatContainerName);
        console.log(`Azure Blob Storage client initialized for chat container: ${chatContainerName}`);
    } catch (error) {
        console.error("Failed to initialize Azure Blob Storage client for chat:", error);
        containerClient = null; // Встановлюємо в null, щоб можна було перевірити
    }
} else {
    console.warn("Azure Storage credentials or chat container name are not fully configured. File uploads to Azure for chat will be disabled.");
    containerClient = null;
}

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
                participants: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                participants: {
                    include: {
                        user: true // Including the user data through the ChatUser model
                    }
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
    const { chatId} = req.params;

    try {
        const userId = req.userId;
        console.log(userId);
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
    const { chatId, text } = req.body;

    try {
        const senderId = req.userId;
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
    const { profileId } = req.params;
    const userIdToAdd = req.userId;

    try {
        const chat = await prisma.chat.findFirst({
            where: { authorId: parseInt(profileId) },
            include: { participants: true } // Correctly reference participants
        });

        if (!chat) return res.status(404).json({ error: 'Chat not found' });

        const exists = chat.participants.some(u => u.userId === userIdToAdd); // Check if user is already in the chat
        if (exists) return res.status(400).json({ error: 'User already in chat' });

        await prisma.chatUser.create({
            data: {
                chatId: chat.id,
                userId: userIdToAdd
            }
        });

        res.status(200).json({ message: 'User added to chat' });
    } catch (err) {
        console.error('Error adding user to chat:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const uploadChatFile = async (req, res) => {
    if (!containerClient) {
        console.error('uploadChatFile: Azure containerClient is not initialized.');
        return res.status(500).json({ message: 'Помилка сервера: сховище файлів не налаштовано.' });
    }

    try {
        if (!req.file || !req.file.buffer) {
            console.error('uploadChatFile: Файл не було отримано або буфер файлу відсутній.');
            return res.status(400).json({ message: 'Файл не було завантажено або він пошкоджений.' });
        }

        const uploadedFileDetails = req.file;
        const userId = req.userId; // З вашого authMiddleware
        const originalFileName = uploadedFileDetails.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_'); // Очищення імені файлу

        // Створюємо унікальне ім'я для blob, щоб уникнути колізій
        // Можна додати chatId, якщо він передається і потрібен для структурування
        // const chatIdFromRequest = req.body.chatId; // Якщо фронтенд надсилає chatId в FormData
        // const blobPathPrefix = chatIdFromRequest ? `chat_${chatIdFromRequest}/` : '';
        const blobName = `user_${userId}/${Date.now()}_${originalFileName}`;

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        console.log(`uploadChatFile: Uploading '${originalFileName}' to Azure Blob Storage as '${blobName}'.`);

        // Завантажуємо буфер файлу в Azure
        await blockBlobClient.uploadData(uploadedFileDetails.buffer, {
            blobHTTPHeaders: { blobContentType: uploadedFileDetails.mimetype }
        });

        const fileUrl = blockBlobClient.url; // URL файлу в Azure
        console.log('uploadChatFile: File uploaded successfully to Azure. URL:', fileUrl);

        res.status(200).json({
            message: 'Файл успішно завантажено в Azure.',
            fileUrl: fileUrl,
            fileName: uploadedFileDetails.originalname, // Повертаємо оригінальне ім'я для відображення
            fileType: uploadedFileDetails.mimetype,
            fileSize: uploadedFileDetails.size
        });

    } catch (error) {
        console.error('Помилка завантаження файлу в Azure (uploadChatFile):', error);
        // Більш детальна обробка помилок Azure, якщо потрібно
        if (error.statusCode && error.message) {
            return res.status(error.statusCode).json({ message: `Помилка Azure: ${error.message}` });
        }
        res.status(500).json({ message: 'Внутрішня помилка сервера при завантаженні файлу в Azure.' });
    }
};