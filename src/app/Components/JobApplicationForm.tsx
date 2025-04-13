"use client";
import React, { useState } from "react";
import { ArrowLeft } from 'lucide-react';

interface JobApplicationFormProps {
  jobId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ jobId, onSuccess, onCancel }) => {
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const applicationData = {
        coverLetter,
        resume,
      };

      const response = await fetch(`/apply-job/${jobId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.error || "Failed to submit application. Please try again.");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Error submitting application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <div className="mb-6 relative">
        <button
          onClick={onCancel}
          className="absolute left-0 top-0 flex items-center text-secondary hover:text-opacity-80"
        >
          <ArrowLeft size={18} className="mr-1" /> Back
        </button>
        <h2 className="text-xl font-semibold text-center text-secondary">Apply for this Position</h2>
      </div>
      
      {error && (
        <div className="p-4 mb-6 text-red-800 bg-red-100 rounded-lg" role="alert">
          <span className="mr-2">⚠️</span> {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-600 mb-2">
            Cover Letter <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-textLight mb-2">
            Introduce yourself, highlight your relevant experience, and explain why you're a good fit for this position.
          </p>
          <textarea
            id="coverLetter"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none resize-none"
            placeholder="Write your cover letter here..."
            rows={8}
            required
            disabled={isSubmitting}
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label htmlFor="resume" className="block text-sm font-medium text-gray-600 mb-2">
            Resume / CV <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-textLight mb-2">
            Provide your professional history, skills, and qualifications. 
            In a real application, you'd upload a file here.
          </p>
          <textarea
            id="resume"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none resize-none"
            placeholder="For this demo, please paste the content of your resume here..."
            rows={8}
            required
            disabled={isSubmitting}
          ></textarea>
          <p className="text-xs text-textLight mt-2">
            Note: In a production environment, this would be a file upload component.
          </p>
        </div>
        
        <div className="mt-8 flex justify-between gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-3 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-all flex-1 
              ${isSubmitting ? 'bg-opacity-80 cursor-not-allowed' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobApplicationForm;
