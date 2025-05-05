import express from 'express';
import {RegisterController, SignInController, VerifyEmailController} from "../controllers/authController.js";
const router = express.Router();
router.post('/login', SignInController);
router.post('/register', RegisterController);
router.get('/verify-email/:token', VerifyEmailController);

export default router;