import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface CheckIfSignedInProps {
  children: React.ReactNode;
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

const CheckIfSignedIn: React.FC<CheckIfSignedInProps> = ({ 
  children, 
  redirectTo = '/login',
  loadingComponent = null
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if code is running in browser (not during SSR)
    if (typeof window !== 'undefined') {
      const username = localStorage.getItem('username');
      const token = localStorage.getItem('token');
      
      const authenticated = !!(username && token);
      setIsAuthenticated(authenticated);
      
      if (!authenticated) {
        router.push(redirectTo);
      }
    }
  }, [redirectTo, router]);

  // Show loading component during authentication check
  if (isAuthenticated === null) {
    return <>{loadingComponent}</>;
  }

  // If authenticated, render children
  return isAuthenticated ? <>{children}</> : null;
};

export default CheckIfSignedIn;