'use client';

import { FileText, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Separator } from '@/src/components/ui/separator';
import { FileUploader, UploadedFileCard } from '@/src/components/molecules';
import { UploadedDocument } from '@/src/types';

interface DocumentPanelProps {
  documents: UploadedDocument[];
  onUpload: (file: File, type: UploadedDocument['type']) => Promise<void>;
  onRemove: (id: string) => void;
  onGenerate: () => void;
  isUploading: boolean;
  isGenerating: boolean;
  canGenerate: boolean;
}

export function DocumentPanel({
  documents,
  onUpload,
  onRemove,
  onGenerate,
  isUploading,
  isGenerating,
  canGenerate,
}: DocumentPanelProps) {
  const rfpDocs = documents.filter(d => d.type === 'rfp' || d.type === 'proposal');
  const styleDocs = documents.filter(d => d.type === 'style-guide' || d.type === 'reference-deck');

  return (
    <div className="h-full flex flex-col bg-gray-50/50">
      <div className="p-4 border-b border-gray-100 bg-white">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          Documents
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your source documents and style guides
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Upload Section */}
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">
                Add Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploader
                onUpload={onUpload}
                isUploading={isUploading}
              />
            </CardContent>
          </Card>

          {/* Source Documents */}
          {rfpDocs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Source Documents ({rfpDocs.length})
              </h3>
              <div className="space-y-2">
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
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Style References ({styleDocs.length})
              </h3>
              <div className="space-y-2">
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
          {documents.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
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
      </ScrollArea>

      {/* Generate Button */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <Button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-12 text-base font-medium"
        >
          {isGenerating ? (
            <>
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Presentation
            </>
          )}
        </Button>
        {!canGenerate && documents.length === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Upload at least one document to generate
          </p>
        )}
      </div>
    </div>
  );
}
