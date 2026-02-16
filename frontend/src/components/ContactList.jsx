import React, { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import UserLoadingSkeleton from '../components/UsersLoadingSkeleton';
import NoChatsFound from '../components/NoChatsFound';
import { useAuthStore } from '../store/useAuthStore';

const ContactList = () => {
    const { getAllContacts, allContacts, isUsersLoading, setSelectedUser } = useChatStore();
    const { onlineUsers } = useAuthStore();
    useEffect(() => {
        getAllContacts();
    }, [getAllContacts])

    if (isUsersLoading) return <UserLoadingSkeleton />
    if (allContacts.length === 0) return <NoChatsFound />

    return (
        <>
            {allContacts.map(contact => (
                <div
                    key={contact._id}
                    className='bg-cyan-500/10 p-4 rounnded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors'
                    onClick={() => setSelectedUser(contact)}
                >
                    {/** TODO: MAKE IT WORKING WITH SOCKET */}
                    <div className='flex items-center gap-3'>
                        <div className={`avatar ${onlineUsers.includes(contact._id) ? 'avatar-online' : 'avatar-offline'}`}>
                            <div className='size-12 rounded-full'>
                                <img src={contact.profilePic || "/images/avatar.png"} alt={contact.fullName} />
                            </div>
                        </div>
                        <h4 className='text-slate-200 font-medium truncate'>{contact.fullName}</h4>
                    </div>
                </div>
            ))}
        </>
    );
};

export default ContactList;