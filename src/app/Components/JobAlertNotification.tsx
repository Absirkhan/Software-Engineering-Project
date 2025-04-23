"use client";
import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import Link from 'next/link';
import io from 'socket.io-client';

interface JobAlert {
  id: string;
  message: string;
  jobId: string;
  jobTitle: string;
  timestamp: Date;
}

const JobAlertNotification = () => {
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user info to get ID for socket authentication
    const fetchUser = async () => {
      try {
        const response = await fetch('/get-user');
        if (response.ok) {
          const userData = await response.json();
          setUserId(userData.id);
          
          // Initialize socket connection after we have the user ID
          const socketConn = io('http://localhost:3000');
          setSocket(socketConn);
          
          // Authenticate socket connection with user ID
          socketConn.emit('authenticate', { userId: userData.id });
          
          // Listen for job alerts
          socketConn.on('job_alert', (data: any) => {
            const newAlert: JobAlert = {
              id: data.jobId, // Use jobId as the unique identifier
              message: data.message,
              jobId: data.jobId,
              jobTitle: data.jobTitle,
              timestamp: new Date(),
            };

            // Prevent duplicate alerts by checking if the jobId already exists in the alerts
            setAlerts(prev => {
              if (prev.some(alert => alert.jobId === newAlert.jobId)) {
                return prev; // If the jobId already exists, return the current state
              }
              return [newAlert, ...prev]; // Otherwise, add the new alert
            });
          });
        }
      } catch (error) {
        console.error('Error fetching user or initializing socket:', error);
      }
    };

    fetchUser();

    // Cleanup function
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);
  
  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };
  
  if (alerts.length === 0) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-full">
      {alerts.map((alert) => (
        <div 
          key={alert.id} 
          className="bg-white rounded-lg shadow-lg mb-2 overflow-hidden animate-slide-up"
        >
          <div className="bg-secondary text-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center">
              <Bell size={16} className="mr-2" />
              <span className="font-medium">New Job Alert</span>
            </div>
            <button onClick={() => dismissAlert(alert.id)} className="text-white hover:text-gray-300">
              <X size={18} />
            </button>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-3">{alert.message}</p>
            <Link 
              href={`/freelancer_dashboard/searchjob/${alert.jobId}`}
              className="text-sm font-medium text-secondary hover:underline"
            >
              View Job Details
            </Link>
          </div>
          <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500">
            {new Date(alert.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobAlertNotification;
