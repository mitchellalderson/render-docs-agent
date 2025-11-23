'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onClear?: () => void;
  isLoading: boolean;
  hasMessages?: boolean;
}

export function ChatInput({ onSendMessage, onClear, isLoading, hasMessages }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the conversation?')) {
      onClear?.();
    }
  };

  return (
    <div className="border-t border-border bg-card p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documentation..."
            className="flex-1 resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[52px] max-h-[200px] transition-all"
            rows={1}
            disabled={isLoading}
            aria-label="Chat message input"
          />
          {hasMessages && onClear && (
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-[52px] w-[52px]"
              onClick={handleClear}
              disabled={isLoading}
              title="Clear conversation"
              aria-label="Clear conversation"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          )}
          <Button
            type="submit"
            size="icon"
            className="h-[52px] w-[52px]"
            disabled={!message.trim() || isLoading}
            title="Send message"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {hasMessages && <span className="text-muted-foreground/70">{hasMessages} message(s)</span>}
        </div>
      </form>
    </div>
  );
}

