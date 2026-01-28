import React, { useRef, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { LogOutIcon, Volume2Icon, VolumeOffIcon } from 'lucide-react'

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

const ProfileHeader = () => {
    const { logout, authUser, updateProfile, isUpdateProfile } = useAuthStore();
    const { isSoundEnabled, toggleSound } = useChatStore();
    const [selectedImg, setSelectedImg] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedImg(URL.createObjectURL(file));
        const formData = new FormData();
        formData.append("profilePic", file);
        await updateProfile(formData);
    }

    return (
        <div className='p-6 border-b border-slate-700/50'>
            <div className='flex items-center justify-between'>
                <div className="flex items-center gap-3">
                    {/**AVATAR */}
                    <div className="avatar avatar-online">
                        <button className='size-14 rounded-full overflow-hidden relative group' onClick={() => fileInputRef.current.click()}
                            disabled={isUpdateProfile}
                        >
                            <img src={selectedImg || authUser.profilePic || "/images/avatar.png"} alt="User Pic" className='size-full object-cover' />
                            {/*Hover change label */}
                            <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity'>
                                <span className='text-white text-xs'>Change</span>
                            </div>
                            {/*SHOW LOADER WHEN UPDATING */}
                            {isUpdateProfile && (
                                <div className='absolute inset-0 bg-black/60 flex items-center justify-center'>
                                    <div className='animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full' />
                                </div>
                            )}
                        </button>
                        <input
                            type="file"
                            accept='image/*'
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className='hidden'
                        />
                    </div>
                    <div>
                        <h3 className='text-slate-200 font-medium text-base max-w-[180px] truncate'>
                            {authUser.fullName}
                        </h3>
                        <p className='text-slate-400 text-xs'>Online</p>
                    </div>
                </div>
                {/**BUTTONS */}
                <div className='flex gap-4 items-center'>
                    {/**LOGOUT BTN */}
                    <button className='text-slate-400 hover:text-slate-200 transition-colors' onClick={logout}>
                        <LogOutIcon className='size-5' />
                    </button>
                    {/**TOGGLE SOUND BTN */}
                    <button
                        className='text-slate-400 hover:text-slate-200 transition-colors'
                        onClick={() => {
                            mouseClickSound.currentTime = 0; //reset to start
                            mouseClickSound.play().catch((error) => console.log("Audio Play Failed: ", error));
                            toggleSound();
                        }}
                    >
                        {isSoundEnabled ? (<Volume2Icon className='size-5' />) : (<VolumeOffIcon className='size-5' />)}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;