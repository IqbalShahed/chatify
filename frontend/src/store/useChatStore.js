import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

export const useChatStore = create((set, get) => ({
    allContacts: [],
    chatPartners: [],
    messages: [],
    activeTab: "chats",
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) ?? false,

    toggleSound: () => {
        const newState = !get().isSoundEnabled;
        localStorage.setItem("isSoundEnabled", JSON.stringify(newState));
        set({ isSoundEnabled: newState });
    },

    setActiveTab: (tab) => set({ activeTab: tab }),
    setSelectedUser: (selectedUser) => set({ selectedUser }),

    getAllContacts: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("message/contacts");
            set({ allContacts: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false })
        }
    },

    getMyChatPartners: async () => {
        set({ isUsersLoading: true })
        try {
            const res = await axiosInstance.get('message/chats');
            set({ chatPartners: res.data });
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isUsersLoading: false })
        }
    }
}))