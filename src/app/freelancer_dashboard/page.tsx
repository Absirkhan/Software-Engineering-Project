"use client";
import Navbar from '../Components/navbar';
import Sidebar from '../Components/sidebar';

import React, { useState, useEffect } from "react";

const ClientDashboard = () => {

    const items = [
      { name: "Dashboard", icon: "home", href: "/freelancer_dashboard" },
      { name: "Profile", icon: "user", href: "/client_dashboard/profile" },
      { name: "Search Job", icon: "folder", href: "/freelancer_dashboard/searchjob" },
      { name: "Applied Jobs", icon: "file", href: "/freelancer_dashboard/jobs" },
      { name: "Payments", icon: "credit-card", href: "/client/payments" },
      { name: "Settings", icon: "settings", href: "/client/settings" },
      { name: "Logout", icon: "logout", href: "/logout" }
    ];


  const [greet, setGreet] = useState("");


  useEffect(() => {
    setGreet("Hello, Freelancer");
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <Navbar initialRole="Freelancer" />

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