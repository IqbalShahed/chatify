import User from "../models/user.model.js";
import Message from '../models/message.model.js';
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getAllContacts = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filterdUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        res.status(200).json(filterdUsers);
    } catch (error) {
        console.error("Error in getAllContacts: ", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
}

export const getMessageByUserId = async (req, res) => {
    try {
        const myId = req.user._id;
        const { id: userToChatId } = req.params;

        const userExists = await User.findById(userToChatId);
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ],
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessageByUserId: ", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        const userExists = await User.findById(receiverId);
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }

        let imageUrl;

        if (req.file) {
            const uploadResponse = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
                {
                    folder: `chatify/messages/${senderId}`,
                }
            );
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage.toObject());
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const getChatPartners = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        //find all the messages where loggedin user in either sender or receiver.
        const messages = await Message.find({
            $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }]
        })

        const chatPartnerIds = [... new Set(messages.map(msg =>
            msg.senderId.toString() === loggedInUserId.toString()
                ? msg.receiverId.toString()
                : msg.senderId.toString()
        ))
        ];

        const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");
        res.status(200).json(chatPartners);

    } catch (error) {
        console.error("Error in getChatPartners: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}