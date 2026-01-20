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
  sm: 'w-32 h-18',
  md: 'w-48 h-27',
  lg: 'w-64 h-36',
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
        'relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200',
        'border-2 shadow-sm hover:shadow-md',
        sizeClasses[size],
        isActive ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-indigo-300'
      )}
      style={{ aspectRatio: '16/9' }}
    >
      <SlidePreviewContent slide={slide} style={style} />
      
      {/* Slide number badge */}
      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/50 rounded text-[8px] text-white font-medium">
        {slide.order}
      </div>
    </div>
  );
});

function SlidePreviewContent({ slide, style }: { slide: SlideContent; style: SlideStyle }) {
  const scale = 0.15; // Scale factor for preview

  if (slide.type === 'title') {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center p-2"
        style={{ backgroundColor: style.primaryColor }}
      >
        <p
          className="text-white font-bold text-center leading-tight"
          style={{ fontSize: `${style.fontSize.title * scale}px` }}
        >
          {truncate(slide.title, 40)}
        </p>
        {slide.subtitle && (
          <p
            className="text-white/80 text-center mt-1"
            style={{ fontSize: `${style.fontSize.subheading * scale}px` }}
          >
            {truncate(slide.subtitle, 30)}
          </p>
        )}
      </div>
    );
  }

  if (slide.type === 'section-header') {
    return (
      <div className="w-full h-full flex flex-col items-start justify-center p-2 bg-white">
        <div
          className="w-full py-1 px-2 -mx-2"
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

  // Default content slide preview
  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div
        className="px-2 py-1"
        style={{ backgroundColor: style.primaryColor }}
      >
        <p
          className="text-white font-semibold truncate"
          style={{ fontSize: `${(style.fontSize.heading - 6) * scale}px` }}
        >
          {truncate(slide.title, 45)}
        </p>
      </div>
      
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
                      style={{ 
                        color: style.accentColor,
                        fontSize: '4px'
                      }}
                    >
                      •
                    </span>
                    <span
                      className="text-gray-700 leading-tight"
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
