import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import type { Message } from '@/types';

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
  formatTime: (dateString: string) => string;
}

export const ChatMessages = ({ messages, isTyping, formatTime }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="flex-1 px-4 pb-3 overflow-hidden">
      <Card className="h-full border-0 bg-white/60 backdrop-blur shadow-sm">
        <CardContent className="p-0 h-full">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="p-3">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <MessageBubble
                    key={index}
                    message={message}
                    formatTime={formatTime}
                  />
                ))}

                {isTyping && <TypingIndicator />}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};