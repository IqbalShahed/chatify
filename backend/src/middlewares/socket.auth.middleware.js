import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { ENV } from '../lib/env.js';

export const socketAuthMiddleware = async (socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie;

        if (!cookieHeader) {
            console.log("Socket rejected - No cookie header");
            return next(new Error("Unauthorized"));
        }

        const token = cookieHeader
            .split("; ")
            .find(row => row.startsWith("jwt="))
            ?.split("=")[1];

        if (!token) {
            console.log("Socket rejected - No JWT token");
            return next(new Error("Unauthorized"));
        }

        // Verify token
        const decoded = jwt.verify(token, ENV.JWT_SECRET);

        if (!decoded?.userId) {
            console.log("Socket rejected - Invalid token");
            return next(new Error("Unauthorized"));
        }

        // Find user
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            console.log("Socket rejected - User not found");
            return next(new Error("Unauthorized"));
        }

        socket.user = user;
        socket.userId = user._id.toString();

        console.log(`Socket authenticated: ${user.fullName}`);

        next();

    } catch (error) {
        console.log("Socket Auth Error:", error.message);
        return next(new Error("Unauthorized"));
    }
};
