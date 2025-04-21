import express from 'express';
import {RegisterController, SignInController} from "../controllers/authController.js";
const router = express.Router();
router.post('/login', SignInController);
router.post('/register', RegisterController);
export default router;