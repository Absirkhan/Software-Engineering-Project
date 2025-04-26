"use client";
import Navbar from '../Components/navbar';
import React, { useState, useEffect } from "react";
import { colors, shadows } from '../Components/colors';
import Link from 'next/link';
import JobAlertNotification from '../Components/JobAlertNotification';
import UpcomingInterviews from '../Components/UpcomingInterviews';
import { Award, ArrowRight, ArrowUp, ArrowDown, Briefcase, Calendar, 
         DollarSign, Eye, FileText, MapPin, SearchX, Tag, UserCheck, 
         Activity, CheckCircle, Clock, Send, Star } from 'lucide-react';
import freelancerRoutes from '../Components/freelancerRoutes';

const FreelancerDashboardPage = () => {
  // Replace the hardcoded freelancerRoutes with the imported routes
  const items = freelancerRoutes;
  
  const [greet, setGreet] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [hasBadge, setHasBadge] = useState(false);
  
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
    
    // Fetch profile data and calculate completion
    const fetchProfile = async () => {
      try {
        const response = await fetch("/get-profile");
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
          
          // Calculate profile completion percentage
          const percentage = calculateProfileCompletion(data);
          setCompletionPercentage(percentage);
          
          // Set badge if profile is 100% complete
          setHasBadge(percentage === 100);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    
    fetchJobs();
    fetchProfile();
  }, []);
  
  // Calculate profile completion percentage
  const calculateProfileCompletion = (profile: any): number => {
    if (!profile) return 0;
    
    const requiredFields = [
      'fullName',
      'bio',
      'skills',
      'contactInfo.phone',
      'contactInfo.location',
      'contactInfo.website'
    ];
    
    let completedFields = 0;
    let totalFields = requiredFields.length;
    
    // Check each required field
    requiredFields.forEach(field => {
      const fieldPath = field.split('.');
      let value;
      
      if (fieldPath.length === 1) {
        value = profile[fieldPath[0]];
      } else if (profile[fieldPath[0]]) {
        value = profile[fieldPath[0]][fieldPath[1]];
      }
      
      // Check if field is filled (for arrays, check if they have items)
      if (Array.isArray(value)) {
        if (value.length > 0) completedFields++;
      } else if (value && String(value).trim() !== '') {
        completedFields++;
      }
    });
    
    // Calculate percentage
    return Math.round((completedFields / totalFields) * 100);
  };
  
  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole='Freelancer' items={items} />
      
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
              onClick={() => window.location.href = '/freelancer_dashboard/searchjob'}
            >
              Find New Jobs
            </button>
          </div>
          
          {/* Stats overview section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">Jobs Applied</h3>
                <div className="p-2 rounded-full bg-blue-50">
                  <FileText size={20} className="text-blue-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">24</p>
              <div className="mt-2 flex items-center text-xs text-green-600">
                <ArrowUp size={14} className="mr-1" />
                <span>12% from last month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">Interviews</h3>
                <div className="p-2 rounded-full bg-purple-50">
                  <Calendar size={20} className="text-purple-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">7</p>
              <div className="mt-2 flex items-center text-xs text-green-600">
                <ArrowUp size={14} className="mr-1" />
                <span>5% from last month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">Earnings</h3>
                <div className="p-2 rounded-full bg-green-50">
                  <DollarSign size={20} className="text-green-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">$2,540</p>
              <div className="mt-2 flex items-center text-xs text-red-500">
                <ArrowDown size={14} className="mr-1" />
                <span>3% from last month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">Profile Views</h3>
                <div className="p-2 rounded-full bg-yellow-50">
                  <Eye size={20} className="text-yellow-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">142</p>
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
                  Available Jobs
                </h2>
              </div>
              <div className="p-5">
                {jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.slice(0, 3).map((job, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                        <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">{job.title}</h3>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <MapPin size={14} className="mr-1" />
                          <span className="mr-3">{job.location}</span>
                          <Tag size={14} className="mr-1" />
                          <span>{job.type}</span>
                        </div>
                        <div className="mt-3 flex justify-between items-center">
                          <span className="text-sm font-medium text-primary">{job.salaryRange || "$50K-$70K"}</span>
                          <Link href={`/freelancer_dashboard/searchjob/${job.id}`} className="text-xs text-secondary font-medium hover:underline">
                            View Details →
                          </Link>
                        </div>
                      </div>
                    ))}
                    {jobs.length > 3 && (
                      <div className="mt-3 text-center">
                        <Link href="/freelancer_dashboard/searchjob" className="inline-flex items-center justify-center px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-secondary hover:bg-gray-50 transition-all">
                          View all {jobs.length} jobs
                          <ArrowRight size={14} className="ml-1.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <SearchX size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No jobs available right now.</p>
                    <button className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      Refresh Jobs
                    </button>
                  </div>
                )}
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
                <UpcomingInterviews userRole="freelancer" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <UserCheck size={18} className="mr-2 text-primary" />
                  Profile Completion
                </h2>
              </div>
              <div className="p-5">
                <p className="text-gray-600 mb-4">
                  {completionPercentage < 100 
                    ? "Complete your profile to increase visibility to potential clients!" 
                    : "Great job! Your profile is complete."}
                </p>
                
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">Completion</span>
                    <span className={`text-sm font-medium ${
                      completionPercentage === 100 
                        ? "text-green-600" 
                        : completionPercentage >= 70 
                          ? "text-blue-600" 
                          : "text-amber-600"
                    }`}>{completionPercentage}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        completionPercentage === 100 
                          ? "bg-gradient-to-r from-green-400 to-green-500" 
                          : completionPercentage >= 70 
                            ? "bg-gradient-to-r from-blue-400 to-primary" 
                            : "bg-gradient-to-r from-amber-400 to-amber-500"
                      }`} 
                      style={{width: `${completionPercentage}%`}}
                    ></div>
                  </div>
                </div>
                
                {hasBadge && (
                  <div className="flex items-center p-3 bg-green-50 rounded-lg my-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <Award size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800">Profile Star Badge</p>
                      <p className="text-xs text-green-600">You've completed your entire profile!</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-4">
                  <Link 
                    href="/freelancer_dashboard/profile" 
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-secondary/90 transition-colors shadow-sm"
                  >
                    {completionPercentage < 100 ? "Complete Your Profile" : "Update Your Profile"}
                    <ArrowRight size={16} className="ml-1.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Resume Analysis Tool Link */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText size={18} className="mr-2 text-primary" />
                  Resume Tools
                </h2>
              </div>
              <div className="p-5">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Improve Your Resume</h3>
                  <p className="text-sm text-textLight mb-4">
                    Get AI-powered feedback on your resume to increase your chances of getting hired.
                  </p>
                  <Link 
                    href="/freelancer_dashboard/resume-analysis"
                    className="inline-flex items-center text-secondary hover:underline font-medium text-sm"
                  >
                    Analyze My Resume
                    <ArrowRight size={14} className="ml-1.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Activity Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 mb-8">
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
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                          <CheckCircle size={16} className="text-green-600" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Application Accepted</div>
                          <p className="mt-0.5 text-xs text-gray-500">Today at 2:15 PM</p>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          Your application for <span className="font-medium">Senior Web Developer</span> was accepted
                        </div>
                      </div>
                    </div>
                    <span className="absolute top-8 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  </li>
                  
                  <li className="relative pb-8">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <Send size={16} className="text-blue-600" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Application Submitted</div>
                          <p className="mt-0.5 text-xs text-gray-500">Yesterday at 11:43 AM</p>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          You applied for <span className="font-medium">Frontend Developer at TechCorp</span>
                        </div>
                      </div>
                    </div>
                    <span className="absolute top-8 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  </li>
                  
                  <li className="relative">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                          <Star size={16} className="text-amber-600" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Job Saved</div>
                          <p className="mt-0.5 text-xs text-gray-500">3 days ago</p>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          You saved <span className="font-medium">UI/UX Designer at DesignHub</span> to your bookmarks
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

export default FreelancerDashboardPage;