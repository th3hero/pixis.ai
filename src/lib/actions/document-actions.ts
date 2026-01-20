'use server';

import { v4 as uuidv4 } from 'uuid';
import { parseDocument } from '@/src/lib/parsers';
import { UploadedDocument, ParsedDocument } from '@/src/types';

export interface UploadResult {
  success: boolean;
  document?: UploadedDocument;
  error?: string;
}

export async function uploadDocument(formData: FormData): Promise<UploadResult> {
  try {
    const file = formData.get('file') as File;
    const documentType = formData.get('type') as UploadedDocument['type'];

    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Please upload PDF, DOCX, or PPTX files.' };
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: 'File size exceeds 10MB limit.' };
    }

    // Convert file to buffer for parsing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse document content
    const parsed: ParsedDocument = await parseDocument(buffer, file.type, file.name);

    const document: UploadedDocument = {
      id: uuidv4(),
      name: file.name,
      type: documentType,
      mimeType: file.type,
      size: file.size,
      content: parsed.text,
      extractedData: {
        title: parsed.metadata.title,
        sections: parsed.sections,
        keyPoints: [],
        metadata: parsed.metadata as Record<string, string>,
      },
      uploadedAt: new Date(),
    };

    return { success: true, document };
  } catch (error) {
    console.error('Upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process document' 
    };
  }
}

export async function analyzeDocuments(documents: UploadedDocument[]): Promise<{
  success: boolean;
  analysis?: {
    summary: string;
    keyThemes: string[];
    suggestedSlides: number;
  };
  error?: string;
}> {
  try {
    if (documents.length === 0) {
      return { success: false, error: 'No documents to analyze' };
    }

    // This will be enhanced with Gemini AI analysis
    const combinedContent = documents.map(d => d.content).join('\n\n');
    
    // Placeholder - will be replaced with actual AI analysis
    return {
      success: true,
      analysis: {
        summary: 'Document analysis pending AI integration',
        keyThemes: ['Theme 1', 'Theme 2'],
        suggestedSlides: 5,
      },
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze documents',
    };
  }
}
