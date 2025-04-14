"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../../../../Components/navbar";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, Calendar, User, FileText, CheckCircle, XCircle } from "lucide-react";

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  freelancer: {
    id: string;
    username: string;
    email: string;
  };
  coverLetter: string;
  resume: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
}

interface Job {
  id: string;
  title: string;
}

const JobApplicationsPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;
  
  const items = [
    { name: "Dashboard", icon: "home", href: "/client_dashboard" },
    { name: "Profile", icon: "user", href: "/client_dashboard/profile" },
    { name: "Jobs", icon: "briefcase", href: "/client_dashboard/jobs" },
    { name: "Applications", icon: "file", href: "/client_dashboard/applications" },
    { name: "Messages", icon: "message-square", href: "/client_dashboard/messages" },
    { name: "Payments", icon: "credit-card", href: "/client_dashboard/payments" },
    { name: "Settings", icon: "settings", href: "/client_dashboard/settings" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch job details
        const jobResponse = await fetch(`/get-job/${jobId}`, {
          credentials: "include",
        });
        
        if (!jobResponse.ok) {
          throw new Error("Failed to fetch job details");
        }
        
        const jobData = await jobResponse.json();
        setJob(jobData);
        
        // Fetch applications for this job
        const applicationsResponse = await fetch(`/get-applications/${jobId}`, {
          credentials: "include",
        });
        
        if (!applicationsResponse.ok) {
          throw new Error("Failed to fetch applications");
        }
        
        const applicationsData = await applicationsResponse.json();
        setApplications(applicationsData);
        
        if (applicationsData.length > 0) {
          setSelectedApplication(applicationsData[0]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    if (jobId) {
      fetchData();
    }
  }, [jobId]);

  const filteredApplications = applications.filter(app => 
    app.freelancer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.freelancer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>;
      case 'accepted':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Accepted</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Unknown</span>;
    }
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      setProcessingId(applicationId);
      const response = await fetch(`/update-application-status/${applicationId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update application status");
      }
      
      const updatedApplication = await response.json();
      
      // Update applications list
      setApplications(prevApps => 
        prevApps.map(app => 
          app.id === applicationId ? {...app, status: newStatus} : app
        )
      );
      
      // Update selected application if it's the one being updated
      if (selectedApplication && selectedApplication.id === applicationId) {
        setSelectedApplication({...selectedApplication, status: newStatus});
      }
      
    } catch (err) {
      console.error("Error updating application status:", err);
      setError("Failed to update status. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleBackClick = () => {
    router.push("/client_dashboard/jobs");
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole="Client" items={items} />
      
      <div className="flex-1 p-8 bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <button
              onClick={handleBackClick}
              className="flex items-center text-primary hover:text-opacity-80"
            >
              <ArrowLeft size={18} className="mr-2" /> Back to Jobs
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-text mb-2">
            {loading ? "Loading..." : job?.title ? `Applications for ${job.title}` : "Applications"}
          </h1>
          
          {!loading && (
            <p className="text-textLight mb-6">
              {filteredApplications.length} {filteredApplications.length === 1 ? "application" : "applications"} received
            </p>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="bg-white rounded-xl shadow-card p-4 mb-6">
                  <div className="flex items-center px-2 py-2 bg-gray-50 rounded-lg mb-4">
                    <Search size={18} className="text-textLight mr-2" />
                    <input
                      type="text"
                      placeholder="Search freelancers..."
                      className="bg-transparent border-none focus:outline-none text-sm flex-grow"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-card overflow-hidden">
                  {filteredApplications.length === 0 ? (
                    <div className="p-6 text-center text-textLight">
                      No applications found
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredApplications.map((application) => (
                        <div
                          key={application.id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer ${
                            selectedApplication?.id === application.id ? "bg-gray-50" : ""
                          }`}
                          onClick={() => setSelectedApplication(application)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-text">
                              {application.freelancer.username}
                            </h3>
                            {getStatusBadge(application.status)}
                          </div>
                          <div className="flex items-center text-xs text-textLight">
                            <Calendar size={12} className="mr-1" />
                            {formatDate(application.submittedAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="md:col-span-2">
                {selectedApplication ? (
                  <div className="bg-white rounded-xl shadow-card p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-semibold text-text">Application Details</h2>
                        <p className="text-textLight">Applied on {formatDate(selectedApplication.submittedAt)}</p>
                      </div>
                      <div>
                        {getStatusBadge(selectedApplication.status)}
                      </div>
                    </div>
                    
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
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
                    
                    {selectedApplication.status === 'pending' && (
                      <div className="border-t border-border pt-4 mt-6 flex justify-end space-x-4">
                        <button
                          onClick={() => handleUpdateStatus(selectedApplication.id, 'rejected')}
                          disabled={processingId === selectedApplication.id}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-all flex items-center"
                        >
                          <XCircle size={16} className="mr-2" />
                          Reject
                        </button>
                        
                        <button
                          onClick={() => handleUpdateStatus(selectedApplication.id, 'accepted')}
                          disabled={processingId === selectedApplication.id}
                          className="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all flex items-center"
                        >
                          <CheckCircle size={16} className="mr-2" />
                          Accept
                        </button>
                      </div>
                    )}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default JobApplicationsPage;
