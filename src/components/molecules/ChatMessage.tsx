import { memo } from 'react';
import { User, Sparkles, Download, RefreshCw } from 'lucide-react';
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

  return (
    <div
      className={cn(
        'flex gap-3 p-3 md:p-4 rounded-xl transition-all',
        isUser 
          ? 'bg-secondary/50 border border-border' 
          : 'glass'
      )}
    >
      <Avatar className={cn(
        'h-8 w-8 shrink-0 border-2',
        isUser 
          ? 'bg-secondary border-accent/50' 
          : 'bg-gradient-to-br from-primary to-accent border-primary/30'
      )}>
        <AvatarFallback className={cn(
          'text-sm',
          isUser ? 'text-accent' : 'text-background'
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            'text-sm font-medium',
            isUser ? 'text-accent' : 'text-primary'
          )}>
            {isUser ? 'You' : 'Pixis AI'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTime(message.timestamp)}
          </span>
        </div>

        <div className="prose prose-sm prose-invert max-w-none text-foreground/90">
          <MessageContent content={message.content} />
        </div>

        {/* Action buttons for assistant messages */}
        {!isUser && message.metadata?.action && (
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            {message.metadata.action === 'generate' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAction?.('generate')}
                className="text-primary border-primary/30 hover:bg-primary/10 text-xs md:text-sm"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Regenerate
              </Button>
            )}
            {message.metadata.action === 'export' && (
              <Button
                size="sm"
                onClick={() => onAction?.('export')}
                className="bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-background text-xs md:text-sm"
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
    <div className="space-y-2 text-sm md:text-base">
      {lines.map((line, i) => {
        // Headers
        if (line.startsWith('# ')) {
          return (
            <h3 key={i} className="text-base md:text-lg font-semibold text-foreground mt-3 first:mt-0">
              {line.slice(2)}
            </h3>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h4 key={i} className="text-sm md:text-base font-semibold text-foreground mt-2">
              {line.slice(3)}
            </h4>
          );
        }
        
        // Bullet points
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span className="text-primary">•</span>
              <span>{renderInlineFormatting(line.slice(2))}</span>
            </div>
          );
        }
        
        // Numbered lists
        const numberedMatch = line.match(/^(\d+)\.\s(.+)$/);
        if (numberedMatch) {
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span className="text-accent font-medium">{numberedMatch[1]}.</span>
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
        <strong key={i} className="font-semibold text-foreground">
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
