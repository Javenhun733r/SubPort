import express from "express";
import upload from "../middleware/upload.js";
import { verifyToken } from "../middleware/verifyToken.js";
import {
    createAuthorRequest,
    getAuthorByUsername,
    checkAdmin,
    getAllAuthorRequests,
    approveAuthorRequest,
    rejectAuthorRequest,
    getAuthors,
    getProfile,
    createPost,
    createTier,
    isOwner, subscribeToTier, createComment, getCommentsByPost, deleteComment, getSimilarAuthors,deletePost
} from "../controllers/authorController.js"
const router = express.Router();


router.get('/author/:username', getAuthorByUsername);
router.post('/request', verifyToken, upload.single('avatarFile'), createAuthorRequest);
router.get("/requests", getAllAuthorRequests);
router.post("/requests/approve/:requestId", verifyToken, checkAdmin, approveAuthorRequest);
router.delete('/requests/reject/:requestId',verifyToken, checkAdmin, rejectAuthorRequest);
router.get("/authors", getAuthors);
router.get('/profile', verifyToken, getProfile);
router.post("/:id/post", verifyToken, upload.single('postImage'), createPost);
router.post("/:id/tier", verifyToken, createTier);
router.get("/author/:username/is-owner", isOwner);
router.post('/subscribe/:tierId', verifyToken, subscribeToTier);
router.get('/:postId/comments', getCommentsByPost);
router.delete('/comment/:commentId', verifyToken, deleteComment);
router.get('/authors/:username/similar', getSimilarAuthors);
router.post('/:postId/comment', verifyToken, upload.single('commentImage'), createComment);
router.delete('/comments/:commentId', verifyToken, deleteComment);
router.delete('/posts/:postId', verifyToken, deletePost);

export default router;
