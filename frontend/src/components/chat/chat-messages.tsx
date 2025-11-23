'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage } from './chat-message';
import { Loader2, Sparkles, BookOpen, Code, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
  error?: boolean;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onSuggestedQuestion?: (question: string) => void;
  onRetry?: (index: number) => void;
}

const SUGGESTED_QUESTIONS = [
  { icon: BookOpen, text: "How do I get started with this product?", category: "Getting Started" },
  { icon: Code, text: "Show me code examples for authentication", category: "Code Examples" },
  { icon: HelpCircle, text: "What are the main features?", category: "Features" },
  { icon: Sparkles, text: "What are the best practices?", category: "Best Practices" },
];

export function ChatMessages({ messages, isLoading, onSuggestedQuestion, onRetry }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <div className="text-center max-w-2xl mx-auto px-4">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 animate-pulse">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mb-3 text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome to Docs Agent
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Upload your documentation and ask questions to get instant, AI-powered answers
            </p>
            
            {onSuggestedQuestion && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-foreground/80 mb-3">
                  Try asking:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUGGESTED_QUESTIONS.map((suggestion, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="h-auto py-4 px-4 text-left justify-start hover:bg-primary/5 hover:border-primary/50 transition-all group"
                      onClick={() => onSuggestedQuestion(suggestion.text)}
                    >
                      <suggestion.icon className="h-4 w-4 mr-3 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-sm font-medium">{suggestion.text}</span>
                        <span className="text-xs text-muted-foreground">{suggestion.category}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Tip:</strong> Upload Markdown files or OpenAPI specifications to get started
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-0">
          {messages.map((message, index) => (
            <ChatMessage 
              key={index} 
              message={message}
              onRetry={message.error && onRetry ? () => onRetry(index) : undefined}
            />
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}

