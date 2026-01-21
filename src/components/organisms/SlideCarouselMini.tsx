'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, RefreshCw, Maximize2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { GeneratedDeck, SlideContent, BulletContent } from '@/src/types';
import { cn } from '@/src/lib/utils';

interface SlideCarouselMiniProps {
  deck: GeneratedDeck;
  onExport: () => void;
  onRegenerate: () => void;
  isExporting: boolean;
  onExpand?: () => void;
}

// Virtual slide dimensions
const SLIDE_WIDTH = 960;
const SLIDE_HEIGHT = 540;

export function SlideCarouselMini({
  deck,
  onExport,
  onRegenerate,
  isExporting,
  onExpand,
}: SlideCarouselMiniProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const activeSlide = deck.slides[activeSlideIndex];

  const goToPrevious = () => {
    setActiveSlideIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setActiveSlideIndex((prev) => Math.min(deck.slides.length - 1, prev + 1));
  };

  // Calculate scale to fit within the card (max width ~180px for the slide)
  const maxSlideWidth = 180;
  const scale = maxSlideWidth / SLIDE_WIDTH;
  const scaledHeight = SLIDE_HEIGHT * scale;

  return (
    <Card className="border-border bg-gradient-to-b from-slate-800 to-slate-900 overflow-hidden">
      {/* Header row with title and actions */}
      <div className="flex items-center justify-between gap-2 px-2.5 py-2 border-b border-white/10">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-white text-[11px] truncate leading-tight">{deck.title}</h3>
          <p className="text-[9px] text-white/50 leading-tight">
            {deck.slides.length} slides • Click to expand
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRegenerate}
            className="h-6 w-6 text-white/50 hover:text-white hover:bg-white/10"
            title="Regenerate"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            onClick={onExport}
            disabled={isExporting}
            className="h-6 w-6 bg-primary hover:bg-primary/90 text-primary-foreground"
            title="Download PPTX"
          >
            {isExporting ? (
              <div className="h-2.5 w-2.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
              <Download className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Slide Preview Area - Compact */}
      <div 
        className="relative px-1 py-2 flex items-center justify-center cursor-pointer group"
        onClick={onExpand}
      >
        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
          disabled={activeSlideIndex === 0}
          className="absolute left-0 z-10 text-white/30 hover:text-white hover:bg-white/10 disabled:opacity-20 h-full w-5 rounded-none rounded-l"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>

        {/* Scaled Slide */}
        <div 
          className="relative mx-4"
          style={{
            width: maxSlideWidth,
            height: scaledHeight,
          }}
        >
          <div
            className="absolute top-0 left-0 rounded-sm shadow-md overflow-hidden"
            style={{
              width: SLIDE_WIDTH,
              height: SLIDE_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              backgroundColor: deck.style.primaryColor,
            }}
          >
            <SlidePreviewContent slide={activeSlide} style={deck.style} />
          </div>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-sm flex items-center justify-center">
            <Maximize2 className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); goToNext(); }}
          disabled={activeSlideIndex === deck.slides.length - 1}
          className="absolute right-0 z-10 text-white/30 hover:text-white hover:bg-white/10 disabled:opacity-20 h-full w-5 rounded-none rounded-r"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>

      {/* Slide indicator */}
      <div className="flex items-center justify-center gap-1 pb-2">
        {deck.slides.length <= 7 ? (
          deck.slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlideIndex(index)}
              className={cn(
                "h-1 rounded-full transition-all",
                index === activeSlideIndex 
                  ? "bg-primary w-3" 
                  : "bg-white/20 hover:bg-white/40 w-1"
              )}
            />
          ))
        ) : (
          <span className="text-[9px] text-white/50 font-medium">
            {activeSlideIndex + 1} / {deck.slides.length}
          </span>
        )}
      </div>
    </Card>
  );
}

