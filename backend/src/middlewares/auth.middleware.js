import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { ENV } from '../lib/env.js';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies?.jwt;
        if (!token) return res.status(401).json({ message: "Unauthorized - token not provided." })
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if (!decoded) return res.status(401).json({ message: "Unauthorized - invalid token." })
        const existingUser = await User.findById(decoded.userId).select("-password")
        if (!existingUser) return res.status(404).json({ message: "User not found." })

        req.user = existingUser
        next()
    } catch (error) {
        console.error("Error in protectRoute middleware: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}