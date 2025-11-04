<script lang="ts">
  import { onMount } from 'svelte';
  import type {
    IComicExplanation,
    IComicPanel,
    SpeechBubbleType,
    PanelLayout,
  } from '$lib/types';
  import { ComicGenerator } from '$lib/education/ComicGenerator';
  import { PanelLayout as PanelLayoutEnum, SpeechBubbleType as SpeechBubbleTypeEnum } from '$lib/types';

  export let comic: IComicExplanation | null = null;
  export let topic: string = '';
  export let concept: string = '';
  export let explanation: string = '';
  export let autoGenerate: boolean = true;

  let currentPanelIndex = 0;
  let generator: ComicGenerator;

  onMount(() => {
    generator = new ComicGenerator();
    
    if (autoGenerate && !comic && topic && concept && explanation) {
      comic = generator.generateComicExplanation({
        topic,
        concept,
        explanation,
        difficulty: 'beginner',
        panelCount: 4,
        characterCount: 2,
      });
    }
  });

  function regenerate() {
    if (generator && topic && concept && explanation) {
      comic = generator.generateComicExplanation({
        topic,
        concept,
        explanation,
        difficulty: 'beginner',
        panelCount: 4,
        characterCount: 2,
      });
      currentPanelIndex = 0;
    }
  }

  function nextPanel() {
    if (comic && currentPanelIndex < comic.panels.length - 1) {
      currentPanelIndex++;
    }
  }

  function previousPanel() {
    if (currentPanelIndex > 0) {
      currentPanelIndex--;
    }
  }

  function getBubbleClass(type: SpeechBubbleType): string {
    switch (type) {
      case SpeechBubbleTypeEnum.THOUGHT:
        return 'thought-bubble';
      case SpeechBubbleTypeEnum.EXCLAMATION:
        return 'exclamation-bubble';
      case SpeechBubbleTypeEnum.NARRATION:
        return 'narration-bubble';
      default:
        return 'speech-bubble';
    }
  }

  function getLayoutClass(layout: PanelLayout): string {
    switch (layout) {
      case PanelLayoutEnum.TWO_COLUMN:
        return 'two-column';
      case PanelLayoutEnum.THREE_COLUMN:
        return 'three-column';
      case PanelLayoutEnum.GRID:
        return 'grid';
      default:
        return 'single';
    }
  }
</script>

