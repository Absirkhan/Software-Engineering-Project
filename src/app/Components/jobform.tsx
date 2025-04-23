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
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [benefits, setBenefits] = useState("");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [autoRenew, setAutoRenew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [timerDuration, setTimerDuration] = useState(3600); // Default timer in seconds (1 hour)

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

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
        timerDuration, // Include timer duration
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
        router.push("/client_dashboard/jobs");
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
    <div className="flex justify-center items-center py-8 bg-gray-50 font-sans">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-card p-6 md:p-8 mx-4">
        <div className="mb-6 relative">
          <h2 className="text-2xl font-semibold text-center text-secondary mb-2">Add New Job</h2>
          <div className="h-1 w-20 bg-accent mx-auto rounded"></div>
        </div>
        
        {error && (
          <div className="p-4 mb-6 text-red-800 bg-red-100 border border-red-200 rounded-lg" role="alert">
            <span className="font-medium mr-2">⚠️</span> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-text mb-1">
                Job Title <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none bg-white text-text"
                placeholder="e.g., Senior Software Engineer"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label htmlFor="jobType" className="block text-sm font-medium text-text mb-1">
                Job Type <span className="text-accent">*</span>
              </label>
              <select
                id="jobType"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none bg-white text-text"
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-text mb-1">
                Location <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none bg-white text-text"
                placeholder="e.g., Remote, New York, NY"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label htmlFor="salaryRange" className="block text-sm font-medium text-text mb-1">
                Salary Range <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                id="salaryRange"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none bg-white text-text"
                placeholder="e.g., $80,000 - $120,000"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="jobDescription" className="block text-sm font-medium text-text mb-1">
              Job Description <span className="text-accent">*</span>
            </label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none resize-none bg-white text-text"
              placeholder="Describe the job role and responsibilities"
              rows={3}
              required
              disabled={isSubmitting}
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="qualifications" className="block text-sm font-medium text-text mb-1">
                Qualifications <span className="text-accent">*</span>
              </label>
              <textarea
                id="qualifications"
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none resize-none bg-white text-text"
                placeholder="Required education, certifications, etc."
                rows={2}
                required
                disabled={isSubmitting}
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-text mb-1">
                Skills <span className="text-accent">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  id="skills"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                  placeholder="Add a skill"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-secondary text-white rounded-lg text-sm hover:bg-buttonHover"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-textLight flex items-center"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-text mb-1">
                Experience <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                id="experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none bg-white text-text"
                placeholder="e.g., 3+ years"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label htmlFor="applicationDeadline" className="block text-sm font-medium text-text mb-1">
                Application Deadline <span className="text-accent">*</span>
              </label>
              <input
                type="date"
                id="applicationDeadline"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none bg-white text-text"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="benefits" className="block text-sm font-medium text-text mb-1">
              Benefits <span className="text-accent">*</span>
            </label>
            <textarea
              id="benefits"
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none resize-none bg-white text-text"
              placeholder="e.g., Health insurance, 401k, remote work"
              rows={2}
              required
              disabled={isSubmitting}
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="timerDuration" className="block text-sm font-medium text-text mb-1">
              Job Timer (in seconds) <span className="text-accent">*</span>
            </label>
            <input
              type="number"
              id="timerDuration"
              value={timerDuration}
              onChange={(e) => setTimerDuration(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none bg-white text-text"
              placeholder="e.g., 3600 for 1 hour"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg border border-border flex items-center">
            <input
              type="checkbox"
              id="autoRenew"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
              className="w-4 h-4 mr-2 accent-secondary"
              disabled={isSubmitting}
            />
            <label htmlFor="autoRenew" className="text-sm font-medium text-textLight">
              Enable Auto-Renewal of Job Posting
            </label>
          </div>
          
          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 border border-border rounded-lg bg-white text-text font-medium text-sm hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-all 
                ${isSubmitting ? 'opacity-80 cursor-not-allowed' : ''}`}
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
