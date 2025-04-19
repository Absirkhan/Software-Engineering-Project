"use client";
import Navbar from '../Components/navbar';
import React, { useState, useEffect } from "react";
import { colors, shadows } from '../Components/colors';
import Link from 'next/link';
import UpcomingInterviews from '../Components/UpcomingInterviews';

const FreelancerDashboard = () => {
  const items = [
    { name: "Dashboard", icon: "home", href: "/freelancer_dashboard" },
    { name: "Profile", icon: "user", href: "/freelancer_dashboard/profile" },
    { name: "Search Job", icon: "folder", href: "/freelancer_dashboard/searchjob" },
    { name: "Applied Jobs", icon: "file", href: "/freelancer_dashboard/jobs" },
    { name: "Payments", icon: "credit-card", href: "/freelancer_dashboard/payments" },
    { name: "Settings", icon: "settings", href: "/freelancer_dashboard/settings" },
    { name: "Logout", icon: "logout", href: "/logout" }
  ];
  
  const [greet, setGreet] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  
  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    let greeting;
    
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";
    else greeting = "Good Evening";
    
    setGreet(`${greeting}, Freelancer`);
    
    // Format current time
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    setCurrentTime(formattedDate);

    // Fetch available jobs
    const fetchJobs = async () => {
      try {
        const response = await fetch("/get-jobs");
        if (response.ok) {
          const jobData = await response.json();
          setJobs(jobData);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    
    fetchJobs();
  }, []);
  
  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole='Freelancer' items={items} />
      
      <div className="flex-1 p-8 bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text mb-2">{greet}</h1>
              <p className="text-textLight">{currentTime}</p>
            </div>
            <button 
              className="bg-secondary hover:bg-buttonHover text-white rounded-lg border-none py-3 px-5 font-semibold transition-all duration-200 flex items-center"
              onClick={() => window.location.href = '/freelancer_dashboard/searchjob'}
            >
              Find New Jobs
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-card">
              <h2 className="text-xl font-semibold text-text mb-4">
                Available Jobs
              </h2>
              {jobs.length > 0 ? (
                <div className="space-y-3">
                  {jobs.slice(0, 3).map((job, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-secondary">{job.title}</h3>
                      <p className="text-sm text-textLight">{job.location} • {job.type}</p>
                      <div className="mt-2 flex justify-end">
                        <Link href={`/freelancer_dashboard/searchjob?id=${index}`} className="text-xs text-accent font-medium hover:underline">
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                  {jobs.length > 3 && (
                    <div className="mt-2 text-center">
                      <Link href="/freelancer_dashboard/searchjob" className="text-sm text-secondary font-medium hover:underline">
                        View all {jobs.length} jobs
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-textLight">No new jobs available.</p>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-card">
              <h2 className="text-xl font-semibold text-text mb-4">
                Your Applications
              </h2>
              <p className="text-textLight">No active applications.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-card">
              <h2 className="text-xl font-semibold text-text mb-4">
                Profile Completion
              </h2>
              <p className="text-textLight">Your profile is incomplete.</p>
              <div className="flex items-center mt-3">
                <div className="h-2 w-full bg-gray-200 rounded overflow-hidden">
                  <div className="h-full w-3/5 bg-accent rounded"></div>
                </div>
                <span className="ml-3 text-accent font-medium">60%</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-card">
              <h2 className="text-xl font-semibold text-text mb-4">
                Upcoming Interviews
              </h2>
              <UpcomingInterviews userRole="freelancer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;