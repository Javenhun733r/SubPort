import prisma from "../db/db.config.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

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

        // Створення payload без пароля
        const payload = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

        return res.status(201).json({
            message: "User registered successfully",
            token,
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
            name : user.name,
            email : user.email,
            password : user.password
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET);

        return res.json({message: "Login Successful", token}).status(200)
    } catch (error){
        console.log(error);
        return res.json({error: "Internal Server Error"}).status(500);
    }
}