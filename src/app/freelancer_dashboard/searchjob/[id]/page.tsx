"use client";
import Navbar from "../../../Components/navbar";
import JobDetail from "../../../Components/JobDetail";
import JobApplicationForm from "../../../Components/JobApplicationForm";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import freelancerRoutes from "@/app/Components/freelancerRoutes";
import { ArrowLeft } from "lucide-react";

const JobDetailPage = () => {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;

  const items = freelancerRoutes;
  
  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/get-job/${jobId}`);
        if (response.ok) {
          const jobData = await response.json();
          setJob(jobData);
        } else {
          const errorData = await response.json().catch(() => null);
          setError(errorData?.error || "Failed to load job details. The job may not exist.");
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
        console.error("Error fetching job:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJob();
  }, [jobId]);
  
  const handleApply = () => {
    setShowApplicationForm(true);
  };
  
  const handleApplicationSuccess = () => {
    setShowApplicationForm(false);
    setApplicationSubmitted(true);
  };
  
  const handleApplicationCancel = () => {
    setShowApplicationForm(false);
  };
  
  const handleBackClick = () => {
    router.push("/freelancer_dashboard/searchjob");
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole='Freelancer' items={items} />
      
      <div className="flex-1 p-8 bg-gray-50 font-sans">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <button
              onClick={handleBackClick}
              className="flex items-center text-secondary hover:text-opacity-80"
            >
              <ArrowLeft size={18} className="mr-2" /> Back to Job Search
            </button>
          </div>
          
          {loading ? (
            <div className="bg-white p-10 rounded-xl shadow-card flex items-center justify-center">
              <p className="text-textLight">Loading job details...</p>
            </div>
          ) : error ? (
            <div className="bg-white p-10 rounded-xl shadow-card">
              <div className="text-center">
                <p className="text-red-600 font-medium mb-2">Error</p>
                <p className="text-textLight">{error}</p>
                <button 
                  onClick={handleBackClick}
                  className="mt-6 px-4 py-2 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-all"
                >
                  Return to Job Search
                </button>
              </div>
            </div>
          ) : showApplicationForm ? (
            <JobApplicationForm 
              jobId={jobId} 
              onSuccess={handleApplicationSuccess} 
              onCancel={handleApplicationCancel} 
            />
          ) : (
            <>
              {applicationSubmitted && (
                <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">
                  ✅ Your application has been submitted successfully! You can track it in Your Applications.
                </div>
              )}
              
              <JobDetail 
                job={job}
                onApply={handleApply}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
