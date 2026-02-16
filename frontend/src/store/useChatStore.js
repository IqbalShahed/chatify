import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

const notificationSound = new Audio("/sounds/notification.mp3");

export const useChatStore = create((set, get) => ({
    // ---------------- STATE ----------------
    allContacts: [],
    chatPartners: [],
    messages: [],
    activeTab: "chats",
    selectedUser: null,

    uploadProgress: 0,
    isUploading: false,

    isUsersLoading: false,
    isMessagesLoading: false,
    isSending: false,

    isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) ?? false,

    // ---------------- UI ACTIONS ----------------
    toggleSound: () => {
        const newState = !get().isSoundEnabled;
        localStorage.setItem("isSoundEnabled", JSON.stringify(newState));
        set({ isSoundEnabled: newState });
    },

    setActiveTab: (tab) => set({ activeTab: tab }),
    setSelectedUser: (user) => set({ selectedUser: user, messages: [] }),

    // ---------------- CONTACTS ----------------
    getAllContacts: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/message/contacts");
            set({ allContacts: res.data });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to load contacts");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMyChatPartners: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/message/chats");
            set({ chatPartners: res.data });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to load chats");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    // ---------------- MESSAGES ----------------
    getMessagesByUserId: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/message/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to load messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    // ---------------- SEND MESSAGE ----------------
    sendMessage: async (formData) => {
        const { selectedUser, isSending } = get();
        const { authUser } = useAuthStore.getState();

        if (!selectedUser || isSending) return;

        const hasImage = formData.get("image");

        set({ isSending: true });

        const tempId = `temp-${Date.now()}`;

        const optimisticMessage = {
            _id: tempId,
            senderId: authUser._id,
            receiverId: selectedUser._id,
            text: formData.get("text"),
            image: hasImage ? URL.createObjectURL(hasImage) : null,
            createdAt: new Date().toISOString(),
            isOptimistic: true,
        };

        // Optimistic UI update
        set((state) => ({
            messages: [...state.messages, optimisticMessage],
            isUploading: hasImage,
            uploadProgress: hasImage ? 0 : 0,
        }));

        try {
            const res = await axiosInstance.post(
                `/message/send/${selectedUser._id}`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    ...(hasImage && {
                        onUploadProgress: (progressEvent) => {
                            if (!progressEvent.total) return;
                            const percent = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            set({ uploadProgress: percent });
                        },
                    }),
                }
            );

            // Replace optimistic message with real one
            set((state) => ({
                messages: state.messages.map((msg) =>
                    msg._id === tempId ? res.data : msg
                ),
                isUploading: false,
                uploadProgress: 0,
            }));
        } catch (error) {
            // Rollback optimistic message
            set((state) => ({
                messages: state.messages.filter((msg) => msg._id !== tempId),
                isUploading: false,
                uploadProgress: 0
            }));

            toast.error(error?.response?.data?.message || "Message failed");
        } finally {
            set({ isSending: false });
        }
    },

    // ---------------- REALTIME MESSAGE ------------
    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            const { selectedUser, isSoundEnabled } = get();

            if (!selectedUser) return;
            if (
                newMessage.senderId === selectedUser._id ||
                newMessage.receiverId === selectedUser._id
            ) {
                set((state) => ({
                    messages: [...state.messages, newMessage],
                }));
            }
            if (isSoundEnabled) {
                notificationSound.currentTime = 0;
                notificationSound
                    .play()
                    .catch((e) => console.log("Audio play failed", e));
            }
        });
    },
    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
    }
}));
