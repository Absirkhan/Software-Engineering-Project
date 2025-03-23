"use client";
import Navbar from "../../Components/navbar";
import Sidebar from "../../Components/sidebar";

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

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [projects, setProjects] = useState<{ name: string; html_url: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const emailResponse = await fetch("/get-user"); // Replace with your API endpoint
        const emailData = await emailResponse.json();
        setEmail(emailData.email);
        setUsername(emailData.username);
        setProjects(emailData.projects);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar initialRole="Client" />

      {/* Main content area with sidebar */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar items={items} />

        {/* Main Content */}
        <div className="flex-1 p-6 bg-white rounded-tl-2xl shadow-lg">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
                <p className="text-gray-600">Email: <span className="font-medium text-gray-800">{email}</span></p>
                <p className="text-gray-600">Username: <span className="font-medium text-gray-800">{username}</span></p>
              </div>

              <div>
                  <h2 className="text-xl font-semibold text-gray-800">Projects</h2>
                  {projects.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      {projects.map((project, index) => (
                        <li key={index} className="text-gray-800">
                          <a href={project.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                            {project.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600">No projects</p>
                  )}
</div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
