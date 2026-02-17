import { useEffect, useRef } from "react";
import { PhoneCallIcon, PhoneIcon, PhoneOffIcon } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
import { useChatStore } from "../store/useChatStore";

const AudioCallPanel = () => {
    const {
        callStatus,
        caller,
        receiver,
        localStream,
        remoteStream,
        acceptCall,
        rejectCall,
        endCall,
    } = useCallStore();
    const { selectedUser } = useChatStore();

    const localAudioRef = useRef(null);
    const remoteAudioRef = useRef(null);

    useEffect(() => {
        if (localAudioRef.current) {
            localAudioRef.current.srcObject = localStream || null;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream || null;
        }
    }, [remoteStream]);

    if (callStatus === "idle") return null;

    const peer = receiver || caller || selectedUser;
    const displayName = peer?.fullName || "Unknown user";

    return (
        <div className="absolute bottom-6 right-6 z-30 w-80 rounded-xl border border-cyan-500/30 bg-slate-900/95 p-4 shadow-2xl">
            <audio ref={localAudioRef} autoPlay muted />
            <audio ref={remoteAudioRef} autoPlay />

            <div className="flex items-center gap-3 mb-3">
                <div className="size-11 rounded-full overflow-hidden bg-slate-800">
                    <img
                        src={peer?.profilePic || "/images/avatar.png"}
                        alt={displayName}
                        className="size-full object-cover"
                    />
                </div>
                <div>
                    <p className="text-slate-100 font-medium truncate">{displayName}</p>
                    <p className="text-xs text-slate-400 capitalize">{callStatus}</p>
                </div>
            </div>

            {callStatus === "ringing" && (
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={acceptCall}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-3 py-2 text-white hover:bg-cyan-700 transition-colors"
                    >
                        <PhoneIcon className="size-4" />
                        Accept
                    </button>
                    <button
                        type="button"
                        onClick={rejectCall}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-white hover:bg-rose-700 transition-colors"
                    >
                        <PhoneOffIcon className="size-4" />
                        Reject
                    </button>
                </div>
            )}

            {callStatus === "calling" && (
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 text-cyan-300 text-sm">
                        <PhoneCallIcon className="size-4 animate-pulse" />
                        Calling...
                    </div>
                    <button
                        type="button"
                        onClick={endCall}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-white hover:bg-rose-700 transition-colors"
                    >
                        <PhoneOffIcon className="size-4" />
                        Cancel
                    </button>
                </div>
            )}

            {callStatus === "connected" && (
                <button
                    type="button"
                    onClick={endCall}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-white hover:bg-rose-700 transition-colors"
                >
                    <PhoneOffIcon className="size-4" />
                    End Call
                </button>
            )}
        </div>
    );
};

export default AudioCallPanel;
