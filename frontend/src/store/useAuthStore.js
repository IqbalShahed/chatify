import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    isLoggedIn: false,
    login: () => {
        set({ isLoggedIn: true })
    }
}));