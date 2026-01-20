# DeckForge AI - Project Documentation

## 📋 Project Overview

**Project Name:** DeckForge AI  
**Purpose:** AI-powered solution that transforms business documents (RFPs, proposals, technical documents) into polished, McKinsey-style slide decks.  
**Interview Task For:** Pixis.ai - Generative-AI Product Engineer Role  
**Duration:** 2 days (self-paced)

---

## 🎯 Task Requirements

### From Pixis.ai Assignment

#### 1. Technical Approach (2-3 pages)
- [ ] Document-ingestion pipeline (file formats, parsing strategy)
- [ ] LLM orchestration: prompt flow, RAG, summarization logic
- [ ] Slide-layout engine: page hierarchy, headline style, charts vs. bullets
- [ ] Safeguards for brand voice, confidentiality, and hallucination control

#### 2. Prototype or Demo
- [ ] Interactive chat interface or minimal web app
- [ ] Accepts sample RFP (PDF or DOCX) plus brand-style guide
- [ ] Returns at least 5 auto-generated slides (PPTX)
- [ ] Screen-capture video (≤ 5 min) walking through proof-of-concept

#### 3. README
- [ ] Quick-start steps and dependencies
- [ ] Known limitations and next-step roadmap

### Deliverables
1. Technical Approach PDF
2. Website URL / Drive link to prototype / video
3. Sample slide deck produced by system (PPTX or PDF)

---

## 🏗️ Architecture

### Tech Stack
| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 16 (App Router) | SSR-first React framework |
| UI Components | shadcn/ui + Tailwind CSS | Component library |
| State Management | Zustand (minimal) | Client-side UI state only |
| Data Fetching | TanStack Query | Server state management |
| AI/LLM | Google Gemini API | Document analysis & content generation |
| Document Parsing | pdf-parse, mammoth, jszip | PDF, DOCX, PPTX extraction |
| Slide Generation | pptxgenjs | PowerPoint file creation |
| Deployment | Vercel | Hosting platform |

### Project Structure
```
pixis.ai/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── upload/route.ts       # Document upload handler
│   │   ├── analyze/route.ts      # Document analysis
│   │   ├── generate/route.ts     # Slide generation
│   │   ├── export/route.ts       # PPTX export
│   │   └── chat/route.ts         # Chat interactions
│   ├── page.tsx                  # Main page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── src/                          # Source code (modular)
│   ├── components/               # Atomic Design Pattern
│   │   ├── atoms/                # Basic building blocks
│   │   │   ├── Logo.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── TypingIndicator.tsx
│   │   ├── molecules/            # Combinations of atoms
│   │   │   ├── FileUploader.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   └── SlidePreview.tsx
│   │   ├── organisms/            # Complex UI sections
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── DocumentPanel.tsx
│   │   │   ├── SlideCarousel.tsx
│   │   │   └── Header.tsx
│   │   ├── templates/            # Page layouts
│   │   │   └── ChatLayout.tsx
│   │   └── ui/                   # shadcn components
│   │
│   ├── lib/                      # Core business logic
│   │   ├── parsers/              # Document parsing
│   │   │   ├── pdf-parser.ts
│   │   │   ├── docx-parser.ts
│   │   │   ├── pptx-parser.ts
│   │   │   └── index.ts
│   │   ├── ai/                   # AI/LLM integration
│   │   │   ├── gemini-client.ts
│   │   │   ├── orchestrator.ts
│   │   │   └── prompts/
│   │   │       ├── analyze-document.ts
│   │   │       ├── generate-slides.ts
│   │   │       ├── chat-response.ts
│   │   │       └── extract-style.ts
│   │   ├── slides/               # Slide generation
│   │   │   └── slide-engine.ts
│   │   ├── actions/              # Server actions
│   │   │   ├── document-actions.ts
│   │   │   ├── slide-actions.ts
│   │   │   └── chat-actions.ts
│   │   ├── providers/            # React providers
│   │   │   └── query-provider.tsx
│   │   └── utils.ts              # Utility functions
│   │
│   ├── hooks/                    # Custom React hooks
│   ├── store/                    # Zustand store
│   │   └── chat-store.ts
│   └── types/                    # TypeScript types
│       ├── document.ts
│       ├── slide.ts
│       ├── chat.ts
│       ├── style.ts
│       └── index.ts
│
├── docs/                         # Documentation
│   └── PROJECT_STATUS.md         # This file
├── public/                       # Static assets
└── Configuration files...
```

---

## 📊 Current Progress

### ✅ Completed

