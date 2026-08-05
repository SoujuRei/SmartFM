import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#faf8ff] flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-bold text-[#2563eb] mb-4 font-display">404</h1>
      <h2 className="text-2xl font-bold text-[#131b2e] mb-2">Page Not Found</h2>
      <p className="text-[#505f76] mb-8 text-center max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button>Go to Home</Button>
      </Link>
    </div>
  );
}
