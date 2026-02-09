import express from 'express';
import { getAllContacts, getMessageByUserId, sendMessage, getChatPartners } from '../controllers/message.controllers.js';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { arcjetProtection } from '../middlewares/arcjet.middleware.js';
import { upload } from '../lib/multer.js';

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessageByUserId);
router.post("/send/:id", upload.single("image"), sendMessage);

export default router;