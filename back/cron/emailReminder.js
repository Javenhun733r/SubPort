import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import cron from 'node-cron';

const prisma = new PrismaClient();

// Налаштування поштового сервера
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendReminders = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const subscriptions = await prisma.tierSubscription.findMany({
        where: {
            expiresAt: {
                gte: tomorrow,
                lt: dayAfter,
            },
        },
        include: {
            user: true,
            tier: {
                include: {
                    author: true,
                },
            },
        },
    });

    for (const sub of subscriptions) {
        // Перевірка: чи вже надсилали нагадування для цього subscription
        const alreadySent = await prisma.reminderLog.findFirst({
            where: { subscriptionId: sub.id },
        });
        if (alreadySent) continue;

        const to = sub.user.email;
        if (!to) continue;

        const subject = `Нагадування: підписка на ${sub.tier.author.username} завершується завтра`;
        const html = `
            <p>Привіт, ${sub.user.name || 'користувачу'}!</p>
            <p>Нагадуємо, що твоя підписка на <strong>${sub.tier.author.username}</strong> рівня <strong>${sub.tier.title}</strong> завершується <strong>завтра</strong>.</p>
            <p>Щоб не втратити доступ, ти можеш поновити її на сайті.</p>
        `;

        try {
            await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
            console.log(`📧 Email sent to ${to}`);

            // Запис у лог
            await prisma.reminderLog.create({
                data: { subscriptionId: sub.id },
            });
        } catch (err) {
            console.error(`❌ Failed to send email to ${to}:`, err.message);
        }
    }
};
const handleExpiredSubscriptions = async () => {
    console.log('Running task: handleExpiredSubscriptions...');

    // 1. Знайти всі підписки, термін дії яких вже закінчився
    const expiredSubscriptions = await prisma.tierSubscription.findMany({
        where: {
            expiresAt: {
                lt: new Date() // Дата закінчення менша за поточну
            }
        },
        include: {
            tier: {
                include: {
                    chats: {
                        select: { id: true }
                    }
                }
            }
        }
    });

    if (expiredSubscriptions.length === 0) {
        console.log('No expired subscriptions to process.');
        return;
    }

    console.log(`Found ${expiredSubscriptions.length} expired subscriptions to process.`);

    for (const sub of expiredSubscriptions) {
        const { userId, tier, id: subscriptionId } = sub;
        const chat = tier?.chats[0];


        if (tier && tier.isChat && chat) {
            try {
                await prisma.chatUser.delete({
                    where: {
                        chatId_userId: {
                            chatId: chat.id,
                            userId: userId
                        }
                    }
                });
                console.log(`✅ User ${userId} removed from chat ${chat.id} for expired sub ${subscriptionId}.`);
            } catch (error) {
                if (error.code === 'P2025') {
                    console.log(`🟡 User ${userId} was already not in chat ${chat.id}.`);
                } else {
                    console.error(`❌ Failed to remove user ${userId} from chat ${chat.id}. Error:`, error);
                    continue;
                }
            }
        }

        await prisma.tierSubscription.delete({
            where: { id: subscriptionId }
        });
        console.log(`🗑️ Expired subscription record ${subscriptionId} deleted.`);
    }
};
cron.schedule('0 10 * * *', async () => {
    console.log('⏰ Starting daily subscription maintenance job...');

    try {
        await handleExpiredSubscriptions();
    } catch(err) {
        console.error("❌ CRITICAL ERROR in handleExpiredSubscriptions:", err);
    }
    try {
        await sendReminders();
    } catch(err) {
        console.error("❌ CRITICAL ERROR in sendReminders:", err);
    }

    console.log('✅ Daily subscription maintenance job finished.');
}, {
    timezone: "Europe/Kiev"
});


