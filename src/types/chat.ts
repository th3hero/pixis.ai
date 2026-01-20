import { UploadedDocument } from './document';
import { GeneratedDeck } from './slide';

export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageStatus = 'sending' | 'sent' | 'error';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  attachments?: MessageAttachment[];
  metadata?: MessageMetadata;
}

export interface MessageAttachment {
  id: string;
  type: 'document' | 'deck' | 'preview';
  document?: UploadedDocument;
  deck?: GeneratedDeck;
  previewUrl?: string;
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

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  documents: UploadedDocument[];
  generatedDecks: GeneratedDeck[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isProcessing: boolean;
  error: string | null;
}
