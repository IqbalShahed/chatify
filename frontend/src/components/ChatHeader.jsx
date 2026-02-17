import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { PhoneIcon, XIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore";
import toast from "react-hot-toast";

const ChatHeader = () => {
    const { selectedUser, setSelectedUser } = useChatStore();
    const { onlineUsers } = useAuthStore();
    const { callStatus, startCall } = useCallStore();
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
    const isOnline = onlineUsers.includes(selectedUser._id);

    const handleStartCall = async () => {
        if (!isOnline) {
            toast.error("User is offline");
            return;
        }
        if (callStatus !== "idle") {
            toast.error("You are already in a call");
            return;
        }
        try {
            await startCall(selectedUser);
        } catch {
            toast.error("Unable to start audio call");
        }
    };

    return (
        <div className="flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 max-h-[84px] px-6">
            <div className="flex items-center space-x-3">
                <div className={`avatar ${isOnline ? 'avatar-online': 'avatar-offline'}`}>
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
                    <p className="text-slate-400 text-sm">{isOnline ? 'Online': 'Offline'}</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={handleStartCall}
                    disabled={!isOnline || callStatus !== "idle"}
                    className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer disabled:text-slate-600 disabled:cursor-not-allowed"
                    title="Start audio call"
                >
                    <PhoneIcon className="w-5 h-5" />
                </button>
                <button type="button" onClick={() => setSelectedUser(null)}>
                    <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;
