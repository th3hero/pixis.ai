import { memo } from 'react';
import { cn } from '@/src/lib/utils';
import { SlideContent, SlideStyle, BulletContent } from '@/src/types';

interface SlidePreviewProps {
  slide: SlideContent;
  style: SlideStyle;
  isActive?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-24 md:w-32 h-[54px] md:h-[72px]',
  md: 'w-36 md:w-48 h-[81px] md:h-[108px]',
  lg: 'w-48 md:w-64 h-[108px] md:h-[144px]',
};

export const SlidePreview = memo(function SlidePreview({
  slide,
  style,
  isActive = false,
  onClick,
  size = 'md',
}: SlidePreviewProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-md md:rounded-lg overflow-hidden cursor-pointer transition-all duration-200',
        'border-2 shadow-sm hover:shadow-lg',
        sizeClasses[size],
        isActive 
          ? 'border-primary ring-2 ring-primary/30 shadow-primary/20' 
          : 'border-border hover:border-primary/50'
      )}
      style={{ aspectRatio: '16/9' }}
    >
      <SlidePreviewContent slide={slide} style={style} />
      
      {/* Slide number badge */}
      <div className="absolute bottom-0.5 right-0.5 md:bottom-1 md:right-1 px-1 md:px-1.5 py-0.5 bg-black/60 rounded text-[6px] md:text-[8px] text-white font-medium">
        {slide.order}
      </div>
    </div>
  );
});

function SlidePreviewContent({ slide, style }: { slide: SlideContent; style: SlideStyle }) {
  const scale = 0.15;

  // Title slide - dark theme
  if (slide.type === 'title') {
    return (
      <div
        className="w-full h-full flex flex-col p-2"
        style={{ backgroundColor: style.primaryColor }}
      >
        <p
          className="font-bold leading-tight"
          style={{ fontSize: `${style.fontSize.title * scale}px`, color: style.accentColor }}
        >
          PIXIS
        </p>
        <p
          className="text-white font-bold leading-tight mt-1"
          style={{ fontSize: `${style.fontSize.title * scale * 0.8}px` }}
        >
          {truncate(slide.title, 40)}
        </p>
        {slide.subtitle && (
          <p
            className="mt-0.5"
            style={{ fontSize: `${style.fontSize.subheading * scale}px`, color: style.accentColor }}
          >
            {truncate(slide.subtitle, 30)}
          </p>
        )}
      </div>
    );
  }

  // Section header - dark theme
  if (slide.type === 'section-header') {
    return (
      <div 
        className="w-full h-full flex flex-col justify-center"
        style={{ backgroundColor: style.primaryColor }}
      >
        <div
          className="py-1 px-2"
          style={{ backgroundColor: style.secondaryColor }}
        >
          <p
            className="text-white font-semibold"
            style={{ fontSize: `${style.fontSize.heading * scale}px` }}
          >
            {truncate(slide.title, 35)}
          </p>
        </div>
      </div>
    );
  }

  // Default content slide - dark theme
  return (
    <div 
      className="w-full h-full flex flex-col"
      style={{ backgroundColor: style.primaryColor }}
    >
      {/* Header */}
      <div
        className="px-2 py-1"
        style={{ backgroundColor: style.secondaryColor }}
      >
        <p
          className="text-white font-semibold truncate"
          style={{ fontSize: `${(style.fontSize.heading - 6) * scale}px` }}
        >
          {truncate(slide.title, 45)}
        </p>
      </div>
      
      {/* Accent line */}
      <div className="h-px" style={{ backgroundColor: style.accentColor }} />
      
      {/* Content preview */}
      <div className="flex-1 p-1.5 overflow-hidden">
        {slide.content.slice(0, 2).map((block, i) => {
          if (block.type === 'bullets') {
            const bulletData = block.data as BulletContent;
            return (
              <div key={i} className="space-y-0.5">
                {bulletData.items.slice(0, 3).map((item, j) => (
                  <div key={j} className="flex items-start gap-0.5">
                    <span
                      className="shrink-0 mt-0.5"
                      style={{ color: style.accentColor, fontSize: '4px' }}
                    >
                      •
                    </span>
                    <span
                      className="text-white/80 leading-tight"
                      style={{ fontSize: `${style.fontSize.body * scale * 0.8}px` }}
                    >
                      {truncate(item.text, 40)}
                    </span>
                  </div>
                ))}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
