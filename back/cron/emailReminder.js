import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import cron from 'node-cron';

const prisma = new PrismaClient();

// Налаштування поштового сервера
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
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

// Розклад: щодня о 10:00
cron.schedule('0 10 * * *', async () => {
    console.log('⏰ Перевірка підписок...');
    await sendReminders();
});


