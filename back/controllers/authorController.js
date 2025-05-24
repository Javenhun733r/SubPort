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
                    orderBy: { createdAt: 'desc' },
                    include: {
                        Comment: {
                            orderBy: { createdAt: 'asc' },
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
        const request = await prisma.authorRequest.findUnique({
            where: { id: Number(requestId) }
        });


        if (!request) {
            return res.status(404).json({message: 'Request not found'});
        }


        await prisma.authorRequest.update({
            where: {id: Number(requestId)},
            data: {status: 'APPROVED'}
        });

        const userId = request.userId;

        const newAuthor = await prisma.author.create({
            data: {
                username: request.username,
                name: request.name,
                bio: request.bio,
                avatarUrl: request.avatarFile,
                genre: request.genre,
                socials: request.socials ? JSON.parse(request.socials) : null,
                userId: userId,
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
        const request = await prisma.authorRequest.findUnique({
            where: {id: Number(requestId)}
        });

        if (!request) {
            return res.status(404).json({message: 'Request not found'});
        }


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

        next();
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
                balance: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

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



export const createPost = async (req, res) => {
    const { title, content } = req.body;
    const authorId = Number(req.params.id); // ID автора з параметрів маршруту
    let imageUrl = null;

    if (!title || !content) {
        return res.status(400).json({ message: "Title and content are required" });
    }

    try {
        const author = await prisma.author.findUnique({
            where: { id: authorId }
        });

        if (!author) {
            return res.status(404).json({ message: "Author not found" });
        }

        if (author.userId !== req.userId) {
            return res.status(403).json({ message: "You are not authorized to create posts for this author" });
        }

        if (req.file) {
            const blobName = `posts/${authorId}/${Date.now()}_${req.userId}_${req.file.originalname}`;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.uploadData(req.file.buffer, {
                blobHTTPHeaders: { blobContentType: req.file.mimetype }
            });
            imageUrl = blockBlobClient.url;
        }

        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                imageUrl,
                authorId: author.id
            },
            include: {
                author: {
                    select: { username: true, name: true, avatarUrl: true }
                }
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
    const authorId = Number(req.params.id); // ID автора з параметрів маршруту

    try {
        const author = await prisma.author.findUnique({
            where: { id: authorId }
        });

        if (!author) return res.status(404).json({ message: "Author not found" });

        // Перевірка, чи залогінений користувач є власником цієї авторської сторінки
        if (author.userId !== req.userId) { // req.userId має бути встановлений middleware'ом verifyToken
            return res.status(403).json({ message: "You are not authorized to create tiers for this author" });
        }

        const newTier = await prisma.tier.create({
            data: {
                title,
                price: parseFloat(price),
                description,
                authorId: author.id,
                isChat: isChat || false // Зберігаємо значення isChat
            }
        });

        // Якщо для цього рівня підписки передбачено чат, створюємо його
        if (newTier.isChat) {
            await prisma.chat.create({
                data: {
                    name: `Чат для рівня "${newTier.title}" (Автор: ${author.name})`,
                    creatorId: author.userId, // Користувач, який є автором
                    authorId: author.id,      // Сутність Author
                    tierId: newTier.id,       // Прив'язка чату до конкретного рівня
                    participants: {
                        create: { userId: author.userId } // Додаємо автора як учасника чату
                    }
                }
            });
        }

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

export const subscribeToTier = async (req, res) => {
    const { userId, tierId } = req.body;

    try {
        const tier = await prisma.tier.findUnique({
            where: {
                id: tierId
            },
            include: {
                author: true
            }
        });

        if (!tier) {
            return res.status(404).json({ message: 'Рівень підписки не знайдений' });
        }

        let chatMessage = 'Підписка підтверджена.';

        // Якщо рівень передбачає чат, додаємо користувача до нього
        if (tier.isChat) {
            const chat = await prisma.chat.findFirst({
                where: {
                    tierId: tier.id // Шукаємо чат, пов'язаний саме з цим рівнем
                }
            });

            if (chat) {
                // Перевіряємо, чи користувач вже не є учасником
                const existingParticipant = await prisma.chatUser.findUnique({
                    where: {
                        chatId_userId: {
                            chatId: chat.id,
                            userId: userId
                        }
                    }
                });

                if (!existingParticipant) {
                    await prisma.chatUser.create({
                        data: {
                            chatId: chat.id,
                            userId: userId
                        }
                    });
                }
                chatMessage = 'Підписка підтверджена, ви додані до чату.';
            } else {
                // Це не мало б статися, якщо createTier працює правильно
                console.warn(`Chat not found for tier ${tier.id} which has isChat=true.`);
                chatMessage = 'Підписка підтверджена, але чат для цього рівня наразі недоступний.';
            }
        } else {
            chatMessage = 'Підписка підтверджена. Цей рівень не включає чат.';
        }

        return res.status(200).json({ message: chatMessage });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Сталася помилка при підписці на рівень' });
    }
};
export const createComment = async (req, res) => {
    const { text } = req.body;
    const userId = req.userId;
    const postId = Number(req.params.postId);
    let imageUrl = null;

    if (!text && !req.file) { // Коментар може бути текстом, або картинкою, або і тим і іншим
        return res.status(400).json({ message: 'Comment text or image is required' });
    }
    if (!userId) { // userId має бути з JWT middleware
        return res.status(401).json({ message: 'User not authenticated' });
    }


    try {
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (req.file) {
            const blobName = `comments/${postId}/${Date.now()}_${userId}_${req.file.originalname}`;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.uploadData(req.file.buffer, {
                blobHTTPHeaders: { blobContentType: req.file.mimetype }
            });
            imageUrl = blockBlobClient.url;
        }

        const newComment = await prisma.comment.create({
            data: {
                text: text || "", // Якщо тексту немає, але є картинка, зберігаємо порожній рядок
                imageUrl,
                postId: postId,
                userId: Number(userId)
            },
            include: {
                user: {
                    select: { id: true, name: true }
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
    const commentId = Number(req.params.commentId);
    const currentUserId = req.userId; // ID поточного залогіненого користувача (з verifyToken)

    try {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        });

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Розширена перевірка авторизації:
        let authorized = false;
        if (comment.userId === currentUserId) { // Чи є користувач автором коментаря?
            authorized = true;
        } else {
            // Якщо ні, перевіряємо, чи є користувач автором поста, якому належить коментар
            const post = await prisma.post.findUnique({
                where: { id: comment.postId },
                include: {
                    author: { // Потрібно для отримання userId автора поста
                        select: { userId: true }
                    }
                }
            });
            if (post && post.author && post.author.userId === currentUserId) {
                authorized = true;
            }
        }

        if (!authorized) {
            return res.status(403).json({ message: 'You are not authorized to delete this comment' });
        }

        // Видалення зображення коментаря з Azure, якщо воно є
        if (comment.imageUrl) {
            const blobName = getBlobNameFromUrl(comment.imageUrl);
            if (blobName) {
                try {
                    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
                    await blockBlobClient.deleteIfExists();
                    console.log(`Successfully deleted comment image blob: ${blobName}`);
                } catch (blobError) {
                    console.error(`Failed to delete comment image blob ${blobName} from Azure:`, blobError);
                    // Ви можете вирішити, чи продовжувати видалення з БД, якщо видалення файлу не вдалося
                }
            }
        }

        // Видалення коментаря з бази даних
        await prisma.comment.delete({
            where: { id: commentId }
        });

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (err) {
        console.error('Error deleting comment:', err);
        res.status(500).json({ message: 'Failed to delete comment' });
    }
};
export const getSimilarAuthors = async (req, res) => {
    const { username } = req.params;

    try {
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
            ORDER BY "subscribers" DESC 
                LIMIT 3
        `;

        res.status(200).json(similarAuthors);
    } catch (err) {
        console.error('Error fetching similar authors:', err);
        res.status(500).json({ message: 'Failed to fetch similar authors' });
    }
};

export const deletePost = async (req, res) => {
    const postId = Number(req.params.postId);
    const currentUserId = req.userId;

    try {
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                author: true,
                Comment: {
                    select: { imageUrl: true }
                }
            }
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }


        if (post.author.userId !== currentUserId) {
            return res.status(403).json({ message: 'You are not authorized to delete this post' });
        }

        for (const comment of post.Comment) {
            if (comment.imageUrl) {
                const commentBlobName = getBlobNameFromUrl(comment.imageUrl);
                if (commentBlobName) {
                    try {
                        const blobClient = containerClient.getBlockBlobClient(commentBlobName);
                        await blobClient.deleteIfExists();
                    } catch (blobError) {
                        console.error(`Failed to delete comment image blob ${commentBlobName}:`, blobError);

                    }
                }
            }
        }

        if (post.imageUrl) {
            const postBlobName = getBlobNameFromUrl(post.imageUrl);
            if (postBlobName) {
                try {
                    const blobClient = containerClient.getBlockBlobClient(postBlobName);
                    await blobClient.deleteIfExists();
                } catch (blobError) {
                    console.error(`Failed to delete post image blob ${postBlobName}:`, blobError);
                }
            }
        }


        await prisma.post.delete({
            where: { id: postId }
        });

        res.status(200).json({ message: 'Post and associated comments and images deleted successfully' });
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({ message: 'Failed to delete post' });
    }
};
const getBlobNameFromUrl = (url) => {
    if (!url) return null;
    try {
        const urlParts = new URL(url);

        const pathSegments = urlParts.pathname.split('/');

        if (pathSegments.length > 2 && pathSegments[1] === containerName) {
            return pathSegments.slice(2).join('/');
        }
        if (pathSegments.length > 0) {
            return pathSegments[pathSegments.length -1];
        }
        return null;
    } catch (error) {
        console.error("Error parsing blob URL to get blob name:", error);
        return null;
    }
};

