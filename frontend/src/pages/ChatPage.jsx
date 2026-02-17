import React, { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import NoConversationPlaceholder from '../components/NoConversationPlaceholder';
import ChatContainer from '../components/ChatContainer';
import ChatsList from '../components/ChatsList';
import ContactList from '../components/ContactList';
import ActiveTabSwitch from '../components/ActiveTabSwitch';
import ProfileHeader from '../components/ProfileHeader';
import { useAuthStore } from '../store/useAuthStore';
import { useCallStore } from '../store/useCallStore';
import AudioCallPanel from '../components/AudioCallPanel';

const ChatPage = () => {
    const { activeTab, selectedUser } = useChatStore();
    const { socket } = useAuthStore();
    const { subscribeToCallEvents, unsubscribeFromCallEvents } = useCallStore();

    useEffect(() => {
        if (!socket) return;
        subscribeToCallEvents();

        return () => {
            unsubscribeFromCallEvents();
        };
    }, [socket, subscribeToCallEvents, unsubscribeFromCallEvents]);

    return (
        <div className='relative w-full max-w-6xl h-[800px]'>
            <BorderAnimatedContainer>
                {/**LEFT SIDE */}
                <div className='w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col'>
                    <ProfileHeader />
                    <ActiveTabSwitch />
                    <div className='flex-1 overflow-y-auto p-4 space-y-2'>
                        {activeTab === "chats" ? <ChatsList /> : <ContactList />}
                    </div>
                </div>

                {/**RIGHT SIDE */}
                <div className='flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm'>
                    {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
                </div>
            </BorderAnimatedContainer>
            <AudioCallPanel />
        </div>
    );
};

export default ChatPage;
