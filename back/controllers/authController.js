import prisma from "../db/db.config.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

export const RegisterController = async (req, res) => {
    try{
        const { name, email, password } = req.body;
        const user = await prisma.user.findFirst({
            where: {
                email: email,
            }
        })
        if (user) {
            return res.json({error: "User already exists"}).status(400);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data:{
                name: name,
                email: email,
                password: hashedPassword,
            }
        })
        return res.json(newUser).status(201)
    } catch (error){
        console.log(error);
        return res.json({error: "Internal Server Error"}).status(500);
    }
}
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