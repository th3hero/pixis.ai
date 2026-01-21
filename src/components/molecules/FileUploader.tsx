'use client';

import { useCallback, useState } from 'react';
import { Upload, File, X, FileText, Presentation } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { cn } from '@/src/lib/utils';
import { UploadedDocument } from '@/src/types';
import { Spinner } from '@/src/components/atoms';

interface FileUploaderProps {
  onUpload: (file: File, type: UploadedDocument['type']) => Promise<void>;
  isUploading?: boolean;
  accept?: string;
  maxSize?: number;
  className?: string;
}

const fileTypeIcons: Record<string, React.ReactNode> = {
  'application/pdf': <FileText className="h-4 w-4 text-red-400" />,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': (
    <FileText className="h-4 w-4 text-blue-400" />
  ),
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': (
    <Presentation className="h-4 w-4 text-orange-400" />
  ),
};

export function FileUploader({
  onUpload,
  isUploading = false,
  accept = '.pdf,.docx,.pptx',
  maxSize = 10 * 1024 * 1024,
  className,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState<UploadedDocument['type']>('rfp');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        await onUpload(file, selectedType);
      }
    },
    [onUpload, selectedType]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await onUpload(file, selectedType);
      }
      // Reset input
      e.target.value = '';
    },
    [onUpload, selectedType]
  );

  return (
    <div className={cn('space-y-3', className)}>
      {/* Document Type Selector */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'rfp', label: 'RFP/Proposal' },
          { value: 'style-guide', label: 'Style Guide' },
          { value: 'reference-deck', label: 'Reference Deck' },
        ].map(({ value, label }) => (
          <Badge
            key={value}
            variant={selectedType === value ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer transition-all text-xs',
              selectedType === value
                ? 'bg-primary text-background hover:bg-primary/90'
                : 'border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
            onClick={() => setSelectedType(value as UploadedDocument['type'])}
          >
            {label}
          </Badge>
        ))}
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-4 transition-all duration-200',
          'flex flex-col items-center justify-center gap-2 text-center',
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/50 hover:bg-secondary/30',
          isUploading && 'opacity-50 pointer-events-none'
        )}
      >
        {isUploading ? (
          <>
            <Spinner size="lg" />
            <p className="text-xs text-muted-foreground">Processing...</p>
          </>
        ) : (
          <>
            <div className="p-2.5 bg-primary/10 rounded-full border border-primary/20">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground">
                Drop file here, or{' '}
                <label className="text-primary hover:text-primary/80 cursor-pointer underline underline-offset-2">
                  browse
                  <input
                    type="file"
                    accept={accept}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-[10px] text-muted-foreground">
                PDF, DOCX, PPTX (max 10MB)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface UploadedFileCardProps {
  document: UploadedDocument;
  onRemove: (id: string) => void;
}

export function UploadedFileCard({ document, onRemove }: UploadedFileCardProps) {
  const icon = fileTypeIcons[document.mimeType] || <File className="h-4 w-4 text-muted-foreground" />;
  const sizeKB = Math.round(document.size / 1024);

  return (
    <div className="flex items-center gap-2 p-2.5 bg-secondary/50 rounded-lg border border-border">
      <div className="p-1.5 bg-background rounded-md border border-border shrink-0">{icon}</div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <p className="text-xs font-medium text-foreground truncate" title={document.name}>
          {document.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-secondary text-muted-foreground">
            {document.type}
          </Badge>
          <span className="text-[10px] text-muted-foreground">{sizeKB} KB</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(document.id)}
        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
