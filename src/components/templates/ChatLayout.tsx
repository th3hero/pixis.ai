'use client';

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { X } from 'lucide-react';
import { Header, ChatWindow, DocumentPanel, SlideCarousel } from '@/src/components/organisms';
import { ChatMessage, UploadedDocument, GeneratedDeck, ChatAction } from '@/src/types';
import { Button } from '@/src/components/ui/button';

interface ChatLayoutProps {
  initialMessage: ChatMessage;
}

export function ChatLayout({ initialMessage }: ChatLayoutProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [currentDeck, setCurrentDeck] = useState<GeneratedDeck | null>(null);
  const [inputValue, setInputValue] = useState('');

  // Loading flags
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // UI toggles
  const [showExpandedSlides, setShowExpandedSlides] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Helper to add a message
  const addMessage = (content: string, action?: ChatAction) => {
    const msg: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      status: 'sent',
      metadata: action ? { action } : undefined,
    };
    setMessages(prev => [...prev, msg]);
    return msg;
  };

  const handleUpload = useCallback(async (file: File, type: UploadedDocument['type']) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const result = await res.json();

      if (result.success && result.document) {
        setDocuments(prev => [...prev, result.document]);

        const hint = documents.length === 0
          ? 'Upload more documents or click "Generate Presentation" when ready.'
          : '';
        addMessage(`✅ **${result.document.name}** uploaded successfully!\n\nI've extracted the content and it's ready for analysis. ${hint}`);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      addMessage(`❌ Failed to upload document: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  }, [documents.length]);

  const handleRemoveDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  }, []);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsProcessing(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          documents,
          previousMessages: messages,
          currentDeck,
        }),
      });

      const result = await res.json();

      if (result.success && result.message) {
        setMessages(prev => [...prev, result.message]);

        // Trigger actions if needed
        if (result.action?.type === 'generate') {
          await handleGenerate();
        } else if (result.action?.type === 'export' && currentDeck) {
          await handleExport();
        }
      } else {
        throw new Error(result.error || 'Failed to process message');
      }
    } catch (err) {
      addMessage(`I apologize, but I encountered an error: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  }, [inputValue, isProcessing, documents, messages, currentDeck]);

  const handleGenerate = useCallback(async () => {
    if (!documents.length) return;

    setIsGenerating(true);
    addMessage(`🎨 **Generating your presentation...**\n\nI'm analyzing your documents and creating McKinsey-style slides. This may take a moment.`);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents, options: { slideCount: 5, tone: 'executive' } }),
      });

      const result = await res.json();

      if (result.success && result.deck) {
        setCurrentDeck(result.deck);
        addMessage(
          `✨ **Presentation Generated!**\n\nI've created a ${result.deck.slides.length}-slide deck titled "${result.deck.title}".\n\nYou can:\n- **Preview** the slides in the panel on the right\n- **Download** as PPTX\n- **Refine** specific slides by telling me what to change\n\nWhat would you like to do next?`,
          'generate'
        );
      } else {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (err) {
      addMessage(`❌ Failed to generate presentation: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  }, [documents]);

  const handleExport = useCallback(async () => {
    if (!currentDeck) return;

    setIsExporting(true);
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deck: currentDeck }),
      });

      if (!res.ok) throw new Error('Export failed');

      // Trigger download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentDeck.title.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addMessage(`📥 **Download started!**\n\nYour presentation "${currentDeck.title}" is being downloaded as a PPTX file.`);
    } catch (err) {
      addMessage(`❌ Failed to export: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  }, [currentDeck]);

  const handleAction = useCallback((action: string) => {
    if (action === 'generate') handleGenerate();
    else if (action === 'export') handleExport();
  }, [handleGenerate, handleExport]);

  return (
    <div className="h-screen flex flex-col bg-gradient-dark">
      <Header onMenuToggle={() => setShowMobileSidebar(true)} documentsCount={documents.length} />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 h-full">
            <ChatWindow
              messages={messages}
              isProcessing={isProcessing}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSend={handleSend}
              onAction={handleAction}
            />
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:block w-80 xl:w-96 border-l border-border bg-sidebar shrink-0">
          <DocumentPanel
            documents={documents}
            onUpload={handleUpload}
            onRemove={handleRemoveDocument}
            onGenerate={handleGenerate}
            isUploading={isUploading}
            isGenerating={isGenerating}
            canGenerate={documents.length > 0}
            currentDeck={currentDeck}
            onExport={handleExport}
            isExporting={isExporting}
            onExpandSlides={() => setShowExpandedSlides(true)}
          />
        </div>

        {/* Mobile sidebar */}
        {showMobileSidebar && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMobileSidebar(false)}
          >
            <div
              className="absolute right-0 top-0 h-full w-full max-w-sm bg-sidebar border-l border-border shadow-2xl animate-in slide-in-from-right duration-300"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Documents</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowMobileSidebar(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="h-[calc(100%-65px)]">
                <DocumentPanel
                  documents={documents}
                  onUpload={handleUpload}
                  onRemove={handleRemoveDocument}
                  onGenerate={() => { handleGenerate(); setShowMobileSidebar(false); }}
                  isUploading={isUploading}
                  isGenerating={isGenerating}
                  canGenerate={documents.length > 0}
                  currentDeck={currentDeck}
                  onExport={handleExport}
                  isExporting={isExporting}
                  onExpandSlides={() => { setShowExpandedSlides(true); setShowMobileSidebar(false); }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen slide viewer */}
        {showExpandedSlides && currentDeck && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowExpandedSlides(false)}
          >
            <div
              className="w-full max-w-5xl h-[80vh] bg-card rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="h-full relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowExpandedSlides(false)}
                  className="absolute top-2 right-2 z-10 text-white/70 hover:text-white hover:bg-white/10 h-10 w-10 rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
                <SlideCarousel
                  deck={currentDeck}
                  onExport={handleExport}
                  onRegenerate={handleGenerate}
                  isExporting={isExporting}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
