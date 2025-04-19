"use client";
import Navbar from '../Components/navbar';
import React, { useState, useEffect } from "react";
import UpcomingInterviews from '../Components/UpcomingInterviews';

const ClientDashboard = () => {
  const items = [
    { name: "Dashboard", icon: "home", href: "/client_dashboard" },
    { name: "Profile", icon: "user", href: "/client_dashboard/profile" },
    { name: "Create Job", icon: "folder", href: "/client_dashboard/createjob" },
    { name: "All Jobs", icon: "file", href: "/client_dashboard/jobs" },
    { name: "Payments", icon: "credit-card", href: "/client/payments" },
    { name: "Settings", icon: "settings", href: "/client/settings" },
    { name: "Logout", icon: "logout", href: "/logout" }
  ];
  
  const [greet, setGreet] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  
  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    let greeting;
    
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";
    else greeting = "Good Evening";
    
    setGreet(`${greeting}, Client`);
    
    // Format current time
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    setCurrentTime(formattedDate);
  }, []);
  
  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole='Client' items={items} />
      
      <div className="flex-1 p-8 bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text mb-2">{greet}</h1>
              <p className="text-textLight">{currentTime}</p>
            </div>
            <button 
              className="bg-secondary hover:bg-buttonHover text-white rounded-lg border-none py-3 px-5 font-semibold transition-all duration-200 flex items-center"
              onClick={() => window.location.href = '/client_dashboard/createjob'}
            >
              Post a New Job
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-card">
              <h2 className="text-xl font-semibold text-text mb-4">
                Recent Jobs
              </h2>
              <p className="text-textLight">You have no recent jobs.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-card">
              <h2 className="text-xl font-semibold text-text mb-4">
                Applications
              </h2>
              <p className="text-textLight">No pending applications.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-card">
              <h2 className="text-xl font-semibold text-text mb-4">
                Account Status
              </h2>
              <p className="text-textLight">Your account is active.</p>
              <div className="flex items-center mt-3">
                <div className="h-2 w-full bg-gray-200 rounded overflow-hidden">
                  <div className="h-full w-[85%] bg-accent rounded"></div>
                </div>
                <span className="ml-3 text-accent font-medium">85%</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-card">
              <h2 className="text-xl font-semibold text-text mb-4">
                Upcoming Interviews
              </h2>
              <UpcomingInterviews userRole="client" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;