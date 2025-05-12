import express from 'express';
import {
    createDonation,
    createSubscription,
    createWithdrawal,
    handleCallback
} from '../controllers/paymentController.js';
import {verifyToken} from "../middleware/verifyToken.js";

const router = express.Router();

router.post('/create-donation', createDonation);
router.post('/create-subscription', verifyToken, createSubscription);
router.post('/callback', express.urlencoded({ extended: false }), handleCallback);
router.post('/withdrawal', verifyToken, createWithdrawal);

export default router;
