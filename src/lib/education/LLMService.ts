/**
 * LLM Service for Comic Script Generation
 * 
 * Provides integration with various LLM providers (OpenAI, Anthropic, etc.)
 * to generate comic scripts from educational content.
 */

import type {
  IComicGenerationOptions,
  IComicPanel,
  IComicCharacter,
  ISpeechBubble,
  IPanelElement,
} from '../types/index';

export interface ILLMProvider {
  generateComicScript(options: IComicGenerationOptions): Promise<IComicScript>;
  generateText(prompt: string, options?: ILLMGenerateOptions): Promise<string>;
}

export interface ILLMGenerateOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface IComicScript {
  panels: IComicScriptPanel[];
  characters: IComicScriptCharacter[];
  narrative: string;
  style: {
    theme: string;
    tone: string;
  };
}

export interface IComicScriptPanel {
  order: number;
  title?: string;
  dialogue: IComicScriptDialogue[];
  visualDescription: string;
  elements: string[];
}

export interface IComicScriptDialogue {
  characterId: string;
  characterName: string;
  text: string;
  type: 'speech' | 'thought' | 'narration' | 'exclamation';
  emotion?: string;
}

export interface IComicScriptCharacter {
  id: string;
  name: string;
  role: 'student' | 'teacher' | 'explainer' | 'concept' | 'helper';
  description: string;
  personality: string[];
}

export interface ILLMConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  apiKey?: string;
  apiUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Base LLM Provider implementation
 */
export abstract class BaseLLMProvider implements ILLMProvider {
  protected config: ILLMConfig;

  constructor(config: ILLMConfig) {
    this.config = config;
  }

  abstract generateText(prompt: string, options?: ILLMGenerateOptions): Promise<string>;

  async generateComicScript(options: IComicGenerationOptions): Promise<IComicScript> {
    const prompt = this.buildComicScriptPrompt(options);
    const response = await this.generateText(prompt, {
      maxTokens: this.config.maxTokens || 2000,
      temperature: this.config.temperature || 0.7,
    });

    return this.parseComicScript(response, options);
  }

  protected buildComicScriptPrompt(options: IComicGenerationOptions): string {
    const {
      topic,
      concept,
      explanation,
      difficulty = 'beginner',
      panelCount = 4,
      characterCount = 2,
    } = options;

    return `You are a creative educational comic script writer. Generate a comic script that explains "${concept}" in the context of "${topic}".

Context:
- Topic: ${topic}
- Concept: ${concept}
- Explanation: ${explanation}
- Difficulty: ${difficulty}
- Number of panels: ${panelCount}
- Number of characters: ${characterCount}

Requirements:
1. Create ${panelCount} comic panels that progressively explain the concept
2. Use ${characterCount} characters (student, teacher, or guide)
3. Make it engaging, clear, and educational
4. Use dialogue that feels natural and age-appropriate for ${difficulty} level
5. Include visual descriptions for each panel
6. Vary speech bubble types (speech, thought, exclamation, narration)

Output format (JSON):
{
  "panels": [
    {
      "order": 1,
      "title": "Panel title",
      "dialogue": [
        {
          "characterId": "student",
          "characterName": "Student",
          "text": "Dialogue text",
          "type": "speech",
          "emotion": "curious"
        }
      ],
      "visualDescription": "Description of what should be shown",
      "elements": ["concept", "diagram", "arrow"]
    }
  ],
  "characters": [
    {
      "id": "student",
      "name": "Student",
      "role": "student",
      "description": "A curious student",
      "personality": ["curious", "eager"]
    }
  ],
  "narrative": "Overall narrative arc",
  "style": {
    "theme": "light",
    "tone": "friendly"
  }
}

Generate the comic script now:`;
  }

  protected parseComicScript(response: string, options: IComicGenerationOptions): IComicScript {
    try {
      // Try to extract JSON from response (handle markdown code blocks)
      let jsonStr = response.trim();
      
      // Remove markdown code blocks if present
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      // Try to find JSON object
      const jsonObjMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonObjMatch) {
        jsonStr = jsonObjMatch[0];
      }

      const script = JSON.parse(jsonStr);
      return this.validateAndNormalizeScript(script, options);
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      // Fallback to structured parsing
      return this.fallbackParse(response, options);
    }
  }

  protected validateAndNormalizeScript(
    script: any,
    options: IComicGenerationOptions
  ): IComicScript {
    // Ensure we have the required structure
    if (!script.panels || !Array.isArray(script.panels)) {
      script.panels = [];
    }

    if (!script.characters || !Array.isArray(script.characters)) {
      script.characters = [];
    }

    // Normalize panels
    script.panels = script.panels.map((panel: any, index: number) => ({
      order: panel.order ?? index + 1,
      title: panel.title,
      dialogue: Array.isArray(panel.dialogue) ? panel.dialogue : [],
      visualDescription: panel.visualDescription || '',
      elements: Array.isArray(panel.elements) ? panel.elements : [],
    }));

    // Normalize characters
    script.characters = script.characters.map((char: any) => ({
      id: char.id || char.name?.toLowerCase() || 'character',
      name: char.name || 'Character',
      role: char.role || 'student',
      description: char.description || '',
      personality: Array.isArray(char.personality) ? char.personality : [],
    }));

    return {
      panels: script.panels,
      characters: script.characters,
      narrative: script.narrative || '',
      style: script.style || { theme: 'light', tone: 'friendly' },
    };
  }

  protected fallbackParse(response: string, options: IComicGenerationOptions): IComicScript {
    // Simple fallback: break response into panels
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const panelsPerPanel = Math.ceil(sentences.length / (options.panelCount || 4));

    const panels: IComicScriptPanel[] = [];
    for (let i = 0; i < (options.panelCount || 4); i++) {
      const startIdx = i * panelsPerPanel;
      const dialogue = sentences.slice(startIdx, startIdx + panelsPerPanel).map((text, idx) => ({
        characterId: idx % 2 === 0 ? 'student' : 'teacher',
        characterName: idx % 2 === 0 ? 'Student' : 'Teacher',
        text: text.trim(),
        type: 'speech' as const,
      }));

      panels.push({
        order: i + 1,
        dialogue,
        visualDescription: `Panel ${i + 1} showing the concept explanation`,
        elements: [],
      });
    }

    return {
      panels,
      characters: [
        {
          id: 'student',
          name: 'Student',
          role: 'student',
          description: 'A curious student',
          personality: ['curious'],
        },
        {
          id: 'teacher',
          name: 'Teacher',
          role: 'teacher',
          description: 'An experienced teacher',
          personality: ['patient', 'knowledgeable'],
        },
      ],
      narrative: options.explanation,
      style: { theme: 'light', tone: 'friendly' },
    };
  }
}

