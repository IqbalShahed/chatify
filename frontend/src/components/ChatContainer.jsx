import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import ChatHeader from './ChatHeader';
import NoChatHistoryPlaceholder from './NoChatHistoryPlaceholder';
import MessageInput from './MessageInput';
import MessagesLoadingSkeleton from './MessagesLoadingSkeleton';

const ChatContainer = () => {
    const { getMessagesByUserId, messages, selectedUser, isMessagesLoading } = useChatStore();
    const { authUser } = useAuthStore();
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!selectedUser) return;
        getMessagesByUserId(selectedUser._id);
    }, [selectedUser, getMessagesByUserId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <>
            <ChatHeader />

            <div className='flex-1 px-6 py-8 overflow-y-auto'>
                {isMessagesLoading ? (
                    <MessagesLoadingSkeleton />
                ) : messages.length > 0 ? (
                    <div className='max-w-3xl mx-auto space-y-6'>
                        {messages.map(message => {
                            const isMe =
                                message.senderId === authUser._id ||
                                message.senderId?._id === authUser._id;

                            return (
                                <div key={message._id} className={`chat ${isMe ? "chat-end" : "chat-start"}`}>
                                    <div className={`chat-bubble relative ${isMe ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-200"}`}>
                                        {message.image && (
                                            <img
                                                src={message.image}
                                                alt="Shared"
                                                className='rounded-lg h-48 object-cover'
                                            />
                                        )}
                                        {message.text && (
                                            <p className='mt-2'>{message.text}</p>
                                        )}
                                        <p className='text-xs mt-1 opacity-75'>
                                            {new Date(message.createdAt).toLocaleTimeString(undefined, {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>
                ) : (
                    <NoChatHistoryPlaceholder name={selectedUser?.fullName} />
                )}
            </div>

            <MessageInput />
        </>
    );
};

export default ChatContainer;
