import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const Index = () => {
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (token) {
      // If authenticated, redirect to dashboard
      setShouldRedirect(true);
    } else {
      // If not authenticated, redirect to auth
      setShouldRedirect(true);
    }
  }, []);

  if (shouldRedirect) {
    const token = localStorage.getItem("token");
    return <Navigate to={token ? "/dashboard" : "/auth"} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
};

export default Index;
