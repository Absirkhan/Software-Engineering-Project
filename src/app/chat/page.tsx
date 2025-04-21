'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ChatInterface from '../Components/ChatInterface';
import Navbar from '../Components/navbar';
import { Search, UserPlus, MessageSquare, X } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  profile?: {
    profilePicture?: string;
  };
}

interface Conversation {
  userId: string;
  username: string;
  profilePicture: string | null;
  role: string;
  lastMessage: {
    content: string;
    createdAt: string;
    isFromUser: boolean;
  } | null;
  unreadCount: number;
}

const ChatPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  
  // Get the user ID from URL if available
  const userId = searchParams.get('userId');
  
  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/get-user');
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        } else {
          // Not logged in, redirect to login
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    
    fetchCurrentUser();
  }, [router]);
  
  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser) return;
      
      try {
        const response = await fetch('/api/chat/conversations');
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversations();
    
    // Set up polling to check for new messages every 30 seconds
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);
  
  // Fetch selected user if userId is in URL
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId || !currentUser) return;
      
      // Check if user is already in conversations
      const existingConversation = conversations.find(c => c.userId === userId);
      if (existingConversation) {
        setSelectedUser({
          id: existingConversation.userId,
          username: existingConversation.username,
          role: existingConversation.role,
          email: '',
          profile: {
            profilePicture: existingConversation.profilePicture || undefined
          }
        });
        return;
      }
      
      // Fetch user details if not in conversations
      try {
        const response = await fetch(`/get-user/${userId}`);
        if (response.ok) {
          const userData = await response.json();
          setSelectedUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };
    
    fetchUserDetails();
  }, [userId, currentUser, conversations]);
  
  // Navigation items for the navbar
  const items = [
    { name: "Dashboard", icon: "home", href: currentUser?.role === 'client' ? "/client_dashboard" : "/freelancer_dashboard" },
    { name: "Profile", icon: "user", href: currentUser?.role === 'client' ? "/client_dashboard/profile" : "/freelancer_dashboard/profile" },
    { name: "Jobs", icon: "file", href: currentUser?.role === 'client' ? "/client_dashboard/jobs" : "/freelancer_dashboard/searchjob" },
    { name: "Applications", icon: "folder", href: currentUser?.role === 'client' ? "/client_dashboard/applications" : "/freelancer_dashboard/applications" },
    { name: "Messages", icon: "message", href: "/chat" },
    { name: "Settings", icon: "settings", href: currentUser?.role === 'client' ? "/client_dashboard/settings" : "/freelancer_dashboard/settings" },
    { name: "Logout", icon: "logout", href: "/auth/logout" }
  ];
  
  // Add function to search for users
  const searchUsers = async () => {
    if (!searchQuery.trim() || !currentUser) return;
    
    try {
      // Search for users of the opposite role (clients see freelancers, freelancers see clients)
      const targetRole = currentUser.role === 'client' ? 'freelancer' : 'client';
      const response = await fetch(`/search-users?role=${targetRole}&query=${encodeURIComponent(searchQuery)}`);
      
      if (response.ok) {
        const users = await response.json();
        setSearchResults(users);
      } else {
        console.error('Error searching users:', response.statusText);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };
  
  // Handle user selection from search results
  const startConversation = (user: User) => {
    setSelectedUser(user);
    setShowSearch(false);
    router.push(`/chat?userId=${user.id}`, { scroll: false });
  };
  
  // Format timestamp for last message
  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 bo    function handleSendMessage(chatId: string, message: string): void {
        throw new Error('Function not implemented.');
    }

rder-b-2 border-secondary"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole={currentUser.role === 'client' ? 'Client' : 'Freelancer'} items={items} />
      
      <div className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-text mb-6">Messages</h1>
          
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="flex h-[calc(100vh-160px)]">
              {/* Sidebar - Conversations */}
              <div className="w-1/3 border-r border-border flex flex-col">
                <div className="p-4 border-b border-border flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-text">Conversations</h2>
                  <button 
                    onClick={() => setShowSearch(!showSearch)} 
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-textLight hover:text-secondary"
                    title="Find users to chat with"
                  >
                    <UserPlus size={20} />
                  </button>
                </div>
                
                {showSearch && (
                  <div className="p-4 border-b border-border">
                    <div className="relative mb-2">
                      <input
                        type="text"
                        placeholder="Search users to chat with..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                        className="w-full px-3 pr-10 py-2 border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary text-text"
                      />
                      <button 
                        onClick={searchUsers}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-textLight hover:text-secondary"
                      >
                        <Search size={20} />
                      </button>
                    </div>
                    
                    {searchResults.length > 0 && (
                      <div className="mt-2 max-h-48 overflow-y-auto border border-border rounded-lg divide-y">
                        {searchResults.map(user => (
                          <div 
                            key={user.id} 
                            className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                            onClick={() => startConversation(user)}
                          >
                            {user.profile?.profilePicture ? (
                              <img 
                                src={user.profile.profilePicture} 
                                alt={user.username} 
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-secondary text-xs font-semibold">
                                  {user.username.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="ml-2">
                              <p className="text-sm font-medium text-text">{user.username}</p>
                              <p className="text-xs text-textLight capitalize">{user.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {searchQuery && searchResults.length === 0 && (
                      <p className="text-sm text-textLight mt-2">No users found. Try a different search.</p>
                    )}
                  </div>
                )}
                
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary"></div>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full p-4">
                      <MessageSquare size={48} className="text-gray-300 mb-4" />
                      <p className="text-textLight mb-4">No conversations yet</p>
                      <button
                        onClick={() => setShowSearch(true)}
                        className="flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-buttonHover transition-colors"
                      >
                        <UserPlus size={16} className="mr-2" />
                        Find Someone to Chat With
                      </button>
                    </div>
                  ) : (
                    conversations.map((conversation) => (
                      <div 
                        key={conversation.userId}
                        className={`p-4 border-b border-border hover:bg-gray-50 cursor-pointer transition ${
                          selectedUser?.id === conversation.userId ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          setSelectedUser({
                            id: conversation.userId,
                            username: conversation.username,
                            role: conversation.role,
                            email: '',
                            profile: {
                              profilePicture: conversation.profilePicture || undefined
                            }
                          });
                          router.push(`/chat?userId=${conversation.userId}`, { scroll: false });
                        }}
                      >
                        <div className="flex items-center">
                          <div className="relative">
                            {conversation.profilePicture ? (
                              <img 
                                src={conversation.profilePicture} 
                                alt={conversation.username} 
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-secondary font-semibold">
                                  {conversation.username.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                            )}
                            {conversation.unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          
                          <div className="ml-4 flex-1 overflow-hidden">
                            <div className="flex justify-between items-baseline">
                              <h3 className="font-medium text-text truncate">{conversation.username}</h3>
                              {conversation.lastMessage && (
                                <span className="text-xs text-textLight">
                                  {formatLastMessageTime(conversation.lastMessage.createdAt)}
                                </span>
                              )}
                            </div>
                            
                            <p className={`text-sm truncate ${
                              conversation.unreadCount > 0 ? 'font-semibold text-text' : 'text-textLight'
                            }`}>
                              {conversation.lastMessage ? (
                                <>
                                  {conversation.lastMessage.isFromUser && 'You: '}
                                  {conversation.lastMessage.content}
                                </>
                              ) : (
                                'Start a conversation'
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Main chat area */}
              <div className="w-2/3">
                {selectedUser ? (
                  <ChatInterface 
                    currentUser={currentUser} 
                    receiver={selectedUser} 
                    fullScreen={true}
                  />
                ) : (
                  <div className="flex flex-col justify-center items-center h-full text-gray-400">
                    <MessageSquare size={64} className="mb-4" />
                    <h3 className="text-xl font-semibold text-text mb-2">Select a conversation</h3>
                    <p className="text-textLight mb-6">Choose a contact to start chatting</p>
                    <button
                      onClick={() => setShowSearch(true)}
                      className="flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-buttonHover transition-colors"
                    >
                      <UserPlus size={16} className="mr-2" />
                      Find New Contact
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
