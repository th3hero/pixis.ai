'use client';

import { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Textarea } from '@/src/components/ui/textarea';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { ChatMessage } from '@/src/components/molecules';
import { TypingIndicator } from '@/src/components/atoms';
import { ChatMessage as ChatMessageType } from '@/src/types';

interface ChatWindowProps {
  messages: ChatMessageType[];
  isProcessing: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onAction?: (action: string, data?: unknown) => void;
}

export function ChatWindow({
  messages,
  isProcessing,
  inputValue,
  onInputChange,
  onSend,
  onAction,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isProcessing) {
        onSend();
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="py-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onAction={onAction}
            />
          ))}
          
          {isProcessing && (
            <div className="flex gap-3 p-4 bg-white border border-gray-100 rounded-xl">
              <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-sm">AI</span>
              </div>
              <TypingIndicator />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-100 p-4 bg-white">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me to generate slides, refine content, or answer questions..."
              className="min-h-[48px] max-h-[200px] resize-none pr-12 rounded-xl border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
              disabled={isProcessing}
            />
          </div>
          <Button
            onClick={onSend}
            disabled={!inputValue.trim() || isProcessing}
            className="h-12 w-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
