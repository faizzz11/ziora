'use client';

import { useEffect } from 'react';

interface PageTrackerProps {
  pageName?: string;
}

export default function PageTracker({ pageName = 'unknown' }: PageTrackerProps) {
  useEffect(() => {
    const trackPageVisit = async () => {
      try {
        // Get user email from localStorage (where login data is stored)
        const userDataString = localStorage.getItem('user');
        
        if (!userDataString) {
          return; // User not logged in
        }

        const userData = JSON.parse(userDataString);
        const userEmail = userData?.email;

        if (!userEmail) {
          return; // No email found
        }

        await fetch('/api/track/page-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: pageName,
            userEmail: userEmail
          })
        });

      } catch (error) {
        // Silently fail - tracking shouldn't interrupt user experience
        console.log('Page tracking failed:', error);
      }
    };

    // Track page visit after component mounts
    trackPageVisit();
  }, [pageName]);

  // This component doesn't render anything
  return null;
} 