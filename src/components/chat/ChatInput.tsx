import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isTyping: boolean;
  loading: boolean;
}

export const ChatInput = ({ onSendMessage, isTyping, loading }: ChatInputProps) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isTyping) return;
    
    const message = newMessage.trim();
    setNewMessage('');
    onSendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-shrink-0 px-4 pb-4">
      <Card className="border-0 bg-white/60 backdrop-blur shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Ask about your data, request analysis, or get insights..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="border-0 bg-transparent"
                disabled={isTyping || loading}
              />
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isTyping || loading}
              className="bg-gradient-primary hover:opacity-90 shadow-md"
            >
              {isTyping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};