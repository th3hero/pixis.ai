import { memo } from 'react';
import { User, Bot, Download, RefreshCw } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { ChatMessage as ChatMessageType } from '@/src/types';

interface ChatMessageProps {
  message: ChatMessageType;
  onAction?: (action: string, data?: unknown) => void;
}

export const ChatMessage = memo(function ChatMessage({ message, onAction }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-xl transition-colors',
        isUser ? 'bg-indigo-50' : 'bg-white border border-gray-100'
      )}
    >
      <Avatar className={cn('h-8 w-8 shrink-0', isUser ? 'bg-indigo-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600')}>
        <AvatarFallback className="text-white text-sm">
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            {isUser ? 'You' : 'DeckForge AI'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTime(message.timestamp)}
          </span>
        </div>

        <div className="prose prose-sm max-w-none text-gray-700">
          <MessageContent content={message.content} />
        </div>

        {/* Action buttons for assistant messages */}
        {isAssistant && message.metadata?.action && (
          <div className="flex items-center gap-2 pt-2">
            {message.metadata.action === 'generate' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAction?.('generate')}
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Regenerate
              </Button>
            )}
            {message.metadata.action === 'export' && (
              <Button
                size="sm"
                onClick={() => onAction?.('export')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Download className="h-3 w-3 mr-1" />
                Download PPTX
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

function MessageContent({ content }: { content: string }) {
  // Simple markdown-like rendering
  const lines = content.split('\n');
  
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        // Headers
        if (line.startsWith('# ')) {
          return (
            <h3 key={i} className="text-lg font-semibold text-gray-900 mt-3 first:mt-0">
              {line.slice(2)}
            </h3>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h4 key={i} className="text-base font-semibold text-gray-900 mt-2">
              {line.slice(3)}
            </h4>
          );
        }
        
        // Bullet points
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span className="text-indigo-500">•</span>
              <span>{renderInlineFormatting(line.slice(2))}</span>
            </div>
          );
        }
        
        // Numbered lists
        const numberedMatch = line.match(/^(\d+)\.\s(.+)$/);
        if (numberedMatch) {
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span className="text-indigo-500 font-medium">{numberedMatch[1]}.</span>
              <span>{renderInlineFormatting(numberedMatch[2])}</span>
            </div>
          );
        }
        
        // Empty lines
        if (!line.trim()) {
          return <div key={i} className="h-2" />;
        }
        
        // Regular paragraphs
        return (
          <p key={i} className="leading-relaxed">
            {renderInlineFormatting(line)}
          </p>
        );
      })}
    </div>
  );
}

function renderInlineFormatting(text: string): React.ReactNode {
  // Bold text
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
