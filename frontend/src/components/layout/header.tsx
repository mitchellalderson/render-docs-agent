'use client';

import { FileText, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-16 items-center px-4 sm:px-6">
        {onToggleSidebar && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 md:hidden"
                onClick={onToggleSidebar}
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle sidebar</TooltipContent>
          </Tooltip>
        )}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold">
            Docs <span className="text-primary">Agent</span>
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-muted-foreground">
            Powered by Claude
          </span>
        </div>
      </div>
    </header>
  );
}

