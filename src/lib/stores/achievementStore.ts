import { writable, derived } from 'svelte/store';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  rewards: {
    xp: number;
    items?: string[];
    badge?: string;
  };
  category: 'exploration' | 'combat' | 'puzzle' | 'social' | 'mastery';
  dateUnlocked?: Date;
}

const achievements: Achievement[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Begin your educational journey',
    icon: '🌟',
    rarity: 'common',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    rewards: { xp: 100 },
    category: 'exploration',
  },
  // Add 20+ more achievements...
];

function createAchievementStore() {
  const { subscribe, update } = writable(achievements);

  return {
    subscribe,
    unlock: (id: string) => {
      update(achievements =>
        achievements.map(a =>
          a.id === id ? { ...a, unlocked: true, dateUnlocked: new Date() } : a
        )
      );
    },
    updateProgress: (id: string, progress: number) => {
      update(achievements =>
        achievements.map(a => {
          if (a.id === id) {
            const newProgress = Math.min(a.maxProgress, progress);
            return {
              ...a,
              progress: newProgress,
              unlocked: newProgress >= a.maxProgress,
            };
          }
          return a;
        })
      );
    },
  };
}

export const achievementStore = createAchievementStore();

export const unlockedAchievements = derived(achievementStore, $achievements =>
  $achievements.filter(a => a.unlocked)
);
