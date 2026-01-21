import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { generateSlideContent } from '@/src/lib/ai/orchestrator';
import { GeneratedDeck, SlideStyle, UploadedDocument, BrandStyle, DARK_CORPORATE_STYLE } from '@/src/types';

// Calculate optimal slide count based on document content
function calculateSlideCount(documents: UploadedDocument[]): number {
  const MIN_SLIDES = 5;
  const MAX_SLIDES = 15;
  
  // Calculate total content length
  const totalContentLength = documents.reduce((acc, doc) => acc + (doc.content?.length || 0), 0);
  
  // Count sections across all documents
  const totalSections = documents.reduce((acc, doc) => {
    const sections = doc.extractedData?.sections?.length || 0;
    return acc + sections;
  }, 0);
  
  // Base calculation:
  // - 1 title slide
  // - 1 executive summary
  // - 1 agenda (if enough content)
  // - Content slides based on sections and content length
  // - 1 key takeaways
  
  let slideCount = 3; // Title + Executive Summary + Key Takeaways
  
  // Add slides based on sections (1 slide per 1-2 sections)
  slideCount += Math.ceil(totalSections / 1.5);
  
  // Add slides based on content length (roughly 1 slide per 2000 characters)
  const contentBasedSlides = Math.ceil(totalContentLength / 2000);
  slideCount += Math.min(contentBasedSlides, 5); // Cap content-based addition
  
  // Add agenda slide if we have enough content
  if (slideCount > 4) {
    slideCount += 1;
  }
  
  // Ensure within bounds
  return Math.max(MIN_SLIDES, Math.min(MAX_SLIDES, slideCount));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documents, style, options } = body as {
      documents: UploadedDocument[];
      style?: Partial<BrandStyle>;
      options?: {
        slideCount?: number;
        focusAreas?: string[];
        tone?: 'formal' | 'casual' | 'executive';
      };
    };

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No documents provided for slide generation' },
        { status: 400 }
      );
    }

    // Combine document content
    const documentContent = documents
      .map(d => `[${d.name}]\n${d.content}`)
      .join('\n\n---\n\n');

    // Calculate dynamic slide count if not explicitly provided
    const slideCount = options?.slideCount || calculateSlideCount(documents);

    // Generate slide content using AI
    const slideContent = await generateSlideContent(documentContent, {
      slideCount,
      focusAreas: options?.focusAreas,
      tone: options?.tone || 'executive',
    });

    // Use dark corporate style as default (matching sample output)
    const defaultStyle = DARK_CORPORATE_STYLE;

    // Merge provided style with dark corporate defaults
    const finalStyle: SlideStyle = {
      primaryColor: style?.colors?.primary || defaultStyle.colors.primary,
      secondaryColor: style?.colors?.secondary || defaultStyle.colors.secondary,
      accentColor: style?.colors?.accent || defaultStyle.colors.accent,
      backgroundColor: style?.colors?.background || defaultStyle.colors.background,
      foreground: '#ffffff', // White text for dark theme
      fontFamily: {
        heading: style?.typography?.headingFont || defaultStyle.typography.headingFont,
        body: style?.typography?.bodyFont || defaultStyle.typography.bodyFont,
      },
      fontSize: {
        title: style?.typography?.headingSizes?.h1 || defaultStyle.typography.headingSizes.h1,
        heading: style?.typography?.headingSizes?.h2 || defaultStyle.typography.headingSizes.h2,
        subheading: style?.typography?.headingSizes?.h3 || defaultStyle.typography.headingSizes.h3,
        body: style?.typography?.bodySizes?.normal || defaultStyle.typography.bodySizes.normal,
        caption: style?.typography?.bodySizes?.caption || defaultStyle.typography.bodySizes.caption,
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
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate presentation',
      },
      { status: 500 }
    );
  }
}
