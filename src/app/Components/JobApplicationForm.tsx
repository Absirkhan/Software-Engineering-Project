"use client";
import React, { useState, useRef } from "react";
import { ArrowLeft, Upload, File, X } from 'lucide-react';

interface JobApplicationFormProps {
  jobId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ jobId, onSuccess, onCancel }) => {
  const [coverLetter, setCoverLetter] = useState("");
  const [genericResumeFile, setGenericResumeFile] = useState<File | null>(null);
  const [jobSpecificResumeFile, setJobSpecificResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const genericResumeRef = useRef<HTMLInputElement | null>(null);
  const jobSpecificResumeRef = useRef<HTMLInputElement | null>(null);
  const coverLetterFileRef = useRef<HTMLInputElement | null>(null);

  const handleApplyClick = async () => {
    try {
        await fetch(`/increment-apply-clicks/${jobId}`, { method: 'POST' });
    } catch (error) {
        console.error('Error incrementing apply clicks:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await handleApplyClick(); // Increment apply clicks
      // Validate file uploads
      if (!genericResumeFile) {
        setError("Generic resume is required");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('coverLetter', coverLetter);
      formData.append('genericResume', genericResumeFile);
      
      if (jobSpecificResumeFile) {
        formData.append('jobSpecificResume', jobSpecificResumeFile);
      }
      
      if (coverLetterFile) {
        formData.append('coverLetterFile', coverLetterFile);
      }

      const response = await fetch(`/apply-job/${jobId}`, {
        method: "POST",
        body: formData,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file is PDF
      if (file.type !== 'application/pdf') {
        setError("Only PDF files are accepted");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File is too large. Maximum size is 5MB");
        return;
      }
      
      setFile(file);
      setError("");
    }
  };

  const removeFile = (setFile: React.Dispatch<React.SetStateAction<File | null>>, inputRef: React.RefObject<HTMLInputElement | null>) => {
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
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
        {/* Cover Letter Text */}
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
        
        {/* Generic Resume Upload (Required) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Generic Resume (PDF) <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-textLight mb-2">
            Upload your general resume/CV that you use for most job applications (Max 5MB).
          </p>
          
          {!genericResumeFile ? (
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => genericResumeRef.current?.click()}>
              <Upload size={24} className="mx-auto mb-2 text-textLight" />
              <p className="text-sm text-textLight">Click to upload your generic resume (PDF only)</p>
              <input 
                type="file" 
                ref={genericResumeRef}
                className="hidden" 
                accept="application/pdf"
                onChange={(e) => handleFileChange(e, setGenericResumeFile)}
                disabled={isSubmitting}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-gray-50">
              <div className="flex items-center">
                <File size={18} className="mr-2 text-accent" />
                <span className="text-sm text-text truncate max-w-xs">{genericResumeFile.name}</span>
              </div>
              <button 
                type="button" 
                onClick={() => removeFile(setGenericResumeFile, genericResumeRef)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <X size={16} className="text-textLight" />
              </button>
            </div>
          )}
        </div>
        
        {/* Job-Specific Resume Upload (Optional) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Job-Specific Resume (PDF) <span className="text-xs font-normal text-textLight">(Optional)</span>
          </label>
          <p className="text-xs text-textLight mb-2">
            Upload a resume tailored specifically for this position, if you have one (Max 5MB).
          </p>
          
          {!jobSpecificResumeFile ? (
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => jobSpecificResumeRef.current?.click()}>
              <Upload size={24} className="mx-auto mb-2 text-textLight" />
              <p className="text-sm text-textLight">Click to upload a job-specific resume (PDF only)</p>
              <input 
                type="file" 
                ref={jobSpecificResumeRef}
                className="hidden" 
                accept="application/pdf"
                onChange={(e) => handleFileChange(e, setJobSpecificResumeFile)}
                disabled={isSubmitting}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-gray-50">
              <div className="flex items-center">
                <File size={18} className="mr-2 text-accent" />
                <span className="text-sm text-text truncate max-w-xs">{jobSpecificResumeFile.name}</span>
              </div>
              <button 
                type="button" 
                onClick={() => removeFile(setJobSpecificResumeFile, jobSpecificResumeRef)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <X size={16} className="text-textLight" />
              </button>
            </div>
          )}
        </div>
        
        {/* Cover Letter File Upload (Optional) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Cover Letter Document (PDF) <span className="text-xs font-normal text-textLight">(Optional)</span>
          </label>
          <p className="text-xs text-textLight mb-2">
            If you have a formal cover letter document, you can upload it here in addition to the text above (Max 5MB).
          </p>
          
          {!coverLetterFile ? (
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => coverLetterFileRef.current?.click()}>
              <Upload size={24} className="mx-auto mb-2 text-textLight" />
              <p className="text-sm text-textLight">Click to upload a formal cover letter (PDF only)</p>
              <input 
                type="file" 
                ref={coverLetterFileRef}
                className="hidden" 
                accept="application/pdf"
                onChange={(e) => handleFileChange(e, setCoverLetterFile)}
                disabled={isSubmitting}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-gray-50">
              <div className="flex items-center">
                <File size={18} className="mr-2 text-accent" />
                <span className="text-sm text-text truncate max-w-xs">{coverLetterFile.name}</span>
              </div>
              <button 
                type="button" 
                onClick={() => removeFile(setCoverLetterFile, coverLetterFileRef)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <X size={16} className="text-textLight" />
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-8 flex justify-between gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-border rounded-lg text-text font-medium text-sm hover:bg-gray-50 transition-all"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="px-6 py-2.5 bg-secondary hover:bg-buttonHover text-white rounded-lg font-medium text-sm transition-all"
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
