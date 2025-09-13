import { MessageSquare, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  sessionTitle: string;
  activeSessionId: string | null;
  onNewChat: () => void;
  onRefresh: () => void;
  onDeleteSession: (sessionId: string) => void;
  loading: boolean;
}

export const ChatHeader = ({
  sessionTitle,
  activeSessionId,
  onNewChat,
  onRefresh,
  onDeleteSession,
  loading,
}: ChatHeaderProps) => {
  return (
    <div className="flex-shrink-0 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">{sessionTitle}</h3>
          {activeSessionId && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteSession(activeSessionId)}
                className="text-muted-foreground hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onNewChat}
          className="flex items-center space-x-1"
          disabled={loading}
        >
          <MessageSquare className="h-4 w-4" />
          <span>New Chat</span>
        </Button>
      </div>
    </div>
  );
};