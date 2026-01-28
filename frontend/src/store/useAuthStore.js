import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

export const useAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLogingIn: false,
    isUpdateProfile: false,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data })
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
            toast.success("Account Successfully Created")
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
        } catch (error) {
            console.error("Error in Login: ", error)
            toast.error(error.response.data.message);
        }
    },
    updateProfile: async (data) => {
        set({isUpdateProfile : true})
        try {
            const res = await axiosInstance.put("/auth/update-profile", data, {
                withCredentials: true,
                headers: {"Content-Type": "multipart/form-data"}
            });
            set({ authUser: res.data });
            toast.success("Profile Updated Successfully");
        } catch (error) {
            console.error("Profile Update Error: ", error);
            toast.error(error?.response?.data?.message || "Internal Server Error");
        } finally{
            set({isUpdateProfile: false})
        }
    }
}));