import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { authService } from '@/services/authService';
import { ROUTES } from '@/config/constants';

const Index = () => {
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string>('');

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = authService.isAuthenticated();
      setRedirectTo(isAuthenticated ? ROUTES.DASHBOARD : ROUTES.AUTH);
      setShouldRedirect(true);
    };

    checkAuth();
  }, []);

  if (shouldRedirect) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner text="Loading..." />
    </div>
  );
};

export default Index;