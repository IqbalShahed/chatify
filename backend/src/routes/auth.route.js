import express from 'express';
import { signup, login, logout, updateProfile } from '../controllers/auth.controller.js';
import { loginLimiter, protectRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, (req, res) => res.status(200).json(req.user))

export default router;