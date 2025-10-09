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
      // Try Gemini first, fallback to OpenAI if it fails
      try {
        return await this.geminiChatCompletion(params);
      } catch (error: any) {
        // Check if it's a quota/rate limit error
        if (error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
          console.warn('⚠️ Gemini quota exceeded, falling back to OpenAI...');
          
          // Initialize OpenAI if not already done
          if (!this.openai && process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
          }
          
          if (this.openai) {
            return await this.openaiChatCompletion(params);
          }
        }
        
        // Re-throw if not a quota error or no fallback available
        throw error;
      }
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

    // Sanitize response: strip markdown code fences that LLMs often add
    let content = response.text || '';
    const originalContent = content;
    content = this.sanitizeJsonResponse(content);
    
    // Log sanitization for debugging
    if (originalContent !== content) {
      console.log('🧹 Sanitized Gemini response');
      console.log('  Original length:', originalContent.length);
      console.log('  Sanitized length:', content.length);
      console.log('  First 200 chars:', content.substring(0, 200));
    }

    return {
      content
    };
  }

  // Remove markdown code fences and other formatting from JSON responses
  private sanitizeJsonResponse(text: string): string {
    let sanitized = text.trim();
    
    // Step 1: Remove all markdown code fences
    sanitized = sanitized.replace(/^```(?:json|javascript)?\s*/gi, '');
    sanitized = sanitized.replace(/```\s*$/g, '');
    sanitized = sanitized.replace(/```(?:json|javascript)?\s*/gi, '');
    sanitized = sanitized.replace(/```/g, '');
    sanitized = sanitized.trim();
    
    // Step 2: Collect ALL top-level JSON entities
    const entities: string[] = [];
    let i = 0;
    
    while (i < sanitized.length) {
      // Skip whitespace
      while (i < sanitized.length && /\s/.test(sanitized[i])) {
        i++;
      }
      
      if (i >= sanitized.length) break;
      
      // Check if we're at the start of a JSON entity
      if (sanitized[i] !== '[' && sanitized[i] !== '{') {
        // Not JSON, skip this character
        i++;
        continue;
      }
      
      const startChar = sanitized[i];
      let depth = 0;
      let jsonEnd = -1;
      let inString = false;
      let escapeNext = false;
      
      // Find the matching closing bracket/brace
      for (let j = i; j < sanitized.length; j++) {
        const char = sanitized[j];
        
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        
        if (char === '\\') {
          escapeNext = true;
          continue;
        }
        
        if (char === '"') {
          inString = !inString;
          continue;
        }
        
        if (inString) continue;
        
        if (char === '[' || char === '{') {
          depth++;
        } else if (char === ']' || char === '}') {
          depth--;
          if (depth === 0) {
            jsonEnd = j;
            break;
          }
        }
      }
      
      if (jsonEnd > i) {
        // Extract this JSON entity
        entities.push(sanitized.substring(i, jsonEnd + 1));
        i = jsonEnd + 1;
        
        // Skip comma if present
        while (i < sanitized.length && /[\s,]/.test(sanitized[i])) {
          i++;
        }
      } else {
        // Couldn't find matching brace, skip
        i++;
      }
    }
    
    // Step 3: Combine entities
    if (entities.length === 0) {
      return sanitized; // No valid JSON found
    } else if (entities.length === 1) {
      sanitized = entities[0];
    } else {
      // Multiple entities: wrap in array
      sanitized = '[' + entities.join(', ') + ']';
    }
    
    // Step 4: Remove trailing commas
    sanitized = sanitized.replace(/,\s*([}\]])/g, '$1');
    
    return sanitized.trim();
  }

  getModelName(): string {
    return this.model;
  }
}

// Export singleton instance
export const llmClient = new LLMClient();