/**
 * OpenAI LLM Provider
 */
export class OpenAILLMProvider extends BaseLLMProvider {
  async generateText(prompt: string, options?: ILLMGenerateOptions): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const apiUrl = this.config.apiUrl || 'https://api.openai.com/v1/chat/completions';
    const model = options?.model || this.config.model || 'gpt-3.5-turbo';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a creative educational comic script writer. Generate engaging, clear comic scripts that help students learn.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: options?.temperature ?? this.config.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? this.config.maxTokens ?? 2000,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw error;
    }
  }
}

/**
 * Anthropic LLM Provider
 */
export class AnthropicLLMProvider extends BaseLLMProvider {
  async generateText(prompt: string, options?: ILLMGenerateOptions): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const apiUrl = this.config.apiUrl || 'https://api.anthropic.com/v1/messages';
    const model = options?.model || this.config.model || 'claude-3-sonnet-20240229';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: options?.maxTokens ?? this.config.maxTokens ?? 2000,
          temperature: options?.temperature ?? this.config.temperature ?? 0.7,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Anthropic API error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      return data.content[0]?.text || '';
    } catch (error) {
      console.error('Anthropic API call failed:', error);
      throw error;
    }
  }
}

/**
 * Mock LLM Provider for testing/development
 */
export class MockLLMProvider extends BaseLLMProvider {
  async generateText(prompt: string, options?: ILLMGenerateOptions): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate a mock JSON response
    return JSON.stringify({
      panels: [
        {
          order: 1,
          title: `Understanding ${this.extractConcept(prompt)}`,
          dialogue: [
            {
              characterId: 'student',
              characterName: 'Student',
              text: `I want to learn about ${this.extractConcept(prompt)}!`,
              type: 'exclamation',
              emotion: 'excited',
            },
            {
              characterId: 'teacher',
              characterName: 'Teacher',
              text: 'Great! Let me explain it step by step.',
              type: 'speech',
              emotion: 'friendly',
            },
          ],
          visualDescription: 'A student and teacher in a classroom setting',
          elements: ['concept'],
        },
        {
          order: 2,
          title: 'The Basics',
          dialogue: [
            {
              characterId: 'teacher',
              characterName: 'Teacher',
              text: this.extractExplanation(prompt),
              type: 'speech',
              emotion: 'patient',
            },
          ],
          visualDescription: 'Visual representation of the concept',
          elements: ['diagram'],
        },
      ],
      characters: [
        {
          id: 'student',
          name: 'Student',
          role: 'student',
          description: 'A curious student eager to learn',
          personality: ['curious', 'eager'],
        },
        {
          id: 'teacher',
          name: 'Teacher',
          role: 'teacher',
          description: 'An experienced and patient teacher',
          personality: ['patient', 'knowledgeable'],
        },
      ],
      narrative: 'A friendly conversation explaining the concept',
      style: {
        theme: 'light',
        tone: 'friendly',
      },
    });
  }

  private extractConcept(prompt: string): string {
    const conceptMatch = prompt.match(/explains "([^"]+)"/);
    return conceptMatch ? conceptMatch[1] : 'this concept';
  }

  private extractExplanation(prompt: string): string {
    const explanationMatch = prompt.match(/Explanation: ([^\n]+)/);
    return explanationMatch ? explanationMatch[1] : 'This is an important concept to understand.';
  }
}

/**
 * LLM Service Factory
 */
export class LLMService {
  private provider: ILLMProvider;

  constructor(config: ILLMConfig) {
    switch (config.provider) {
      case 'openai':
        this.provider = new OpenAILLMProvider(config);
        break;
      case 'anthropic':
        this.provider = new AnthropicLLMProvider(config);
        break;
      case 'custom':
        // For custom providers, use mock as fallback
        this.provider = new MockLLMProvider(config);
        break;
      default:
        this.provider = new MockLLMProvider(config);
    }
  }

  async generateComicScript(options: IComicGenerationOptions): Promise<IComicScript> {
    return this.provider.generateComicScript(options);
  }

  async generateText(prompt: string, options?: ILLMGenerateOptions): Promise<string> {
    return this.provider.generateText(prompt, options);
  }
}
