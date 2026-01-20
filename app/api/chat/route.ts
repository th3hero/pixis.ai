import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { processUserMessage } from '@/src/lib/ai/orchestrator';
import { ChatMessage, UploadedDocument, GeneratedDeck } from '@/src/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, documents, previousMessages, currentDeck } = body as {
      message: string;
      documents: UploadedDocument[];
      previousMessages: ChatMessage[];
      currentDeck?: GeneratedDeck;
    };

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    // Process message with AI
    const response = await processUserMessage(message, {
      documents: documents || [],
      previousMessages: previousMessages || [],
      currentDeck,
    });

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

    return NextResponse.json({
      success: true,
      message: assistantMessage,
      action: response.action ? {
        type: response.action,
        data: response.actionData,
      } : undefined,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process message',
      },
      { status: 500 }
    );
  }
}