1. **Project Setup**
   - Next.js 16 with App Router
   - TypeScript configuration
   - Tailwind CSS + shadcn/ui
   - Path aliases configured (`@/src/*`)

2. **Type Definitions**
   - `document.ts` - UploadedDocument, ParsedDocument, DocumentSection
   - `slide.ts` - SlideContent, SlideStyle, GeneratedDeck, chart/table types
   - `chat.ts` - ChatMessage, ChatSession, ChatState
   - `style.ts` - BrandStyle, BrandColors, BrandTypography, MCKINSEY_STYLE defaults

3. **Document Parsers**
   - PDF parser using pdf-parse v2+ (PDFParse class API)
   - DOCX parser using mammoth
   - PPTX parser using jszip (style extraction + text extraction)

4. **AI Integration**
   - Gemini client setup
   - Prompt templates:
     - Document analysis
     - Slide generation (McKinsey style)
     - Chat response handling
     - Style extraction from guidelines
   - Orchestrator for AI workflow

5. **Slide Generation Engine**
   - PPTX generation using pptxgenjs
   - McKinsey-style templates:
     - Title slide
     - Executive summary
     - Agenda
     - Section header
     - Content slide
     - Two-column layout
     - Chart slide
     - Comparison slide
     - Key takeaways

6. **API Routes**
   - `/api/upload` - Document upload & parsing
   - `/api/generate` - Slide generation
   - `/api/export` - PPTX file export
   - `/api/chat` - Chat message processing

7. **UI Components (Atomic Design)**
   - Atoms: Logo, Spinner, TypingIndicator
   - Molecules: FileUploader, ChatMessage, SlidePreview
   - Organisms: ChatWindow, DocumentPanel, SlideCarousel, Header
   - Templates: ChatLayout

8. **State Management**
   - Zustand store for UI state (minimal)
   - Server-side state via API routes

### 🔄 In Progress

*Nothing currently in progress*

### ⏳ Pending

1. **Testing & Debugging**
   - Test document upload flow
   - Test slide generation
   - Test PPTX export
   - End-to-end flow testing

2. **UI Polish**
   - Mobile responsiveness
   - Error handling UI
   - Loading states
   - Animations

3. **Documentation**
   - Technical Approach document (2-3 pages)
   - README with quick-start
   - Demo video recording

4. **Deployment**
   - Vercel deployment
   - Environment variables setup
   - Production testing

---

## 🔧 Build Issues Log

### Current Issues

*No current issues - build successful!*

### Resolved Issues

1. ✅ Path alias issues (`@/` vs `@/src/`)
2. ✅ Regex `/s` flag not supported in ES2017 target
3. ✅ Buffer type incompatibility with NextResponse
4. ✅ ChatAction type narrowing
5. ✅ pdf-parse v2 API types (InfoResult.total, info.Title, getDateNode())

---

## 🔑 Environment Variables

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
NEXT_PUBLIC_APP_NAME=DeckForge AI
NEXT_PUBLIC_APP_URL=http://localhost:3000
MAX_FILE_SIZE_MB=10
```

---

## 📝 McKinsey Style Guidelines

The slide generation follows McKinsey consulting style:

1. **Headlines** - Action-oriented statements (not just topics)
2. **Pyramid Principle** - Lead with conclusion, then support
3. **Content Density** - 3-5 bullets per slide max
4. **Data-Driven** - Include specific numbers where available
5. **Single Message** - Each slide has one clear takeaway
6. **Action Verbs** - Use in recommendations

### Default Color Scheme
```typescript
{
  primary: '#003366',      // Deep blue
  secondary: '#0066CC',    // Bright blue
  accent: '#00A3E0',       // Light blue
  background: '#FFFFFF',   // White
  text: '#333333',         // Dark gray
  textLight: '#666666',    // Medium gray
}
```

### Default Typography
```typescript
{
  headingFont: 'Georgia',
  bodyFont: 'Arial',
  headingSizes: { h1: 44, h2: 32, h3: 24, h4: 20 },
  bodySizes: { large: 18, normal: 14, small: 12, caption: 10 },
}
```

---

## 🚀 Next Steps

1. Fix remaining build errors
2. Run dev server and test locally
3. Test with sample documents
4. Polish UI and UX
5. Write Technical Approach document
6. Record demo video
7. Deploy to Vercel
8. Submit deliverables

---

## 📚 References

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [pdf-parse](https://www.npmjs.com/package/pdf-parse)
- [pptxgenjs](https://gitbrent.github.io/PptxGenJS/)
- [Google Gemini API](https://ai.google.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

*Last Updated: January 20, 2026*
