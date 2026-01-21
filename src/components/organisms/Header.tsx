import { Github, FileText } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Logo } from '@/src/components/atoms';
import { Badge } from '@/src/components/ui/badge';

interface HeaderProps {
  onMenuToggle?: () => void;
  documentsCount?: number;
}

export function Header({ onMenuToggle, documentsCount = 0 }: HeaderProps) {
  return (
    <header className="h-14 md:h-16 border-b border-border glass sticky top-0 z-40">
      <div className="h-full px-3 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size="md" />
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* AI Status Badge */}
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs md:text-sm font-medium border border-primary/20">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            AI Ready
          </span>
          
          {/* GitHub Link */}
          <Button variant="ghost" size="icon" asChild className="hidden md:flex text-muted-foreground hover:text-foreground hover:bg-secondary">
            <a
              href="https://github.com/th3hero/pixis.ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
            </a>
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden relative text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <FileText className="h-5 w-5" />
            {documentsCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-accent text-accent-foreground text-xs"
              >
                {documentsCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
