import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ChatSessionCard } from "./ChatSessionCard";

interface ChatSessionsListProps {
  sessions: any[];
  activeSessionId: string | null;
  loadingSessionId: string | null;
  loading: boolean;
  onNewChat: () => void;
  onSessionClick: (sessionId: string) => void;
  getSessionTitle: (session: any) => string;
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
}

export function ChatSessionsList({
  sessions,
  activeSessionId,
  loadingSessionId,
  loading,
  onNewChat,
  onSessionClick,
  getSessionTitle,
  formatDate,
  formatTime,
}: ChatSessionsListProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 pb-3">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Chat Sessions
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewChat}
          disabled={loading}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full">
        {loading && sessions.length === 0 ? (
          <div className="text-xs text-muted-foreground p-2 text-center">
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-xs text-muted-foreground p-2 text-center">
            No chat sessions yet
            <br />
            Click + to create one
          </div>
        ) : (
          sessions.map((session) => (
            <ChatSessionCard
              key={session.session_id}
              session={session}
              isActive={activeSessionId === session.session_id}
              isLoading={loadingSessionId === session.session_id}
              onClick={() => onSessionClick(session.session_id)}
              getSessionTitle={getSessionTitle}
              formatDate={formatDate}
              formatTime={formatTime}
            />
          ))
        )}
      </div>
    </div>
  );
}