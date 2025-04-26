"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../../Components/navbar";
import { Search, Filter, FileText, User, Calendar, CheckCircle, XCircle } from "lucide-react";
import InterviewScheduleModal from "../../Components/InterviewScheduleModal";
import clientRoutes from "@/app/Components/clientRoutes";

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
  interviewDateTime?: string;
}

const ApplicationsPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  const items = clientRoutes; // Use the imported routes for the navbar

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await fetch("/get-applications", {
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch applications");
        }
        
        const data = await response.json();
        setApplications(data);
        setFilteredApplications(data);
        if (data.length > 0) {
          setSelectedApplication(data[0]);
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, []);

  useEffect(() => {
    // Apply filtering and searching
    let results = applications;
    
    // Apply status filter
    if (filterStatus !== "all") {
      results = results.filter(app => app.status === filterStatus);
    }
    
    // Apply search term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        app => 
          app.jobTitle.toLowerCase().includes(term) || 
          app.freelancer.username.toLowerCase().includes(term) ||
          app.freelancer.email.toLowerCase().includes(term)
      );
    }
    
    setFilteredApplications(results);
  }, [applications, searchTerm, filterStatus]);

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

  const handleUpdateStatus = async (applicationId: string, status: string) => {
    setProcessingId(applicationId);
    
    try {
      // If accepting, show the interview modal instead of immediately updating
      if (status === 'accepted') {
        setShowInterviewModal(true);
        return;
      }
      
      const response = await fetch(`/update-application-status/${applicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        // Update the application in the list
        setApplications(apps => 
          apps.map(app => 
            app.id === applicationId ? { ...app, status: status as Application['status'] } : app
          )
        );
        
        // Also update the selected application if it's the one being modified
        if (selectedApplication && selectedApplication.id === applicationId) {
          setSelectedApplication({
            ...selectedApplication,
            status: status as Application['status']
          });
        }
      } else {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.error || "Failed to update application status. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleScheduleInterview = async (applicationId: string, dateTime: string, message: string) => {
    try {
      const response = await fetch(`/schedule-interview/${applicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          dateTime, 
          message,
          scheduleNow: true
        })
      });
      
      if (response.ok) {
        // Update the application status to accepted
        setApplications(apps => 
          apps.map(app => 
            app.id === applicationId ? { ...app, status: 'accepted', interviewDateTime: dateTime } : app
          )
        );
        
        // Also update the selected application if it's the one being modified
        if (selectedApplication && selectedApplication.id === applicationId) {
          setSelectedApplication({
            ...selectedApplication,
            status: 'accepted',
            interviewDateTime: dateTime
          });
        }
        
        setShowInterviewModal(false);
      } else {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.error || "Failed to schedule interview. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleScheduleLater = async (applicationId: string) => {
    try {
      const response = await fetch(`/schedule-interview/${applicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          scheduleNow: false 
        })
      });
      
      if (response.ok) {
        // Update the application status to accepted
        setApplications(apps => 
          apps.map(app => 
            app.id === applicationId ? { ...app, status: 'accepted' } : app
          )
        );
        
        // Also update the selected application if it's the one being modified
        if (selectedApplication && selectedApplication.id === applicationId) {
          setSelectedApplication({
            ...selectedApplication,
            status: 'accepted'
          });
        }
        
        setShowInterviewModal(false);
      } else {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.error || "Failed to accept application. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole="Client" items={items} />
      
      <div className="flex-1 p-8 bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-text mb-6">Job Applications</h1>
          
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
                      placeholder="Search applications..."
                      className="bg-transparent border-none focus:outline-none text-sm flex-grow"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <Filter size={16} className="text-textLight mr-2" />
                    <select
                      className="bg-transparent border-none focus:outline-none text-sm flex-grow"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4 mt-2">
                    <h3 className="text-sm font-medium text-textLight mb-3">Applications ({filteredApplications.length})</h3>
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
                          <p className="text-sm text-primary mb-1">
                            {application.jobTitle}
                          </p>
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
                        <h2 className="text-2xl font-semibold text-text">{selectedApplication.jobTitle}</h2>
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

      {showInterviewModal && selectedApplication && (
        <InterviewScheduleModal
          applicationId={selectedApplication.id}
          freelancerName={selectedApplication.freelancer.username}
          isOpen={showInterviewModal}
          onClose={() => setShowInterviewModal(false)}
          onSchedule={handleScheduleInterview}
          onScheduleLater={handleScheduleLater}
        />
      )}
    </div>
  );
};

export default ApplicationsPage;
