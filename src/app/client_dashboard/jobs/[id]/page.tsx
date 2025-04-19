"use client";
import Navbar from "../../../Components/navbar";
import JobDetail from "../../../Components/JobDetail";
import InterviewScheduleModal from "../../../Components/InterviewScheduleModal";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, CheckCircle, XCircle, Clock } from "lucide-react";

const JobDetailPage = () => {
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [selectedFreelancerName, setSelectedFreelancerName] = useState<string>('');
  
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;

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
      if (!jobId) return;
      
      setLoading(true);
      try {
        // Fetch job details
        const jobResponse = await fetch(`/get-job/${jobId}`);
        if (!jobResponse.ok) {
          throw new Error("Failed to load job details");
        }
        const jobData = await jobResponse.json();
        setJob(jobData);
        
        // Fetch job applications
        const applicationsResponse = await fetch(`/get-applications/${jobId}`);
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json();
          setApplications(applicationsData);
        }
      } catch (err) {
        setError("An error occurred while fetching job data");
        console.error("Error fetching job data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [jobId]);
  
  const handleEditJob = () => {
    router.push(`/client_dashboard/jobs/edit/${jobId}`);
  };
  
  const handleDeleteJob = async () => {
    if (!deleteConfirmation) {
      setDeleteConfirmation(true);
      return;
    }
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/delete-job/${jobId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        router.push("/client_dashboard/jobs");
      } else {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.error || "Failed to delete job. Please try again.");
        setDeleteConfirmation(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setDeleteConfirmation(false);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleBackClick = () => {
    router.push("/client_dashboard/jobs");
  };
  
  const handleUpdateStatus = async (applicationId: string, status: string) => {
    try {
      // If accepting, show the interview modal instead of immediately updating
      if (status === 'accepted') {
        const application = applications.find(app => app.id === applicationId);
        if (application) {
          setSelectedApplicationId(applicationId);
          setSelectedFreelancerName(application.freelancer.username);
          setShowInterviewModal(true);
        }
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
            app.id === applicationId ? { ...app, status } : app
          )
        );
      } else {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.error || "Failed to update application status");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
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
            app.id === applicationId ? { ...app, status: 'accepted' } : app
          )
        );
        setShowInterviewModal(false);
      } else {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.error || "Failed to schedule interview. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
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
        setShowInterviewModal(false);
      } else {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.error || "Failed to accept application. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }
  };
  
  // Format date to human readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get status badge for applications
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded flex items-center">
            <Clock size={12} className="mr-1" /> Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded flex items-center">
            <CheckCircle size={12} className="mr-1" /> Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded flex items-center">
            <XCircle size={12} className="mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole='Client' items={items} />
      
      <div className="flex-1 p-8 bg-gray-50 font-sans">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <button
              onClick={handleBackClick}
              className="flex items-center text-secondary hover:text-opacity-80"
            >
              <ArrowLeft size={18} className="mr-2" /> Back to All Jobs
            </button>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
              ⚠️ {error}
            </div>
          )}
          
          {loading ? (
            <div className="bg-white p-10 rounded-xl shadow-card flex items-center justify-center">
              <p className="text-textLight">Loading job details...</p>
            </div>
          ) : job ? (
            <>
              <div className="mb-10">
                <JobDetail 
                  job={job}
                  onEdit={handleEditJob}
                  onDelete={() => handleDeleteJob()}
                />
              </div>
              
              {deleteConfirmation && (
                <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-xl">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Confirm Deletion</h3>
                  <p className="text-red-700 mb-4">
                    Are you sure you want to delete this job posting? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteConfirmation(false)}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50"
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteJob}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Confirm Delete"}
                    </button>
                  </div>
                </div>
              )}
              
              <div className="bg-white rounded-xl shadow-card overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="font-semibold text-xl text-text">
                    Applications ({applications.length})
                  </h2>
                </div>
                
                {applications.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-textLight uppercase tracking-wider">
                            Freelancer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-textLight uppercase tracking-wider">
                            Applied On
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-textLight uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-textLight uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {applications.map((application) => (
                          <tr key={application.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  <User size={16} className="text-gray-500" />
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-text">{application.freelancer.username}</p>
                                  <p className="text-xs text-textLight">{application.freelancer.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-textLight">
                              {formatDate(application.submittedAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(application.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <button 
                                onClick={() => router.push(`/client_dashboard/applications?application=${application.id}`)}
                                className="text-accent hover:text-secondary mr-3"
                              >
                                View Details
                              </button>
                              {application.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(application.id, 'accepted')}
                                    className="text-green-600 hover:text-green-800 mr-2"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(application.id, 'rejected')}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-textLight">
                    No applications received for this job yet.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white p-10 rounded-xl shadow-card">
              <div className="text-center">
                <p className="text-textLight mb-4">Job not found or you don't have permission to view it.</p>
                <button 
                  onClick={handleBackClick}
                  className="px-4 py-2 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-all"
                >
                  Return to All Jobs
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {showInterviewModal && selectedApplicationId && (
        <InterviewScheduleModal
          applicationId={selectedApplicationId}
          freelancerName={selectedFreelancerName}
          isOpen={showInterviewModal}
          onClose={() => setShowInterviewModal(false)}
          onSchedule={handleScheduleInterview}
          onScheduleLater={handleScheduleLater}
        />
      )}
    </div>
  );
};

export default JobDetailPage;
