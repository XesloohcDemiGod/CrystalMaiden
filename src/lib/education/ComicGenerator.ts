/**
 * ComicGenerator - Generates comic-style educational explanations
 * 
 * This class transforms educational content into engaging comic-style
 * visual explanations with panels, characters, and speech bubbles.
 */

import type {
  IComicExplanation,
  IComicPanel,
  IComicCharacter,
  ISpeechBubble,
  IPanelElement,
  PanelLayout,
  SpeechBubbleType,
  IComicGenerationOptions,
  Vector2D,
} from '../types/index';
import {
  LLMService,
  type ILLMConfig,
  type IComicScript,
  type IComicScriptPanel,
  type IComicScriptDialogue,
} from './LLMService';

export class ComicGenerator {
  private useLLM: boolean = false;
  private llmService: LLMService | null = null;

  private defaultCharacters: IComicCharacter[] = [
    {
      id: 'student',
      name: 'Student',
      role: 'student',
      appearance: {
        color: '#4A90E2',
        emoji: '🧑‍🎓',
        style: 'simple',
      },
      personality: ['curious', 'eager'],
    },
    {
      id: 'teacher',
      name: 'Teacher',
      role: 'teacher',
      appearance: {
        color: '#F5A623',
        emoji: '👨‍🏫',
        style: 'simple',
      },
      personality: ['patient', 'knowledgeable'],
    },
    {
      id: 'explainer',
      name: 'Guide',
      role: 'explainer',
      appearance: {
        color: '#7ED321',
        emoji: '🤖',
        style: 'simple',
      },
      personality: ['friendly', 'helpful'],
    },
  ];

  /**
   * Configures LLM service for comic script generation
   * 
   * @param config - LLM configuration
   */
  public configureLLM(config: ILLMConfig): void {
    this.llmService = new LLMService(config);
    this.useLLM = true;
  }

  /**
   * Disables LLM and uses rule-based generation
   */
  public disableLLM(): void {
    this.useLLM = false;
    this.llmService = null;
  }

  /**
   * Generates a comic-style explanation from educational content
   * 
   * @param options - Generation options including topic, concept, and explanation
   * @returns A complete comic explanation with panels and characters
   */
  public async generateComicExplanation(options: IComicGenerationOptions): Promise<IComicExplanation> {
    const {
      topic,
      concept,
      explanation,
      difficulty = 'beginner',
      subject = 'general',
      characterCount = 2,
      panelCount = 4,
      style = 'simple',
    } = options;

    // Use LLM if configured, otherwise use rule-based generation
    if (this.useLLM && this.llmService) {
      try {
        return await this.generateWithLLM(options);
      } catch (error) {
        console.warn('LLM generation failed, falling back to rule-based:', error);
        // Fall through to rule-based generation
      }
    }

    // Rule-based generation (original implementation)
    const explanationParts = this.breakDownExplanation(explanation, panelCount);
    const characters = this.selectCharacters(characterCount);
    const panels = this.generatePanels(
      explanationParts,
      characters,
      concept,
      panelCount,
      style
    );

    return {
      id: this.generateId(),
      topic,
      concept,
      explanation,
      panels,
      characters,
      style: {
        theme: this.selectTheme(difficulty),
        font: 'Comic Sans MS, sans-serif',
        panelSpacing: 20,
      },
      metadata: {
        difficulty,
        subject,
        estimatedTime: panelCount * 30, // ~30 seconds per panel
        tags: this.extractTags(topic, concept),
      },
    };
  }

  /**
   * Generates comic explanation using LLM
   */
  private async generateWithLLM(options: IComicGenerationOptions): Promise<IComicExplanation> {
    if (!this.llmService) {
      throw new Error('LLM service not configured');
    }

    const {
      topic,
      concept,
      explanation,
      difficulty = 'beginner',
      subject = 'general',
      panelCount = 4,
    } = options;

    // Generate script using LLM
    const script = await this.llmService.generateComicScript(options);

    // Convert LLM script to comic panels
    const panels = this.convertScriptToPanels(script, panelCount);
    const characters = this.convertScriptToCharacters(script);

    return {
      id: this.generateId(),
      topic,
      concept,
      explanation,
      panels,
      characters,
      style: {
        theme: script.style.theme as 'light' | 'dark' | 'colorful' || this.selectTheme(difficulty),
        font: 'Comic Sans MS, sans-serif',
        panelSpacing: 20,
      },
      metadata: {
        difficulty,
        subject,
        estimatedTime: panelCount * 30,
        tags: this.extractTags(topic, concept),
      },
    };
  }

