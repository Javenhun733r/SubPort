import crypto from 'crypto';
import LiqPay from 'liqpay';
import prisma from "../db/db.config.js";
import axios from 'axios'; // Розкоментуйте axios, він нам знадобиться

const publicKey = process.env.LIQPAY_PUBLIC_KEY;
const privateKey = process.env.LIQPAY_PRIVATE_KEY;
const liqpay = new LiqPay(publicKey, privateKey); // Ініціалізуємо один раз

const LIQPAY_SERVER_CALLBACK_URL = process.env.LIQPAY_SERVER_CALLBACK_URL || 'https://d47f-188-163-8-6.ngrok-free.app/api/callback';
const LIQPAY_API_URL = 'https://www.liqpay.ua/api/request'; // Правильний URL для серверних API запитів

// ... функції createDonation та createSubscription залишаються без змін ...
export const createDonation = (req, res) => {
    const { amount, username } = req.body;
    if (!amount || !username || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Некоректна сума або ім'я користувача." });
    }
    const params = {
        public_key: publicKey,
        action: 'pay',
        amount: parseFloat(amount).toFixed(2),
        currency: "UAH",
        description: `Донат для ${username}`,
        order_id: `donation-${username}-${Date.now()}`,
        version: '3',
        result_url: `http://localhost:5173/thanks?author=${encodeURIComponent(username)}`,
        server_url: LIQPAY_SERVER_CALLBACK_URL,
        sandbox: 1
    };
    const data = Buffer.from(JSON.stringify(params)).toString('base64');
    const signature = crypto
        .createHash('sha1')
        .update(privateKey + data + privateKey)
        .digest('base64');
    res.json({ data, signature });
};

export const createSubscription = async (req, res) => { // Змінено на async
    const { amount, username, title, id: tierId } = req.body; // 'id' тут це tierId
    const userId = req.userId; // ID користувача, який платить

    if (!amount || !username || !title || !tierId || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 || !userId) {
        return res.status(400).json({ message: "Некоректні дані для створення підписки." });
    }

    try {
        // Перевірка наявності активної підписки на цей рівень
        const existingActiveSubscription = await prisma.tierSubscription.findFirst({
            where: {
                userId: userId,
                tierId: tierId,
                expiresAt: {
                    gt: new Date() // Перевіряємо, чи дата завершення більша за поточну
                }
            }
        });

        if (existingActiveSubscription) {
            return res.status(400).json({ message: 'Ви вже маєте активну підписку на цей рівень.' });
        }

        // Якщо активної підписки немає, продовжуємо створення платежу
        const orderId = `sub-${username}-${userId}-${tierId}-${Date.now()}`;
        const params = {
            public_key: publicKey,
            action: 'pay',
            amount: parseFloat(amount).toFixed(2),
            currency: 'UAH',
            description: `Підписка на ${username} рівня ${title}`,
            order_id: orderId,
            version: '3',
            result_url: `http://localhost:5173/thanks?author=${encodeURIComponent(username)}`,
            server_url: LIQPAY_SERVER_CALLBACK_URL,
            sandbox: 1,
        };

        const data = Buffer.from(JSON.stringify(params)).toString('base64');
        const signature = crypto
            .createHash('sha1')
            .update(privateKey + data + privateKey)
            .digest('base64');

        res.json({ data, signature });

    } catch (error) {
        console.error('Error in createSubscription controller:', error);
        res.status(500).json({ message: 'Внутрішня помилка сервера при створенні підписки.' });
    }
};


