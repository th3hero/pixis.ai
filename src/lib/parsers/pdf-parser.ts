import { PDFParse } from 'pdf-parse';
import { ParsedDocument, DocumentSection } from '@/src/types';
import { v4 as uuidv4 } from 'uuid';

export async function parsePDF(buffer: Buffer): Promise<ParsedDocument> {
  let parser: PDFParse | null = null;
  
  try {
    // Initialize parser with buffer data
    parser = new PDFParse({ data: buffer });
    
    // Get text content
    const textResult = await parser.getText();
    const text = textResult.text;
    
    // Get metadata/info
    const infoResult = await parser.getInfo({ parsePageInfo: true });
    
    // Extract sections from text
    const sections = extractSections(text);
    
    // Get date info
    const dateNode = infoResult.getDateNode();
    
    return {
      text,
      metadata: {
        pageCount: infoResult.total,
        title: extractTitle(text) || infoResult.info?.Title,
        author: infoResult.info?.Author || undefined,
        createdAt: dateNode.CreationDate?.toISOString() || undefined,
      },
      sections,
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF document');
  } finally {
    // Clean up resources
    if (parser) {
      await parser.destroy();
    }
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
