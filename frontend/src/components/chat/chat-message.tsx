'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { User, Bot, Copy, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
  error?: boolean;
}

interface ChatMessageProps {
  message: Message;
  onRetry?: () => void;
}

export function ChatMessage({ message, onRetry }: ChatMessageProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div
      className={`flex gap-4 animate-slide-in-bottom ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      {message.role === 'assistant' && (
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${
          message.error ? 'bg-destructive' : 'bg-primary'
        }`}>
          {message.error ? (
            <AlertCircle className="h-5 w-5 text-destructive-foreground" />
          ) : (
            <Bot className="h-5 w-5 text-primary-foreground" />
          )}
        </div>
      )}

      <div
        className={`flex-1 max-w-[80%] rounded-lg p-4 ${
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : message.error
            ? 'bg-destructive/10 border border-destructive'
            : 'bg-card border border-border'
        }`}
      >
        {message.role === 'user' ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="markdown prose prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');

                  return !inline && match ? (
                    <div className="relative group">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleCopyCode(codeString)}
                      >
                        {copiedCode === codeString ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {message.error && onRetry && (
          <div className="mt-4 border-t border-destructive/20 pt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="border-destructive/50 hover:bg-destructive/10"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Retry
            </Button>
          </div>
        )}

        {message.sources && message.sources.length > 0 && !message.error && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-xs text-muted-foreground mb-2">Sources:</p>
            <div className="flex flex-wrap gap-2">
              {message.sources.slice(0, 3).map((source, idx) => (
                <div
                  key={idx}
                  className="text-xs bg-muted px-2 py-1 rounded hover:bg-muted/70 transition-colors cursor-default"
                  title={source.fileName || source.documentTitle}
                >
                  {source.fileName || source.documentTitle || `Source ${idx + 1}`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {message.role === 'user' && (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary flex-shrink-0">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}

