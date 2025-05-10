import prisma from "../db/db.config.js";
import jwt from 'jsonwebtoken';
import {BlobServiceClient} from "@azure/storage-blob";
const accountName = process.env.ACCOUNT_NAME;
const sasToken = process.env.SAS_TOKEN;
const containerName = process.env.CONTAINER_NAME;
const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net/?${sasToken}`);
const containerClient = blobServiceClient.getContainerClient(containerName);
export const getAuthorByUsername = async (req, res) => {
    const { username } = req.params;

    try {
        const author = await prisma.author.findUnique({
            where: { username },
            include: {
                posts: {
                    include: {
                        Comment: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                },
                tiers: true,
            }
        });

        if (!author) return res.status(404).json({ message: 'Author not found' });

        res.json(author);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
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
    const { username, name, bio, genre, subscribers, socials } = req.body;
    let avatarFile = null;

    try {
        console.log(req.file);
        if (req.file) {
            const blobName = `${req.userId}_${req.file.originalname}`;
            const blobClient = containerClient.getBlockBlobClient(blobName);
            await blobClient.uploadData(req.file.buffer);
            avatarFile = blobClient.url;
        }

        const newRequest = await prisma.authorRequest.create({
            data: {
                username,
                name,
                bio,
                genre,
                subscribers,
                avatarFile,
                userId: req.userId,
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
        await prisma.chat.create({
            data: {
                name: `Чат ${request.name}`, // Назва чату
                creatorId: userId,  // Це ID автора, який створює чат
                authorId: newAuthor.id,  // Прив'язка чату до нового автора
                participants: {
                    create: { userId } // Спочатку додається тільки автор як учасник
                }
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

export const checkAdmin = async (req, res, next) => {
    const userId = req.userId;

    try {
        const user = await prisma.user.findUnique({
            where: {id: Number(userId)},
        });

        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        if (user.role !== 'ADMIN') {
            return res.status(403).json({message: 'Access denied'});
        }

        next();  // Викликаємо наступний middleware, якщо користувач є адміном
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
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

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Отримуємо авторські сторінки користувача
        const userAuthorPages = await prisma.author.findMany({
            where: { userId: userId },
            select: {
                id: true,
                name: true,
                username: true,
                genre: true,
                avatarUrl: true,
            }
        });

        // Отримуємо підписки користувача
        const userSubscriptions = await prisma.tierSubscription.findMany({
            where: { userId: userId },
            include: {
                tier: {
                    select: {
                        title: true,
                        price: true,
                        description: true,
                    }
                }
            }
        });

        // Повертаємо профіль, авторські сторінки та підписки
        return res.status(200).json({
            user,
            authorPages: userAuthorPages,
            subscriptions: userSubscriptions.map(subscription => ({
                tierTitle: subscription.tier.title,
                price: subscription.tier.price,
                description: subscription.tier.description,
                expiresAt: subscription.expiresAt
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
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
    const { title, price, description, isChat } = req.body;

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
                authorId: author.id,
                isChat: isChat || false // Зберігаємо значення для isChat
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
export const subscribeToTier = async (req, res) => {
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
export const createComment = async (req, res) => {
    const { text } = req.body;
    const userId = req.userId;  // Витягуємо userId з JWT
    const postId = Number(req.params.postId);

    if (!text || !userId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Створюємо коментар
        const newComment = await prisma.comment.create({
            data: {
                text,
                postId: postId,
                userId: Number(userId)
            },
            include: {
                user: {
                    select: { name: true }  // Додати ім’я користувача в результат (опціонально)
                }
            }
        });

        res.status(201).json(newComment);
    } catch (err) {
        console.error('Error creating comment:', err);
        res.status(500).json({ message: 'Failed to create comment' });
    }
};

export const getCommentsByPost = async (req, res) => {

    try {
        const postId = req.params.postId;
        const comments = await prisma.comment.findMany({
            where: { postId: Number(postId) },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        res.status(200).json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to get comments' });
    }
};
export const deleteComment = async (req, res) => {
    const { commentId } = req.params;

    try {
        const comment = await prisma.comment.findUnique({
            where: { id: Number(commentId) }
        });

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Перевіряємо, чи є у користувача доступ до цього коментаря
        if (comment.userId !== req.userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this comment' });
        }

        await prisma.comment.delete({
            where: { id: Number(commentId) }
        });

        res.status(200).json({ message: 'Comment deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete comment' });
    }
};
export const getSimilarAuthors = async (req, res) => {
    const { username } = req.params;

    try {
        // Знаходимо автора за username
        const currentAuthor = await prisma.author.findUnique({
            where: { username },
            select: { genre: true }
        });

        if (!currentAuthor) {
            return res.status(404).json({ message: 'Author not found' });
        }

        const similarAuthors = await prisma.$queryRaw`
            SELECT * FROM "Author"
            WHERE genre = ${currentAuthor.genre} AND username != ${username}
            ORDER BY RANDOM()
            LIMIT 3
        `;

        res.status(200).json(similarAuthors);
    } catch (err) {
        console.error('Error fetching similar authors:', err);
        res.status(500).json({ message: 'Failed to fetch similar authors' });
    }
};


