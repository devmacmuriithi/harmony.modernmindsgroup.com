import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

// Multi-model LLM client supporting OpenAI and Gemini
// Uses DEFAULT_MODEL env variable (defaults to 'gemini')

type LLMModel = 'openai' | 'gemini';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionParams {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

interface ChatCompletionResponse {
  content: string;
}

class LLMClient {
  private model: LLMModel;
  private openai: OpenAI | null = null;
  private gemini: GoogleGenAI | null = null;

  constructor() {
    // Get model from environment variable, default to gemini
    const defaultModel = (process.env.DEFAULT_MODEL || 'gemini').toLowerCase();
    this.model = defaultModel === 'openai' ? 'openai' : 'gemini';

    console.log(`🤖 LLM Client initialized with model: ${this.model}`);

    // Initialize the selected model
    if (this.model === 'openai') {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not found in environment');
      }
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    } else {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not found in environment');
      }
      this.gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
  }

  async chatCompletion(params: ChatCompletionParams): Promise<ChatCompletionResponse> {
    if (this.model === 'openai') {
      return this.openaiChatCompletion(params);
    } else {
      return this.geminiChatCompletion(params);
    }
  }

  private async openaiChatCompletion(params: ChatCompletionParams): Promise<ChatCompletionResponse> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: params.messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 500
    });

    return {
      content: response.choices[0].message.content || ''
    };
  }

  private async geminiChatCompletion(params: ChatCompletionParams): Promise<ChatCompletionResponse> {
    if (!this.gemini) {
      throw new Error('Gemini client not initialized');
    }

    // Combine system and user messages for Gemini
    // Gemini uses a single prompt with system instructions
    const systemMessage = params.messages.find(m => m.role === 'system');
    const userMessages = params.messages.filter(m => m.role === 'user');
    
    const userPrompt = userMessages.map(m => m.content).join('\n\n');
    
    const response = await this.gemini.models.generateContent({
      model: 'gemini-2.0-flash-exp', // Using latest Gemini model
      config: {
        systemInstruction: systemMessage?.content,
        temperature: params.temperature ?? 0.7,
        maxOutputTokens: params.maxTokens ?? 500
      },
      contents: userPrompt
    });

    return {
      content: response.text || ''
    };
  }

  getModelName(): string {
    return this.model;
  }
}

// Export singleton instance
export const llmClient = new LLMClient();
