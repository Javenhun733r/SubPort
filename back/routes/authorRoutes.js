import express from "express";
import upload from "../middleware/upload.js";
import { verifyToken } from "../middleware/verifyToken.js";
import {
    createAuthor,
    createAuthorRequest,
    getAuthorByUsername,
    checkAdmin,
    getAllAuthorRequests,
    approveAuthorRequest,
    rejectAuthorRequest, getAuthors, updateProfile, getProfile
} from "../controllers/authorController.js"
const router = express.Router();


router.get('/author/:username', getAuthorByUsername);
router.post('/createauthor', createAuthor);
router.post('/request', verifyToken, upload.single('avatarFile'), createAuthorRequest);
router.get("/requests", getAllAuthorRequests);
router.post("/requests/approve/:requestId", approveAuthorRequest);
router.delete('/requests/reject/:requestId',  rejectAuthorRequest);
router.get("/authors", getAuthors);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

export default router;
