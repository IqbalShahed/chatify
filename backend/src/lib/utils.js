import jwt from 'jsonwebtoken';
import { ENV } from './env.js';

export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId: userId }, ENV.JWT_SECRET, {
        expiresIn: "7d"
    })

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, //7d
        httpOnly: true,
        sameSite: "strict",
        secure: ENV.NODE_ENV !== "development",
    });

    return token;
} 