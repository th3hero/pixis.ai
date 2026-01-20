import { ParsedDocument } from '@/src/types';
import { parsePDF } from './pdf-parser';
import { parseDOCX } from './docx-parser';
import { extractTextFromPPTX, extractStyleFromPPTX } from './pptx-parser';

export async function parseDocument(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<ParsedDocument> {
  switch (mimeType) {
    case 'application/pdf':
      return parsePDF(buffer);
    
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return parseDOCX(buffer);
    
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      // For PPTX, extract text content
      const text = await extractTextFromPPTX(buffer);
      return {
        text,
        metadata: {
          title: fileName.replace(/\.pptx$/i, ''),
        },
        sections: [{
          id: 'pptx-content',
          title: 'Presentation Content',
          content: text,
          level: 1,
        }],
      };
    
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

export { parsePDF } from './pdf-parser';
export { parseDOCX } from './docx-parser';
export { extractStyleFromPPTX, extractTextFromPPTX } from './pptx-parser';
