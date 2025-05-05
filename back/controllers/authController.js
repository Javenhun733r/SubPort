import prisma from "../db/db.config.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
export const sendVerificationEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
        service: "gmail", // чи інший сервіс
        auth: {
            user: process.env.EMAIL, // твоя пошта
            pass: process.env.EMAIL_PASSWORD, // пароль до пошти
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Confirm your email address",
        html: `<h1>Welcome!</h1><p>Click the link below to confirm your email address:</p><a href="${process.env.FRONTEND_URL}/verify-email/${token}">Verify Email</a>`,
    };

    await transporter.sendMail(mailOptions);
};

export const RegisterController = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await prisma.user.findFirst({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        // Генерація токену для підтвердження пошти
        const verificationToken = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Надсилання листа для підтвердження пошти
        await sendVerificationEmail(newUser.email, verificationToken);

        return res.status(201).json({
            message: "User registered successfully. Please check your email to confirm your account.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const SignInController = async (req, res) => {
    try{
        const { email, password } = req.body;
        const user = await prisma.user.findFirst({
            where: {
                email: email,
            }
        })
        if (!user) {
            return res.json({error: "User does not exists"}).status(400);
        }
        const comparePassword = await bcrypt.compare(password, user.password)
        if (!comparePassword) {
            return res.json({error: "Invalid Credentials"});
        }
        const payload = {
            id : user.id,
            role: user.role,
            name: user.name,
            email: user.email
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET);

        return res.json({message: "Login Successful", token}).status(200)
    } catch (error){
        console.log(error);
        return res.json({error: "Internal Server Error"}).status(500);
    }
}
export const VerifyEmailController = async (req, res) => {
    try {
        const { token } = req.params;

        // Декодуємо токен
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { email: decoded.email },
        });

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        // Оновлюємо статус користувача як підтверджений
        await prisma.user.update({
            where: { email: decoded.email },
            data: { isVerified: true }, // необхідно додати поле isVerified в модель User
        });

        return res.status(200).json({ message: "Email verified successfully!" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
