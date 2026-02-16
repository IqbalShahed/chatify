import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { XIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const ChatHeader = () => {
    const { selectedUser, setSelectedUser } = useChatStore();
    const { onlineUsers } = useAuthStore();
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === "Escape") {
                setSelectedUser(null);
            }
        };

        window.addEventListener("keydown", handleEscKey);

        return () => {
            window.removeEventListener("keydown", handleEscKey);
        };
    }, [setSelectedUser]);

    if (!selectedUser) return null;

    return (
        <div className="flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 max-h-[84px] px-6">
            <div className="flex items-center space-x-3">
                <div className={`avatar ${onlineUsers.includes(selectedUser._id) ? 'avatar-online': 'avatar-offline'}`}>
                    <div className="size-12 rounded-full">
                        <img
                            src={selectedUser.profilePic || "/images/avatar.png"}
                            alt={selectedUser.fullName}
                        />
                    </div>
                </div>
                <div>
                    <h3 className="text-slate-200 font-medium">
                        {selectedUser.fullName}
                    </h3>
                    <p className="text-slate-400 text-sm">{onlineUsers.includes(selectedUser._id) ? 'Online': 'Offline'}</p>
                </div>
            </div>

            <button onClick={() => setSelectedUser(null)}>
                <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
            </button>
        </div>
    );
};

export default ChatHeader;
