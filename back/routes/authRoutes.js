import express from 'express';
import {
    ForgotPasswordController,
    RegisterController,
    ResetPasswordController,
    SignInController,
    VerifyEmailController
} from "../controllers/authController.js";
const router = express.Router();
router.post('/login', SignInController);
router.post('/register', RegisterController);
router.get('/verify-email/:token', VerifyEmailController);
router.post('/forgot-password', ForgotPasswordController);
router.post('/reset-password/:token', ResetPasswordController);
export default router;