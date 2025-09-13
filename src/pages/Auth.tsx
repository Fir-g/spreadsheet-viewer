import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { ROUTES } from '@/config/constants';

const Auth = () => {
  const navigate = useNavigate();
  const { login, signup, isLoading, error } = useAuth();

  const handleLogin = async (username: string, password: string) => {
    try {
      await login(username, password);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  const handleSignup = async (name: string, username: string, password: string) => {
    try {
      await signup(name, username, password);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
      <div className="w-full max-w-md relative z-10">
        <AuthForm
          onLogin={handleLogin}
          onSignup={handleSignup}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
};

export default Auth;