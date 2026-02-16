import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client'

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";
export const useAuthStore = create((set, get) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLogingIn: false,
    isUpdateProfile: false,
    socket: null,
    onlineUsers: [],

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
            get().connectSocket();
        } catch (error) {
            console.error("Error in checkAuth: ", error);
            set({ authUser: null })
        } finally {
            set({ isCheckingAuth: false })
        }
    },
    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account Successfully Created");
            get().connectSocket();
        } catch (error) {
            console.error("Error in signup: ", error);
            toast.error(error?.response?.data?.message || "Internal Server Error");
        } finally {
            set({ isSigningUp: false })
        }
    },
    login: async (data) => {
        set({ isLogingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success("Login successfully");
            get().connectSocket();
        } catch (error) {
            console.error("Error in Login: ", error)
            toast.error(error?.response?.data?.message || "Internal Server Error");
        } finally {
            set({ isLogingIn: false })
        }
    },
    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logout successfully");
            get().disconnectSocket();
        } catch (error) {
            console.error("Error in Login: ", error)
            toast.error(error?.response?.data?.message || "Logout failed");
        }
    },
    updateProfile: async (data) => {
        set({ isUpdateProfile: true })
        try {
            const res = await axiosInstance.put("/auth/update-profile", data, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" }
            });
            set({ authUser: res.data });
            toast.success("Profile Updated Successfully");
        } catch (error) {
            console.error("Profile Update Error: ", error);
            toast.error(error?.response?.data?.message || "Internal Server Error");
        } finally {
            set({ isUpdateProfile: false })
        }
    },
    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, { withCredentials: true });
        socket.connect();

        set({ socket });

        //Listen for online users
        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds })
        })
    },
    disconnectSocket: () => {
        const socket = get().socket;
        if (socket?.connected) {
            socket.disconnect();
            set({ socket: null, onlineUsers: [] });
        }
    }
}));