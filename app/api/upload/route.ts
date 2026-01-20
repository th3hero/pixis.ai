import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { parseDocument } from '@/src/lib/parsers';
import { UploadedDocument, ParsedDocument } from '@/src/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('type') as UploadedDocument['type'];

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload PDF, DOCX, or PPTX files.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit.' },
        { status: 400 }
      );
    }

    // Convert file to buffer for parsing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse document content
    const parsed: ParsedDocument = await parseDocument(buffer, file.type, file.name);

    const document: UploadedDocument = {
      id: uuidv4(),
      name: file.name,
      type: documentType || 'rfp',
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

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process document' 
      },
      { status: 500 }
    );
  }
}
