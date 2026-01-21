import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { processUserMessage } from '@/src/lib/ai/orchestrator';
import { ChatMessage, UploadedDocument, GeneratedDeck } from '@/src/types';

export async function POST(request: NextRequest) {
  try {
    const { message, documents, previousMessages, currentDeck } = await request.json() as {
      message: string;
      documents: UploadedDocument[];
      previousMessages: ChatMessage[];
      currentDeck?: GeneratedDeck;
    };

    if (!message?.trim()) {
      return NextResponse.json({ success: false, error: 'Message cannot be empty' }, { status: 400 });
    }

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
      metadata: { processingTime: response.processingTime, action: response.action },
    };

    return NextResponse.json({
      success: true,
      message: assistantMessage,
      action: response.action ? { type: response.action, data: response.actionData } : undefined,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to process message' },
      { status: 500 }
    );
  }
}
