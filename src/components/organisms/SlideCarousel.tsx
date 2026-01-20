'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, RefreshCw, Maximize2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { ScrollArea, ScrollBar } from '@/src/components/ui/scroll-area';
import { SlidePreview } from '@/src/components/molecules';
import { GeneratedDeck, SlideContent, BulletContent } from '@/src/types';
import { cn } from '@/src/lib/utils';

interface SlideCarouselProps {
  deck: GeneratedDeck;
  onExport: () => void;
  onRegenerate: () => void;
  isExporting: boolean;
}

export function SlideCarousel({
  deck,
  onExport,
  onRegenerate,
  isExporting,
}: SlideCarouselProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const activeSlide = deck.slides[activeSlideIndex];

  const goToPrevious = () => {
    setActiveSlideIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setActiveSlideIndex((prev) => Math.min(deck.slides.length - 1, prev + 1));
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div>
          <h2 className="font-semibold text-white">{deck.title}</h2>
          <p className="text-sm text-gray-400">
            {deck.slides.length} slides • Generated just now
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Regenerate
          </Button>
          <Button
            size="sm"
            onClick={onExport}
            disabled={isExporting}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isExporting ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-1" />
                Download PPTX
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Slide View */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevious}
          disabled={activeSlideIndex === 0}
          className="absolute left-4 text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>

        {/* Active Slide */}
        <Card className="w-full max-w-4xl aspect-video bg-white shadow-2xl overflow-hidden">
          <SlideFullView slide={activeSlide} style={deck.style} />
        </Card>

        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          disabled={activeSlideIndex === deck.slides.length - 1}
          className="absolute right-4 text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>

        {/* Slide Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-800 rounded-full">
          <span className="text-white font-medium">
            {activeSlideIndex + 1} / {deck.slides.length}
          </span>
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="border-t border-gray-800 p-4">
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-2">
            {deck.slides.map((slide, index) => (
              <div
                key={slide.id}
                onClick={() => setActiveSlideIndex(index)}
                className="shrink-0"
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
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}

// Full-size slide view component
function SlideFullView({ slide, style }: { slide: SlideContent; style: GeneratedDeck['style'] }) {
  if (slide.type === 'title') {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center p-12"
        style={{ backgroundColor: style.primaryColor }}
      >
        <h1
          className="text-white font-bold text-center leading-tight"
          style={{ fontSize: '48px', fontFamily: style.fontFamily.heading }}
        >
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p
            className="text-white/80 text-center mt-4"
            style={{ fontSize: '24px', fontFamily: style.fontFamily.body }}
          >
            {slide.subtitle}
          </p>
        )}
        <p className="text-white/60 mt-8" style={{ fontSize: '14px' }}>
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>
    );
  }

  if (slide.type === 'section-header') {
    return (
      <div className="w-full h-full flex flex-col items-start justify-center p-12 bg-white">
        <div
          className="w-full py-4 px-8 -mx-8"
          style={{ backgroundColor: style.secondaryColor }}
        >
          <h2
            className="text-white font-bold"
            style={{ fontSize: '36px', fontFamily: style.fontFamily.heading }}
          >
            {slide.title}
          </h2>
        </div>
        {slide.subtitle && (
          <p
            className="mt-6"
            style={{ 
              fontSize: '18px', 
              fontFamily: style.fontFamily.body,
              color: style.primaryColor 
            }}
          >
            {slide.subtitle}
          </p>
        )}
      </div>
    );
  }

  // Default content slide
  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div
        className="px-8 py-4"
        style={{ backgroundColor: style.primaryColor }}
      >
        <h2
          className="text-white font-bold"
          style={{ fontSize: '24px', fontFamily: style.fontFamily.heading }}
        >
          {slide.title}
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-auto">
        {slide.content.map((block, i) => {
          if (block.type === 'bullets') {
            const bulletData = block.data as BulletContent;
            return (
              <div key={i} className="space-y-3">
                {bulletData.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <span
                      className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: style.accentColor }}
                    />
                    <div>
                      <p
                        style={{ 
                          fontSize: '16px', 
                          fontFamily: style.fontFamily.body,
                          color: style.primaryColor 
                        }}
                      >
                        {item.text}
                      </p>
                      {item.subItems && item.subItems.length > 0 && (
                        <div className="mt-2 ml-4 space-y-1">
                          {item.subItems.map((subItem, k) => (
                            <p
                              key={k}
                              className="text-gray-600"
                              style={{ fontSize: '14px', fontFamily: style.fontFamily.body }}
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

      {/* Footer */}
      <div className="px-8 py-3 border-t border-gray-100 flex justify-between items-center">
        <div
          className="h-0.5 flex-1 mr-4"
          style={{ backgroundColor: style.accentColor }}
        />
        <span
          className="text-sm font-medium"
          style={{ color: style.primaryColor }}
        >
          {slide.order}
        </span>
      </div>
    </div>
  );
}