export const createWithdrawal = async (req, res) => {
    const { amount: requestedAmountStr, receiverCard } = req.body;
    const userId = req.userId;

    if (!receiverCard || !requestedAmountStr) {
        return res.status(400).json({ message: 'Номер картки та сума є обов\'язковими.' });
    }
    if (!/^\d{16}$/.test(receiverCard)) {
        return res.status(400).json({ message: 'Номер картки має складатися з 16 цифр.' });
    }

    const requestedAmount = parseFloat(requestedAmountStr);
    if (isNaN(requestedAmount) || requestedAmount <= 0) {
        return res.status(400).json({ message: 'Сума має бути позитивним числом.' });
    }

    let withdrawalRecord; // Оголошуємо заздалегідь для доступу в catch

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { balance: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'Користувача не знайдено.' });
        }

        const userBalance = parseFloat(user.balance.toString());
        if (userBalance < requestedAmount) {
            return res.status(400).json({ message: 'Недостатньо коштів на балансі.' });
        }

        const orderId = `withdraw-${userId}-${Date.now()}`;

        const withdrawalParamsForLiqPay = {
            public_key: publicKey,
            action: 'p2pcredit',
            version: '3',
            amount: requestedAmount.toFixed(2),
            currency: 'UAH',
            description: `Вивід коштів для користувача ID: ${userId}`,
            order_id: orderId,
            receiver_card: receiverCard,
            server_url: LIQPAY_SERVER_CALLBACK_URL,
            sandbox: 1,
        };

        const dataString = Buffer.from(JSON.stringify(withdrawalParamsForLiqPay)).toString('base64');
        const signatureString = crypto
            .createHash('sha1')
            .update(privateKey + dataString + privateKey)
            .digest('base64');

        withdrawalRecord = await prisma.withdrawal.create({ // Присвоюємо значення
            data: {
                userId: userId,
                amount: requestedAmount,
                currency: 'UAH',
                receiverCard: receiverCard,
                status: 'PENDING_LIQPAY_API_CALL',
                liqpayOrderId: orderId,
            }
        });

        const formData = new URLSearchParams();
        formData.append('data', dataString);
        formData.append('signature', signatureString);

        const liqpayResponse = await axios.post(LIQPAY_API_URL, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const json_response = liqpayResponse.data;
        console.log("LiqPay API p2pcredit (manual data/signature with axios) response:", json_response);

        // --- FIX PRISMA TYPE ---
        const rawPaymentId = json_response.payment_id || json_response.transaction_id;
        const liqpayPaymentIdStr = rawPaymentId ? String(rawPaymentId) : null;
        // --- END FIX ---

        let updateData = {
            liqpayPaymentId: liqpayPaymentIdStr, // Використовуємо конвертоване значення
            updatedAt: new Date()
        };

        if (json_response.result === 'ok' || (json_response.action === 'p2pcredit' && (json_response.status === 'success' || json_response.status === 'sandbox' || json_response.status === 'processing'))) {
            updateData.status = json_response.status === 'sandbox' ? 'PROCESSING_SANDBOX' :
                (json_response.status === 'processing' ? 'PROCESSING_LIQPAY' : 'PROCESSING_LIVE');
            updateData.notes = `Запит на вивід прийнято LiqPay. Статус: ${json_response.status}. ID транзакції LiqPay: ${updateData.liqpayPaymentId || 'N/A'}`;

            await prisma.withdrawal.update({
                where: { id: withdrawalRecord.id },
                data: updateData
            });
            return res.json({ success: true, message: updateData.notes, orderId: orderId, liqpay_status: json_response.status });
        } else {
            updateData.status = 'FAILED_LIQPAY_REJECTED';
            updateData.notes = `LiqPay відхилив запит: ${json_response.err_description || json_response.err_code || 'Невідома помилка LiqPay'}. Статус: ${json_response.status || 'N/A'}`;
            console.error("LiqPay rejection details:", json_response);

            await prisma.withdrawal.update({
                where: { id: withdrawalRecord.id },
                data: updateData
            });
            return res.status(400).json({ success: false, message: updateData.notes, error_details: json_response });
        }

    } catch (error) {
        console.error('Error in createWithdrawal controller:', error.response ? error.response.data : error.message);
        if (axios.isAxiosError(error) && error.response) {
            console.error('Axios error response status:', error.response.status);
            console.error('Axios error response data:', error.response.data);
        }
        // Якщо помилка сталася після створення withdrawalRecord, але до відповіді LiqPay або під час неї,
        // оновлюємо статус запису на помилку, якщо він існує
        if (withdrawalRecord && withdrawalRecord.id) {
            try {
                await prisma.withdrawal.update({
                    where: { id: withdrawalRecord.id },
                    data: {
                        status: 'FAILED_INTERNAL_ERROR',
                        notes: `Внутрішня помилка сервера: ${error.message}`
                    }
                });
            } catch (dbUpdateError) {
                console.error("Failed to update withdrawal status on outer catch:", dbUpdateError);
            }
        }

        if (!res.headersSent) {
            if (error.code === 'P2002' && error.meta?.target?.includes('liqpayOrderId')) {
                return res.status(400).json({ message: 'Помилка: Order ID для виводу вже існує. Спробуйте ще раз за мить.' });
            }
            return res.status(500).json({ message: 'Внутрішня помилка сервера при обробці запиту на вивід.' });
        }
    }
};

