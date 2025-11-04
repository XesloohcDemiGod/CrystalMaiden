/**
 * Comic Explanation Usage Example
 * 
 * This demonstrates how to integrate comic-style explanations into your educational app
 */

// Example: Using ComicExplanation component in a Svelte page
export const exampleUsage = `
<script lang="ts">
  import ComicExplanation from '$lib/components/education/ComicExplanation.svelte';
  
  let topic = 'Biology';
  let concept = 'Photosynthesis';
  let explanation = 'Photosynthesis is how plants make food using sunlight, water, and carbon dioxide.';
</script>

<ComicExplanation 
  {topic} 
  {concept} 
  {explanation} 
  autoGenerate={true} 
/>
`;

// Example: Using ComicGenerator programmatically
export const programmaticUsage = `
import { ComicGenerator } from '$lib/education/ComicGenerator';
import type { IComicExplanation } from '$lib/types';

const generator = new ComicGenerator();

const comic = generator.generateComicExplanation({
  topic: 'Mathematics',
  concept: 'Fractions',
  explanation: 'Fractions represent parts of a whole number.',
  difficulty: 'beginner',
  subject: 'mathematics',
  panelCount: 4,
  characterCount: 2,
});

// Use the comic object with your component
`;

// Example: Integrating with ContentManager
export const contentManagerIntegration = `
// In ContentManager.svelte, add comic type support:
{#if module.type === 'comic'}
  <ComicExplanation 
    topic={module.title}
    concept={module.content.concept}
    explanation={module.content.explanation}
  />
{/if}
`;
