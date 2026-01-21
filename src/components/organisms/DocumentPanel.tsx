'use client';

import { FileText, Sparkles } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { FileUploader, UploadedFileCard } from '@/src/components/molecules';
import { SlideCarouselMini } from './SlideCarouselMini';
import { UploadedDocument, GeneratedDeck } from '@/src/types';

interface DocumentPanelProps {
  documents: UploadedDocument[];
  onUpload: (file: File, type: UploadedDocument['type']) => Promise<void>;
  onRemove: (id: string) => void;
  onGenerate: () => void;
  isUploading: boolean;
  isGenerating: boolean;
  canGenerate: boolean;
  // New props for slide preview
  currentDeck?: GeneratedDeck | null;
  onExport?: () => void;
  isExporting?: boolean;
  onExpandSlides?: () => void;
}

export function DocumentPanel({
  documents,
  onUpload,
  onRemove,
  onGenerate,
  isUploading,
  isGenerating,
  canGenerate,
  currentDeck,
  onExport,
  isExporting = false,
  onExpandSlides,
}: DocumentPanelProps) {
  const rfpDocs = documents.filter(d => d.type === 'rfp' || d.type === 'proposal');
  const styleDocs = documents.filter(d => d.type === 'style-guide' || d.type === 'reference-deck');

  return (
    <div className="h-full flex flex-col bg-sidebar overflow-hidden">
      {/* Fixed Header */}
      <div className="p-3 border-b border-sidebar-border shrink-0 hidden lg:block">
        <h2 className="font-semibold text-sidebar-foreground flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-primary" />
          Documents
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Upload your source documents and style guides
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-3 space-y-3">
          {/* Slide Preview Card - shown when deck exists */}
          {currentDeck && onExport && (
            <SlideCarouselMini
              deck={currentDeck}
              onExport={onExport}
              onRegenerate={onGenerate}
              isExporting={isExporting}
              onExpand={onExpandSlides}
            />
          )}

          {/* Upload Section */}
          <Card className="border-border bg-secondary/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Add Document
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <FileUploader
                onUpload={onUpload}
                isUploading={isUploading}
              />
            </CardContent>
          </Card>

          {/* Source Documents */}
          {rfpDocs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Source Documents ({rfpDocs.length})
              </h3>
              <div className="space-y-1.5">
                {rfpDocs.map((doc) => (
                  <UploadedFileCard
                    key={doc.id}
                    document={doc}
                    onRemove={onRemove}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Style Documents */}
          {styleDocs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Style References ({styleDocs.length})
              </h3>
              <div className="space-y-1.5">
                {styleDocs.map((doc) => (
                  <UploadedFileCard
                    key={doc.id}
                    document={doc}
                    onRemove={onRemove}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {documents.length === 0 && !currentDeck && (
            <div className="text-center py-6">
              <div className="w-12 h-12 mx-auto bg-secondary rounded-full flex items-center justify-center mb-3 border border-border">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No documents uploaded yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload an RFP or proposal to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Generate Button */}
      <div className="p-3 border-t border-sidebar-border shrink-0">
        <Button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="w-full bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-background h-10 text-sm font-medium shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none transition-all"
        >
          {isGenerating ? (
            <>
              <div className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {currentDeck ? 'Regenerate Presentation' : 'Generate Presentation'}
            </>
          )}
        </Button>
        {!canGenerate && documents.length === 0 && (
          <p className="text-[10px] text-muted-foreground text-center mt-1.5">
            Upload at least one document to generate
          </p>
        )}
      </div>
    </div>
  );
}
