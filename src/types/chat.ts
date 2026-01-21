export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageStatus = 'sending' | 'sent' | 'error';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  processingTime?: number;
  tokensUsed?: number;
  model?: string;
  action?: ChatAction;
}

export type ChatAction = 
  | 'upload'
  | 'analyze'
  | 'generate'
  | 'refine'
  | 'export'
  | 'question';
