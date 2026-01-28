import express from 'express';
import { signup, login, logout, updateProfile } from '../controllers/auth.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { arcjetProtection } from '../middlewares/arcjet.middleware.js';
import multer from 'multer';

const router = express.Router();

router.use(arcjetProtection);
const upload = multer({ storage: multer.diskStorage({}) });

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update-profile", protectRoute, upload.single("profilePic"), updateProfile);
router.get("/check", protectRoute, (req, res) => res.status(200).json(req.user))

export default router;