<div class="comic-explanation">
  {#if comic}
    <div class="comic-header">
      <h2 class="comic-title">{comic.topic}</h2>
      <p class="comic-concept">{comic.concept}</p>
      <div class="comic-metadata">
        <span class="difficulty">{comic.metadata.difficulty}</span>
        <span class="subject">{comic.metadata.subject}</span>
        <span class="time">~{comic.metadata.estimatedTime}s</span>
      </div>
    </div>

    <div class="comic-container">
      {#each comic.panels as panel, index}
        {#if index === currentPanelIndex}
          <div class="comic-panel {getLayoutClass(panel.layout)}" style="background-color: {panel.background?.color || '#fff'}">
            {#if panel.title}
              <h3 class="panel-title">{panel.title}</h3>
            {/if}
            
            <div class="panel-content">
              {#each panel.elements as element}
                {#if element.type === 'character'}
                  <div 
                    class="character" 
                    style="left: {element.position.x}px; top: {element.position.y}px; width: {element.size.x}px; height: {element.size.y}px;"
                  >
                    <div class="character-emoji" style="color: {element.style?.color || '#000'}">
                      {element.style?.emoji || '👤'}
                    </div>
                    {#if element.content.name}
                      <div class="character-name">{element.content.name}</div>
                    {/if}
                  </div>
                {:else if element.type === 'label'}
                  <div 
                    class="label" 
                    style="left: {element.position.x}px; top: {element.position.y}px; width: {element.size.x}px; height: {element.size.y}px; font-size: {element.style?.fontSize || '14px'}; font-weight: {element.style?.fontWeight || 'normal'};"
                  >
                    {element.content}
                  </div>
                {/if}
              {/each}

              {#each panel.speechBubbles as bubble}
                <div 
                  class="bubble {getBubbleClass(bubble.type)}" 
                  style="left: {bubble.position.x}px; top: {bubble.position.y}px;"
                >
                  <div class="bubble-text">{bubble.text}</div>
                  {#if bubble.type === SpeechBubbleTypeEnum.THOUGHT}
                    <div class="bubble-circles">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  {:else if bubble.type === SpeechBubbleTypeEnum.EXCLAMATION}
                    <div class="bubble-exclamation">!</div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}
      {/each}
    </div>

    <div class="comic-controls">
      <button 
        class="nav-button" 
        on:click={previousPanel} 
        disabled={currentPanelIndex === 0}
      >
        ← Previous
      </button>
      <div class="panel-indicator">
        Panel {currentPanelIndex + 1} of {comic.panels.length}
      </div>
      <button 
        class="nav-button" 
        on:click={nextPanel} 
        disabled={currentPanelIndex === comic.panels.length - 1}
      >
        Next →
      </button>
    </div>

    <div class="comic-actions">
      <button class="action-button" on:click={regenerate}>Regenerate Comic</button>
    </div>
  {:else if topic && concept && explanation}
    <div class="comic-placeholder">
      <p>Click "Generate Comic" to create a comic explanation</p>
      <button class="action-button" on:click={regenerate}>Generate Comic</button>
    </div>
  {:else}
    <div class="comic-placeholder">
      <p>Provide topic, concept, and explanation to generate a comic</p>
    </div>
  {/if}
</div>

<style>
  .comic-explanation {
    font-family: 'Comic Sans MS', 'Comic Neue', sans-serif;
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .comic-header {
    text-align: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e0e0e0;
  }

  .comic-title {
    font-size: 2rem;
    margin: 0 0 10px 0;
    color: #333;
  }

  .comic-concept {
    font-size: 1.2rem;
    color: #666;
    margin: 0 0 15px 0;
  }

  .comic-metadata {
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .comic-metadata span {
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: bold;
  }

  .difficulty {
    background: #e3f2fd;
    color: #1976d2;
  }

  .subject {
    background: #f3e5f5;
    color: #7b1fa2;
  }

  .time {
    background: #fff3e0;
    color: #f57c00;
  }

  .comic-container {
    min-height: 400px;
    position: relative;
    margin-bottom: 20px;
  }

  .comic-panel {
    width: 100%;
    min-height: 400px;
    border: 3px solid #333;
    border-radius: 8px;
    padding: 20px;
    position: relative;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .panel-title {
    text-align: center;
    margin: 0 0 20px 0;
    font-size: 1.3rem;
    color: #333;
  }

  .panel-content {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 300px;
  }

  .character {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .character-emoji {
    font-size: 4rem;
    margin-bottom: 5px;
  }

  .character-name {
    font-size: 0.9rem;
    font-weight: bold;
    color: #333;
  }

  .label {
    position: absolute;
    text-align: center;
    color: #333;
    font-weight: bold;
  }

  .bubble {
    position: absolute;
    max-width: 300px;
    padding: 15px;
    background: white;
    border: 3px solid #333;
    border-radius: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .speech-bubble {
    clip-path: polygon(
      0% 0%, 100% 0%, 100% 85%, 
      85% 100%, 80% 95%, 75% 100%, 
      0% 100%
    );
  }

  .thought-bubble {
    border-radius: 50%;
    position: relative;
  }

  .bubble-circles {
    position: absolute;
    bottom: -25px;
    left: 20px;
  }

  .bubble-circles span {
    display: inline-block;
    width: 8px;
    height: 8px;
    background: #333;
    border-radius: 50%;
    margin-right: 5px;
  }

  .exclamation-bubble {
    font-weight: bold;
    background: #fff3cd;
    border-color: #ffc107;
  }

  .bubble-exclamation {
    position: absolute;
    top: -10px;
    right: -10px;
    width: 30px;
    height: 30px;
    background: #ff5722;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
  }

  .narration-bubble {
    background: #f5f5f5;
    font-style: italic;
    border-style: dashed;
    text-align: center;
  }

  .bubble-text {
    font-size: 1rem;
    line-height: 1.4;
    color: #333;
  }

  .comic-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding: 15px;
    background: #f5f5f5;
    border-radius: 8px;
  }

  .nav-button {
    padding: 10px 20px;
    font-size: 1rem;
    font-family: 'Comic Sans MS', sans-serif;
    background: #4A90E2;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .nav-button:hover:not(:disabled) {
    background: #357ABD;
  }

  .nav-button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .panel-indicator {
    font-weight: bold;
    color: #666;
  }

  .comic-actions {
    margin-top: 20px;
    text-align: center;
  }

  .action-button {
    padding: 12px 24px;
    font-size: 1rem;
    font-family: 'Comic Sans MS', sans-serif;
    background: #7ED321;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .action-button:hover {
    background: #6AB817;
  }

  .comic-placeholder {
    text-align: center;
    padding: 60px 20px;
    color: #999;
  }

  /* Layout variants */
  .two-column {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .three-column {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 10px;
  }
</style>
