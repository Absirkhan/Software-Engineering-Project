"use client";
import Navbar from "../../Components/navbar";
import ResumeAnalyzer from "../../../Components/ResumeAnalyzer";
import React from "react";
import { FileText } from 'lucide-react';

const ResumeAnalysisPage = () => {
  const items = [
    { name: "Dashboard", icon: "home", href: "/freelancer_dashboard" },
    { name: "Profile", icon: "user", href: "/freelancer_dashboard/profile" },
    { name: "Search Jobs", icon: "search", href: "/freelancer_dashboard/searchjob" },
    { name: "Saved Jobs", icon: "bookmark", href: "/freelancer_dashboard/saved_jobs" },
    { name: "Applied Jobs", icon: "file", href: "/freelancer_dashboard/applications" },
    { name: "Resume Analysis", icon: "file-text", href: "/freelancer_dashboard/resume-analysis" },
    { name: "Settings", icon: "settings", href: "/freelancer_dashboard/settings" },
    { name: "Logout", icon: "logout", href: "/auth/logout" }
  ];
  
  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole='Freelancer' items={items} />
      
      <div className="flex-1 p-8 bg-gray-50 font-sans">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-6">
            <FileText size={28} className="text-secondary mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-text">
                Resume Analysis
              </h1>
              <p className="text-textLight">
                Upload your resume to get AI-powered feedback on how to improve it
              </p>
            </div>
          </div>
          
          <ResumeAnalyzer />
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysisPage;
