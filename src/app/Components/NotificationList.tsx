"use client";
import React, { useState, useEffect } from "react";
import { Bell, Check, X } from 'lucide-react';

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await fetch("/get-notifications");
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/mark-notification-read/${id}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id ? { ...notification, isRead: true } : notification
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/mark-all-notifications-read", {
        method: 'POST'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job-application':
        return <span className="bg-blue-100 text-blue-600 p-2 rounded-full">📄</span>;
      case 'status-update':
        return <span className="bg-green-100 text-green-600 p-2 rounded-full">📌</span>;
      case 'message':
        return <span className="bg-yellow-100 text-yellow-600 p-2 rounded-full">💬</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 p-2 rounded-full">📣</span>;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center">
          <Bell size={18} className="mr-2 text-secondary" />
          <h2 className="font-semibold text-text">Notifications</h2>
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-secondary text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        
        {notifications.length > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-xs text-secondary hover:text-opacity-80"
          >
            Mark all as read
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="p-4 text-center text-textLight">
          Loading notifications...
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-600">
          {error}
        </div>
      ) : notifications.length > 0 ? (
        <div className="max-h-80 overflow-y-auto">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-4 border-b border-border flex items-start ${!notification.isRead ? 'bg-blue-50' : ''}`}
            >
              <div className="mr-3">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text mb-1">{notification.message}</p>
                <p className="text-xs text-textLight">{formatDate(notification.createdAt)}</p>
              </div>
              {!notification.isRead && (
                <button 
                  onClick={() => markAsRead(notification.id)}
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  title="Mark as read"
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-textLight">
          You have no notifications
        </div>
      )}
    </div>
  );
};

export default NotificationList;
