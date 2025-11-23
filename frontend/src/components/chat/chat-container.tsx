'use client';

import { useState } from 'react';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { useMutation } from '@tanstack/react-query';
import { chatApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
  error?: boolean;
}

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>();
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: (message: string) => chatApi.sendMessage(message, sessionId),
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message, sources: data.sources },
      ]);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || 'Failed to send message. Please try again.';
      
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: errorMessage,
          error: true 
        },
      ]);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const handleSendMessage = (message: string) => {
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    chatMutation.mutate(message);
  };

  const handleClearConversation = () => {
    if (window.confirm('Are you sure you want to clear the conversation?')) {
      setMessages([]);
      setSessionId(undefined);
      toast({
        title: 'Conversation cleared',
        description: 'Start a new conversation',
      });
    }
  };

  const handleRetry = (index: number) => {
    // Find the original user message before the error
    const userMessage = messages[index - 1];
    if (userMessage && userMessage.role === 'user') {
      // Remove the error message and retry
      setMessages((prev) => prev.slice(0, index));
      chatMutation.mutate(userMessage.content);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <ChatMessages 
        messages={messages} 
        isLoading={chatMutation.isPending}
        onSuggestedQuestion={handleSendMessage}
        onRetry={handleRetry}
      />
      <ChatInput 
        onSendMessage={handleSendMessage} 
        onClear={handleClearConversation}
        isLoading={chatMutation.isPending}
        hasMessages={messages.length > 0}
      />
    </div>
  );
}

