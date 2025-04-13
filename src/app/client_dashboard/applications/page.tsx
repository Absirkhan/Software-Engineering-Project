"use client";
import Navbar from "../../Components/navbar";
import React, { useState, useEffect } from "react";
import { FileText, UserCheck, UserX, User, Briefcase, Check, X } from 'lucide-react';

const ApplicationsPage = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({
    status: '',
    job: ''
  });
  const [jobs, setJobs] = useState<any[]>([]);
  const [updateStatus, setUpdateStatus] = useState({ loading: false, success: false, error: '' });

  const items = [
    { name: "Dashboard", icon: "home", href: "/client_dashboard" },
    { name: "Profile", icon: "user", href: "/client_dashboard/profile" },
    { name: "Create Job", icon: "folder", href: "/client_dashboard/createjob" },
    { name: "All Jobs", icon: "file", href: "/client_dashboard/jobs" },
    { name: "Applications", icon: "file-text", href: "/client_dashboard/applications" },
    { name: "Payments", icon: "credit-card", href: "/client_dashboard/payments" },
    { name: "Settings", icon: "settings", href: "/client_dashboard/settings" },
    { name: "Logout", icon: "logout", href: "/auth/logout" }
  ];
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch applications
        const appResponse = await fetch("/get-applications");
        if (appResponse.ok) {
          const appData = await appResponse.json();
          setApplications(appData);
          
          // Also fetch jobs to populate filter options
          const jobsResponse = await fetch("/get-jobs");
          if (jobsResponse.ok) {
            const jobsData = await jobsResponse.json();
            setJobs(jobsData);
          }
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Format date to human readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded flex items-center w-fit">
            <User size={12} className="mr-1" /> Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded flex items-center w-fit">
            <UserCheck size={12} className="mr-1" /> Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded flex items-center w-fit">
            <UserX size={12} className="mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded flex items-center w-fit">
            {status}
          </span>
        );
    }
  };

  const handleUpdateStatus = async (applicationId: string, status: string) => {
    setUpdateStatus({ loading: true, success: false, error: '' });
    try {
      const response = await fetch(`/update-application-status/${applicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        // Update the application in state
        setApplications(currentApplications => 
          currentApplications.map(app => 
            app.id === applicationId ? { ...app, status } : app
          )
        );
        
        // Update selectedApplication if it's the one being modified
        if (selectedApplication && selectedApplication.id === applicationId) {
          setSelectedApplication((prev: any) => ({ ...prev, status }));
        }
        
        setUpdateStatus({ loading: false, success: true, error: '' });
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setUpdateStatus(prev => ({ ...prev, success: false }));
        }, 3000);
      } else {
        const errorData = await response.json().catch(() => null);
        setUpdateStatus({
          loading: false,
          success: false,
          error: errorData?.error || 'Failed to update application status'
        });
      }
    } catch (error) {
      setUpdateStatus({
        loading: false,
        success: false,
        error: 'An unexpected error occurred'
      });
    }
  };

  // Filter applications based on search and filters
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      searchTerm === '' || 
      app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.freelancer?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === '' || app.status === filters.status;
    const matchesJob = filters.job === '' || app.jobId === filters.job;
    
    return matchesSearch && matchesStatus && matchesJob;
  });

  // Get filter options
  const filterOptions = [
    {
      label: "Status",
      options: ["pending", "accepted", "rejected"],
      filterKey: "status",
    },
    {
      label: "Job",
      options: jobs.filter(job => job.client).map(job => ({ value: job.id, label: job.title })),
      filterKey: "job",
    }
  ];

  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole='Client' items={items} />
      
      <div className="flex-1 p-8 bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-text mb-2">
            Applications
          </h1>
          
          <p className="text-textLight mb-6">
            Review and manage applications for your job postings
          </p>
          
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative max-w-md w-full">
                <input
                  type="text"
                  placeholder="Search by job title or applicant name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border text-sm text-text bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="w-full sm:w-auto">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                <div className="w-full sm:w-auto">
                  <select
                    value={filters.job}
                    onChange={(e) => setFilters(prev => ({ ...prev, job: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
                  >
                    <option value="">All Jobs</option>
                    {jobs.map(job => (
                      <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-card overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold text-lg text-text">
                    Applications ({filteredApplications.length})
                  </h2>
                </div>
                
                {loading ? (
                  <div className="p-6 text-center text-textLight">
                    Loading applications...
                  </div>
                ) : filteredApplications.length > 0 ? (
                  <div className="divide-y divide-border max-h-[65vh] overflow-y-auto">
                    {filteredApplications.map((application) => (
                      <div 
                        key={application.id}
                        className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${selectedApplication && selectedApplication.id === application.id ? 'bg-gray-50' : ''}`}
                        onClick={() => setSelectedApplication(application)}
                      >
                        <h3 className="font-medium text-text">{application.jobTitle}</h3>
                        <p className="text-xs text-textLight mt-1">
                          {application.freelancer?.username || 'Unknown Freelancer'}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-textLight">
                            {formatDate(application.submittedAt)}
                          </span>
                          {getStatusBadge(application.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-textLight">
                    No applications found matching your criteria.
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:col-span-2">
              {selectedApplication ? (
                <div className="bg-white rounded-xl shadow-card p-6">
                  {updateStatus.success && (
                    <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
                      ✅ Application status updated successfully!
                    </div>
                  )}
                  
                  {updateStatus.error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
                      ⚠️ {updateStatus.error}
                    </div>
                  )}
                
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-text">{selectedApplication.jobTitle}</h2>
                      <div className="flex items-center mt-1 text-textLight">
                        <span className="flex items-center">
                          <Briefcase size={14} className="mr-1" />
                          Job ID: {selectedApplication.jobId}
                        </span>
                        <span className="mx-2">•</span>
                        <span>Applied on {formatDate(selectedApplication.submittedAt)}</span>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(selectedApplication.status)}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-md font-semibold text-text mb-2">Applicant Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <User size={24} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-text">{selectedApplication.freelancer.username}</p>
                          <p className="text-sm text-textLight">{selectedApplication.freelancer.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-md font-semibold text-text mb-2">Cover Letter</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-textLight whitespace-pre-line">
                        {selectedApplication.coverLetter}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-md font-semibold text-text mb-2">Resume/CV</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-textLight whitespace-pre-line">
                        {selectedApplication.resume}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-border pt-4 mt-4">
                    <h3 className="text-md font-semibold text-text mb-2">Update Application Status</h3>
                    
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleUpdateStatus(selectedApplication.id, 'accepted')}
                        disabled={selectedApplication.status === 'accepted' || updateStatus.loading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors
                          ${selectedApplication.status === 'accepted' 
                            ? 'bg-green-100 text-green-800 cursor-not-allowed' 
                            : 'bg-green-500 text-white hover:bg-green-600'}
                          ${updateStatus.loading ? 'opacity-75 cursor-not-allowed' : ''}
                        `}
                      >
                        <Check size={16} className="mr-1" /> Accept Application
                      </button>
                      
                      <button
                        onClick={() => handleUpdateStatus(selectedApplication.id, 'rejected')}
                        disabled={selectedApplication.status === 'rejected' || updateStatus.loading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors
                          ${selectedApplication.status === 'rejected' 
                            ? 'bg-red-100 text-red-800 cursor-not-allowed' 
                            : 'bg-red-500 text-white hover:bg-red-600'}
                          ${updateStatus.loading ? 'opacity-75 cursor-not-allowed' : ''}
                        `}
                      >
                        <X size={16} className="mr-1" /> Reject Application
                      </button>
                      
                      {selectedApplication.status !== 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(selectedApplication.id, 'pending')}
                          disabled={selectedApplication.status === 'pending' || updateStatus.loading}
                          className={`px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center hover:bg-gray-300 transition-colors
                            ${updateStatus.loading ? 'opacity-75 cursor-not-allowed' : ''}
                          `}
                        >
                          <User size={16} className="mr-1" /> Mark as Pending
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-card p-6 flex flex-col items-center justify-center" style={{minHeight: '300px'}}>
                  <div className="text-center max-w-md">
                    <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-medium text-text mb-2">Application Details</h3>
                    <p className="text-textLight">Select an application from the list to view its details.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsPage;
