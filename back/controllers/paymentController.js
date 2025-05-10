import crypto from 'crypto';
import LiqPay from 'liqpay';
import prisma from "../db/db.config.js";
const publicKey = process.env.LIQPAY_PUBLIC_KEY;
const privateKey = process.env.LIQPAY_PRIVATE_KEY;
const liqpay = new LiqPay(publicKey, privateKey);

export const createDonation = (req, res) => {
    const { amount, username } = req.body;

    const params = {
        public_key: publicKey,
        action: 'pay',
        amount,
        currency: "UAH",
        description: `Донат для ${username}`,
        order_id: `donation-${username}-${Date.now()}`,
        version: '3',
        result_url: `http://localhost:5173/thanks?author=${encodeURIComponent(username)}`,
        server_url: 'https://c424-188-163-8-6.ngrok-free.app/api/callback',
        sandbox: 1
    };

    const data = Buffer.from(JSON.stringify(params)).toString('base64');
    const signature = crypto
        .createHash('sha1')
        .update(privateKey + data + privateKey)
        .digest('base64');

    res.json({ data, signature });
};

export const createSubscription = (req, res) => {
    const { amount, username, title, id } = req.body;
    const userId = req.userId;
    const orderId = `sub-${username}-${userId}-${id}-${Date.now()}`;
    const params = {
        public_key: publicKey,
        action: 'pay',
        amount,
        currency: 'UAH',
        description: `Підписка на ${username} рівня ${title}`,
        order_id: orderId,
        version: '3',
        result_url: `http://localhost:5173/thanks?author=${encodeURIComponent(username)}`,
        server_url: 'https://c424-188-163-8-6.ngrok-free.app/api/callback',
        sandbox: 1,
    };

    const data = Buffer.from(JSON.stringify(params)).toString('base64');
    const signature = crypto
        .createHash('sha1')
        .update(privateKey + data + privateKey)
        .digest('base64');

    res.json({ data, signature });
};

export const handleCallback = async (req, res) => {
    const { data, signature } = req.body;

    const expected = crypto
        .createHash('sha1')
        .update(privateKey + data + privateKey)
        .digest('base64');

    if (expected !== signature) {
        console.warn('⚠️ Bad LiqPay signature');
        return res.status(400).send('Bad signature');
    }

    const json = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
    console.log('✅ LiqPay callback:', json);

    // Перевіряємо, чи підписка успішна
    if (json.status === 'success' || json.status === 'sandbox') {
        if (json.order_id.startsWith('sub-')) {
            try {
                const [, username, userIdStr, tierIdStr] = json.order_id.split('-');
                const userId = parseInt(userIdStr);
                const tierId = parseInt(tierIdStr);

                // Перевірка на наявність автора за username
                const author = await prisma.author.findUnique({
                    where: { username },
                });

                if (!author) {
                    console.warn(`⚠️ Автор з username ${username} не знайдений`);
                    return res.status(404).send('Автор не знайдений');
                }

                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 30);

                // Створюємо підписку
                await prisma.tierSubscription.create({
                    data: {
                        userId,
                        tierId,
                        createdAt: new Date(),
                        expiresAt,
                    },
                });

                console.log(`📦 Підписка збережена: userId=${userId}, tierId=${tierId}`);

                const updatedAuthor = await prisma.author.update({
                    where: { username },
                    data: {
                        subscribers: {
                            increment: 1,
                        },
                    },
                    select: { subscribers: true },
                });
                console.log(`📈 Кількість підписників автора ${username} збільшено до ${updatedAuthor.subscribers}`);

            } catch (err) {
                console.error('❌ Помилка при збереженні підписки:', err);
            }
        } else {
            console.warn('⚠️ Підписка не починається з "sub-"');
        }
    } else {
        console.warn('⚠️ Підписка не успішна або знаходиться в тестовому режимі');
    }

    res.sendStatus(200);
};
