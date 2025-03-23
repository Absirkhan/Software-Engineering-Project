"use client";
import React, { useState } from "react";

const JobForm: React.FC = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    try {
        const response = await fetch('/createjob', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jobData),
        });
    
        if (response.ok) {
            const result = await response.json();
            console.log('Job submitted successfully:', result);
            // Redirect to another page
            window.location.href = '/client_dashboard';
        } else {
            console.error('Failed to submit job:', response.statusText);
        }
    } catch (error) {
        console.error('Error submitting job:', error);
    }
    };    


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4 shadow-md bg-white rounded">
        <h2 className="text-xl font-bold text-center mb-4 text-black">Add Job</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col">
            <label htmlFor="jobTitle" className="text-sm font-medium text-black">Job Title</label>
            <input
              type="text"
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="mt-1 p-2 border rounded text-black"
              placeholder="Enter the job title"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="jobDescription" className="text-sm font-medium text-black">Job Description</label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="mt-1 p-2 border rounded text-black"
              placeholder="Enter the job description"
              rows={3}
              required
            ></textarea>
          </div>
          <div className="flex flex-col">
            <label htmlFor="jobType" className="text-sm font-medium text-black">Job Type</label>
            <select
              id="jobType"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="mt-1 p-2 border rounded text-black"
            >
              <option value="">Select Job Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Temporary">Temporary</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="location" className="text-sm font-medium text-black">Location</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 p-2 border rounded text-black"
              placeholder="Enter the job location"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="qualifications" className="text-sm font-medium text-black">Qualifications</label>
            <textarea
              id="qualifications"
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              className="mt-1 p-2 border rounded text-black"
              placeholder="Enter the required qualifications"
              rows={2}
              required
            ></textarea>
          </div>
          <div className="flex flex-col">
            <label htmlFor="experience" className="text-sm font-medium text-black">Experience</label>
            <input
              type="text"
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="mt-1 p-2 border rounded text-black"
              placeholder="Enter the required experience"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="skills" className="text-sm font-medium text-black">Skills</label>
            <textarea
              id="skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="mt-1 p-2 border rounded text-black"
              placeholder="Enter the required skills"
              rows={2}
              required
            ></textarea>
          </div>
          <div className="flex flex-col">
            <label htmlFor="salaryRange" className="text-sm font-medium text-black">Salary Range</label>
            <input
              type="text"
              id="salaryRange"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              className="mt-1 p-2 border rounded text-black"
              placeholder="Enter the salary range"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="benefits" className="text-sm font-medium text-black">Benefits</label>
            <textarea
              id="benefits"
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              className="mt-1 p-2 border rounded text-black"
              placeholder="Enter the offered benefits"
              rows={2}
              required
            ></textarea>
          </div>
          <div className="flex flex-col">
            <label htmlFor="applicationDeadline" className="text-sm font-medium text-black">Application Deadline</label>
            <input
              type="date"
              id="applicationDeadline"
              value={applicationDeadline}
              onChange={(e) => setApplicationDeadline(e.target.value)}
              className="mt-1 p-2 border rounded text-black"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoRenew"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
            />
            <label htmlFor="autoRenew" className="text-sm font-medium text-black">
              Enable Auto-Renewal
            </label>
          </div>
          <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default JobForm;
