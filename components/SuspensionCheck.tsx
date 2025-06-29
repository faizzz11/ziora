'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function SuspensionCheck() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't check suspension on these pages to avoid redirects
    if (pathname === '/suspended' || 
        pathname === '/login' || 
        pathname === '/signup' || 
        pathname.startsWith('/admin') ||
        pathname.startsWith('/api')) {
      return;
    }

    checkUserSuspension();
  }, [pathname]);

  const checkUserSuspension = async () => {
    try {
      // First, get current user data
      const userResponse = await fetch('/api/auth/me');
      
      if (!userResponse.ok) {
        // User is not logged in
        console.log('SuspensionCheck: User not logged in');
        return;
      }

      const userData = await userResponse.json();
      
      if (!userData.success || !userData.user.email) {
        console.log('SuspensionCheck: No user email found');
        return;
      }

      const userEmail = userData.user.email;
      console.log('SuspensionCheck: Checking suspension for email:', userEmail);

      // Check user's suspension status
      const stateResponse = await fetch('/api/auth/check-state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      if (stateResponse.ok) {
        const stateData = await stateResponse.json();
        console.log('SuspensionCheck: State response:', stateData);
        
        if (stateData.success && stateData.suspended) {
          console.log('SuspensionCheck: User is suspended, redirecting...');
          // User is suspended or deleted, redirect to suspension page
          const suspensionParams = new URLSearchParams({
            status: stateData.status,
            reason: stateData.reason || 'No reason provided',
            ...(stateData.suspendedAt && { suspendedAt: stateData.suspendedAt }),
            ...(stateData.deletedAt && { deletedAt: stateData.deletedAt }),
          });
          
          router.push(`/suspended?${suspensionParams.toString()}`);
        } else {
          console.log('SuspensionCheck: User is not suspended');
        }
      } else {
        console.error('SuspensionCheck: Error checking state:', stateResponse.status);
      }
    } catch (error) {
      console.error('Error checking user suspension:', error);
      // On error, continue with normal flow
    }
  };

  // This component doesn't render anything visible
  return null;
} 