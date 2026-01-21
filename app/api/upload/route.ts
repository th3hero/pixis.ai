import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { parseDocument } from '@/src/lib/parsers';
import { UploadedDocument, ParsedDocument } from '@/src/types';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const docType = formData.get('type') as UploadedDocument['type'];

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid file type. Use PDF, DOCX, or PPTX.' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'File too large. Max 10MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed: ParsedDocument = await parseDocument(buffer, file.type, file.name);

    const doc: UploadedDocument = {
      id: uuidv4(),
      name: file.name,
      type: docType || 'rfp',
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

    return NextResponse.json({ success: true, document: doc });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to process document' },
      { status: 500 }
    );
  }
}
