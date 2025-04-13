"use client";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';

const JobForm: React.FC = () => {
  const router = useRouter();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

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
      };

      const response = await fetch("/createjob", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Job submitted successfully:", result);
        router.push("/client_dashboard/jobs"); // Redirect to jobs page instead of dashboard
      } else {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.message || "Failed to submit job. Please try again.");
        console.error("Failed to submit job:", response.statusText);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Error submitting job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[90vh] bg-white font-sans">
      <div className="max-w-3xl w-full bg-gradient-bg bg-opacity-20 rounded-xl shadow-card p-6 md:p-8 mx-4 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-accent scrollbar-track-gray-100">
        <div className="mb-6 relative">
          <h2 className="text-xl font-semibold text-center text-secondary mb-2">Add New Job</h2>
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
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                placeholder="e.g., Senior Software Engineer"
                required
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
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                placeholder="e.g., Remote, New York, NY"
                required
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
                onChange={(e) => setSalaryRange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                placeholder="e.g., $80,000 - $120,000"
                required
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
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-all flex-2 
                ${isSubmitting ? 'bg-opacity-80 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Post Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;
