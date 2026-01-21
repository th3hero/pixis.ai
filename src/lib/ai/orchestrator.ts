import { generateContent, generateStructuredContent } from './gemini-client';
import {
  ANALYZE_DOCUMENT_PROMPT,
  GENERATE_SLIDES_PROMPT,
  REFINE_SLIDE_PROMPT,
  INTENT_CLASSIFICATION_PROMPT,
  GENERATE_RESPONSE_PROMPT,
  EXTRACT_STYLE_FROM_GUIDELINES_PROMPT,
} from './prompts';
import { SlideContent, ChatMessage, UploadedDocument, GeneratedDeck, ChatAction, BrandStyle } from '@/src/types';

// --- Types ---

interface DocumentAnalysis {
  title: string;
  documentType: string;
  executiveSummary: string;
  keyThemes: string[];
  mainSections: Array<{ title: string; summary: string; keyPoints: string[] }>;
  keyFindings: string[];
  recommendations: string[];
  dataPoints: Array<{ metric: string; value: string; context: string }>;
  suggestedSlideCount: number;
}

interface SlideGenerationResult {
  title: string;
  slides: SlideContent[];
}

interface IntentClassification {
  intent: ChatAction;
  confidence: number;
  entities: { slideNumbers?: number[]; specificRequest?: string; tone?: string };
  suggestedAction: string;
}

interface ProcessedResponse {
  content: string;
  action?: ChatAction;
  actionData?: unknown;
  processingTime: number;
}

// --- Document Analysis ---

export async function analyzeDocument(content: string): Promise<DocumentAnalysis> {
  const prompt = ANALYZE_DOCUMENT_PROMPT.replace('{documentContent}', content);
  return generateStructuredContent<DocumentAnalysis>(prompt);
}

// --- Slide Generation ---

export async function generateSlideContent(
  documentContent: string,
  options: { slideCount: number; focusAreas?: string[]; tone: 'formal' | 'casual' | 'executive' }
): Promise<SlideGenerationResult> {
  const prompt = GENERATE_SLIDES_PROMPT
    .replace('{documentContent}', documentContent)
    .replace('{slideCount}', String(options.slideCount))
    .replace('{focusAreas}', options.focusAreas?.join(', ') || 'general overview')
    .replace('{tone}', options.tone);

  const result = await generateStructuredContent<SlideGenerationResult>(prompt);
  
  // Make sure slides are numbered correctly
  result.slides = result.slides.map((slide, i) => ({ ...slide, order: i + 1 }));

  return result;
}

export async function refineSlide(
  currentSlide: SlideContent,
  userFeedback: string,
  documentContext: string
): Promise<SlideContent> {
  const prompt = REFINE_SLIDE_PROMPT
    .replace('{currentSlide}', JSON.stringify(currentSlide, null, 2))
    .replace('{userFeedback}', userFeedback)
    .replace('{documentContext}', documentContext);

  return generateStructuredContent<SlideContent>(prompt);
}

// --- Chat Intent ---

export async function classifyIntent(
  userMessage: string,
  context: { hasDocuments: boolean; hasDeck: boolean; recentActions: string[] }
): Promise<IntentClassification> {
  const prompt = INTENT_CLASSIFICATION_PROMPT
    .replace('{userMessage}', userMessage)
    .replace('{hasDocuments}', String(context.hasDocuments))
    .replace('{hasDeck}', String(context.hasDeck))
    .replace('{recentActions}', context.recentActions.join(', '));

  return generateStructuredContent<IntentClassification>(prompt);
}

// --- Main Message Handler ---

