/**
 * LLM Configuration Example
 * 
 * This file shows how to configure and use LLM for comic script generation
 */

import { ComicGenerator } from './ComicGenerator';
import type { ILLMConfig } from './LLMService';

/**
 * Example: Configure ComicGenerator with OpenAI
 */
export function configureWithOpenAI(apiKey: string): ComicGenerator {
  const generator = new ComicGenerator();
  
  const llmConfig: ILLMConfig = {
    provider: 'openai',
    apiKey: apiKey,
    model: 'gpt-3.5-turbo', // or 'gpt-4' for better quality
    temperature: 0.7,
    maxTokens: 2000,
  };

  generator.configureLLM(llmConfig);
  return generator;
}

/**
 * Example: Configure ComicGenerator with Anthropic Claude
 */
export function configureWithAnthropic(apiKey: string): ComicGenerator {
  const generator = new ComicGenerator();
  
  const llmConfig: ILLMConfig = {
    provider: 'anthropic',
    apiKey: apiKey,
    model: 'claude-3-sonnet-20240229',
    temperature: 0.7,
    maxTokens: 2000,
  };

  generator.configureLLM(llmConfig);
  return generator;
}

/**
 * Example: Use Mock LLM (for development/testing)
 */
export function configureWithMock(): ComicGenerator {
  const generator = new ComicGenerator();
  
  const llmConfig: ILLMConfig = {
    provider: 'custom', // Uses MockLLMProvider
  };

  generator.configureLLM(llmConfig);
  return generator;
}

/**
 * Example: Generate comic with LLM
 */
export async function generateComicWithLLM() {
  // Get API key from environment variable
  const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.warn('No API key found. Using mock LLM provider.');
    const generator = configureWithMock();
    return await generator.generateComicExplanation({
      topic: 'Biology',
      concept: 'Photosynthesis',
      explanation: 'Photosynthesis is how plants make food using sunlight.',
      difficulty: 'beginner',
      panelCount: 4,
    });
  }

  // Configure with OpenAI (or Anthropic)
  const generator = configureWithOpenAI(apiKey);
  
  return await generator.generateComicExplanation({
    topic: 'Biology',
    concept: 'Photosynthesis',
    explanation: 'Photosynthesis is how plants make food using sunlight, water, and carbon dioxide.',
    difficulty: 'beginner',
    subject: 'biology',
    panelCount: 4,
    characterCount: 2,
  });
}

/**
 * Example: Environment-based configuration
 */
export function createGeneratorFromEnv(): ComicGenerator {
  const generator = new ComicGenerator();
  
  const provider = process.env.LLM_PROVIDER || 'mock';
  const apiKey = process.env.LLM_API_KEY;
  
  if (provider === 'openai' && apiKey) {
    generator.configureLLM({
      provider: 'openai',
      apiKey,
      model: process.env.LLM_MODEL || 'gpt-3.5-turbo',
      temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '2000'),
    });
  } else if (provider === 'anthropic' && apiKey) {
    generator.configureLLM({
      provider: 'anthropic',
      apiKey,
      model: process.env.LLM_MODEL || 'claude-3-sonnet-20240229',
      temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '2000'),
    });
  } else {
    // Use mock for development
    generator.configureLLM({
      provider: 'custom',
    });
  }
  
  return generator;
}

/**
 * Example: Toggle LLM on/off
 */
export function toggleLLM(generator: ComicGenerator, enabled: boolean): void {
  if (enabled) {
    // Reconfigure with LLM if needed
    const apiKey = process.env.LLM_API_KEY;
    if (apiKey) {
      generator.configureLLM({
        provider: 'openai',
        apiKey,
      });
    }
  } else {
    generator.disableLLM();
  }
}
