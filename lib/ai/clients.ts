import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

export type AIModel = 'gemini-1.5-flash' | 'gpt-4-turbo' | 'claude-3-opus' | 'deepseek-chat';

interface AIResponse {
  content: string;
  error?: string;
}

export class AIClientManager {
  private static instance: AIClientManager;
  private supabase = createClientComponentClient<Database>();
  private settings: Database['public']['Tables']['api_settings']['Row'] | null = null;

  private constructor() {}

  public static getInstance(): AIClientManager {
    if (!AIClientManager.instance) {
      AIClientManager.instance = new AIClientManager();
    }
    return AIClientManager.instance;
  }

  public async initialize(): Promise<void> {
    const { data, error } = await this.supabase
      .from('api_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching API settings:', error);
      return;
    }

    this.settings = data;
  }

  public async getClient(model?: AIModel): Promise<AIClient> {
    if (!this.settings) {
      await this.initialize();
    }

    const selectedModel = model || this.settings?.default_model as AIModel || 'gemini-1.5-flash';

    switch (selectedModel) {
      case 'gemini-1.5-flash':
        return new GeminiClient(this.settings?.gemini_api_key || '');
      case 'gpt-4-turbo':
        return new OpenAIClient(this.settings?.openai_api_key || '');
      case 'claude-3-opus':
        return new ClaudeClient(this.settings?.claude_api_key || '');
      case 'deepseek-chat':
        return new DeepseekClient(this.settings?.deepseek_api_key || '');
      default:
        throw new Error(`Unsupported model: ${selectedModel}`);
    }
  }
}

abstract class AIClient {
  protected apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  abstract generateText(prompt: string): Promise<AIResponse>;
}

class GeminiClient extends AIClient {
  async generateText(prompt: string): Promise<AIResponse> {
    if (!this.apiKey) {
      return { content: '', error: 'Gemini API key is not set' };
    }

    try {
      // Gemini APIは query parameter でAPI keyを渡す
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        return {
          content: '',
          error: `Gemini API error: ${errorData.error?.message || response.statusText}`
        };
      }

      const data = await response.json();
      console.log('Gemini API response:', data);
      
      // レスポンス構造をチェック
      if (!data.candidates || !data.candidates[0]) {
        return {
          content: '',
          error: 'Gemini API returned no candidates'
        };
      }
      
      if (!data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        return {
          content: '',
          error: 'Gemini API returned invalid content structure'
        };
      }
      
      return {
        content: data.candidates[0].content.parts[0].text
      };
    } catch (error) {
      console.error('Gemini client error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

class OpenAIClient extends AIClient {
  async generateText(prompt: string): Promise<AIResponse> {
    if (!this.apiKey) {
      return { content: '', error: 'OpenAI API key is not set' };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [{ role: 'user', content: prompt }],
        })
      });

      const data = await response.json();
      return {
        content: data.choices[0].message.content
      };
    } catch (error) {
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

class ClaudeClient extends AIClient {
  async generateText(prompt: string): Promise<AIResponse> {
    if (!this.apiKey) {
      return { content: '', error: 'Claude API key is not set' };
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 4096,
        })
      });

      const data = await response.json();
      return {
        content: data.content[0].text
      };
    } catch (error) {
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

class DeepseekClient extends AIClient {
  async generateText(prompt: string): Promise<AIResponse> {
    if (!this.apiKey) {
      return { content: '', error: 'Deepseek API key is not set' };
    }

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
        })
      });

      const data = await response.json();
      return {
        content: data.choices[0].message.content
      };
    } catch (error) {
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const aiManager = AIClientManager.getInstance();
