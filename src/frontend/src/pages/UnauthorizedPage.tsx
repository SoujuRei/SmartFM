import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#F1F9FC] flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-bold text-[#ba1a1a] mb-4 font-display">403</h1>
      <h2 className="text-2xl font-bold text-[#183446] mb-2">Access Denied</h2>
      <p className="text-[#4B7084] mb-8 text-center max-w-md">
        You do not have permission to access this page. Please log in with an appropriate account.
      </p>
      <Link to="/">
        <Button>Go to Home</Button>
      </Link>
    </div>
  );
}
