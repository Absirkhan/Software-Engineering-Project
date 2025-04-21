'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { MessageSquare, Send, Clock } from 'lucide-react';

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  profilePicture?: string;
  role: string;
}

interface ChatInterfaceProps {
  currentUser: User;
  receiver: User;
  onClose?: () => void;
  fullScreen?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  currentUser, 
  receiver, 
  onClose,
  fullScreen = false
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [receiverTyping, setReceiverTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch message history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/chat/history/${receiver.id}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        } else {
          console.error('Error fetching messages:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (currentUser && receiver) {
      fetchMessages();
      // Mark messages as read
      fetch(`/api/chat/read/${receiver.id}`, { method: 'POST' });
    }
  }, [currentUser, receiver]);
  
  // Setup socket connection
  useEffect(() => {
    // Create a new socket connection
    const newSocket = io('http://localhost:3000', {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'] // Try WebSocket first, fallback to polling
    });
    
    setSocket(newSocket);
    
    // Socket connection events
    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
      setConnectionStatus('connected');
      
      // Authenticate after connection is established
      if (currentUser) {
        newSocket.emit('authenticate', { userId: currentUser.id });
      }
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnectionStatus('disconnected');
    });
    
    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnectionStatus('disconnected');
    });
    
    // Cleanup function
    return () => {
      console.log('Cleaning up socket connection');
      newSocket.disconnect();
    };
  }, [currentUser]);
  
  // Set up socket event listeners
  useEffect(() => {
    if (!socket || connectionStatus !== 'connected') return;
    
    // Receive message handler
    const handleReceiveMessage = (message: ChatMessage) => {
      if (message.senderId === receiver.id) {
        setMessages(prev => [...prev, message]);
        // Mark as read since chat is open
        fetch(`/api/chat/read/${receiver.id}`, { method: 'POST' });
      }
    };
    
    // Typing indicators
    const handleUserTyping = (data: { userId: string }) => {
      if (data.userId === receiver.id) {
        setReceiverTyping(true);
      }
    };
    
    const handleUserStoppedTyping = (data: { userId: string }) => {
      if (data.userId === receiver.id) {
        setReceiverTyping(false);
      }
    };
    
    // Message sent confirmation
    const handleMessageSent = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    };
    
    // Register event handlers
    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);
    socket.on('message_sent', handleMessageSent);
    
    // Cleanup
    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
      socket.off('message_sent', handleMessageSent);
    };
  }, [socket, receiver, connectionStatus]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, receiverTyping]);
  
  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping && socket && connectionStatus === 'connected') {
      setIsTyping(true);
      socket.emit('typing', { receiverId: receiver.id });
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (socket && connectionStatus === 'connected') {
        socket.emit('stop_typing', { receiverId: receiver.id });
      }
    }, 2000);
  };
  
  // Send message
  const sendMessage = () => {
    if (!inputMessage.trim() || !socket || connectionStatus !== 'connected') return;
    
    socket.emit('send_message', {
      receiverId: receiver.id,
      content: inputMessage.trim()
    });
    
    setInputMessage('');
    
    // Also clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
    socket.emit('stop_typing', { receiverId: receiver.id });
    
    // Focus the input field after sending
    inputRef.current?.focus();
  };
  
  // Handle enter key press to send message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      sendMessage();
    }
  };
  
  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format date for message groups
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = '';
    let currentGroup: ChatMessage[] = [];
    
    messages.forEach(message => {
      const messageDate = new Date(message.createdAt).toLocaleDateString();
      
      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({
            date: currentDate,
            messages: [...currentGroup]
          });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push({
        date: currentDate,
        messages: [...currentGroup]
      });
    }
    
    return groups;
  };
  
  const messageGroups = groupMessagesByDate();
  
  return (
    <div className={`flex flex-col ${fullScreen ? 'h-[calc(100vh-164px)]' : 'h-[500px]'} bg-white rounded-lg shadow-card`}>
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center">
          <div className="relative">
            {receiver.profilePicture ? (
              <img 
                src={receiver.profilePicture} 
                alt={receiver.username} 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-secondary font-semibold">
                  {receiver.username.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
          </div>
          <div className="ml-3">
            <p className="font-semibold text-text">{receiver.username}</p>
            <p className="text-xs text-textLight capitalize">{receiver.role}</p>
          </div>
        </div>
        {connectionStatus !== 'connected' && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
            <Clock size={12} className="mr-1" /> Reconnecting...
          </span>
        )}
        {onClose && (
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary"></div>
          </div>
        ) : messageGroups.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-textLight">
            <MessageSquare size={48} />
            <p className="mt-2">No messages yet. Start the conversation!</p>
            {connectionStatus !== 'connected' && (
              <p className="mt-2 text-sm text-yellow-600">Connecting to chat server...</p>
            )}
          </div>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-3">
              <div className="flex justify-center">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-textLight">
                  {formatDate(group.messages[0].createdAt)}
                </span>
              </div>
              
              {group.messages.map((message, index) => {
                const isCurrentUser = message.senderId === currentUser.id;
                const showAvatar = index === 0 || 
                  group.messages[index - 1].senderId !== message.senderId;
                
                return (
                  <div 
                    key={message.id} 
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isCurrentUser && showAvatar && (
                      <div className="flex-shrink-0 mr-2">
                        {receiver.profilePicture ? (
                          <img 
                            src={receiver.profilePicture} 
                            alt={receiver.username} 
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-secondary text-xs font-semibold">
                              {receiver.username.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="max-w-[75%]">
                      <div 
                        className={`px-4 py-2 rounded-lg ${
                          isCurrentUser 
                            ? 'bg-secondary text-white rounded-tr-none' 
                            : 'bg-gray-100 text-text rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                      <div 
                        className={`text-xs mt-1 text-textLight ${
                          isCurrentUser ? 'text-right' : 'text-left'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                        {isCurrentUser && message.read && (
                          <span className="ml-1 text-blue-500">✓</span>
                        )}
                      </div>
                    </div>
                    
                    {isCurrentUser && showAvatar && (
                      <div className="flex-shrink-0 ml-2">
                        {currentUser.profilePicture ? (
                          <img 
                            src={currentUser.profilePicture} 
                            alt={currentUser.username} 
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">
                              {currentUser.username.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
        
        {receiverTyping && (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
              <span className="text-secondary text-xs font-semibold">
                {receiver.username.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-500">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input */}
    <div className="border-t border-border p-3 bg-white">
      <div className="flex items-end space-x-2">
        <div className="flex-1 min-h-0">
        <textarea
          ref={inputRef}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary resize-none transition"
          placeholder="Type a message..."
          rows={2}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          onKeyUp={handleTyping}
          style={{ height: '50px', minHeight: '50px' }}
          disabled={connectionStatus !== 'connected'}
        />
        </div>
        <button
        className={`p-3 rounded-full bg-secondary text-white flex-shrink-0 ${connectionStatus !== 'connected' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-buttonHover'}`}
        onClick={sendMessage}
        disabled={!inputMessage.trim() || connectionStatus !== 'connected'}
        >
        <Send size={20} />
        </button>
      </div>
        {connectionStatus !== 'connected' && (
          <p className="text-xs text-yellow-600 mt-1 text-center">
            Connection to chat server lost. Reconnecting...
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
