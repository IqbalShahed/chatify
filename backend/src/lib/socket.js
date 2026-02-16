import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middlewares/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ENV.CLIENT_URL,
        credentials: true,
    },
});

// Apply authentication middleware
io.use(socketAuthMiddleware);

export const getReceiverSocketId = (userId) => {
    return userSocketMap[userId];
}

// Store online users
const userSocketMap = {}; // { userId: socketId }

io.on("connection", (socket) => {
    console.log("User connected:", socket.user.fullName);

    const userId = socket.userId;

    // Add user to map
    userSocketMap[userId] = socket.id;

    // Send updated online users list
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.user.fullName);

        delete userSocketMap[userId];

        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, app, server };
