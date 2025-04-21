'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Terminal } from 'lucide-react';

const ChatDebugger: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [socketInfo, setSocketInfo] = useState<any>(null);
  const [showDebugger, setShowDebugger] = useState(false);
  
  const checkSocketConnection = async () => {
    try {
      const response = await fetch('/api/socket-status');
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.running);
        setSocketInfo(data);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error checking socket status:', error);
      setIsConnected(false);
    }
  };
  
  useEffect(() => {
    checkSocketConnection();
  }, []);
  
  if (!showDebugger) {
    return (
      <button
        onClick={() => setShowDebugger(true)}
        className="fixed bottom-4 right-4 p-2 bg-gray-800 text-white rounded-full shadow-lg"
        title="Chat Debugger"
      >
        <Terminal size={20} />
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200 w-80 z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-800">Chat Connection Status</h3>
        <button 
          onClick={() => setShowDebugger(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center">
          <span className="mr-2">Socket Server:</span>
          {isConnected === null ? (
            <span className="text-yellow-500">Checking...</span>
          ) : isConnected ? (
            <span className="text-green-500 flex items-center">
              <CheckCircle size={16} className="mr-1" /> Running
            </span>
          ) : (
            <span className="text-red-500 flex items-center">
              <AlertTriangle size={16} className="mr-1" /> Not Running
            </span>
          )}
        </div>
        
        {socketInfo && (
          <div className="text-xs space-y-1 text-gray-600">
            <p>Active Connections: {socketInfo.connectionsCount}</p>
            <p>Server Started: {new Date(socketInfo.serverStartTime).toLocaleString()}</p>
          </div>
        )}
        
        <button
          onClick={checkSocketConnection}
          className="w-full py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
};

export default ChatDebugger;
