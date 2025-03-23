"use client";
import Navbar from '../Components/navbar';
import Sidebar from '../Components/sidebar';

import React, { useState, useEffect } from "react";

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


  useEffect(() => {
    setGreet("Hello, Client");
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <Navbar initialRole='Client' />

      {/* Main content area with sidebar */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar items = {items}/>

        {/* Main Content */}
        <div className="flex-1 p-3" style={{ backgroundColor: "white" }}>
          <h1 style={{color : "black"}}>{greet}</h1>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;