import JSZip from 'jszip';
import { ExtractedStyle, BrandColors } from '@/src/types';

// Note: pptxgenjs doesn't have a parser, so we use JSZip to read PPTX structure
// PPTX files are ZIP archives containing XML files

export async function extractStyleFromPPTX(buffer: Buffer): Promise<ExtractedStyle> {
  try {
    const zip = await JSZip.loadAsync(buffer);
    
    // Extract theme colors from ppt/theme/theme1.xml
    const themeXml = await zip.file('ppt/theme/theme1.xml')?.async('text');
    const colors = themeXml ? extractColorsFromTheme(themeXml) : {};
    
    // Extract fonts from theme
    const fonts = themeXml ? extractFontsFromTheme(themeXml) : [];
    
    return {
      colors,
      fonts,
      suggestedTypography: fonts.length > 0 ? {
        headingFont: fonts[0],
        bodyFont: fonts[1] || fonts[0],
      } : undefined,
    };
  } catch (error) {
    console.error('PPTX style extraction error:', error);
    // Return empty style on error - will fall back to defaults
    return {
      colors: {},
      fonts: [],
    };
  }
}

function extractColorsFromTheme(themeXml: string): Partial<BrandColors> {
  const colors: Partial<BrandColors> = {};
  
  // Extract color scheme colors using simpler patterns
  // Theme XML has color definitions like <a:dk1>, <a:lt1>, <a:accent1>, etc.
  
  const colorMappings: Array<{ tag: string; key: keyof BrandColors }> = [
    { tag: 'accent1', key: 'primary' },
    { tag: 'accent2', key: 'secondary' },
    { tag: 'accent3', key: 'accent' },
    { tag: 'lt1', key: 'background' },
    { tag: 'dk1', key: 'text' },
    { tag: 'dk2', key: 'textLight' },
  ];
  
  for (const { tag, key } of colorMappings) {
    // Use a simpler approach - find the tag and then extract srgbClr value
    const tagRegex = new RegExp(`<a:${tag}>[\\s\\S]*?<\\/a:${tag}>`, 'i');
    const tagMatch = themeXml.match(tagRegex);
    
    if (tagMatch) {
      const colorMatch = tagMatch[0].match(/srgbClr val="([A-Fa-f0-9]{6})"/);
      if (colorMatch) {
        colors[key] = `#${colorMatch[1]}`;
      }
    }
  }
  
  return colors;
}

function extractFontsFromTheme(themeXml: string): string[] {
  const fonts: string[] = [];
  
  // Extract major font (headings) using simpler pattern
  const majorFontRegex = /<a:majorFont>[\s\S]*?<\/a:majorFont>/i;
  const majorFontMatch = themeXml.match(majorFontRegex);
  if (majorFontMatch) {
    const latinMatch = majorFontMatch[0].match(/latin typeface="([^"]+)"/);
    if (latinMatch) {
      fonts.push(latinMatch[1]);
    }
  }
  
  // Extract minor font (body)
  const minorFontRegex = /<a:minorFont>[\s\S]*?<\/a:minorFont>/i;
  const minorFontMatch = themeXml.match(minorFontRegex);
  if (minorFontMatch) {
    const latinMatch = minorFontMatch[0].match(/latin typeface="([^"]+)"/);
    if (latinMatch) {
      fonts.push(latinMatch[1]);
    }
  }
  
  return fonts;
}

export async function extractTextFromPPTX(buffer: Buffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const textParts: string[] = [];
    
    // Iterate through slide files
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
    console.error('PPTX text extraction error:', error);
    throw new Error('Failed to extract text from PPTX');
  }
}

function extractTextFromSlideXml(xml: string): string {
  // Extract all text content from <a:t> tags
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
