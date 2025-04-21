import express from "express";
import upload from "../middleware/upload.js";
import {
    createAuthor,
    createAuthorRequest,
    getAuthorByUsername,
    checkAdmin,
    getAllAuthorRequests,
    approveAuthorRequest,
    rejectAuthorRequest
} from "../controllers/authorController.js"
const router = express.Router();


router.get('/author/:username', getAuthorByUsername);
router.post('/createauthor', createAuthor);
router.post('/request', upload.single('avatarFile'), createAuthorRequest);
router.get("/requests", getAllAuthorRequests);
router.post("/requests/approve/:requestId", approveAuthorRequest);
router.delete('/requests/reject/:requestId',  rejectAuthorRequest);

export default router;
