import JSZip from 'jszip';

export async function extractTextFromPPTX(buffer: Buffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const textParts: string[] = [];
    
    // Get all slide files
    const slideFiles = Object.keys(zip.files).filter(
      name => name.match(/ppt\/slides\/slide\d+\.xml/)
    );
    
    // Sort slides by number
    slideFiles.sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)?.[1] || '0');
      const numB = parseInt(b.match(/slide(\d+)/)?.[1] || '0');
      return numA - numB;
    });
    
    for (const slideFile of slideFiles) {
      const slideXml = await zip.file(slideFile)?.async('text');
      if (slideXml) {
        const slideText = extractTextFromSlideXml(slideXml);
        if (slideText) {
          textParts.push(slideText);
        }
      }
    }
    
    return textParts.join('\n\n---\n\n');
  } catch (error) {
    throw new Error(`Failed to extract text from PPTX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractTextFromSlideXml(xml: string): string {
  const textMatches = xml.matchAll(/<a:t>([^<]*)<\/a:t>/g);
  const texts: string[] = [];
  
  for (const match of textMatches) {
    const text = match[1].trim();
    if (text) {
      texts.push(text);
    }
  }
  
  return texts.join('\n');
}
