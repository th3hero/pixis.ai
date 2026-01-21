import { Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const sizeMap = {
  sm: { icon: 18, text: 'text-base', gap: 'gap-1.5' },
  md: { icon: 22, text: 'text-lg md:text-xl', gap: 'gap-2' },
  lg: { icon: 28, text: 'text-2xl', gap: 'gap-2.5' },
};

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const { icon, text, gap } = sizeMap[size];

  return (
    <div className={`flex items-center ${gap}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-lg blur-md opacity-50" />
        <div className="relative bg-gradient-to-br from-primary via-cyan-400 to-accent p-1.5 md:p-2 rounded-lg">
          <Sparkles size={icon} className="text-background" strokeWidth={2.5} />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
        <span className={`font-bold ${text} bg-gradient-to-r from-primary via-cyan-300 to-accent bg-clip-text text-transparent`}>
          Pixis AI
        </span>
        <span className="text-[10px] md:text-xs text-muted-foreground tracking-wider uppercase">
          Presentation Generator
        </span>
        </div>
      )}
    </div>
  );
}
