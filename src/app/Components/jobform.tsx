"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

const JobForm: React.FC = () => {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobType, setJobType] = useState("");
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
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
        router.push("/client_dashboard");
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
    <div style={styles.container}>
      <div style={styles.formCard}>
        <div style={styles.formHeader}>
          <h2 style={styles.heading}>Add New Job</h2>
          <div style={styles.headerLine}></div>
        </div>
        
        {error && (
          <div style={styles.errorAlert} role="alert">
            <span>⚠️</span> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label htmlFor="jobTitle" style={styles.label}>
                Job Title <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                style={styles.input}
                placeholder="e.g., Senior Software Engineer"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label htmlFor="jobType" style={styles.label}>
                Job Type <span style={styles.required}>*</span>
              </label>
              <select
                id="jobType"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                style={styles.select}
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
          
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label htmlFor="location" style={styles.label}>
                Location <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={styles.input}
                placeholder="e.g., Remote, New York, NY"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label htmlFor="salaryRange" style={styles.label}>
                Salary Range <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="salaryRange"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                style={styles.input}
                placeholder="e.g., $80,000 - $120,000"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="jobDescription" style={styles.label}>
              Job Description <span style={styles.required}>*</span>
            </label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              style={{...styles.input, ...styles.textarea}}
              placeholder="Describe the job role and responsibilities"
              rows={3}
              required
              disabled={isSubmitting}
            ></textarea>
          </div>
          
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label htmlFor="qualifications" style={styles.label}>
                Qualifications <span style={styles.required}>*</span>
              </label>
              <textarea
                id="qualifications"
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                style={{...styles.input, ...styles.textarea}}
                placeholder="Required education, certifications, etc."
                rows={2}
                required
                disabled={isSubmitting}
              ></textarea>
            </div>
            
            <div style={styles.formGroup}>
              <label htmlFor="skills" style={styles.label}>
                Skills <span style={styles.required}>*</span>
              </label>
              <textarea
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                style={{...styles.input, ...styles.textarea}}
                placeholder="e.g., JavaScript, React, Node.js"
                rows={2}
                required
                disabled={isSubmitting}
              ></textarea>
            </div>
          </div>
          
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label htmlFor="experience" style={styles.label}>
                Experience <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                style={styles.input}
                placeholder="e.g., 3+ years"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label htmlFor="applicationDeadline" style={styles.label}>
                Application Deadline <span style={styles.required}>*</span>
              </label>
              <input
                type="date"
                id="applicationDeadline"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                style={styles.input}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="benefits" style={styles.label}>
              Benefits <span style={styles.required}>*</span>
            </label>
            <textarea
              id="benefits"
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              style={{...styles.input, ...styles.textarea}}
              placeholder="e.g., Health insurance, 401k, remote work"
              rows={2}
              required
              disabled={isSubmitting}
            ></textarea>
          </div>
          
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="autoRenew"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
              style={styles.checkbox}
              disabled={isSubmitting}
            />
            <label htmlFor="autoRenew" style={styles.checkboxLabel}>
              Enable Auto-Renewal of Job Posting
            </label>
          </div>
          
          <div style={styles.buttonContainer}>
            <button
              type="button"
              onClick={() => router.back()}
              style={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...styles.submitButton,
                ...(isSubmitting ? styles.submittingButton : {})
              }}
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

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '90vh',
    padding: '0px',
    background: '#ffffff',
    fontFamily: "'Poppins', sans-serif",
  },
  formCard: {
    maxWidth: '700px',
    width: '100%',
    padding: '25px',
    background: 'linear-gradient(135deg,rgba(230, 240, 255, 0.15),rgba(240, 230, 255, 0.25))',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    maxHeight: '80vh',
    overflowY: 'auto' as const,
    scrollbarWidth: 'thin' as const,
    scrollbarColor: '#a8c6fa #f0f0f0',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#f0f0f0',
      borderRadius: '6px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#a8c6fa',
      borderRadius: '6px',
      '&:hover': {
        background: '#335599',
      }
    },
  },
  formHeader: {
    marginBottom: '25px',
    position: 'relative' as const,
  },
  heading: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#335599',
    textAlign: 'center' as const,
    margin: 0,
  },
  headerLine: {
    height: '3px',
    width: '50px',
    background: '#a8c6fa',
    margin: '12px auto 0',
    borderRadius: '2px',
  },
  errorAlert: {
    padding: '10px 15px',
    marginBottom: '20px',
    color: '#721c24',
    backgroundColor: '#f8d7da',
    borderRadius: '6px',
  },
  formRow: {
    display: 'flex',
    gap: '15px',
    marginBottom: '15px',
    '@media (max-width: 640px)': {
      flexDirection: 'column' as const,
    }
  },
  formGroup: {
    flex: '1',
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#5d5d5d',
  },
  required: {
    color: '#e53e3e',
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    fontSize: '14px',
    border: '1px solid #dce0e8',
    borderRadius: '6px',
    color: '#495057',
    transition: 'all 0.2s',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05) inset',
    '&:focus': {
      borderColor: '#a8c6fa',
      boxShadow: '0 0 0 3px rgba(168, 198, 250, 0.25)',
      outline: 'none',
    }
  },
  select: {
    width: '100%',
    padding: '9px 12px',
    fontSize: '14px',
    border: '1px solid #dce0e8',
    borderRadius: '6px',
    color: '#495057',
    backgroundColor: '#fff',
    transition: 'all 0.2s',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05) inset',
    appearance: 'menulist' as const,
  },
  textarea: {
    resize: 'none' as 'none',
    minHeight: '70px',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    marginRight: '10px',
    accentColor: '#335599',
  },
  checkboxLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#5d5d5d',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '15px',
  },
  cancelButton: {
    padding: '10px 15px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#4b5563',
    fontWeight: '500',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flex: '1',
  },
  submitButton: {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#335599',
    color: 'white',
    fontWeight: '500',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flex: '2',
  },
  submittingButton: {
    backgroundColor: '#4a71b4',
    cursor: 'not-allowed',
    opacity: 0.8,
  }
};

export default JobForm;
