"use client";
import React from "react";
import { Briefcase, MapPin, Calendar, DollarSign, User, Building } from 'lucide-react';

interface JobDetailProps {
  job: any;
  showActions?: boolean;
  onApply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const JobDetail: React.FC<JobDetailProps> = ({ 
  job, 
  showActions = true,
  onApply,
  onEdit,
  onDelete 
}) => {
  // Format date to human readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-semibold text-text">{job.title}</h2>
        {job.status && (
          <span 
            className={`px-2 py-1 text-xs font-medium rounded ${
              job.status === 'active' ? 'bg-green-100 text-green-800' : 
              job.status === 'closed' ? 'bg-red-100 text-red-800' :
              job.status === 'filled' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}
          >
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center text-sm text-textLight">
          <Briefcase size={16} className="mr-1" /> {job.type}
        </div>
        <div className="flex items-center text-sm text-textLight">
          <MapPin size={16} className="mr-1" /> {job.location}
        </div>
        <div className="flex items-center text-sm text-accent font-medium">
          <DollarSign size={16} className="mr-1" /> {job.salaryRange}
        </div>
        <div className="flex items-center text-sm text-textLight">
          <Calendar size={16} className="mr-1" /> 
          Apply by {formatDate(job.applicationDeadline)}
        </div>
      </div>
      
      {job.client && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-gray-200 rounded-full mr-3">
              <Building size={18} className="text-secondary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text">Posted by {job.client.username}</h3>
              <p className="text-xs text-textLight">Contact: {job.client.email}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-md font-semibold text-text mb-2">Job Description</h3>
        <p className="text-sm text-textLight whitespace-pre-line">{job.description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-md font-semibold text-text mb-2">Qualifications</h3>
          <p className="text-sm text-textLight whitespace-pre-line">{job.qualifications}</p>
        </div>
        
        <div>
          <h3 className="text-md font-semibold text-text mb-2">Skills</h3>
          <p className="text-sm text-textLight whitespace-pre-line">{job.skills}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <h3 className="text-md font-semibold text-text mb-2">Experience</h3>
          <p className="text-sm text-textLight">{job.experience}</p>
        </div>
        
        <div>
          <h3 className="text-md font-semibold text-text mb-2">Benefits</h3>
          <p className="text-sm text-textLight whitespace-pre-line">{job.benefits}</p>
        </div>
      </div>
      
      {job.createdAt && (
        <div className="mt-6 pt-4 border-t border-border text-xs text-textLight">
          Posted on {formatDate(job.createdAt)}
        </div>
      )}
      
      {showActions && (
        <div className="flex justify-end mt-6 gap-3">
          {onEdit && (
            <button 
              onClick={onEdit}
              className="px-4 py-2 border border-secondary text-secondary bg-white rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Edit Job
            </button>
          )}
          
          {onDelete && (
            <button 
              onClick={onDelete}
              className="px-4 py-2 border border-red-500 text-red-500 bg-white rounded-lg font-medium text-sm hover:bg-red-50 transition-colors"
            >
              Delete Job
            </button>
          )}
          
          {onApply && (
            <button 
              onClick={onApply}
              className="px-4 py-2 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-all"
            >
              Apply for this Job
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default JobDetail;
