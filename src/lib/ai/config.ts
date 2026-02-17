// src/lib/ai/config.ts
export type AIProvider = 'ollama-cloud' | 'deepseek' | 'local-llama';

export interface AIProviderConfig {
  name: AIProvider;
  apiUrl: string;
  apiKey?: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export const providerConfigs: Record<AIProvider, AIProviderConfig> = {
  'ollama-cloud': {
    name: 'ollama-cloud',
    apiUrl: process.env.NEXT_PUBLIC_OLLAMA_CLOUD_URL || 'https://api.ollama.ai/v1',
    apiKey: process.env.NEXT_PUBLIC_OLLAMA_API_KEY,
    model: 'llama3.2',
    maxTokens: 4000,
    temperature: 0.7
  },
  'deepseek': {
    name: 'deepseek',
    apiUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY,
    model: 'deepseek-chat',
    maxTokens: 4000,
    temperature: 0.7
  },
  'local-llama': {
    name: 'local-llama',
    apiUrl: process.env.NEXT_PUBLIC_LOCAL_LLAMA_URL || 'http://localhost:11434/api/generate',
    apiKey: undefined,
    model: 'llama3',  // Using your installed model
    maxTokens: 4000,
    temperature: 0.7
  }
};

export function getActiveProvider(): AIProviderConfig {
  const provider = (process.env.NEXT_PUBLIC_AI_PROVIDER || 'local-llama') as AIProvider;
  return providerConfigs[provider];
}