export async function processUserMessage(
  userMessage: string,
  context: { documents: UploadedDocument[]; previousMessages: ChatMessage[]; currentDeck?: GeneratedDeck }
): Promise<ProcessedResponse> {
  const startTime = Date.now();

  try {
    const intent = await classifyIntent(userMessage, {
      hasDocuments: context.documents.length > 0,
      hasDeck: !!context.currentDeck,
      recentActions: context.previousMessages
        .slice(-5)
        .map(m => m.metadata?.action)
        .filter(Boolean) as string[],
    });

    let responseContent: string;
    let action: ChatAction | undefined;
    let actionData: unknown;

    switch (intent.intent) {
      case 'generate':
        if (!context.documents.length) {
          responseContent = `I'd be happy to generate a presentation for you! However, I don't see any documents uploaded yet. 

Please upload your RFP, proposal, or business document first, and optionally a brand style guide. Then I can create a polished McKinsey-style slide deck for you.

You can upload documents using the panel on the right.`;
        } else {
          const docList = context.documents.map(d => `- **${d.name}** (${d.type})`).join('\n');
          responseContent = `Great! I'll generate a presentation based on your ${context.documents.length} uploaded document(s):

${docList}

I'll create a McKinsey-style deck with:
- Clear, action-oriented headlines
- Structured content with key insights
- Data-driven recommendations

Generating your slides now...`;
          action = 'generate';
          actionData = { slideCount: 5 };
        }
        break;

      case 'refine':
        if (!context.currentDeck) {
          responseContent = `I don't have a presentation to refine yet. Would you like me to generate one first based on your documents?`;
        } else {
          responseContent = `I understand you want to refine the presentation. Could you tell me:

1. Which specific slide(s) need changes? (e.g., "slide 2" or "the executive summary")
2. What changes would you like to make?

I'll then update the slides while maintaining the McKinsey style.`;
          action = 'refine';
        }
        break;

      case 'export':
        if (!context.currentDeck) {
          responseContent = `There's no presentation to export yet. Would you like me to generate one first?`;
        } else {
          responseContent = `I'll prepare your presentation for download. The PPTX file will include all ${context.currentDeck.slides.length} slides with proper formatting.

Your download will start shortly...`;
          action = 'export';
          actionData = { deckId: context.currentDeck.id };
        }
        break;

      case 'analyze':
        if (!context.documents.length) {
          responseContent = `I'd be happy to analyze your documents! Please upload your RFP, proposal, or business document first.`;
        } else {
          responseContent = `Analyzing your documents to extract key insights...`;
          action = 'analyze';
        }
        break;

      default:
        // General conversation - let the AI handle it
        const recentContext = context.previousMessages
          .slice(-5)
          .map(m => `${m.role}: ${m.content}`)
          .join('\n');

        const prompt = GENERATE_RESPONSE_PROMPT
          .replace('{userMessage}', userMessage)
          .replace('{intent}', intent.intent)
          .replace('{context}', recentContext);

        responseContent = await generateContent(prompt, { temperature: 0.7 });
        action = 'question';
    }

    return { content: responseContent, action, actionData, processingTime: Date.now() - startTime };
  } catch (err) {
    // Something went wrong - give a friendly error
    return {
      content: `I apologize, but I encountered an issue processing your request. Could you please try again or rephrase your question?`,
      processingTime: Date.now() - startTime,
    };
  }
}

// --- Style Extraction ---

export async function extractStyleFromGuidelines(guidelinesContent: string): Promise<Partial<BrandStyle>> {
  const prompt = EXTRACT_STYLE_FROM_GUIDELINES_PROMPT.replace('{guidelinesContent}', guidelinesContent);

  const result = await generateStructuredContent<{
    brandName: string;
    colors: Record<string, string>;
    typography: { headingFont: string; bodyFont: string };
    voiceAndTone: { tone: string };
  }>(prompt);

  // Fill in defaults for anything the AI didn't extract
  return {
    name: result.brandName,
    colors: {
      primary: result.colors.primary || '#003366',
      secondary: result.colors.secondary || '#0066CC',
      accent: result.colors.accent || '#00A3E0',
      background: result.colors.background || '#FFFFFF',
      text: result.colors.text || '#333333',
      textLight: result.colors.textLight || '#666666',
    },
    typography: {
      headingFont: result.typography.headingFont || 'Georgia',
      bodyFont: result.typography.bodyFont || 'Arial',
      headingSizes: { h1: 44, h2: 32, h3: 24, h4: 20 },
      bodySizes: { large: 18, normal: 14, small: 12, caption: 10 },
      lineHeight: 1.4,
    },
  };
}
