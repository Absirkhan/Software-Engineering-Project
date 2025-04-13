"use client";
import Navbar from "../../Components/navbar";
import React, { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

const ApplicationsPage = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  const items = [
    { name: "Dashboard", icon: "home", href: "/freelancer_dashboard" },
    { name: "Profile", icon: "user", href: "/freelancer_dashboard/profile" },
    { name: "Search Job", icon: "folder", href: "/freelancer_dashboard/searchjob" },
    { name: "Applied Jobs", icon: "file", href: "/freelancer_dashboard/applications" },
    { name: "Payments", icon: "credit-card", href: "/freelancer_dashboard/payments" },
    { name: "Settings", icon: "settings", href: "/freelancer_dashboard/settings" },
    { name: "Logout", icon: "logout", href: "/auth/logout" }
  ];
  
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const response = await fetch("/get-applications");
        if (response.ok) {
          const data = await response.json();
          setApplications(data);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
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
            <Clock size={12} className="mr-1" /> Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded flex items-center w-fit">
            <CheckCircle size={12} className="mr-1" /> Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded flex items-center w-fit">
            <XCircle size={12} className="mr-1" /> Rejected
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

  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole='Freelancer' items={items} />
      
      <div className="flex-1 p-8 bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-text mb-2">
            Your Applications
          </h1>
          
          <p className="text-textLight mb-6">
            Track the status of your job applications
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-card overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold text-lg text-text">
                    Applications ({applications.length})
                  </h2>
                </div>
                
                {loading ? (
                  <div className="p-6 text-center text-textLight">
                    Loading applications...
                  </div>
                ) : applications.length > 0 ? (
                  <div className="divide-y divide-border max-h-[65vh] overflow-y-auto">
                    {applications.map((application) => (
                      <div 
                        key={application.id}
                        className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${selectedApplication && selectedApplication.id === application.id ? 'bg-gray-50' : ''}`}
                        onClick={() => setSelectedApplication(application)}
                      >
                        <h3 className="font-medium text-text">{application.jobTitle}</h3>
                        <p className="text-xs text-textLight mt-1">
                          {application.client?.username || 'Unknown Client'}
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
                    You haven't applied to any jobs yet.
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
                    <h3 className="text-md font-semibold text-text mb-2">Application Status</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {selectedApplication.status === 'pending' ? (
                        <p className="text-sm text-textLight">
                          Your application is being reviewed by the employer. We'll notify you when there's an update.
                        </p>
                      ) : selectedApplication.status === 'accepted' ? (
                        <p className="text-sm text-green-600">
                          Congratulations! Your application has been accepted. The employer will contact you soon with further details.
                        </p>
                      ) : (
                        <p className="text-sm text-red-600">
                          Thank you for your interest, but the employer has decided to move forward with other candidates.
                        </p>
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
