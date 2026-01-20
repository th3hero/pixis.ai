import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

const DEFAULT_CONFIG: GenerationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
};

export function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export function getModel(modelName: string = 'gemini-1.5-flash'): GenerativeModel {
  const client = getGeminiClient();
  return client.getGenerativeModel({ 
    model: modelName,
    generationConfig: DEFAULT_CONFIG,
  });
}

export async function generateContent(
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
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

  const response = result.response;
  return response.text();
}

export async function generateStructuredContent<T>(
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
  }
): Promise<T> {
  const response = await generateContent(prompt, {
    ...options,
    temperature: options?.temperature ?? 0.3, // Lower temperature for structured output
  });
  
  // Extract JSON from response
  const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || 
                    response.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error('Failed to extract JSON from response');
  }
  
  const jsonStr = jsonMatch[1] || jsonMatch[0];
  return JSON.parse(jsonStr) as T;
}

export async function chat(
  messages: Array<{ role: 'user' | 'model'; content: string }>,
  options?: {
    model?: string;
    temperature?: number;
  }
): Promise<string> {
  const model = getModel(options?.model);
  
  const chat = model.startChat({
    history: messages.slice(0, -1).map(m => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      ...DEFAULT_CONFIG,
      temperature: options?.temperature ?? DEFAULT_CONFIG.temperature,
    },
  });

  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.content);
  
  return result.response.text();
}
