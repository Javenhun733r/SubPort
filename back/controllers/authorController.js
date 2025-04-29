import prisma from "../db/db.config.js";
import jwt from 'jsonwebtoken';

export const getAuthorByUsername = async (req, res) => {
    const {username} = req.params;

    try {
        const author = await prisma.author.findUnique({
            where: {username},
            include: {
                posts: true,
                tiers: true,  // Підписки
            }
        });

        if (!author) return res.status(404).json({message: 'Author not found'});

        res.json(author); // Тепер повертаємо також інформацію про підписки
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
};


export const createAuthor = async (req, res) => {
    const {
        username,
        name,
        avatarUrl,
        bio,
        tiers,
        twitterUrl,
        linkedinUrl,
        twitchUrl,
        youtubeUrl,
        instagramUrl,
        tiktokUrl
    } = req.body;

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
        res.status(500).json({message: 'Failed to create author'});
    }
};

export const createAuthorRequest = async (req, res) => {
    const {username, name, bio, genre, subscribers, socials} = req.body;
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
                userId: req.userId, // Витягуємо userId з JWT
                socials: socials ? JSON.stringify(socials) : null
            }
        });

        res.status(201).json(newRequest);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Failed to submit request'});
    }
};


export const getAllAuthorRequests = async (req, res) => {
    try {
        const requests = await prisma.authorRequest.findMany({
            where: {status: 'PENDING'},
            include: {user: true}
        });
        res.json(requests);
    } catch (err) {
        res.status(500).json({message: 'Server error'});
    }
};
export const approveAuthorRequest = async (req, res) => {
    const {requestId} = req.params;

    try {
        // Отримуємо запит по ID
        const request = await prisma.authorRequest.findUnique({
            where: { id: Number(requestId) }
        });

        // Перевірка, чи існує запит
        if (!request) {
            return res.status(404).json({message: 'Request not found'});
        }

        // Оновлюємо статус запиту
        await prisma.authorRequest.update({
            where: {id: Number(requestId)},
            data: {status: 'APPROVED'}
        });

        const userId = request.userId;  // припускаючи, що користувач автентифікований через JWT

        const newAuthor = await prisma.author.create({
            data: {
                username: request.username,
                name: request.name,
                bio: request.bio,
                avatarUrl: request.avatarFile,
                genre: request.genre,
                socials: request.socials ? JSON.parse(request.socials) : null,
                userId: userId, // беремо userId з JWT
                tiers: {
                    create: request.tiers || [],
                },
            }
        });

        res.json({message: 'Request approved and author created', author: newAuthor});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Failed to approve request'});
    }
};

export const rejectAuthorRequest = async (req, res) => {
    const {requestId} = req.params;

    try {
        // Отримуємо запит по ID
        const request = await prisma.authorRequest.findUnique({
            where: {id: Number(requestId)}
        });

        // Перевірка, чи існує запит
        if (!request) {
            return res.status(404).json({message: 'Request not found'});
        }

        // Оновлюємо статус запиту на "REJECTED"
        await prisma.authorRequest.update({
            where: {id: Number(requestId)},
            data: {status: 'REJECTED'}
        });

        res.json({message: 'Request rejected'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Failed to reject request'});
    }
};

export const checkAdmin = (req, res, next) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({message: 'Access denied'});
    }
    next();
};
export const getAuthors = async (req, res) => {
    try {
        const authors = await prisma.author.findMany();
        res.json(authors);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error fetching authors'});
    }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await prisma.author.findUnique({
            where: {id: userId},
            select: {
                id: true,
                name: true,
                username: true,
                bio: true,
                genre: true,
                socials: true,
            },
        });

        if (!user) {
            return res.status(404).json({error: "User not found"});
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
};
export const updateProfile = async (req, res) => {
    const {name, username, bio, genre, socials} = req.body;
    const userId = req.userId;

    try {
        const updatedUser = await prisma.user.update({
            where: {id: userId},
            data: {
                name,
                username,
                bio,
                genre,
                socials: socials ? JSON.stringify(socials) : null,
            },
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
};
export const createPost = async (req, res) => {
    const { title, content } = req.body;

    try {
        const author = await prisma.author.findUnique({
            where: { id: Number(req.params.id) }
        });

        if (!author) return res.status(404).json({ message: "Author not found" });

        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                authorId: author.id
            }
        });

        res.status(201).json(newPost);
    } catch (err) {
        console.error("createPost error:", err);
        res.status(500).json({ message: "Failed to create post" });
    }
};

export const createTier = async (req, res) => {
    const { title, price, description } = req.body;

    try {
        const author = await prisma.author.findUnique({
            where: { id: Number(req.params.id) }
        });


        if (!author) return res.status(404).json({ message: "Author not found" });

        const newTier = await prisma.tier.create({
            data: {
                title,
                price: parseFloat(price),  // якщо price приходить як рядок
                description,
                authorId: author.id
            }
        });

        res.status(201).json(newTier);
    } catch (err) {
        console.error("createTier error:", err);
        res.status(500).json({ message: "Failed to create tier" });
    }
};

export const isOwner = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({isOwner: false});

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const author = await prisma.author.findUnique({
            where: { username: req.params.username }
        });
        if (decoded.id === author.userId) {
            return res.json({isOwner: true});
        } else {
            return res.json({isOwner: false});
        }
    } catch (err) {
        return res.status(401).json({isOwner: false});
    }
};
// Controller для підтвердження підписки користувача
const subscribeToTier = async (req, res) => {
    const { userId, tierId } = req.body;

    try {
        // Отримуємо рівень підписки
        const tier = await prisma.tier.findUnique({
            where: {
                id: tierId
            },
            include: {
                author: true // Автор, до якого належить цей рівень підписки
            }
        });

        if (!tier) {
            return res.status(404).json({ message: 'Рівень підписки не знайдений' });
        }

        // Перевірка чи автор створив чат для цього рівня підписки
        const chat = await prisma.chat.findFirst({
            where: {
                authorId: tier.authorId
            }
        });

        if (!chat) {
            return res.status(404).json({ message: 'Чат для цього автора не знайдено' });
        }

        // Додавання користувача до чату
        await prisma.chatUser.create({
            data: {
                chatId: chat.id,
                userId: userId
            }
        });

        // Оновлення статусу підписки користувача (якщо потрібно)
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                // Можна зберегти інформацію про рівень підписки, якщо потрібно
            }
        });

        return res.status(200).json({ message: 'Підписка підтверджена, ви додані до чату' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Сталася помилка при підписці на рівень' });
    }
};

