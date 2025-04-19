"use client";
import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 20,
  interactive = false,
  onChange,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = React.useState<number>(0);

  const handleClick = (newRating: number) => {
    if (interactive && onChange) {
      onChange(newRating);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  return (
    <div className={`flex ${className}`}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = hoverRating ? starValue <= hoverRating : starValue <= rating;

        return (
          <Star
            key={index}
            size={size}
            className={`
              ${isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
              ${interactive ? 'cursor-pointer' : ''}
              transition-colors mr-0.5
            `}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
    </div>
  );
};

export default RatingStars;
