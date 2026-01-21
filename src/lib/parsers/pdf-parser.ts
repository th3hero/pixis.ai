import { ParsedDocument, DocumentSection } from '@/src/types';
import { v4 as uuidv4 } from 'uuid';
import { extractText, getDocumentProxy } from 'unpdf';

export async function parsePDF(buffer: Buffer): Promise<ParsedDocument> {
  try {
    // Create a fresh copy of the buffer data to avoid detached ArrayBuffer issues
    const uint8Array = new Uint8Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      uint8Array[i] = buffer[i];
    }
    
    // Extract text from all pages
    const { text, totalPages } = await extractText(uint8Array, {
      mergePages: true,
    });
    
    // Get metadata using a fresh copy of the data
    let title: string | undefined;
    let author: string | undefined;
    let createdAt: string | undefined;
    
    try {
      // Create another fresh copy for metadata extraction
      const metadataArray = new Uint8Array(buffer.length);
      for (let i = 0; i < buffer.length; i++) {
        metadataArray[i] = buffer[i];
      }
      
      const pdf = await getDocumentProxy(metadataArray);
      const metadata = await pdf.getMetadata();
      const info = metadata?.info as Record<string, unknown> | undefined;
      if (info) {
        title = typeof info.Title === 'string' ? info.Title : undefined;
        author = typeof info.Author === 'string' ? info.Author : undefined;
        if (info.CreationDate && typeof info.CreationDate === 'string') {
          const dateStr = info.CreationDate;
          if (dateStr.startsWith('D:')) {
            const year = dateStr.substring(2, 6);
            const month = dateStr.substring(6, 8);
            const day = dateStr.substring(8, 10);
            createdAt = `${year}-${month}-${day}`;
          }
        }
      }
    } catch {
      // Metadata extraction is optional, continue without it
    }
    
    // Extract sections from text
    const sections = extractSections(text);
    
    return {
      text,
      metadata: {
        pageCount: totalPages,
        title: extractTitle(text) || title,
        author,
        createdAt,
      },
      sections,
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(`Failed to parse PDF document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractTitle(text: string): string | undefined {
  // Try to extract title from first few lines
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    // First non-empty line is often the title
    const potentialTitle = lines[0].trim();
    if (potentialTitle.length > 0 && potentialTitle.length < 200) {
      return potentialTitle;
    }
  }
  return undefined;
}

function extractSections(text: string): DocumentSection[] {
  const sections: DocumentSection[] = [];
  const lines = text.split('\n');
  
  let currentSection: DocumentSection | null = null;
  let sectionContent: string[] = [];
  
  // Common section header patterns
  const headerPatterns = [
    /^(\d+\.)\s+(.+)$/,           // 1. Section Name
    /^(\d+\.\d+)\s+(.+)$/,        // 1.1 Subsection
    /^([A-Z][A-Z\s]+)$/,          // ALL CAPS HEADERS
    /^(Executive Summary|Introduction|Background|Methodology|Findings|Recommendations|Conclusion|Appendix)/i,
  ];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    let isHeader = false;
    let headerLevel = 1;
    let headerTitle = trimmedLine;
    
    for (const pattern of headerPatterns) {
      const match = trimmedLine.match(pattern);
      if (match) {
        isHeader = true;
        if (match[2]) {
          headerTitle = match[2];
          // Determine level based on numbering
          if (match[1].includes('.') && match[1].split('.').length > 1) {
            headerLevel = 2;
          }
        }
        break;
      }
    }
    
    if (isHeader && trimmedLine.length < 100) {
      // Save previous section
      if (currentSection) {
        currentSection.content = sectionContent.join('\n').trim();
        if (currentSection.content) {
          sections.push(currentSection);
        }
      }
      
      // Start new section
      currentSection = {
        id: uuidv4(),
        title: headerTitle,
        content: '',
        level: headerLevel,
      };
      sectionContent = [];
    } else if (currentSection) {
      sectionContent.push(trimmedLine);
    } else {
      // Content before first section
      if (!currentSection) {
        currentSection = {
          id: uuidv4(),
          title: 'Introduction',
          content: '',
          level: 1,
        };
      }
      sectionContent.push(trimmedLine);
    }
  }
  
  // Don't forget the last section
  if (currentSection) {
    currentSection.content = sectionContent.join('\n').trim();
    if (currentSection.content) {
      sections.push(currentSection);
    }
  }
  
  return sections;
}
