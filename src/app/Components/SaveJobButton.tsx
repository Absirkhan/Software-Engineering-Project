"use client";
import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';

interface SaveJobButtonProps {
  jobId: string;
  className?: string;
  buttonText?: boolean;
  savedText?: string;
  unsavedText?: string;
  onSaveStateChange?: (isSaved: boolean) => void;
}

const SaveJobButton: React.FC<SaveJobButtonProps> = ({ 
  jobId, 
  className = '', 
  buttonText = false,
  savedText = 'Saved',
  unsavedText = 'Save Job',
  onSaveStateChange
}) => {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Check if the job is already saved when component mounts
    const checkSaveStatus = async () => {
      try {
        const response = await fetch(`/is-job-saved/${jobId}`);
        if (response.ok) {
          const data = await response.json();
          setIsSaved(data.isSaved);
          if (onSaveStateChange) {
            onSaveStateChange(data.isSaved);
          }
        }
      } catch (error) {
        console.error('Error checking job saved status:', error);
      }
    };

    checkSaveStatus();
  }, [jobId, onSaveStateChange]);

  const toggleSaveJob = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const url = isSaved ? `/unsave-job/${jobId}` : `/save-job/${jobId}`;
      const method = isSaved ? 'DELETE' : 'POST';
      
      const response = await fetch(url, { method });
      
      if (response.ok) {
        const newSavedState = !isSaved;
        setIsSaved(newSavedState);
        if (onSaveStateChange) {
          onSaveStateChange(newSavedState);
        }
      } else {
        const errorData = await response.json();
        console.error('Error toggling job saved status:', errorData.error);
      }
    } catch (error) {
      console.error('Error toggling job saved status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleSaveJob}
      disabled={isLoading}
      className={`flex items-center transition-colors ${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={isSaved ? "Unsave job" : "Save job"}
    >
      <Bookmark 
        size={18} 
        className={`mr-1 ${isSaved ? 'fill-secondary text-secondary' : 'text-gray-500'}`} 
      />
      {buttonText && (
        <span className={isSaved ? 'text-secondary' : 'text-gray-700'}>
          {isSaved ? savedText : unsavedText}
        </span>
      )}
    </button>
  );
};

export default SaveJobButton;
