import prisma from "../db/db.config.js";
import jwt from 'jsonwebtoken';

export const getAuthorByUsername = async (req, res) => {
    const { username } = req.params;

    try {
        const author = await prisma.author.findUnique({
            where: { username },
            include: {
                posts: true,  // Посты
                tiers: true,  // Підписки
            }
        });

        if (!author) return res.status(404).json({ message: 'Author not found' });

        res.json(author); // Тепер повертаємо також інформацію про підписки
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};



export const createAuthor = async (req, res) => {
    const { username, name, avatarUrl, bio, tiers, twitterUrl, linkedinUrl, twitchUrl, youtubeUrl, instagramUrl, tiktokUrl } = req.body;

    try {
        const newAuthor = await prisma.author.create({
            data: {
                username,
                name,
                avatarUrl,
                bio,
                twitterUrl,   // Зберігаємо Twitter URL
                linkedinUrl,  // Зберігаємо LinkedIn URL
                twitchUrl,    // Зберігаємо Twitch URL
                youtubeUrl,   // Зберігаємо YouTube URL
                instagramUrl, // Зберігаємо Instagram URL
                tiktokUrl,    // Зберігаємо TikTok URL
                tiers: {
                    create: tiers,  // Створюємо підписки разом з автором
                },
            },
        });

        res.status(201).json(newAuthor);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create author' });
    }
};

export const createAuthorRequest = async (req, res) => {
    const { username, name, bio, genre, userId, subscribers, socials } = req.body;
    const avatarFile = req.file?.filename || null;

    try {
        const newRequest = await prisma.authorRequest.create({
            data: {
                username,
                name,
                bio,
                genre,
                subscribers,
                avatarFile,
                userId: Number(userId),

                socials: socials ? JSON.stringify(socials) : null
            }
        });
        res.status(201).json(newRequest);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to submit request' });
    }
};



export const getAllAuthorRequests = async (req, res) => {
    try {
        const requests = await prisma.authorRequest.findMany({
            where: { status: 'PENDING' },
            include: { user: true }
        });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
export const approveAuthorRequest = async (req, res) => {
    const { requestId } = req.params;

    try {
        // Отримуємо запит по ID
        const request = await prisma.authorRequest.findUnique({
            where: { id: Number(requestId) }
        });

        // Перевірка, чи існує запит
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Оновлюємо статус запиту
        await prisma.authorRequest.update({
            where: { id: Number(requestId) },
            data: { status: 'APPROVED' }
        });

        // Створюємо автора на основі запиту
        const newAuthor = await prisma.author.create({
            data: {
                username: request.username,
                name: request.name,
                bio: request.bio,
                avatarUrl: request.avatarFile,
                socials: request.socials ? JSON.parse(request.socials) : null, // Взяти соцмережі з request.socials
                tiers: {
                    create: request.tiers || [], // Якщо є підписки, створюємо їх
                },
            }
        });

        res.json({ message: 'Request approved and author created', author: newAuthor });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to approve request' });
    }
};

export const rejectAuthorRequest = async (req, res) => {
    const { requestId } = req.params;

    try {
        // Отримуємо запит по ID
        const request = await prisma.authorRequest.findUnique({
            where: { id: Number(requestId) }
        });

        // Перевірка, чи існує запит
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Оновлюємо статус запиту на "REJECTED"
        await prisma.authorRequest.update({
            where: { id: Number(requestId) },
            data: { status: 'REJECTED' }
        });

        res.json({ message: 'Request rejected' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to reject request' });
    }
};

export const checkAdmin = (req, res, next) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};