// ... функція handleCallback залишається без змін ...
export const handleCallback = async (req, res) => {
    const liqpayData = req.body.data;
    const liqpaySignature = req.body.signature;

    if (!liqpayData || !liqpaySignature) {
        console.warn('⚠️ Missing data or signature in LiqPay callback POST body');
        return res.status(400).send('Missing data or signature from LiqPay');
    }

    const expectedSignature = crypto
        .createHash('sha1')
        .update(privateKey + liqpayData + privateKey)
        .digest('base64');

    if (expectedSignature !== liqpaySignature) {
        console.warn('⚠️ Bad LiqPay signature in callback');
        return res.status(400).send('Bad signature');
    }

    try {
        const json = JSON.parse(Buffer.from(liqpayData, 'base64').toString('utf8'));
        console.log('✅ LiqPay callback received (parsed JSON):', json);

        const orderId = json.order_id;

        // Обробка колбеку для ВИВОДУ КОШТІВ
        if (orderId && orderId.startsWith('withdraw-')) {
            console.log(`🔄 Processing WITHDRAWAL callback for order_id: ${orderId}`);
            const withdrawal = await prisma.withdrawal.findUnique({
                where: { liqpayOrderId: orderId }
            });

            if (!withdrawal) {
                console.warn(`⚠️ Withdrawal record not found for order_id: ${orderId}. Ignoring callback.`);
                return res.sendStatus(200);
            }

            if (withdrawal.status.startsWith('COMPLETED_') || withdrawal.status === 'FAILED_FINALIZED' || withdrawal.status === 'ERROR_BALANCE_DECREMENT') {
                console.log(`↪️ Withdrawal order_id: ${orderId} already in a final or critical error state: ${withdrawal.status}. No update.`);
                return res.sendStatus(200);
            }

            let newStatus = withdrawal.status;
            let notes = withdrawal.notes || '';
            const finalLiqpayPaymentId = json.payment_id || json.transaction_id || withdrawal.liqpayPaymentId;

            if (json.status === 'success' || json.status === 'sandbox') {
                newStatus = json.status === 'sandbox' ? 'COMPLETED_SANDBOX' : 'COMPLETED_LIVE';
                notes = `Успішний вивід (${json.status}). ID транзакції LiqPay: ${finalLiqpayPaymentId || 'N/A'}`;
                console.log(`✅ Withdrawal successful for order_id: ${orderId}, LiqPay status: ${json.status}`);

                if (withdrawal.status !== 'COMPLETED_SANDBOX' && withdrawal.status !== 'COMPLETED_LIVE') {
                    try {
                        await prisma.user.update({
                            where: { id: withdrawal.userId },
                            data: {
                                balance: {
                                    decrement: withdrawal.amount
                                }
                            }
                        });
                        console.log(`➖ User balance decremented for userId: ${withdrawal.userId} by ${withdrawal.amount}`);
                    } catch (balanceError) {
                        console.error(`❌ CRITICAL: Error decrementing balance for userId: ${withdrawal.userId} after successful withdrawal ${orderId}`, balanceError);
                        newStatus = `ERROR_BALANCE_DECREMENT`;
                        notes += ` | КРИТИЧНО: Помилка зменшення балансу після успішного виводу! ${balanceError.message}`;
                    }
                }
            } else {
                newStatus = `FAILED_LIQPAY_STATUS_${json.status.toUpperCase()}`;
                notes = `Вивід не успішний. Статус LiqPay: ${json.status}, Код помилки: ${json.err_code || 'N/A'}, Опис: ${json.err_description || 'N/A'}`;
                console.warn(`❌ Withdrawal for order_id: ${orderId} has status: ${json.status}. Error: ${json.err_description}`);
            }

            await prisma.withdrawal.update({
                where: { liqpayOrderId: orderId },
                data: {
                    status: newStatus,
                    liqpayPaymentId: String(json.payment_id || json.transaction_id || ''),
                    notes,
                    updatedAt: new Date()
                }
            });
            console.log(`💾 Withdrawal record for order_id: ${orderId} updated to status: ${newStatus}`);

        } else if (orderId && (orderId.startsWith('sub-') || orderId.startsWith('donation-'))) {
            console.log(`💰 Processing PAYMENT (donation/subscription) callback for order_id: ${orderId}`);
            if (json.status === 'success' || json.status === 'sandbox') {
                const paymentAmount = parseFloat(json.amount);
                let authorUsername;
                let isSubscription = false;
                let subscribingUserId;

                if (orderId.startsWith('sub-')) {
                    const parts = orderId.split('-');
                    if (parts.length >= 5) {
                        authorUsername = parts[1];
                        subscribingUserId = parseInt(parts[2]);
                        isSubscription = true;
                    } else {
                        console.warn('⚠️ Malformed subscription order_id for payment:', orderId);
                        return res.sendStatus(200);
                    }
                } else if (orderId.startsWith('donation-')) {
                    const parts = orderId.split('-');
                    if (parts.length >= 2) {
                        authorUsername = parts[1];
                    } else {
                        console.warn('⚠️ Malformed donation order_id for payment:', orderId);
                        return res.sendStatus(200);
                    }
                } else {
                    console.warn('⚠️ Unknown payment order_id type:', orderId);
                    return res.sendStatus(200);
                }

                if (authorUsername && paymentAmount > 0) {
                    const author = await prisma.author.findUnique({
                        where: { username: authorUsername },
                        select: { userId: true, id: true },
                    });

                    if (!author) {
                        console.warn(`⚠️ Author (recipient) not found for payment processing: ${authorUsername}. Order_id: ${orderId}`);
                        return res.sendStatus(200);
                    }

                    const updatedUser = await prisma.user.update({
                        where: { id: author.userId },
                        data: {
                            balance: {
                                increment: paymentAmount,
                            },
                        },
                    });
                    console.log(`💰 User balance (author ${authorUsername}, userId=${author.userId}) incremented by ${paymentAmount}. New balance: ${updatedUser.balance}`);

                    if (isSubscription) {
                        const [, , , tierIdStr] = orderId.split('-');
                        const tierId = parseInt(tierIdStr);

                        const expiresAt = new Date();
                        expiresAt.setDate(expiresAt.getDate() + 30);

                        await prisma.tierSubscription.create({
                            data: {
                                userId: subscribingUserId,
                                tierId: tierId,
                                createdAt: new Date(json.create_date || Date.now()),
                                expiresAt,
                            },
                        });
                        console.log(`📦 Subscription record created for subscribingUserId=${subscribingUserId}, tierId=${tierId}`);

                        await prisma.author.update({
                            where: { id: author.id },
                            data: {
                                subscribers: {
                                    increment: 1,
                                },
                            },
                        });
                        console.log(`📈 Subscribers count for author ${authorUsername} incremented.`);
                    }
                } else {
                    console.warn(`⚠️ Could not process payment: invalid data. authorUsername ('${authorUsername}'), paymentAmount (${paymentAmount}). Order_id: ${orderId}`);
                }
            } else {
                console.warn(`⚠️ LiqPay PAYMENT (donation/subscription) status not successful: ${json.status} for order_id ${orderId}. Description: ${json.err_description || 'N/A'}`);
            }
        } else {
            console.warn(`❓ Unhandled LiqPay callback type or missing/unrecognized order_id: '${orderId}'. Full callback JSON:`, json);
        }
    } catch (error) {
        console.error('❌ CRITICAL Error processing LiqPay callback:', error);
    }
    res.sendStatus(200);
};