import { v4 as uuidv4 } from 'uuid';
import { ChatLayout } from '@/src/components/templates';
import { ChatMessage } from '@/src/types';

// Generate initial welcome message on the server
function getWelcomeMessage(): ChatMessage {
  return {
    id: uuidv4(),
    role: 'assistant',
    content: `# Welcome to Pixis AI! 🎯

I'm your AI-powered presentation assistant. I can help you transform your business documents into polished, **McKinsey-style slide decks**.

**Here's how to get started:**

1. **Upload your documents** - RFPs, proposals, or technical documents (PDF or DOCX)
2. **Add a style guide** - Upload a brand guidelines document or reference slide deck (optional)
3. **Generate your deck** - I'll create a professional presentation based on your content

You can also chat with me to:
- Refine specific slides
- Adjust the tone or focus
- Add or remove sections
- Export your final presentation

**Ready to begin?** Upload your first document using the panel on the right, or just type a message!`,
    timestamp: new Date(),
    status: 'sent',
  };
}

export default function Home() {
  const welcomeMessage = getWelcomeMessage();
  
  return <ChatLayout initialMessage={welcomeMessage} />;
}
