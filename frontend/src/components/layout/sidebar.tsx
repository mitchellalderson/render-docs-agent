'use client';

import { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { DocumentListSkeleton } from '@/components/chat/chat-skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentApi.getAll(),
  });

  const uploadMutation = useMutation({
    mutationFn: documentApi.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: documentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
    },
  });

  const handleFileUpload = (files: FileList | null) => {
    if (files && files[0]) {
      uploadMutation.mutate(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      <aside 
        className={`
          fixed md:relative z-50 md:z-auto
          w-80 h-full border-r border-border bg-card
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Documents</h2>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:hidden"
                onClick={onClose}
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

        {/* Upload Area */}
        <div
          className={`mb-4 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="mb-2 text-sm text-muted-foreground">
            Drop files here or click to upload
          </p>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".md,.markdown,.json,.yaml,.yml"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <Button
            size="sm"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Select File'}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Markdown & OpenAPI files
          </p>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <DocumentListSkeleton />
          ) : documents?.documents?.length > 0 ? (
            <div className="space-y-2">
              {documents.documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="group flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm truncate">{doc.fileName}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{doc.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.type || 'Document'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteMutation.mutate(doc.id)}
                        aria-label={`Delete ${doc.fileName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete document</TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 px-4 animate-fade-in">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                No documents yet
              </p>
              <p className="text-xs text-muted-foreground/70">
                Upload Markdown or OpenAPI files to get started
              </p>
            </div>
          )}
        </div>
        </div>
      </aside>
    </>
  );
}

