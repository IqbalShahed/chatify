import React, { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import UserLoadingSkeleton from '../components/UsersLoadingSkeleton';
import NoChatsFound from '../components/NoChatsFound';

const ChatsList = () => {
    const { getMyChatPartners, chatPartners, isUsersLoading, setSelectedUser } = useChatStore();
    useEffect(() => {
        getMyChatPartners();
    }, [getMyChatPartners])

    if (isUsersLoading) return <UserLoadingSkeleton />
    if (chatPartners.length === 0) return <NoChatsFound />
    return (
        <>
            {chatPartners.map(chatPartner => (
                <div
                    key={chatPartner._id}
                    className='bg-cyan-500/10 p-4 rounnded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors'
                    onClick={() => setSelectedUser(chatPartner)}
                >
                    <div className='flex items-center gap-3'>
                        <div className='avatar avatar-online'>
                            <div className='size-12 rounded-full'>
                                <img src={chatPartner.profilePic || "/images/avatar.png"} alt={chatPartner.fullName} />
                            </div>
                        </div>
                        <h4 className='text-slate-200 font-medium truncate'>{chatPartner.fullName}</h4>
                    </div>
                </div>
            ))}
        </>
    );
};

export default ChatsList;