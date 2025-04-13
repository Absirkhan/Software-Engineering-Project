import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-secondary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-text mb-4">Page Not Found</h2>
        <p className="text-textLight mb-6">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="px-4 py-2 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
