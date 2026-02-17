import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { createPeerConnection } from "../lib/webrtc";

export const useCallStore = create((set, get) => ({
    callStatus: "idle", // idle | calling | ringing | connected
    caller: null,
    receiver: null,
    localStream: null,
    remoteStream: null,
    peerConnection: null,

    // ---------------- START CALL ----------------
    startCall: async (receiver) => {
        const socket = useAuthStore.getState().socket;
        const { authUser } = useAuthStore.getState();

        if (!socket) return;

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });

        const pc = createPeerConnection();

        pc.ontrack = (event) => {
            set({ remoteStream: event.streams[0] });
        };

        stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("iceCandidate", {
                    to: receiver._id,
                    candidate: event.candidate,
                });
            }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("callUser", {
            to: receiver._id,
            offer,
            from: authUser,
        });

        set({
            callStatus: "calling",
            receiver,
            localStream: stream,
            peerConnection: pc,
        });
    },

    // ---------------- ACCEPT CALL ----------------
    acceptCall: async () => {
        const socket = useAuthStore.getState().socket;
        const { caller, peerConnection } = get();
        if (!socket || !caller || !peerConnection) return;

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });

        stream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, stream);
        });

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit("answerCall", {
            to: caller._id,
            answer,
        });

        set({
            callStatus: "connected",
            localStream: stream,
        });
    },

    // ---------------- REJECT CALL ----------------
    rejectCall: () => {
        const socket = useAuthStore.getState().socket;
        const { caller } = get();
        if (!socket || !caller) return;

        socket.emit("rejectCall", {
            to: caller._id,
        });

        get().resetCall();
    },

    // ---------------- END CALL ----------------
    endCall: () => {
        const socket = useAuthStore.getState().socket;
        const { receiver, caller } = get();
        if (!socket) return;

        socket.emit("endCall", {
            to: receiver?._id || caller?._id,
        });

        get().resetCall();
    },

    // ---------------- SOCKET LISTENERS ----------------
    subscribeToCallEvents: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        // Incoming Call
        socket.on("incomingCall", async ({ from, fromUser, offer }) => {
            const pc = createPeerConnection();

            await pc.setRemoteDescription(new RTCSessionDescription(offer));

            pc.ontrack = (event) => {
                set({ remoteStream: event.streams[0] });
            };

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("iceCandidate", {
                        to: from,
                        candidate: event.candidate,
                    });
                }
            };

            set({
                caller: fromUser || { _id: from },
                callStatus: "ringing",
                peerConnection: pc,
            });
        });

        // Call Accepted
        socket.on("callAccepted", async ({ answer }) => {
            const { peerConnection } = get();
            if (!peerConnection) return;

            await peerConnection.setRemoteDescription(
                new RTCSessionDescription(answer)
            );

            set({ callStatus: "connected" });
        });

        // ICE Candidate
        socket.on("iceCandidate", async ({ candidate }) => {
            const { peerConnection } = get();
            if (peerConnection && candidate) {
                await peerConnection.addIceCandidate(
                    new RTCIceCandidate(candidate)
                );
            }
        });

        // Call Ended
        socket.on("callEnded", () => {
            get().resetCall();
        });

        socket.on("callRejected", () => {
            get().resetCall();
        });
    },


    unsubscribeFromCallEvents: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("incomingCall");
        socket?.off("callAccepted");
        socket?.off("callRejected");
        socket?.off("iceCandidate");
        socket?.off("callEnded");
    },


    resetCall: () => {
        const { peerConnection, localStream } = get();
        peerConnection?.close();
        localStream?.getTracks().forEach((track) => track.stop());
        set({
            callStatus: "idle",
            caller: null,
            receiver: null,
            localStream: null,
            remoteStream: null,
            peerConnection: null,
        });
    },
}));
