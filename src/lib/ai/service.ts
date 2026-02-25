// src/lib/ai/service.ts // AI provider selection (local-llama, etc.)
import { ReportGenerationParams } from '../openai/openai';
import { getActiveProvider, AIProviderConfig } from './config';

export interface AIResponse {
  content: string;
  provider: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export async function generateWithAI(
  prompt: string,
  params?: ReportGenerationParams
): Promise<AIResponse> {
  const provider = getActiveProvider();
  
  switch (provider.name) {
    case 'ollama-cloud':
      return generateWithOllamaCloud(prompt, provider);
    case 'deepseek':
      return generateWithDeepSeek(prompt, provider);
    case 'local-llama':
    default:
      return generateWithLocalLlama(prompt, provider);
  }
}

// Ollama Cloud Implementation
async function generateWithOllamaCloud(
  prompt: string,
  config: AIProviderConfig
): Promise<AIResponse> {
  try {
    const response = await fetch(`${config.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a regulatory intelligence expert for digital assets. Provide professional, accurate compliance guidance.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        max_tokens: config.maxTokens,
        temperature: config.temperature
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama Cloud API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      provider: 'ollama-cloud',
      usage: data.usage
    };
  } catch (error) {
    console.error('Ollama Cloud failed:', error);
    throw error;
  }
}

// DeepSeek Implementation
async function generateWithDeepSeek(
  prompt: string,
  config: AIProviderConfig
): Promise<AIResponse> {
  try {
    const response = await fetch(`${config.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a regulatory intelligence expert for digital assets. Provide professional, accurate compliance guidance.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        max_tokens: config.maxTokens,
        temperature: config.temperature
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      provider: 'deepseek',
      usage: data.usage
    };
  } catch (error) {
    console.error('DeepSeek failed:', error);
    throw error;
  }
}

// Local LLAMA (existing implementation, refactored)
async function generateWithLocalLlama(
  prompt: string,
  config: AIProviderConfig
): Promise<AIResponse> {
  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: config.temperature,
          max_tokens: config.maxTokens
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Local LLAMA error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.response,
      provider: 'local-llama',
      usage: {
        promptTokens: prompt.length / 4, // rough estimate
        completionTokens: data.response.length / 4,
        totalTokens: (prompt.length + data.response.length) / 4
      }
    };
  } catch (error) {
    console.error('Local LLAMA failed:', error);
    throw error;
  }
}