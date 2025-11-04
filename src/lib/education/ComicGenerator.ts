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

export class ComicGenerator {
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
   * Generates a comic-style explanation from educational content
   * 
   * @param options - Generation options including topic, concept, and explanation
   * @returns A complete comic explanation with panels and characters
   */
  public generateComicExplanation(options: IComicGenerationOptions): IComicExplanation {
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

    // Break down explanation into digestible parts
    const explanationParts = this.breakDownExplanation(explanation, panelCount);

    // Select characters based on count
    const characters = this.selectCharacters(characterCount);

    // Generate panels
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
  public generateQuickExplanation(
    concept: string,
    explanation: string
  ): IComicExplanation {
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
