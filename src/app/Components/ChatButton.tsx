'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface ChatButtonProps {
  userId: string;
  username?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'icon';
  className?: string;
}

const ChatButton: React.FC<ChatButtonProps> = ({ 
  userId, 
  username, 
  variant = 'primary',
  className = ''
}) => {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/chat?userId=${userId}`);
  };
  
  // Styling based on variant
  const getButtonStyles = () => {
    switch(variant) {
      case 'primary':
        return 'bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md';
      case 'secondary':
        return 'bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md';
      case 'outline':
        return 'border border-indigo-500 text-indigo-500 hover:bg-indigo-50 px-4 py-2 rounded-md';
      case 'icon':
        return 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800 p-2 rounded-full';
      default:
        return 'bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md';
    }
  };
  
  return (
    <button 
      onClick={handleClick}
      className={`flex items-center transition-colors ${getButtonStyles()} ${className}`}
    >
      {variant === 'icon' ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          {username ? `Chat with ${username}` : 'Message'}
        </>
      )}
    </button>
  );
};

export default ChatButton;
