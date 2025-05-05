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
    rejectAuthorRequest,
    getAuthors,
    updateProfile,
    getProfile,
    createPost,
    createTier,
    isOwner, subscribeToTier, createComment, getCommentsByPost, deleteComment, getSimilarAuthors
} from "../controllers/authorController.js"
const router = express.Router();


router.get('/author/:username', getAuthorByUsername);
router.post('/createauthor', createAuthor);
router.post('/request', verifyToken, upload.single('avatarFile'), createAuthorRequest);
router.get("/requests", getAllAuthorRequests);
router.post("/requests/approve/:requestId", verifyToken, checkAdmin, approveAuthorRequest);
router.delete('/requests/reject/:requestId',verifyToken, checkAdmin, rejectAuthorRequest);
router.get("/authors", getAuthors);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.post("/:id/post", verifyToken, createPost);
router.post("/:id/tier", verifyToken, createTier);
router.get("/author/:username/is-owner", isOwner);
router.post('/subscribe/:tierId', verifyToken, subscribeToTier);
router.post('/:postId/comment', verifyToken, createComment);
router.get('/:postId/comments', getCommentsByPost);
router.delete('/comment/:commentId', verifyToken, deleteComment);
router.get('/authors/:username/similar', getSimilarAuthors);

export default router;
