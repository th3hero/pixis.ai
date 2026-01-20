'use server';

import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, UploadedDocument, GeneratedDeck } from '@/src/types';
import { processUserMessage } from '@/src/lib/ai/orchestrator';

export interface ChatResponse {
  success: boolean;
  message?: ChatMessage;
  action?: {
    type: 'generate' | 'refine' | 'export' | 'analyze' | 'question';
    data?: unknown;
  };
  error?: string;
}

export async function sendMessage(
  userMessage: string,
  context: {
    documents: UploadedDocument[];
    previousMessages: ChatMessage[];
    currentDeck?: GeneratedDeck;
  }
): Promise<ChatResponse> {
  try {
    if (!userMessage.trim()) {
      return { success: false, error: 'Message cannot be empty' };
    }

    // Process message with AI
    const response = await processUserMessage(userMessage, context);

    const assistantMessage: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      status: 'sent',
      metadata: {
        processingTime: response.processingTime,
        action: response.action,
      },
    };

    const validActions = ['generate', 'refine', 'export', 'analyze', 'question'] as const;
    const actionType = response.action && validActions.includes(response.action as typeof validActions[number]) 
      ? response.action as typeof validActions[number]
      : undefined;

    return {
      success: true,
      message: assistantMessage,
      action: actionType ? {
        type: actionType,
        data: response.actionData,
      } : undefined,
    };
  } catch (error) {
    console.error('Chat error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process message',
    };
  }
}

export async function getWelcomeMessage(): Promise<ChatMessage> {
  return {
    id: uuidv4(),
    role: 'assistant',
    content: `# Welcome to DeckForge AI! 🎯

I'm your AI-powered presentation assistant. I can help you transform your business documents into polished, McKinsey-style slide decks.

**Here's how to get started:**

1. **Upload your documents** - RFPs, proposals, or technical documents (PDF or DOCX)
2. **Add a style guide** - Upload a brand guidelines document or reference slide deck (optional)
3. **Generate your deck** - I'll create a professional presentation based on your content

You can also chat with me to:
- Refine specific slides
- Adjust the tone or focus
- Add or remove sections
- Export your final presentation

**Ready to begin?** Upload your first document using the panel on the right, or just type a message!`,
    timestamp: new Date(),
    status: 'sent',
  };
}
