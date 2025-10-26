import mongoose from 'mongoose';

export const connectDB = async ()=> {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("MONGODB CONNECTED", conn.connection.host);
    } catch (error) {
        console.error("DATABASE CONNECTION FAILED", error);
        process.exit(1); // 1 means faild, 0 means success
    }
}