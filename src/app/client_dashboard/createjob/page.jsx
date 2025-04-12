"use client";
import Navbar from '../../Components/navbar';
import CreateJobForm from '../../Components/jobform';
import React from "react";

const CreateJobPage = () => {
  const items = [
    { name: "Dashboard", icon: "home", href: "/client_dashboard" },
    { name: "Profile", icon: "user", href: "/client_dashboard/profile" },
    { name: "Create Job", icon: "folder", href: "/client_dashboard/createjob" },
    { name: "All Jobs", icon: "file", href: "/client_dashboard/jobs" },
    { name: "Payments", icon: "credit-card", href: "/client/payments" },
    { name: "Settings", icon: "settings", href: "/client/settings" },
    { name: "Logout", icon: "logout", href: "/logout" }
  ];
  
  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <Navbar initialRole='Client' items={items} />
      
      {/* Main content area */}
      <div className="flex-1">
        <CreateJobForm />
      </div>
    </div>
  );
};

export default CreateJobPage;