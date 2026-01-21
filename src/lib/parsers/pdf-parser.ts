import { ParsedDocument, DocumentSection } from '@/src/types';
import { v4 as uuidv4 } from 'uuid';
import { extractText, getDocumentProxy } from 'unpdf';

export async function parsePDF(buffer: Buffer): Promise<ParsedDocument> {
  // Need to copy buffer because unpdf can detach the ArrayBuffer
  const uint8Array = new Uint8Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) uint8Array[i] = buffer[i];
  
  const { text, totalPages } = await extractText(uint8Array, { mergePages: true });
  
  // Try to get metadata (might fail on some PDFs, that's fine)
  let title: string | undefined;
  let author: string | undefined;
  let createdAt: string | undefined;
  
  try {
    const metadataArray = new Uint8Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) metadataArray[i] = buffer[i];
    
    const pdf = await getDocumentProxy(metadataArray);
    const metadata = await pdf.getMetadata();
    const info = metadata?.info as Record<string, unknown> | undefined;
    
    if (info) {
      title = typeof info.Title === 'string' ? info.Title : undefined;
      author = typeof info.Author === 'string' ? info.Author : undefined;
      
      // Parse PDF date format (D:YYYYMMDDHHmmSS)
      if (typeof info.CreationDate === 'string' && info.CreationDate.startsWith('D:')) {
        const d = info.CreationDate;
        createdAt = `${d.substring(2, 6)}-${d.substring(6, 8)}-${d.substring(8, 10)}`;
      }
    }
  } catch {
    // Some PDFs don't have metadata, no biggie
  }
  
  return {
    text,
    metadata: {
      pageCount: totalPages,
      title: extractTitle(text) || title,
      author,
      createdAt,
    },
    sections: extractSections(text),
  };
}

function extractTitle(text: string): string | undefined {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length && lines[0].length < 200) {
    return lines[0].trim();
  }
  return undefined;
}

function extractSections(text: string): DocumentSection[] {
  const sections: DocumentSection[] = [];
  const lines = text.split('\n');
  
  let current: DocumentSection | null = null;
  let content: string[] = [];
  
  // Patterns that look like section headers
  const headerPatterns = [
    /^(\d+\.)\s+(.+)$/,           // "1. Section"
    /^(\d+\.\d+)\s+(.+)$/,        // "1.1 Subsection"
    /^([A-Z][A-Z\s]+)$/,          // "ALL CAPS"
    /^(Executive Summary|Introduction|Background|Methodology|Findings|Recommendations|Conclusion|Appendix)/i,
  ];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    let isHeader = false;
    let level = 1;
    let headerTitle = trimmed;
    
    for (const pattern of headerPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        isHeader = true;
        if (match[2]) {
          headerTitle = match[2];
          // Subsections have dots in the number
          if (match[1].includes('.') && match[1].split('.').length > 1) level = 2;
        }
        break;
      }
    }
    
    // Short lines that match patterns are probably headers
    if (isHeader && trimmed.length < 100) {
      // Save previous section
      if (current) {
        current.content = content.join('\n').trim();
        if (current.content) sections.push(current);
      }
      
      current = { id: uuidv4(), title: headerTitle, content: '', level };
      content = [];
    } else {
      // Create intro section if we haven't started yet
      if (!current) {
        current = { id: uuidv4(), title: 'Introduction', content: '', level: 1 };
      }
      content.push(trimmed);
    }
  }
  
  // Don't forget the last one
  if (current) {
    current.content = content.join('\n').trim();
    if (current.content) sections.push(current);
  }
  
  return sections;
}
