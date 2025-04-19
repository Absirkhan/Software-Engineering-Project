import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Interview {
  id: string;
  applicationId: string;
  jobTitle: string;
  freelancerName: string;
  clientName: string;
  dateTime: string;
  message?: string;
}

const UpcomingInterviews: React.FC<{ userRole: string }> = ({ userRole }) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await fetch('/get-interviews');
        if (response.ok) {
          const data = await response.json();
          setInterviews(data);
        }
      } catch (error) {
        console.error('Error fetching interviews:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInterviews();
  }, []);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format time for display
  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = { 
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };
  
  const handleClick = (applicationId: string) => {
    if (userRole === 'client') {
      router.push(`/client_dashboard/applications?application=${applicationId}`);
    } else {
      router.push(`/freelancer_dashboard/applications`);
    }
  };
  
  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-textLight">Loading interviews...</p>
      </div>
    );
  }
  
  if (interviews.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-textLight">No upcoming interviews scheduled.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {interviews.map((interview) => (
        <div 
          key={interview.id} 
          className="bg-white p-4 rounded-lg border border-border hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleClick(interview.applicationId)}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-text">{interview.jobTitle}</h3>
            <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Interview</div>
          </div>
          
          <p className="text-sm text-textLight mb-3">
            {userRole === 'client' 
              ? `With: ${interview.freelancerName}` 
              : `With: ${interview.clientName}`}
          </p>
          
          <div className="flex items-center text-xs text-textLight">
            <Calendar size={14} className="mr-1" />
            <span className="mr-3">{formatDate(interview.dateTime)}</span>
            <Clock size={14} className="mr-1" />
            <span>{formatTime(interview.dateTime)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UpcomingInterviews;
