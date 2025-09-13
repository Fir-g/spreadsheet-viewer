import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Clock, Loader2 } from "lucide-react";

interface ChatSessionCardProps {
  session: any;
  isActive: boolean;
  isLoading: boolean;
  onClick: () => void;
  getSessionTitle: (session: any) => string;
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
}

export function ChatSessionCard({
  session,
  isActive,
  isLoading,
  onClick,
  getSessionTitle,
  formatDate,
  formatTime,
}: ChatSessionCardProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "w-full justify-start p-3 h-auto text-left transition-all duration-200",
        isActive
          ? "bg-gradient-primary text-white shadow-sm hover:opacity-90"
          : "hover:bg-secondary/60",
        isLoading && "opacity-60"
      )}
    >
      <div className="w-full min-w-0">
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "text-xs font-medium break-words leading-relaxed flex-1",
              isActive ? "text-white" : "text-foreground"
            )}
          >
            {getSessionTitle(session)}
          </div>
          {isLoading && (
            <Loader2 className="h-3 w-3 animate-spin ml-2 flex-shrink-0" />
          )}
        </div>
        <div
          className={cn(
            "text-xs mt-0.5 flex items-center space-x-1",
            isActive ? "text-white/70" : "text-muted-foreground"
          )}
        >
          <Clock className="h-2 w-2 flex-shrink-0" />
          <span className="break-words">
            {formatDate(session.last_activity)} {formatTime(session.last_activity)}
          </span>
        </div>
      </div>
    </Button>
  );
}