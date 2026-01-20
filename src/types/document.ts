export interface UploadedDocument {
  id: string;
  name: string;
  type: 'rfp' | 'proposal' | 'style-guide' | 'reference-deck';
  mimeType: string;
  size: number;
  content?: string;
  extractedData?: ExtractedDocumentData;
  uploadedAt: Date;
}

export interface ExtractedDocumentData {
  title?: string;
  sections: DocumentSection[];
  keyPoints: string[];
  metadata: Record<string, string>;
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  level: number;
  subsections?: DocumentSection[];
}

export interface ParsedDocument {
  text: string;
  metadata: {
    pageCount?: number;
    title?: string;
    author?: string;
    createdAt?: string;
  };
  sections: DocumentSection[];
}
