import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';

interface InterviewScheduleModalProps {
  applicationId: string;
  freelancerName: string;
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (applicationId: string, dateTime: string, message: string) => void;
  onScheduleLater: (applicationId: string) => void;
}

const InterviewScheduleModal: React.FC<InterviewScheduleModalProps> = ({
  applicationId,
  freelancerName,
  isOpen,
  onClose,
  onSchedule,
  onScheduleLater
}) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const dateTime = `${date}T${time}`;
    onSchedule(applicationId, dateTime, message);
  };

  const handleScheduleLater = () => {
    onScheduleLater(applicationId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-text">Schedule Interview</h2>
          <button onClick={onClose} className="text-textLight hover:text-text">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <p className="mb-4 text-textLight">
            Schedule an interview with <span className="font-medium text-text">{freelancerName}</span>
          </p>
          
          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-600 mb-1">
              Interview Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                required
                min={new Date().toISOString().split('T')[0]}
              />
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="time" className="block text-sm font-medium text-gray-600 mb-1">
              Interview Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="time"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full pl-10 px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                required
              />
              <Clock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-600 mb-1">
              Additional Information (Optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none resize-none"
              placeholder="Provide any additional information or instructions for the interview"
              rows={3}
            ></textarea>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              type="button"
              onClick={handleScheduleLater}
              className="px-4 py-2 border border-border text-textLight rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
              disabled={isSubmitting}
            >
              Schedule Later
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border text-textLight rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-buttonHover transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewScheduleModal;
