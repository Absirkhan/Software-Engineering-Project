'use client';
 
import { useEffect } from 'react';
import Link from 'next/link';
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-500 mb-2">Something went wrong!</h1>
          <p className="text-lg text-textLight mb-6">
            We apologize for the inconvenience. An unexpected error has occurred.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={reset}
              className="px-4 py-2 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-colors"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-4 py-2 border border-secondary text-secondary bg-white rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Return to home page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
