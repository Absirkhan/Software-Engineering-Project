"use client";
import Navbar from '../Components/navbar';
import React, { useState, useEffect } from "react";
import UpcomingInterviews from '../Components/UpcomingInterviews';
import { Briefcase } from 'lucide-react'; // Replace 'your-icon-library' with the actual library name
import { ArrowUp } from 'lucide-react';
import { FileText } from 'lucide-react';
import { Users } from 'lucide-react';
import { Eye } from 'lucide-react';
import { Tag } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { UserCheck } from 'lucide-react';
import { Check } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { Activity } from 'lucide-react';
import { Calendar } from 'lucide-react';
import { Send } from 'lucide-react';
import { Logout } from 'lucide-react';


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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar initialRole='Client' items={items} />
      
      <div className="flex-1 pt-8 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-7xl mx-auto">
          {/* Header with greeting and action button */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-900 animate-fadeIn">
                {greet}
              </h1>
              <p className="text-gray-500">{currentTime}</p>
            </div>
            <button 
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white 
                rounded-lg border-none py-3 px-5 font-semibold transition-all duration-300 flex items-center shadow-md 
                hover:shadow-lg transform hover:-translate-y-0.5"
              onClick={() => window.location.href = '/client_dashboard/createjob'}
            >
              Post a New Job
            </button>
          </div>
          
          {/* Stats overview section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">Active Jobs</h3>
                <div className="p-2 rounded-full bg-blue-50">
                  <Briefcase size={20} className="text-blue-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <div className="mt-2 flex items-center text-xs text-green-600">
                <ArrowUp size={14} className="mr-1" />
                <span>3 more than last month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">Applications</h3>
                <div className="p-2 rounded-full bg-purple-50">
                  <FileText size={20} className="text-purple-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">48</p>
              <div className="mt-2 flex items-center text-xs text-green-600">
                <ArrowUp size={14} className="mr-1" />
                <span>12% from last month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">Hires</h3>
                <div className="p-2 rounded-full bg-green-50">
                  <Users size={20} className="text-green-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">5</p>
              <div className="mt-2 flex items-center text-xs text-green-600">
                <ArrowUp size={14} className="mr-1" />
                <span>2 more than last month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">Job Views</h3>
                <div className="p-2 rounded-full bg-yellow-50">
                  <Eye size={20} className="text-yellow-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">324</p>
              <div className="mt-2 flex items-center text-xs text-green-600">
                <ArrowUp size={14} className="mr-1" />
                <span>18% from last month</span>
              </div>
            </div>
          </div>
          
          {/* Content cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Briefcase size={18} className="mr-2 text-primary" />
                  Recent Jobs
                </h2>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                    <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">Senior Backend Developer</h3>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <Tag size={14} className="mr-1" />
                      <span className="mr-3">Full-time</span>
                      <Eye size={14} className="mr-1" />
                      <span>24 views</span>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-sm font-medium text-primary">3 applicants</span>
                      <a href="#" className="text-xs text-secondary font-medium hover:underline">View Details →</a>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                    <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">UX Designer</h3>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <Tag size={14} className="mr-1" />
                      <span className="mr-3">Contract</span>
                      <Eye size={14} className="mr-1" />
                      <span>19 views</span>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-sm font-medium text-primary">2 applicants</span>
                      <a href="#" className="text-xs text-secondary font-medium hover:underline">View Details →</a>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <Link href="/client_dashboard/jobs" className="inline-flex items-center justify-center px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-secondary hover:bg-gray-50 transition-all">
                    View all jobs
                    <ArrowRight size={14} className="ml-1.5" />
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock size={18} className="mr-2 text-primary" />
                  Upcoming Interviews
                </h2>
              </div>
              <div className="p-5">
                <UpcomingInterviews userRole="client" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <UserCheck size={18} className="mr-2 text-primary" />
                  Account Status
                </h2>
              </div>
              <div className="p-5">
                <p className="text-gray-600 mb-4">
                  Your account is in good standing with premium features activated.
                </p>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">Profile completion</span>
                    <span className="text-sm font-medium text-blue-600">85%</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-primary rounded-full transition-all duration-500" 
                      style={{width: '85%'}}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                      <Check size={12} className="text-green-600" />
                    </div>
                    <p className="ml-3 text-sm text-gray-600">Email verified</p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                      <Check size={12} className="text-green-600" />
                    </div>
                    <p className="ml-3 text-sm text-gray-600">Payment method added</p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center">
                      <AlertCircle size={12} className="text-amber-600" />
                    </div>
                    <p className="ml-3 text-sm text-gray-600">Company profile incomplete</p>
                  </div>
                </div>
                
                <div className="mt-5">
                  <Link 
                    href="/client_dashboard/profile" 
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-secondary/90 transition-colors shadow-sm"
                  >
                    Complete Your Profile
                    <ArrowRight size={16} className="ml-1.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Activity Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity size={18} className="mr-2 text-primary" />
                Recent Activity
              </h2>
            </div>
            <div className="p-5">
              <div className="flow-root">
                <ul className="-mb-8">
                  <li className="relative pb-8">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <FileText size={16} className="text-blue-600" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm font-medium text-gray-900">New Application</div>
                          <p className="mt-0.5 text-xs text-gray-500">Today at 2:15 PM</p>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          <span className="font-medium">John Doe</span> applied for <span className="font-medium">Senior Web Developer</span>
                        </div>
                      </div>
                    </div>
                    <span className="absolute top-8 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  </li>
                  
                  <li className="relative pb-8">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                          <Send size={16} className="text-green-600" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Job Posted</div>
                          <p className="mt-0.5 text-xs text-gray-500">Yesterday at 11:43 AM</p>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          You posted a new job: <span className="font-medium">Frontend Developer</span>
                        </div>
                      </div>
                    </div>
                    <span className="absolute top-8 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  </li>
                  
                  <li className="relative">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                          <Calendar size={16} className="text-purple-600" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Interview Scheduled</div>
                          <p className="mt-0.5 text-xs text-gray-500">3 days ago</p>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          Interview scheduled with <span className="font-medium">Jane Smith</span> for <span className="font-medium">UI/UX Designer</span> position
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;