  /**
   * Converts LLM script panels to comic panels
   */
  private convertScriptToPanels(script: IComicScript, panelCount: number): IComicPanel[] {
    const panels: IComicPanel[] = [];

    script.panels.forEach((scriptPanel: IComicScriptPanel, index: number) => {
      // Determine layout
      let layout: PanelLayout = PanelLayout.SINGLE;
      if (panelCount === 2) {
        layout = PanelLayout.TWO_COLUMN;
      } else if (panelCount >= 3) {
        layout = PanelLayout.THREE_COLUMN;
      }

      // Create panel elements
      const elements: IPanelElement[] = [];
      
      // Add characters from dialogue
      const characterIds = new Set(scriptPanel.dialogue.map(d => d.characterId));
      let charIndex = 0;
      characterIds.forEach(charId => {
        const char = script.characters.find(c => c.id === charId);
        if (char) {
          elements.push({
            type: 'character',
            id: `char-${index}-${charIndex}`,
            position: { x: 50 + charIndex * 150, y: 50 },
            size: { x: 100, y: 100 },
            content: this.convertScriptCharacter(char),
            style: {
              emoji: this.getCharacterEmoji(char.role),
              color: this.getCharacterColor(char.role),
            },
          });
          charIndex++;
        }
      });

      // Add title if present
      if (scriptPanel.title) {
        elements.push({
          type: 'label',
          id: `title-${index}`,
          position: { x: 50, y: 20 },
          size: { x: 200, y: 30 },
          content: scriptPanel.title,
          style: {
            fontSize: '18px',
            fontWeight: 'bold',
          },
        });
      }

      // Create speech bubbles from dialogue
      const speechBubbles: ISpeechBubble[] = scriptPanel.dialogue.map((dialogue: IComicScriptDialogue, dIndex: number) => {
        const bubbleType = this.mapDialogueTypeToBubbleType(dialogue.type);
        return {
          id: `bubble-${index}-${dIndex}`,
          type: bubbleType,
          text: dialogue.text,
          position: { x: 180 + dIndex * 10, y: 60 + dIndex * 80 },
          characterId: dialogue.characterId,
        };
      });

      // Add narration if present
      if (index === script.panels.length - 1 && script.narrative) {
        speechBubbles.push({
          id: `narration-${index}`,
          type: SpeechBubbleType.NARRATION,
          text: script.narrative,
          position: { x: 50, y: 180 },
        });
      }

      panels.push({
        id: `panel-${index}`,
        order: scriptPanel.order ?? index,
        layout,
        elements,
        speechBubbles,
        background: {
          color: this.getBackgroundColor(index, 'simple'),
        },
        title: scriptPanel.title,
      });
    });

    return panels;
  }

  /**
   * Converts LLM script characters to comic characters
   */
  private convertScriptToCharacters(script: IComicScript): IComicCharacter[] {
    return script.characters.map(char => this.convertScriptCharacter(char));
  }

  /**
   * Converts script character to comic character
   */
  private convertScriptCharacter(char: any): IComicCharacter {
    return {
      id: char.id,
      name: char.name,
      role: char.role,
      appearance: {
        color: this.getCharacterColor(char.role),
        emoji: this.getCharacterEmoji(char.role),
        style: 'simple',
      },
      personality: char.personality || [],
    };
  }

  /**
   * Maps dialogue type to speech bubble type
   */
  private mapDialogueTypeToBubbleType(type: string): SpeechBubbleType {
    switch (type.toLowerCase()) {
      case 'thought':
        return SpeechBubbleType.THOUGHT;
      case 'exclamation':
        return SpeechBubbleType.EXCLAMATION;
      case 'narration':
        return SpeechBubbleType.NARRATION;
      default:
        return SpeechBubbleType.SPEECH;
    }
  }

  /**
   * Gets emoji for character role
   */
  private getCharacterEmoji(role: string): string {
    switch (role) {
      case 'student':
        return '🧑‍🎓';
      case 'teacher':
        return '👨‍🏫';
      case 'explainer':
        return '🤖';
      default:
        return '👤';
    }
  }

  /**
   * Gets color for character role
   */
  private getCharacterColor(role: string): string {
    switch (role) {
      case 'student':
        return '#4A90E2';
      case 'teacher':
        return '#F5A623';
      case 'explainer':
        return '#7ED321';
      default:
        return '#999999';
    }
  }

