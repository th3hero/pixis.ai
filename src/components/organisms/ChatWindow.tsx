'use client';

import { useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Textarea } from '@/src/components/ui/textarea';
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

export function ChatWindow({ messages, isProcessing, inputValue, onInputChange, onSend, onAction }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter adds newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isProcessing) onSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 md:px-6 scrollbar-thin">
        <div className="py-4 md:py-6 space-y-4 max-w-4xl mx-auto">
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} onAction={onAction} />
          ))}

          {isProcessing && (
            <div className="flex gap-3 p-4 glass rounded-xl animate-pulse-glow">
              <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-background" />
              </div>
              <TypingIndicator />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 md:p-4 glass">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 md:gap-3 items-end">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={e => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me to generate slides, refine content, or answer questions..."
                className="min-h-[48px] max-h-[150px] md:max-h-[200px] resize-none rounded-xl bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20 text-sm md:text-base"
                disabled={isProcessing}
              />
            </div>
            <Button
              onClick={onSend}
              disabled={!inputValue.trim() || isProcessing}
              className="h-12 w-12 rounded-xl bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 shrink-0 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              <Send className="h-5 w-5 text-background" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center hidden md:block">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
