'use client';

import * as React from 'react';

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function Toast({ title, description }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-lg shadow-lg p-4 max-w-md">
      {title && <div className="font-semibold mb-1">{title}</div>}
      {description && <div className="text-sm text-muted-foreground">{description}</div>}
    </div>
  );
}

