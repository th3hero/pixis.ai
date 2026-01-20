'use server';

import { v4 as uuidv4 } from 'uuid';
import { GeneratedDeck, SlideContent, SlideStyle, UploadedDocument, BrandStyle, MCKINSEY_STYLE } from '@/src/types';
import { generateSlideContent } from '@/src/lib/ai/orchestrator';
import { createPPTX } from '@/src/lib/slides/slide-engine';

export interface GenerateResult {
  success: boolean;
  deck?: GeneratedDeck;
  error?: string;
}

export interface ExportResult {
  success: boolean;
  fileBuffer?: Buffer;
  fileName?: string;
  error?: string;
}

export async function generatePresentation(
  documents: UploadedDocument[],
  style?: Partial<BrandStyle>,
  options?: {
    slideCount?: number;
    focusAreas?: string[];
    tone?: 'formal' | 'casual' | 'executive';
  }
): Promise<GenerateResult> {
  try {
    if (documents.length === 0) {
      return { success: false, error: 'No documents provided for slide generation' };
    }

    // Combine document content
    const documentContent = documents
      .map(d => `[${d.name}]\n${d.content}`)
      .join('\n\n---\n\n');

    // Generate slide content using AI
    const slideContent = await generateSlideContent(documentContent, {
      slideCount: options?.slideCount || 5,
      focusAreas: options?.focusAreas,
      tone: options?.tone || 'executive',
    });

    // Merge provided style with McKinsey defaults
    const finalStyle: SlideStyle = {
      primaryColor: style?.colors?.primary || MCKINSEY_STYLE.colors.primary,
      secondaryColor: style?.colors?.secondary || MCKINSEY_STYLE.colors.secondary,
      accentColor: style?.colors?.accent || MCKINSEY_STYLE.colors.accent,
      backgroundColor: style?.colors?.background || MCKINSEY_STYLE.colors.background,
      fontFamily: {
        heading: style?.typography?.headingFont || MCKINSEY_STYLE.typography.headingFont,
        body: style?.typography?.bodyFont || MCKINSEY_STYLE.typography.bodyFont,
      },
      fontSize: {
        title: style?.typography?.headingSizes?.h1 || MCKINSEY_STYLE.typography.headingSizes.h1,
        heading: style?.typography?.headingSizes?.h2 || MCKINSEY_STYLE.typography.headingSizes.h2,
        subheading: style?.typography?.headingSizes?.h3 || MCKINSEY_STYLE.typography.headingSizes.h3,
        body: style?.typography?.bodySizes?.normal || MCKINSEY_STYLE.typography.bodySizes.normal,
        caption: style?.typography?.bodySizes?.caption || MCKINSEY_STYLE.typography.bodySizes.caption,
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

    return { success: true, deck };
  } catch (error) {
    console.error('Generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate presentation',
    };
  }
}

export async function exportToPPTX(deck: GeneratedDeck): Promise<ExportResult> {
  try {
    const pptxBuffer = await createPPTX(deck);
    const fileName = `${deck.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pptx`;

    return {
      success: true,
      fileBuffer: pptxBuffer,
      fileName,
    };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export presentation',
    };
  }
}
