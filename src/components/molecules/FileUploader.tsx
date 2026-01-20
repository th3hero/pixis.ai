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
  'application/pdf': <FileText className="h-5 w-5 text-red-500" />,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': (
    <FileText className="h-5 w-5 text-blue-500" />
  ),
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': (
    <Presentation className="h-5 w-5 text-orange-500" />
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
              'cursor-pointer transition-all',
              selectedType === value
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'hover:bg-indigo-50'
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
          'relative border-2 border-dashed rounded-xl p-6 transition-all duration-200',
          'flex flex-col items-center justify-center gap-3 text-center',
          isDragging
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50',
          isUploading && 'opacity-50 pointer-events-none'
        )}
      >
        {isUploading ? (
          <>
            <Spinner size="lg" />
            <p className="text-sm text-muted-foreground">Processing document...</p>
          </>
        ) : (
          <>
            <div className="p-3 bg-indigo-100 rounded-full">
              <Upload className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Drop your file here, or{' '}
                <label className="text-indigo-600 hover:text-indigo-700 cursor-pointer underline">
                  browse
                  <input
                    type="file"
                    accept={accept}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, DOCX, or PPTX up to 10MB
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
  const icon = fileTypeIcons[document.mimeType] || <File className="h-5 w-5" />;
  const sizeKB = Math.round(document.size / 1024);

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
      <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{document.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="secondary" className="text-xs">
            {document.type}
          </Badge>
          <span className="text-xs text-muted-foreground">{sizeKB} KB</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onRemove(document.id)}
        className="text-gray-400 hover:text-red-500"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
