'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { ScrollArea, ScrollBar } from '@/src/components/ui/scroll-area';
import { SlidePreview } from '@/src/components/molecules';
import { GeneratedDeck, SlideContent, BulletContent } from '@/src/types';

interface SlideCarouselProps {
  deck: GeneratedDeck;
  onExport: () => void;
  onRegenerate: () => void;
  isExporting: boolean;
}

// Virtual slide dimensions (like a real PPT slide)
const SLIDE_WIDTH = 960;
const SLIDE_HEIGHT = 540;

export function SlideCarousel({
  deck,
  onExport,
  onRegenerate,
  isExporting,
}: SlideCarouselProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeSlide = deck.slides[activeSlideIndex];

  // Calculate scale to fit slide in container
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 100; // Account for nav buttons
        const containerHeight = containerRef.current.clientHeight - 20;
        
        const scaleX = containerWidth / SLIDE_WIDTH;
        const scaleY = containerHeight / SLIDE_HEIGHT;
        
        setScale(Math.min(scaleX, scaleY, 1)); // Never scale up, only down
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const goToPrevious = () => {
    setActiveSlideIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setActiveSlideIndex((prev) => Math.min(deck.slides.length - 1, prev + 1));
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-white/10 bg-black/20 shrink-0">
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-white text-sm truncate">{deck.title}</h2>
          <p className="text-xs text-white/60">
            {deck.slides.length} slides • Generated just now
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRegenerate}
            className="text-white/70 hover:text-white hover:bg-white/10 h-8 px-3"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Regenerate
          </Button>
          <Button
            size="sm"
            onClick={onExport}
            disabled={isExporting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-4 font-medium"
          >
            {isExporting ? (
              <div className="h-3.5 w-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
              <>
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download PPTX
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Slide View Area */}
      <div 
        ref={containerRef}
        className="flex-1 min-h-0 flex items-center justify-center relative"
      >
        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevious}
          disabled={activeSlideIndex === 0}
          className="absolute left-2 z-10 text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-20 h-12 w-12 rounded-full"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>

        {/* Scaled Slide Container */}
        <div 
          className="relative"
          style={{
            width: SLIDE_WIDTH * scale,
            height: SLIDE_HEIGHT * scale,
          }}
        >
          {/* The actual slide rendered at full size, then scaled */}
          <div
            className="absolute top-0 left-0 rounded-lg shadow-2xl overflow-hidden"
            style={{
              width: SLIDE_WIDTH,
              height: SLIDE_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              backgroundColor: deck.style.primaryColor,
            }}
          >
            <SlideFullView slide={activeSlide} style={deck.style} />
          </div>
          
          {/* Slide Counter */}
          <div 
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 rounded-full"
          >
            <span className="text-white font-medium text-xs">
              {activeSlideIndex + 1} / {deck.slides.length}
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          disabled={activeSlideIndex === deck.slides.length - 1}
          className="absolute right-2 z-10 text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-20 h-12 w-12 rounded-full"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>

      {/* Thumbnail Strip */}
      <div className="border-t border-white/10 p-3 shrink-0 bg-black/30">
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-1 justify-center">
            {deck.slides.map((slide, index) => (
              <div
                key={slide.id}
                onClick={() => setActiveSlideIndex(index)}
                className="shrink-0 cursor-pointer transition-transform hover:scale-105"
              >
                <SlidePreview
                  slide={slide}
                  style={deck.style}
                  isActive={index === activeSlideIndex}
                  size="sm"
                />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="bg-white/10" />
        </ScrollArea>
      </div>
    </div>
  );
}

// Full-size slide view component - renders at SLIDE_WIDTH x SLIDE_HEIGHT with dark theme
function SlideFullView({ slide, style }: { slide: SlideContent; style: GeneratedDeck['style'] }) {
  // Title slide
  if (slide.type === 'title') {
    return (
      <div
        className="w-full h-full flex flex-col px-12 py-10"
        style={{ backgroundColor: style.primaryColor }}
      >
        {/* Brand mark */}
        <div 
          className="text-sm font-bold mb-8"
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
          className="w-40 h-1 mt-auto mb-4"
          style={{ backgroundColor: style.accentColor }}
        />
        
        {/* Tagline */}
        <p 
          className="text-xl font-semibold"
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
          className="text-sm font-bold px-12 pt-6"
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
        
        {/* Footer */}
        <div className="px-12 py-4 flex items-center">
          <div 
            className="flex-1 h-0.5"
            style={{ backgroundColor: style.accentColor }}
          />
          <span className="text-white font-bold text-sm ml-4">{slide.order}</span>
        </div>
      </div>
    );
  }

  // Default content slide
  return (
    <div 
      className="w-full h-full flex flex-col"
      style={{ backgroundColor: style.primaryColor }}
    >
      {/* Brand mark */}
      <div 
        className="text-sm font-bold px-10 pt-4"
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
      
      {/* Content Area */}
      <div className="flex-1 overflow-hidden px-10 py-6">
        <div className="h-full overflow-y-auto">
          {slide.content.map((block, i) => {
            if (block.type === 'bullets') {
              const bulletData = block.data as BulletContent;
              return (
                <div key={i} className="space-y-4">
                  {bulletData.items.map((item, j) => (
                    <div key={j} className="flex items-start gap-4">
                      <span
                        className="shrink-0 w-3 h-3 rounded-full mt-1.5"
                        style={{ backgroundColor: style.accentColor }}
                      />
                      <div className="flex-1">
                        <p
                          className="text-white text-lg leading-relaxed"
                          style={{ fontFamily: style.fontFamily.body }}
                        >
                          {item.text}
                        </p>
                        {item.subItems && item.subItems.length > 0 && (
                          <div className="mt-2 ml-6 space-y-1">
                            {item.subItems.map((subItem, k) => (
                              <p
                                key={k}
                                className="text-gray-400 text-base"
                                style={{ fontFamily: style.fontFamily.body }}
                              >
                                – {subItem}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-10 py-3 flex items-center">
        <div
          className="flex-1 h-0.5"
          style={{ backgroundColor: style.accentColor }}
        />
        <span className="text-white font-bold text-sm ml-4">
          {slide.order}
        </span>
      </div>
    </div>
  );
}
