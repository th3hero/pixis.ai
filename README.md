# 🎯 Pixis AI

> AI-powered solution that transforms business documents (RFPs, proposals, technical documents) into polished, McKinsey-style slide decks.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?logo=google)](https://ai.google.dev/)

## ✨ Features

- **📄 Document Ingestion** - Upload PDF, DOCX, or PPTX files
- **🤖 AI-Powered Analysis** - Uses Google Gemini to analyze and extract key insights
- **🎨 McKinsey-Style Output** - Generates professional, executive-ready presentations
- **💬 Interactive Chat** - Refine and customize your slides through conversation
- **📊 Multiple Slide Types** - Title, Executive Summary, Content, Charts, Comparisons, and more
- **⬇️ PPTX Export** - Download your presentation as a PowerPoint file
- **🎯 Brand Style Support** - Upload style guides to match your brand identity

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/th3hero/pixis.ai.git
   cd pixis.ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 How to Use

1. **Upload Documents** - Click on the document panel (right side) and upload your RFP, proposal, or business document
2. **Add Style Guide** (Optional) - Upload a brand guidelines document or reference slide deck
3. **Generate Presentation** - Click "Generate Presentation" or ask the AI to create slides
4. **Preview & Refine** - View your slides and chat with the AI to make adjustments
5. **Export** - Download your presentation as a PPTX file

## 🏗️ Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 16 (App Router) | Full-stack React framework |
| UI Components | shadcn/ui + Tailwind CSS | Component library |
| State Management | React useState/useCallback | Local component state |
| AI/LLM | Google Gemini API | Document analysis & content generation |
| Document Parsing | unpdf, mammoth, jszip | PDF, DOCX, PPTX extraction |
| Slide Generation | pptxgenjs | PowerPoint file creation |

### Project Structure

```
pixis.ai/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── upload/               # Document upload & parsing
│   │   ├── generate/             # Slide generation
│   │   ├── export/               # PPTX export
│   │   └── chat/                 # Chat interactions
│   ├── page.tsx                  # Main page
│   └── globals.css               # Global styles
│
├── src/
│   ├── components/               # React Components (Atomic Design)
│   │   ├── atoms/                # Basic building blocks (Logo, Spinner)
│   │   ├── molecules/            # Combinations of atoms (ChatMessage, FileUploader)
│   │   ├── organisms/            # Complex UI sections (ChatWindow, DocumentPanel)
│   │   ├── templates/            # Page layouts (ChatLayout)
│   │   └── ui/                   # shadcn/ui components
│   │
│   ├── lib/                      # Core business logic
│   │   ├── parsers/              # Document parsing (PDF, DOCX, PPTX)
│   │   ├── ai/                   # AI/LLM integration
│   │   │   ├── gemini-client.ts  # Gemini API wrapper
│   │   │   ├── orchestrator.ts   # AI workflow orchestration
│   │   │   └── prompts/          # Prompt templates
│   │   └── slides/               # Slide generation engine
│   │
│   └── types/                    # TypeScript types
│
└── env.example                   # Environment variable template
```

## 🎨 Slide Types

Pixis AI generates the following slide types:

| Type | Description |
|------|-------------|
| **Title Slide** | Opening slide with presentation title and tagline |
| **Executive Summary** | Key takeaways and recommendations |
| **Agenda** | Outline of presentation structure |
| **Section Header** | Transition slides for new sections |
| **Content** | Standard content with bullets or text |
| **Two-Column** | Side-by-side comparison |
| **Chart** | Data visualization (bar, line, pie) |
| **Comparison** | Before/after or option comparison |
| **Key Takeaways** | Summary of main points |

## 🔧 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | - | Google Gemini API key |
| `NEXT_PUBLIC_APP_NAME` | No | Pixis AI | App name displayed in UI |
| `GEMINI_MODEL` | No | gemini-2.0-flash | Gemini model to use |
| `MAX_FILE_SIZE_MB` | No | 10 | Max upload size in MB |
| `AI_TEMPERATURE` | No | 0.7 | AI response creativity (0-1) |
| `AI_MAX_TOKENS` | No | 8192 | Max output tokens |

## ⚠️ Known Limitations

- **File Size**: Maximum 10MB per document
- **PDF Parsing**: Complex layouts may not extract perfectly
- **Rate Limits**: Free Gemini API has request limits
- **Chart Data**: Charts require structured data in source documents
- **Languages**: Currently optimized for English content

## 🗺️ Roadmap

- [ ] Multi-language support
- [ ] Custom slide templates
- [ ] Real-time collaboration
- [ ] Google Slides export
- [ ] Image extraction from documents
- [ ] Advanced chart generation
- [ ] User authentication & history

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Alok Kumar**
- GitHub: [@th3hero](https://github.com/th3hero)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Google Gemini](https://ai.google.dev/) - AI/LLM
- [pptxgenjs](https://gitbrent.github.io/PptxGenJS/) - PowerPoint generation
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [unpdf](https://github.com/nicholasgriffintn/unpdf) - PDF parsing

---

<p align="center">
  Made with ❤️ for the Pixis.ai GenAI Product Engineer Assignment
</p>
