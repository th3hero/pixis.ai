import { Layers } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const sizeMap = {
  sm: { icon: 20, text: 'text-lg' },
  md: { icon: 28, text: 'text-xl' },
  lg: { icon: 36, text: 'text-2xl' },
};

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const { icon, text } = sizeMap[size];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg blur-sm opacity-75" />
        <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-lg">
          <Layers size={icon} className="text-white" strokeWidth={2.5} />
        </div>
      </div>
      {showText && (
        <span className={`font-bold ${text} bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
          DeckForge
        </span>
      )}
    </div>
  );
}
