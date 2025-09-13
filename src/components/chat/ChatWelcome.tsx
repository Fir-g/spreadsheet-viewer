import { Bot, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatWelcomeProps {
  activeSessionId: string | null;
  sessionsLength: number;
  onNewChat: () => void;
}

export const ChatWelcome = ({ activeSessionId, sessionsLength, onNewChat }: ChatWelcomeProps) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          {!activeSessionId 
            ? 'Select a chat session or start a new conversation' 
            : 'Start your conversation'}
        </h3>
        <p className="text-muted-foreground text-sm mb-4">
          Ask questions about your data, request analysis, or get insights to get started.
        </p>
        {!activeSessionId && sessionsLength === 0 && (
          <Button onClick={onNewChat} className="bg-gradient-primary">
            <MessageSquare className="h-4 w-4 mr-2" />
            Create First Chat
          </Button>
        )}
      </div>
    </div>
  );
};