  /**
   * Breaks down explanation text into parts for different panels
   */
  private breakDownExplanation(explanation: string, panelCount: number): string[] {
    const sentences = explanation.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const parts: string[] = [];
    const sentencesPerPanel = Math.max(1, Math.ceil(sentences.length / panelCount));

    for (let i = 0; i < sentences.length; i += sentencesPerPanel) {
      const chunk = sentences.slice(i, i + sentencesPerPanel).join('. ').trim();
      if (chunk) {
        parts.push(chunk + '.');
      }
    }

    // Ensure we have at least panelCount panels
    while (parts.length < panelCount && parts.length > 0) {
      parts.push(parts[parts.length - 1]);
    }

    return parts.slice(0, panelCount);
  }

  /**
   * Selects characters to use in the comic
   */
  private selectCharacters(count: number): IComicCharacter[] {
    return this.defaultCharacters.slice(0, Math.min(count, this.defaultCharacters.length));
  }

  /**
   * Generates comic panels from explanation parts
   */
  private generatePanels(
    explanationParts: string[],
    characters: IComicCharacter[],
    concept: string,
    panelCount: number,
    style: 'simple' | 'detailed'
  ): IComicPanel[] {
    const panels: IComicPanel[] = [];

    explanationParts.forEach((part, index) => {
      const isFirst = index === 0;
      const isLast = index === explanationParts.length - 1;
      const character = characters[index % characters.length];

      // Determine layout based on panel position
      let layout: PanelLayout = PanelLayout.SINGLE;
      if (panelCount === 2) {
        layout = PanelLayout.TWO_COLUMN;
      } else if (panelCount >= 3) {
        layout = PanelLayout.THREE_COLUMN;
      }

      // Create panel elements
      const elements: IPanelElement[] = [
        {
          type: 'character',
          id: `char-${index}`,
          position: { x: 50, y: 50 },
          size: { x: 100, y: 100 },
          content: character,
          style: {
            emoji: character.appearance.emoji,
            color: character.appearance.color,
          },
        },
      ];

      // Add concept visualization if first panel
      if (isFirst) {
        elements.push({
          type: 'label',
          id: `concept-${index}`,
          position: { x: 50, y: 20 },
          size: { x: 200, y: 30 },
          content: concept,
          style: {
            fontSize: '18px',
            fontWeight: 'bold',
          },
        });
      }

      // Create speech bubbles
      const speechBubbles: ISpeechBubble[] = [
        {
          id: `bubble-${index}`,
          type: this.determineBubbleType(index, isLast),
          text: part,
          position: { x: 180, y: 60 },
          characterId: character.id,
        },
      ];

      // Add narration for last panel
      if (isLast) {
        speechBubbles.push({
          id: `narration-${index}`,
          type: SpeechBubbleType.NARRATION,
          text: 'Remember: Understanding takes practice!',
          position: { x: 50, y: 180 },
        });
      }

      panels.push({
        id: `panel-${index}`,
        order: index,
        layout,
        elements,
        speechBubbles,
        background: {
          color: this.getBackgroundColor(index, style),
        },
        title: isFirst ? `Learning: ${concept}` : undefined,
      });
    });

    return panels;
  }

  /**
   * Determines the type of speech bubble based on context
   */
  private determineBubbleType(index: number, isLast: boolean): SpeechBubbleType {
    if (index === 0) {
      return SpeechBubbleType.EXCLAMATION;
    }
    if (isLast) {
      return SpeechBubbleType.THOUGHT;
    }
    return SpeechBubbleType.SPEECH;
  }

  /**
   * Gets background color for panel
   */
  private getBackgroundColor(index: number, style: 'simple' | 'detailed'): string {
    const colors = [
      '#F8F9FA',
      '#E8F4F8',
      '#FFF4E6',
      '#F0F8E8',
    ];
    return colors[index % colors.length];
  }

  /**
   * Selects theme based on difficulty
   */
  private selectTheme(difficulty: 'beginner' | 'intermediate' | 'advanced'): 'light' | 'dark' | 'colorful' {
    switch (difficulty) {
      case 'beginner':
        return 'light';
      case 'intermediate':
        return 'colorful';
      case 'advanced':
        return 'dark';
      default:
        return 'light';
    }
  }

  /**
   * Extracts tags from topic and concept
   */
  private extractTags(topic: string, concept: string): string[] {
    const topicWords = topic.toLowerCase().split(/\s+/);
    const conceptWords = concept.toLowerCase().split(/\s+/);
    return [...new Set([...topicWords, ...conceptWords].filter(w => w.length > 3))];
  }

  /**
   * Generates a unique ID
   */
  private generateId(): string {
    return `comic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generates a simple comic explanation for quick concepts
   */
  public async generateQuickExplanation(
    concept: string,
    explanation: string
  ): Promise<IComicExplanation> {
    return this.generateComicExplanation({
      topic: concept,
      concept,
      explanation,
      difficulty: 'beginner',
      panelCount: 3,
      characterCount: 2,
    });
  }
}
