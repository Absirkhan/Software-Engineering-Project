"use client";
import Navbar from "../../Components/navbar";
import React, { useState, useEffect } from "react";
import { Briefcase, MapPin, DollarSign, Calendar, Trash2 } from 'lucide-react';
import Link from "next/link";
import SaveJobButton from "../../Components/SaveJobButton";

interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  savedAt: string;
  job: {
    id: string;
    title: string;
    type: string;
    location: string;
    salaryRange: string;
    applicationDeadline: string;
    description: string;
    client: {
      username: string;
    };
    // other job fields
  };
}

const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const items = [
    { name: "Dashboard", icon: "home", href: "/freelancer_dashboard" },
    { name: "Profile", icon: "user", href: "/freelancer_dashboard/profile" },
    { name: "Search Jobs", icon: "search", href: "/freelancer_dashboard/searchjob" },
    { name: "Saved Jobs", icon: "bookmark", href: "/freelancer_dashboard/saved_jobs" },
    { name: "Applied Jobs", icon: "file", href: "/freelancer_dashboard/applications" },
    { name: "Settings", icon: "settings", href: "/freelancer_dashboard/settings" },
    { name: "Logout", icon: "logout", href: "/auth/logout" }
  ];

  useEffect(() => {
    const fetchSavedJobs = async () => {
      setLoading(true);
      try {
        const response = await fetch("/saved-jobs");
        if (response.ok) {
          const data = await response.json();
          setSavedJobs(data);
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to fetch saved jobs");
        }
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, []);

  const handleUnsaveJob = async (jobId: string) => {
    try {
      const response = await fetch(`/unsave-job/${jobId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Remove the unsaved job from the list
        setSavedJobs(savedJobs.filter(savedJob => savedJob.jobId !== jobId));
      } else {
        const errorData = await response.json();
        console.error('Error removing saved job:', errorData.error);
      }
    } catch (error) {
      console.error('Error removing saved job:', error);
    }
  };

  // Format date to human readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole='Freelancer' items={items} />
      
      <div className="flex-1 p-8 bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-text mb-2">
            Saved Jobs
          </h1>
          
          <p className="text-textLight mb-6">
            View and manage your bookmarked job opportunities
          </p>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-lg text-red-600">
              {error}
            </div>
          ) : savedJobs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-card p-10 text-center">
              <h2 className="text-xl font-semibold text-text mb-2">No Saved Jobs</h2>
              <p className="text-textLight mb-6">
                You haven't saved any jobs yet. Browse job listings and click the bookmark icon to save jobs for later.
              </p>
              <Link 
                href="/freelancer_dashboard/searchjob" 
                className="px-4 py-2 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-all inline-block"
              >
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {savedJobs.map((savedJob) => (
                <div key={savedJob.id} className="bg-white rounded-xl shadow-card p-5">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-text mb-2">
                        {savedJob.job.title}
                      </h2>
                      <div className="mb-3">
                        <span className="text-sm text-textLight">{savedJob.job.client?.username || 'Unknown Company'}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mb-3">
                        <div className="flex items-center text-sm text-textLight">
                          <Briefcase size={16} className="mr-1" />
                          {savedJob.job.type}
                        </div>
                        <div className="flex items-center text-sm text-textLight">
                          <MapPin size={16} className="mr-1" />
                          {savedJob.job.location}
                        </div>
                        <div className="flex items-center text-sm text-accent">
                          <DollarSign size={16} className="mr-1" />
                          {savedJob.job.salaryRange}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:ml-4 flex flex-col gap-2">
                      <Link 
                        href={`/freelancer_dashboard/searchjob/${savedJob.job.id}`}
                        className="px-4 py-2 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-all inline-block"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleUnsaveJob(savedJob.job.id)}
                        className="px-4 py-2 border border-red-500 text-red-500 rounded-lg font-medium text-sm hover:bg-red-50 transition-all inline-flex items-center justify-center"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-textLight line-clamp-2">
                    {savedJob.job.description}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                    <div className="text-xs text-textLight">
                      <Calendar size={14} className="inline mr-1" />
                      Deadline: {formatDate(savedJob.job.applicationDeadline)}
                    </div>
                    <div className="text-xs text-textLight">
                      Saved on {formatDate(savedJob.savedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedJobsPage;
