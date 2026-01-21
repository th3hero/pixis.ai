import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { generateSlideContent } from '@/src/lib/ai/orchestrator';
import { GeneratedDeck, SlideStyle, UploadedDocument, BrandStyle, DARK_CORPORATE_STYLE } from '@/src/types';

/**
 * Figure out how many slides we need based on content.
 * More content = more slides, but capped at reasonable limits.
 */
function calculateSlideCount(docs: UploadedDocument[]): number {
  const totalChars = docs.reduce((sum, d) => sum + (d.content?.length || 0), 0);
  const totalSections = docs.reduce((sum, d) => sum + (d.extractedData?.sections?.length || 0), 0);
  
  // Start with basics: title + summary + takeaways
  let count = 3;
  
  // Add based on sections (~1 slide per 1.5 sections)
  count += Math.ceil(totalSections / 1.5);
  
  // Add based on content length (~1 slide per 2k chars, max 5 extra)
  count += Math.min(Math.ceil(totalChars / 2000), 5);
  
  // Add agenda if we have enough content
  if (count > 4) count++;
  
  // Keep it reasonable
  return Math.max(5, Math.min(15, count));
}

export async function POST(request: NextRequest) {
  try {
    const { documents, style, options } = await request.json() as {
      documents: UploadedDocument[];
      style?: Partial<BrandStyle>;
      options?: { slideCount?: number; focusAreas?: string[]; tone?: 'formal' | 'casual' | 'executive' };
    };

    if (!documents?.length) {
      return NextResponse.json({ success: false, error: 'No documents provided' }, { status: 400 });
    }

    // Combine all docs into one big string
    const content = documents.map(d => `[${d.name}]\n${d.content}`).join('\n\n---\n\n');
    const slideCount = options?.slideCount || calculateSlideCount(documents);

    const slideContent = await generateSlideContent(content, {
      slideCount,
      focusAreas: options?.focusAreas,
      tone: options?.tone || 'executive',
    });

    // Build final style (dark theme by default)
    const base = DARK_CORPORATE_STYLE;
    const finalStyle: SlideStyle = {
      primaryColor: style?.colors?.primary || base.colors.primary,
      secondaryColor: style?.colors?.secondary || base.colors.secondary,
      accentColor: style?.colors?.accent || base.colors.accent,
      backgroundColor: style?.colors?.background || base.colors.background,
      foreground: '#ffffff',
      fontFamily: {
        heading: style?.typography?.headingFont || base.typography.headingFont,
        body: style?.typography?.bodyFont || base.typography.bodyFont,
      },
      fontSize: {
        title: style?.typography?.headingSizes?.h1 || base.typography.headingSizes.h1,
        heading: style?.typography?.headingSizes?.h2 || base.typography.headingSizes.h2,
        subheading: style?.typography?.headingSizes?.h3 || base.typography.headingSizes.h3,
        body: style?.typography?.bodySizes?.normal || base.typography.bodySizes.normal,
        caption: style?.typography?.bodySizes?.caption || base.typography.bodySizes.caption,
      },
    };

    const deck: GeneratedDeck = {
      id: uuidv4(),
      title: slideContent.title || 'Generated Presentation',
      slides: slideContent.slides,
      style: finalStyle,
      createdAt: new Date(),
      sourceDocuments: documents.map(d => d.id),
    };

    return NextResponse.json({ success: true, deck });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to generate presentation' },
      { status: 500 }
    );
  }
}
