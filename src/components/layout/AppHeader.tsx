import { User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_CONFIG } from '@/config/constants';

interface AppHeaderProps {
  userName?: string;
  onLogout: () => void;
  title?: string;
  subtitle?: string;
}

export const AppHeader = ({ 
  userName, 
  onLogout, 
  title = APP_CONFIG.NAME,
  subtitle 
}: AppHeaderProps) => {
  return (
    <header className="border-b bg-white/80 backdrop-blur shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-xl text-foreground font-bold bg-clip-text">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {userName && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{userName}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};