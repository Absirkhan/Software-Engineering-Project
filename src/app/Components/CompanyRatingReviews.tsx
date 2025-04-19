"use client";
import React, { useState, useEffect } from 'react';
import { Star, User, Calendar } from 'lucide-react';

interface Review {
  id: string;
  freelancerId: string;
  freelancerName: string;
  stars: number;
  comment: string;
  createdAt: string;
  jobTitle?: string;
}

interface CompanyRatingReviewsProps {
  clientId: string;
}

const CompanyRatingReviews: React.FC<CompanyRatingReviewsProps> = ({ clientId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!clientId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/client-ratings/${clientId}`);
        
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews);
          setAverageRating(data.averageRating);
        } else {
          // Handle specific error status codes
          if (response.status === 404) {
            setError('Client not found. The profile you requested does not exist.');
          } else if (response.status === 403) {
            setError('You do not have permission to view this client profile.');
          } else {
            const errorData = await response.json().catch(() => null);
            setError(errorData?.error || 'Failed to load reviews');
          }
        }
      } catch (err) {
        setError('An unexpected error occurred while loading reviews');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [clientId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="text-xl font-semibold text-text mb-4">Client Ratings & Reviews</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
          <p className="font-medium mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <h2 className="text-xl font-semibold text-text mb-4">Client Ratings & Reviews</h2>
      
      {reviews && reviews.length > 0 ? (
        <>
          <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-text mr-4">
              {Number(averageRating).toFixed(1)}
            </div>
            <div>
              <div className="flex mb-1">
                {renderStars(averageRating)}
              </div>
              <div className="text-sm text-textLight">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <User size={18} className="text-gray-500" />
                    </div>
                    <div>
                      <div className="font-medium text-text">{review.freelancerName}</div>
                      {review.jobTitle && (
                        <div className="text-xs text-textLight mt-1">
                          Project: {review.jobTitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    {renderStars(review.stars)}
                    <div className="flex items-center text-xs text-textLight mt-1">
                      <Calendar size={12} className="mr-1" /> 
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-text mt-2">{review.comment}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-textLight">
          No reviews yet for this client.
        </div>
      )}
    </div>
  );
};

export default CompanyRatingReviews;
