"use client";
import Navbar from "../../../../Components/navbar";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import clientRoutes from "@/app/Components/clientRoutes";

const EditJobPage = () => {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;

  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobType, setJobType] = useState("");
  const [location, setLocation] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [benefits, setBenefits] = useState("");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [autoRenew, setAutoRenew] = useState(false);
  const [status, setStatus] = useState("active");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const items = clientRoutes;

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/get-job/${jobId}`);
        if (response.ok) {
          const jobData = await response.json();
          
          setJobTitle(jobData.title);
          setJobDescription(jobData.description);
          setJobType(jobData.type);
          setLocation(jobData.location);
          setQualifications(jobData.qualifications);
          setExperience(jobData.experience);
          setSkills(jobData.skills);
          setSalaryRange(jobData.salaryRange);
          setBenefits(jobData.benefits);
          setApplicationDeadline(jobData.applicationDeadline?.split('T')[0] || ''); // Format date for input
          setAutoRenew(jobData.autoRenew);
          setStatus(jobData.status);
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

  // Input validation functions
  const validateJobTitle = (value: string) => {
    return value.length <= 100;
  };

  const validateTextArea = (value: string, maxLength: number) => {
    return value.length <= maxLength;
  };

  const validateSalaryRange = (value: string) => {
    return value.length <= 50;
  };

  const validateExperience = (value: string) => {
    return value.length <= 50;
  };

  const validateSkills = (value: string) => {
    return value.length <= 500;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validate inputs
    if (!validateJobTitle(jobTitle) ||
        !validateTextArea(jobDescription, 5000) ||
        !validateTextArea(qualifications, 1000) ||
        !validateSkills(skills) ||
        !validateExperience(experience) ||
        !validateTextArea(benefits, 1000)) {
      setError("Please check your inputs. Some fields may exceed the maximum allowed length.");
      setIsSubmitting(false);
      return;
    }

    // Check if deadline is in the future
    const deadlineDate = new Date(applicationDeadline);
    if (deadlineDate < new Date()) {
      setError("Application deadline cannot be in the past");
      setIsSubmitting(false);
      return;
    }

    try {
      const jobData = {
        title: jobTitle,
        description: jobDescription,
        type: jobType,
        location,
        qualifications,
        experience,
        skills,
        salaryRange,
        benefits,
        applicationDeadline,
        autoRenew,
        status
      };

      const response = await fetch(`/update-job/${jobId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Job updated successfully:", result);
        router.push(`/client_dashboard/jobs/${jobId}`);
      } else {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.error || "Failed to update job. Please try again.");
        console.error("Failed to update job:", response.statusText);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Error updating job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    router.push(`/client_dashboard/jobs/${jobId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar initialRole='Client' items={items} />
        <div className="flex-1 p-8 bg-gray-50 font-sans flex items-center justify-center">
          <div className="text-textLight">Loading job details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole='Client' items={items} />
      
      <div className="flex-1 p-8 bg-gray-50 font-sans">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <button
              onClick={handleBackClick}
              className="flex items-center text-secondary hover:text-opacity-80"
            >
              <ArrowLeft size={18} className="mr-2" /> Back to Job Details
            </button>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-card">
            <div className="mb-6 relative">
              <h2 className="text-xl font-semibold text-center text-secondary mb-2">Edit Job</h2>
              <div className="h-1 w-12 bg-accent mx-auto rounded"></div>
            </div>
            
            {error && (
              <div className="p-4 mb-6 text-red-800 bg-red-100 rounded-lg" role="alert">
                <span className="mr-2">⚠️</span> {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-600 mb-1">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => {
                      if (validateJobTitle(e.target.value)) {
                        setJobTitle(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                    placeholder="e.g., Senior Software Engineer"
                    required
                    maxLength={100}
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label htmlFor="jobType" className="block text-sm font-medium text-gray-600 mb-1">
                    Job Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="jobType"
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none bg-white"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-600 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => {
                      if (e.target.value.length <= 100) {
                        setLocation(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                    placeholder="e.g., Remote, New York, NY"
                    required
                    maxLength={100}
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label htmlFor="salaryRange" className="block text-sm font-medium text-gray-600 mb-1">
                    Salary Range <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="salaryRange"
                    value={salaryRange}
                    onChange={(e) => {
                      if (validateSalaryRange(e.target.value)) {
                        setSalaryRange(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                    placeholder="e.g., $80,000 - $120,000"
                    required
                    maxLength={50}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-600 mb-1">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none resize-none"
                  placeholder="Describe the job role and responsibilities"
                  rows={3}
                  required
                  disabled={isSubmitting}
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="qualifications" className="block text-sm font-medium text-gray-600 mb-1">
                    Qualifications <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="qualifications"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none resize-none"
                    placeholder="Required education, certifications, etc."
                    rows={2}
                    required
                    disabled={isSubmitting}
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-600 mb-1">
                    Skills <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none resize-none"
                    placeholder="e.g., JavaScript, React, Node.js"
                    rows={2}
                    required
                    disabled={isSubmitting}
                  ></textarea>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-600 mb-1">
                    Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                    placeholder="e.g., 3+ years"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label htmlFor="applicationDeadline" className="block text-sm font-medium text-gray-600 mb-1">
                    Application Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="applicationDeadline"
                    value={applicationDeadline}
                    onChange={(e) => setApplicationDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="benefits" className="block text-sm font-medium text-gray-600 mb-1">
                  Benefits <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="benefits"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none resize-none"
                  placeholder="e.g., Health insurance, 401k, remote work"
                  rows={2}
                  required
                  disabled={isSubmitting}
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label htmlFor="jobStatus" className="block text-sm font-medium text-gray-600 mb-1">
                  Job Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="jobStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none bg-white"
                  required
                  disabled={isSubmitting}
                >
                  <option value="active">Active</option>
                  <option value="filled">Filled</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg mb-6 flex items-center">
                <input
                  type="checkbox"
                  id="autoRenew"
                  checked={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.checked)}
                  className="w-4 h-4 mr-2 accent-secondary"
                  disabled={isSubmitting}
                />
                <label htmlFor="autoRenew" className="text-sm font-medium text-gray-600">
                  Enable Auto-Renewal of Job Posting
                </label>
              </div>
              
              <div className="flex justify-between gap-4">
                <button
                  type="button"
                  onClick={handleBackClick}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-all flex-1 
                    ${isSubmitting ? 'bg-opacity-80 cursor-not-allowed' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditJobPage;
