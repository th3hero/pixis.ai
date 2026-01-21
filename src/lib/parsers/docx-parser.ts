import mammoth from 'mammoth';
import { ParsedDocument, DocumentSection } from '@/src/types';
import { v4 as uuidv4 } from 'uuid';

export async function parseDOCX(buffer: Buffer): Promise<ParsedDocument> {
  try {
    // Extract raw text
    const textResult = await mammoth.extractRawText({ buffer });
    const text = textResult.value;
    
    // Extract with HTML to get structure
    const htmlResult = await mammoth.convertToHtml({ buffer });
    const html = htmlResult.value;
    
    // Parse sections from HTML structure
    const sections = extractSectionsFromHtml(html, text);
    
    return {
      text,
      metadata: {
        title: extractTitleFromHtml(html) || extractTitleFromText(text),
      },
      sections,
    };
  } catch (error) {
    throw new Error(`Failed to parse DOCX document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractTitleFromHtml(html: string): string | undefined {
  // Look for first h1 or strong text
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    return h1Match[1].trim();
  }
  
  const strongMatch = html.match(/<strong>([^<]+)<\/strong>/);
  if (strongMatch && strongMatch[1].length < 100) {
    return strongMatch[1].trim();
  }
  
  return undefined;
}

function extractTitleFromText(text: string): string | undefined {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length > 0 && lines[0].length < 200) {
    return lines[0].trim();
  }
  return undefined;
}

function extractSectionsFromHtml(html: string, fullText: string): DocumentSection[] {
  const sections: DocumentSection[] = [];
  
  // Match headings with their content
  const headingRegex = /<h([1-6])[^>]*>([^<]+)<\/h\1>/gi;
  const headings: Array<{ level: number; title: string; index: number }> = [];
  
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      title: match[2].trim(),
      index: match.index,
    });
  }
  
  if (headings.length === 0) {
    // No headings found, treat entire document as one section
    return [{
      id: uuidv4(),
      title: 'Document Content',
      content: fullText,
      level: 1,
    }];
  }
  
  // Extract content between headings
  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const nextHeading = headings[i + 1];
    
    const startIndex = heading.index;
    const endIndex = nextHeading ? nextHeading.index : html.length;
    
    const sectionHtml = html.substring(startIndex, endIndex);
    const sectionText = stripHtml(sectionHtml);
    
    sections.push({
      id: uuidv4(),
      title: heading.title,
      content: sectionText.replace(heading.title, '').trim(),
      level: heading.level,
    });
  }
  
  return sections;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}
