import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';

// Singleton - we only need one client
let genAI: GoogleGenerativeAI | null = null;

const DEFAULT_CONFIG: GenerationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
};

export function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is not set');
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export function getModel(modelName?: string): GenerativeModel {
  const client = getGeminiClient();
  const name = modelName || process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  return client.getGenerativeModel({ model: name, generationConfig: DEFAULT_CONFIG });
}

export async function generateContent(
  prompt: string,
  options?: { model?: string; temperature?: number; maxTokens?: number }
): Promise<string> {
  const model = getModel(options?.model);
  
  const config: GenerationConfig = {
    ...DEFAULT_CONFIG,
    temperature: options?.temperature ?? DEFAULT_CONFIG.temperature,
    maxOutputTokens: options?.maxTokens ?? DEFAULT_CONFIG.maxOutputTokens,
  };

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: config,
  });

  return result.response.text();
}

/**
 * Same as generateContent but parses JSON from the response.
 * Uses lower temperature by default for more consistent output.
 */
export async function generateStructuredContent<T>(
  prompt: string,
  options?: { model?: string; temperature?: number }
): Promise<T> {
  const response = await generateContent(prompt, {
    ...options,
    temperature: options?.temperature ?? 0.3,
  });
  
  // Try to find JSON in markdown code block first, then raw JSON
  const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || response.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) throw new Error('Failed to extract JSON from response');
  
  const jsonStr = jsonMatch[1] || jsonMatch[0];
  return JSON.parse(jsonStr) as T;
}

export async function chat(
  messages: Array<{ role: 'user' | 'model'; content: string }>,
  options?: { model?: string; temperature?: number }
): Promise<string> {
  const model = getModel(options?.model);
  
  const chatSession = model.startChat({
    history: messages.slice(0, -1).map(m => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      ...DEFAULT_CONFIG,
      temperature: options?.temperature ?? DEFAULT_CONFIG.temperature,
    },
  });

  const lastMsg = messages[messages.length - 1];
  const result = await chatSession.sendMessage(lastMsg.content);
  
  return result.response.text();
}
