// app/(public)/shop/[slug]/HelpfulButton.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface HelpfulButtonProps {
  reviewId: number;
  initialHelpful: number;
}

export default function HelpfulButton({ reviewId, initialHelpful }: HelpfulButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [helpful, setHelpful] = useState(initialHelpful);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!session) {
      router.push('/auth/login');
      return;
    }
    
    if (hasVoted) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setHelpful(data.helpful);
        setHasVoted(true);
      } else {
        const error = await response.json();
        console.error('Failed to mark helpful:', error);
        alert(error.error || 'Failed to mark as helpful');
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      className={`flex items-center text-sm transition-colors ${
        hasVoted 
          ? 'text-primary cursor-default' 
          : 'text-gray-500 hover:text-primary'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleClick}
      disabled={isLoading || hasVoted}
      title={hasVoted ? "You've already marked this as helpful" : "Mark as helpful"}
    >
      <svg 
        className={`w-4 h-4 mr-1 ${hasVoted ? 'text-primary' : ''}`} 
        fill={hasVoted ? "currentColor" : "none"} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={hasVoted ? 0 : 2} 
          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" 
        />
      </svg>
      Helpful ({helpful})
    </button>
  );
}