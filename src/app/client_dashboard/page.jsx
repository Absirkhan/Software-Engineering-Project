"use client";
import Navbar from '../Components/navbar';
import React, { useState, useEffect } from "react";
import { colors, shadows } from '../Components/colors';

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
      
      <div 
        style={{
          flex: 1,
          padding: '2rem',
          backgroundColor: '#f8fafc',
          fontFamily: "'Poppins', sans-serif"
        }}
      >
        <div 
          style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}
        >
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}
          >
            <div>
              <h1 
                style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: colors.text,
                  marginBottom: '0.5rem'
                }}
              >
                {greet}
              </h1>
              <p style={{ color: colors.textLight }}>{currentTime}</p>
            </div>
            <button 
              style={{
                backgroundColor: colors.secondary,
                color: colors.buttonText,
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease',
              }}
              onClick={() => window.location.href = '/client_dashboard/createjob'}
            >
              Post a New Job
            </button>
          </div>
          
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}
          >
            <div 
              style={{
                backgroundColor: colors.primary,
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: shadows.card,
              }}
            >
              <h2 
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: colors.text,
                  marginBottom: '1rem'
                }}
              >
                Recent Jobs
              </h2>
              <p style={{ color: colors.textLight }}>You have no recent jobs.</p>
            </div>
            
            <div 
              style={{
                backgroundColor: colors.primary,
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: shadows.card,
              }}
            >
              <h2 
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: colors.text,
                  marginBottom: '1rem'
                }}
              >
                Applications
              </h2>
              <p style={{ color: colors.textLight }}>No pending applications.</p>
            </div>
            
            <div 
              style={{
                backgroundColor: colors.primary,
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: shadows.card,
              }}
            >
              <h2 
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: colors.text,
                  marginBottom: '1rem'
                }}
              >
                Account Status
              </h2>
              <p style={{ color: colors.textLight }}>Your account is active.</p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '0.75rem'
                }}
              >
                <div
                  style={{
                    height: '8px',
                    width: '100%',
                    backgroundColor: '#e9ecef',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: '85%',
                      backgroundColor: colors.accent,
                      borderRadius: '4px'
                    }}
                  ></div>
                </div>
                <span
                  style={{
                    marginLeft: '12px',
                    color: colors.accent,
                    fontWeight: 500
                  }}
                >
                  85%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;