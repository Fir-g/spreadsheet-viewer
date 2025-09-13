import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot } from 'lucide-react';

export const TypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="flex max-w-[80%] space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-secondary">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="bg-secondary rounded-lg px-4 py-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};