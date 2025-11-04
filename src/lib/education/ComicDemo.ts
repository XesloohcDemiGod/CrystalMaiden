/**
 * Comic Explanation Demo
 * 
 * This file demonstrates how to use the comic-style explanation generator
 * for educational content.
 */

import { ComicGenerator } from './ComicGenerator';
import type { IComicExplanation, IComicGenerationOptions } from '../types/index';

// Example 1: Simple concept explanation
export function generatePhotosynthesisComic(): IComicExplanation {
  const generator = new ComicGenerator();
  
  return generator.generateComicExplanation({
    topic: 'Biology',
    concept: 'Photosynthesis',
    explanation: 'Photosynthesis is how plants make food. They use sunlight, water, and carbon dioxide to create glucose and oxygen. This process happens in the leaves, specifically in structures called chloroplasts. The glucose gives the plant energy to grow, while oxygen is released into the air for us to breathe.',
    difficulty: 'beginner',
    subject: 'biology',
    panelCount: 4,
    characterCount: 2,
    style: 'simple',
  });
}

// Example 2: Math concept explanation
export function generateFractionsComic(): IComicExplanation {
  const generator = new ComicGenerator();
  
  return generator.generateComicExplanation({
    topic: 'Mathematics',
    concept: 'Fractions',
    explanation: 'A fraction represents parts of a whole. The top number is the numerator, showing how many parts we have. The bottom number is the denominator, showing how many parts make up the whole. For example, 3/4 means we have 3 out of 4 equal parts. Fractions help us describe quantities that are not whole numbers.',
    difficulty: 'beginner',
    subject: 'mathematics',
    panelCount: 4,
    characterCount: 2,
    style: 'simple',
  });
}

// Example 3: Physics concept explanation
export function generateGravityComic(): IComicExplanation {
  const generator = new ComicGenerator();
  
  return generator.generateComicExplanation({
    topic: 'Physics',
    concept: 'Gravity',
    explanation: 'Gravity is the force that pulls objects toward each other. Earth\'s gravity pulls everything toward its center, which is why things fall down and why we stay on the ground. The larger an object is, the stronger its gravitational pull. This is why Earth pulls us down, but we don\'t pull Earth up - Earth is much more massive than we are.',
    difficulty: 'intermediate',
    subject: 'physics',
    panelCount: 5,
    characterCount: 3,
    style: 'detailed',
  });
}

// Example 4: Quick explanation generator
export function generateQuickComic(concept: string, explanation: string): IComicExplanation {
  const generator = new ComicGenerator();
  return generator.generateQuickExplanation(concept, explanation);
}

// Example usage in a component or page
export const exampleConcepts = [
  {
    concept: 'Photosynthesis',
    explanation: 'Plants use sunlight to make food from water and carbon dioxide.',
  },
  {
    concept: 'Fractions',
    explanation: 'Fractions show parts of a whole number.',
  },
  {
    concept: 'Gravity',
    explanation: 'Gravity is the force that pulls objects toward each other.',
  },
];

/**
 * Generate comic explanations for multiple concepts
 */
export function generateMultipleComics(): IComicExplanation[] {
  const generator = new ComicGenerator();
  
  return exampleConcepts.map(({ concept, explanation }) =>
    generator.generateQuickExplanation(concept, explanation)
  );
}

/**
 * Example integration with educational content system
 */
export interface IEducationalContent {
  id: string;
  title: string;
  concept: string;
  explanation: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export function convertToComic(content: IEducationalContent): IComicExplanation {
  const generator = new ComicGenerator();
  
  return generator.generateComicExplanation({
    topic: content.title,
    concept: content.concept,
    explanation: content.explanation,
    difficulty: content.difficulty,
    subject: content.subject,
    panelCount: content.difficulty === 'advanced' ? 6 : 4,
    characterCount: content.difficulty === 'advanced' ? 3 : 2,
  });
}
