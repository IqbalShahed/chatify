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

    // ----------------Call Signal------------------

    //Call User (Send Offer)
    socket.on("callUser", ({ to, offer }) => {
        const receiverSocketId = getReceiverSocketId(to);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("incomingCall", {
                from: socket.userId,
                fromUser: {
                    _id: socket.userId,
                    fullName: socket.user.fullName,
                    profilePic: socket.user.profilePic,
                },
                offer,
            });
        }
    });

    //Answer Call
    socket.on("answerCall", ({ to, answer }) => {
        const receiverSocketId = getReceiverSocketId(to);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("callAccepted", {
                answer,
            });
        }
    });

    //ICE Candidate Exchange
    socket.on("iceCandidate", ({ to, candidate }) => {
        const receiverSocketId = getReceiverSocketId(to);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("iceCandidate", {
                candidate,
            });
        }
    });

    //End Call
    socket.on("endCall", ({ to }) => {
        const receiverSocketId = getReceiverSocketId(to);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("callEnded");
        }
    });

    // Reject Call
    socket.on("rejectCall", ({ to }) => {
        const receiverSocketId = getReceiverSocketId(to);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("callRejected");
        }
    });
});

export { io, app, server };