// Simplified slide preview content - Dark theme
function SlidePreviewContent({ slide, style }: { slide: SlideContent; style: GeneratedDeck['style'] }) {
  // Title slide
  if (slide.type === 'title') {
    return (
      <div
        className="w-full h-full flex flex-col px-12 py-10"
        style={{ backgroundColor: style.primaryColor }}
      >
        {/* Brand mark */}
        <div 
          className="text-xs font-bold mb-8"
          style={{ color: style.accentColor }}
        >
          PIXIS
        </div>
        
        {/* Title */}
        <h1
          className="text-white font-bold leading-tight text-5xl max-w-[700px]"
          style={{ fontFamily: style.fontFamily.heading }}
        >
          {slide.title}
        </h1>
        
        {/* Subtitle with accent */}
        {slide.subtitle && (
          <p
            className="mt-4 text-2xl max-w-[600px]"
            style={{ 
              fontFamily: style.fontFamily.body,
              color: style.accentColor 
            }}
          >
            {slide.subtitle}
          </p>
        )}
        
        {/* Accent line */}
        <div 
          className="w-32 h-1 mt-auto mb-4"
          style={{ backgroundColor: style.accentColor }}
        />
        
        {/* Tagline */}
        <p 
          className="text-lg font-semibold"
          style={{ color: style.accentColor }}
        >
          Future, Faster. Together
        </p>
        
        {/* Date */}
        <p className="text-sm text-gray-400 mt-2">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>
    );
  }

  // Section header slide
  if (slide.type === 'section-header') {
    return (
      <div 
        className="w-full h-full flex flex-col"
        style={{ backgroundColor: style.primaryColor }}
      >
        {/* Brand mark */}
        <div 
          className="text-xs font-bold px-12 pt-6"
          style={{ color: style.accentColor }}
        >
          PIXIS
        </div>
        
        {/* Center content */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Accent line */}
          <div 
            className="w-24 h-1 mx-12 mb-4"
            style={{ backgroundColor: style.accentColor }}
          />
          
          {/* Header bar */}
          <div
            className="py-6 px-12"
            style={{ backgroundColor: style.secondaryColor }}
          >
            <h2
              className="text-white font-bold text-4xl"
              style={{ fontFamily: style.fontFamily.heading }}
            >
              {slide.title}
            </h2>
          </div>
          
          {slide.subtitle && (
            <p
              className="px-12 mt-6 text-xl"
              style={{ 
                fontFamily: style.fontFamily.body,
                color: style.accentColor 
              }}
            >
              {slide.subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Content slide (default)
  return (
    <div 
      className="w-full h-full flex flex-col"
      style={{ backgroundColor: style.primaryColor }}
    >
      {/* Brand mark */}
      <div 
        className="text-xs font-bold px-10 pt-4"
        style={{ color: style.accentColor }}
      >
        PIXIS
      </div>
      
      {/* Header bar */}
      <div
        className="mt-2 py-4 px-10"
        style={{ backgroundColor: style.secondaryColor }}
      >
        <h2
          className="text-white font-bold text-2xl leading-tight"
          style={{ fontFamily: style.fontFamily.heading }}
        >
          {slide.title}
        </h2>
      </div>
      
      {/* Accent line */}
      <div 
        className="w-full h-0.5"
        style={{ backgroundColor: style.accentColor }}
      />
      
      {/* Content */}
      <div className="flex-1 px-10 py-6 overflow-hidden">
        {slide.content.map((block, i) => {
          if (block.type === 'bullets') {
            const bulletData = block.data as BulletContent;
            return (
              <div key={i} className="space-y-4">
                {bulletData.items.slice(0, 4).map((item, j) => (
                  <div key={j} className="flex items-start gap-4">
                    <span
                      className="shrink-0 w-3 h-3 rounded-full mt-1.5"
                      style={{ backgroundColor: style.accentColor }}
                    />
                    <p
                      className="text-white text-lg leading-relaxed"
                      style={{ fontFamily: style.fontFamily.body }}
                    >
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            );
          }
          return null;
        })}
      </div>
      
      {/* Footer */}
      <div className="px-10 py-3 flex items-center">
        <div 
          className="flex-1 h-0.5"
          style={{ backgroundColor: style.accentColor }}
        />
        <span className="text-white font-bold text-sm ml-4">{slide.order}</span>
      </div>
    </div>
  );
}
