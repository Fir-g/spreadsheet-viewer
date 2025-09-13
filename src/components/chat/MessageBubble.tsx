import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MarkdownComponent } from '@/components/Markdown';
import { Bot, User } from 'lucide-react';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  formatTime: (dateString: string) => string;
}

export const MessageBubble = ({ message, formatTime }: MessageBubbleProps) => {
  return (
    <div
      className={`flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`flex max-w-[80%] space-x-3 ${
          message.role === 'user'
            ? 'flex-row-reverse space-x-reverse'
            : ''
        }`}
      >
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback
            className={
              message.role === 'user'
                ? 'bg-gradient-primary text-white'
                : 'bg-secondary'
            }
          >
            {message.role === 'user' ? (
              <User className="h-4 w-4" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1 min-w-0">
          <div
            className={`rounded-lg px-4 py-2 ${
              message.role === 'user'
                ? 'bg-gradient-primary text-white'
                : 'bg-secondary text-foreground'
            }`}
          >
            <MarkdownComponent content={message.content} />
          </div>
          <p className="text-xs text-muted-foreground px-2">
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
};