"use client";
import Navbar from "../../Components/navbar";
import Sidebar from "../../Components/sidebar";

import React, { useState, useEffect } from "react";

const ClientDashboard = () => {
  // Manage job data with state
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from the API
        const response = await fetch("/get-jobs");
        if (response.ok) {
          const jobData = await response.json();
          setJobs(jobData);
        } else {
          console.error("Failed to fetch jobs:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    fetchData();
  }, []);

  const items = [
    { name: "Dashboard", icon: "home", href: "/client_dashboard" },
    { name: "Profile", icon: "user", href: "/client_dashboard/profile" },
    { name: "Create Job", icon: "folder", href: "/client_dashboard/createjob" },
    { name: "All Jobs", icon: "file", href: "/client_dashboard/jobs" },
    { name: "Payments", icon: "credit-card", href: "/client/payments" },
    { name: "Settings", icon: "settings", href: "/client/settings" },
    { name: "Logout", icon: "logout", href: "/logout" },
  ];

  return (
    <div className="flex flex-col h-screen text-black">
      {/* Navbar */}
      <Navbar initialRole="Client" />

      {/* Main content area with sidebar */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar items={items} />

        {/* Main Content */}
        <div className="flex-1 p-3" style={{ backgroundColor: "white" }}>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <div className="flex flex-wrap">
            {jobs.length > 0 ? (
              jobs.map((job, index) => (
                <div key={index} className="p-4 w-1/3">
                  <div className="bg-white shadow-md rounded p-4">
                    <h2 className="text-lg font-bold">{job.title}</h2>
                    <p className="text-gray-500">{job.description}</p>
                    <p className="text-gray-500">{job.location}</p>
                    <p className="text-gray-500">{job.salaryRange}</p>
                    <p className="text-gray-500">{job.client.username}</p>
                    <p className="text-gray-500">{job.client.email}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No jobs available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
