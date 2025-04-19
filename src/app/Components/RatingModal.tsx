"use client";
import React, { useState } from 'react';
import RatingStars from './RatingStars';
import { X } from 'lucide-react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (stars: number, comment: string) => Promise<void>;
  clientName: string;
  jobTitle: string;
}

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  clientName,
  jobTitle
}) => {
  const [stars, setStars] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (stars === 0) {
      setError('Please select a rating before submitting');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(stars, comment);
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={isSubmitting}
        >
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-semibold text-text mb-4">Rate your experience</h2>
        
        <p className="text-sm text-textLight mb-6">
          Rate your experience working with <span className="font-medium">{clientName}</span> on the job "{jobTitle}"
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating
            </label>
            <div className="flex justify-center mb-2">
              <RatingStars
                rating={stars}
                onChange={setStars}
                interactive={true}
                size={32}
              />
            </div>
            <div className="text-center text-sm text-gray-500">
              {stars === 0 && 'Click to rate'}
              {stars === 1 && 'Poor'}
              {stars === 2 && 'Fair'}
              {stars === 3 && 'Good'}
              {stars === 4 && 'Very Good'}
              {stars === 5 && 'Excellent'}
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Review (Optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none resize-none"
              placeholder="Share your experience working with this client..."
              rows={4}
              disabled={isSubmitting}
            ></textarea>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-colors ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
