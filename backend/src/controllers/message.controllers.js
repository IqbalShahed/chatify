import User from "../models/user.model.js";
import Message from '../models/message.model.js';
import cloudinary from "../lib/cloudinary.js";

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
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        const userExists = await User.findById(receiverId);
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image, {
                folder: "chatify/messages",
            });
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        await newMessage.save();
        //todo: Send message to receiver if onlne -- socket.io

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

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