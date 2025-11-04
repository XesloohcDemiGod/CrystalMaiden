import { Vector3, Quaternion } from 'three';

// Core Types
export interface WorldState {
  time: number;
  entities: Map<string, Entity>;
  resources: Map<string, Resource>;
  environment: EnvironmentState;
}

export interface Entity {
  id: string;
  position: Vector3;
  health: number;
  state: string;
  tags: Set<string>;
}

export interface Resource {
  id: string;
  position: Vector3;
  available: boolean;
  type: string;
  quantity: number;
}

export interface EnvironmentState {
  timeOfDay: number;
  weather: string;
  visibility: number;
  temperature: number;
  humidity: number;
}

// AI Types

export interface AgentState {
  type: string;
  data: Record<string, any>;
  timestamp: number;
}

export interface Goal {
  id: string;
  priority: number;
  preconditions: Set<string>;
  effects: Set<string>;
  utility: (state: WorldState) => number;
  deadline?: number;
  dependencies: Set<string>;
}

export interface Plan {
  id: string;
  goals: Goal[];
  actions: PlanAction[];
  status: PlanStatus;
  utility: number;
  startTime: number;
  estimatedDuration: number;
}

export interface PlanAction {
  id: string;
  type: string;
  parameters: Record<string, any>;
  preconditions: Set<string>;
  effects: Set<string>;
  startTime: number;
  duration: number;
  status: ActionStatus;
}

// Decision System Types
export interface FuzzySet {
  name: string;
  membershipFunction: (value: number) => number;
  domain: [number, number];
}

export interface FuzzyRule {
  id: string;
  antecedents: FuzzyAntecedent[];
  consequent: FuzzyConsequent;
  weight: number;
}

export interface FuzzyAntecedent {
  variable: string;
  set: string;
  operator: 'AND' | 'OR' | 'NOT';
}

export interface FuzzyConsequent {
  variable: string;
  set: string;
  value: number;
}

// Environment Types
export interface WeatherCondition {
  type: string;
  intensity: number;
  coverage: number;
  duration: number;
}

export interface FluidParticle {
  position: Vector3;
  velocity: Vector3;
  density: number;
  pressure: number;
  temperature: number;
}

// Spatial Types
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpatialNode<T> {
  boundary: BoundingBox;
  items: T[];
  children?: SpatialNode<T>[];
}

// Enums
export enum PlanStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum ActionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum WeatherType {
  CLEAR = 'CLEAR',
  CLOUDY = 'CLOUDY',
  RAIN = 'RAIN',
  STORM = 'STORM',
  SNOW = 'SNOW',
  FOG = 'FOG',
}

// Utility Types
export type Vector2D = { x: number; y: number };
export type UUID = string;
export type Timestamp = number;

// Event Types
export interface SystemEvent {
  type: string;
  timestamp: Timestamp;
  data: any;
}

export interface AgentEvent extends SystemEvent {
  agentId: UUID;
  previousState?: AgentState;
  newState: AgentState;
}

// Performance Metrics
export interface PerformanceMetrics {
  fps: number;
  agentCount: number;
  activeGoals: number;
  completedGoals: number;
  failedGoals: number;
  averageUtility: number;
  systemLoad: number;
}

// Configuration Types
export interface SystemConfig {
  maxAgents: number;
  updateInterval: number;
  spatialGridSize: number;
  debugMode: boolean;
  performanceMetrics: boolean;
}

export interface AIConfig {
  swarmConfig: SwarmConfig;
  decisionConfig: DecisionConfig;
  planningConfig: PlanningConfig;
}

export interface SwarmConfig {
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
  maxSpeed: number;
  neighborhoodRadius: number;
}

export interface DecisionConfig {
  decisionRules: FuzzyRule[];
  decisionVariables: FuzzySet[];
  ruleWeight: number;
  defuzzificationMethod: string;
}

export interface PlanningConfig {
  maxGoals: number;
  planningHorizon: number;
  replanning: boolean;
  opportunisticPlanning: boolean;
}

// Input Types
export interface AISystemInputs {
  swarm: SwarmInputs;
  decision: DecisionInputs;
  environment: EnvironmentInputs;
}

export interface SwarmInputs {
  agentCount: number;
  spawnArea: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  roles: {
    name: string;
    distribution: number; // Percentage of total agents
    attributes: Map<string, number>;
  }[];
}

export interface DecisionInputs {
  rules: {
    id: string;
    antecedents: {
      variable: string;
      set: string;
      operator: 'AND' | 'OR' | 'NOT';
    }[];
    consequent: {
      variable: string;
      set: string;
      value: number;
    };
    weight: number;
  }[];
  variables: {
    name: string;
    sets: {
      name: string;
      domain: [number, number];
      type: 'triangle' | 'trapezoid';
      points: number[];
    }[];
  }[];
}

export interface EnvironmentInputs {
  timeScale: number;
  weatherEnabled: boolean;
  weatherPatterns: {
    type: string;
    probability: number;
    duration: [number, number];
  }[];
  resources: {
    type: string;
    spawnRate: number;
    maxCount: number;
    value: number;
  }[];
}

// Swarm Agent
export interface SwarmAgent {
  previousState: any;
  id: string;
  position: Vector3;
  velocity: Vector3;
  rotation: Quaternion;
  state: AgentState;
  role: string;
  neighbors: Set<string>;
  attributes: Map<string, number>;
}

// Comic Style Explanation Types
export enum PanelLayout {
  SINGLE = 'single',
  TWO_COLUMN = 'two_column',
  THREE_COLUMN = 'three_column',
  GRID = 'grid',
}

export enum SpeechBubbleType {
  THOUGHT = 'thought',
  SPEECH = 'speech',
  NARRATION = 'narration',
  EXCLAMATION = 'exclamation',
}

export interface IComicCharacter {
  id: string;
  name: string;
  role: 'student' | 'teacher' | 'explainer' | 'concept' | 'helper';
  appearance: {
    color: string;
    emoji?: string;
    style: 'simple' | 'detailed';
  };
  personality?: string[];
}

export interface ISpeechBubble {
  id: string;
  type: SpeechBubbleType;
  text: string;
  position: Vector2D;
  characterId?: string;
  arrow?: {
    direction: 'left' | 'right' | 'up' | 'down';
    target: Vector2D;
  };
}

export interface IPanelElement {
  type: 'character' | 'object' | 'diagram' | 'formula' | 'arrow' | 'label';
  id: string;
  position: Vector2D;
  size: Vector2D;
  content: string | any;
  style?: Record<string, any>;
}

export interface IComicPanel {
  id: string;
  order: number;
  layout: PanelLayout;
  elements: IPanelElement[];
  speechBubbles: ISpeechBubble[];
  background?: {
    color: string;
    pattern?: string;
  };
  title?: string;
}

export interface IComicExplanation {
  id: string;
  topic: string;
  concept: string;
  explanation: string;
  panels: IComicPanel[];
  characters: IComicCharacter[];
  style: {
    theme: 'light' | 'dark' | 'colorful';
    font: string;
    panelSpacing: number;
  };
  metadata: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    subject: string;
    estimatedTime: number;
    tags: string[];
  };
}

export interface IComicGenerationOptions {
  topic: string;
  concept: string;
  explanation: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  subject?: string;
  characterCount?: number;
  panelCount?: number;
  style?: 'simple' | 'detailed';
}
