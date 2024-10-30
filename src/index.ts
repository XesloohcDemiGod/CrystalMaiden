// src/index.ts
import { SwarmIntelligenceSystem } from './lib/ai/SwarmIntelligence';
import { FuzzyDecisionSystem } from './lib/ai/FuzzyDecisionSystem';
import { Vector3, Quaternion } from 'three';
import {
  SwarmConfig,
  DecisionConfig,
  SwarmAgent,
  WorldState,
  SystemEvent,
  SwarmInputs,
  DecisionInputs,
  EnvironmentInputs,
} from './lib/types';
import { AISystemInputs } from './lib/types';
import { defaultInputs } from './config/defaultInput';
import { EventEmitter } from 'events';
export class AISystem extends EventEmitter {
  private swarmSystem: SwarmIntelligenceSystem;
  private decisionSystem: FuzzyDecisionSystem;
  private worldState!: WorldState;
  private isRunning!: boolean;
  private eventEmitter: EventEmitter;
  private statistics: Map<string, number>;

  constructor(inputs: AISystemInputs) {
      super();
    console.log('🚀 Initializing AI System...');
    
    // Initialize with inputs
                const swarmConfig = {
                    ...defaultInputs.swarm,
                    separationWeight: 1.0,
                    alignmentWeight: 1.0,
                    cohesionWeight: 1.0,
                    maxSpeed: 10,
                    neighborhoodRadius: 50
                };
                const decisionConfig = this.createDecisionConfig(defaultInputs.decision);
                this.swarmSystem = new SwarmIntelligenceSystem(swarmConfig);
                this.decisionSystem = new FuzzyDecisionSystem(decisionConfig);

                // Initialize agents based on inputs 
                if (inputs.swarm) {
      this.initializeAgents(inputs.swarm);
    }

    // Initialize environment
    this.initializeEnvironment(inputs.environment);

    console.log('✅ AI System initialized with:', {
      agentCount: inputs.swarm?.agentCount || 0,
      rules: inputs.decision?.rules.length || 0,
      variables: inputs.decision?.variables.length || 0
    });

    this.eventEmitter = new EventEmitter();
    this.statistics = new Map();
    this.initializeStatistics();
  }

    createSwarmConfig(swarm: SwarmInputs) {
        return swarm;
    }
    createDecisionConfig(decision: DecisionInputs): DecisionConfig {
        return {
            decisionRules: decision.rules,
            decisionVariables: decision.variables.map(variable => ({
                name: variable.name,
                membershipFunction: (x: number) => {
                    // Find the set that contains x
                    const set = variable.sets.find(s => 
                        x >= s.domain[0] && x <= s.domain[1]
                    );
                    if (!set) return 0;
                    
                    if (set.type === 'triangle') {
                        // Triangle membership calculation
                        const [a, b, c] = set.points;
                        if (x <= a || x >= c) return 0;
                        if (x <= b) return (x - a) / (b - a);
                        return (c - x) / (c - b);
                    } else {
                        // Trapezoid membership calculation
                        const [a, b, c, d] = set.points;
                        if (x <= a || x >= d) return 0;
                        if (x >= b && x <= c) return 1;
                        if (x < b) return (x - a) / (b - a);
                        return (d - x) / (d - c);
                    }
                },
                domain: variable.sets[0].domain // Use first set's domain
            })),
            ruleWeight: 1.0,
            defuzzificationMethod: 'centroid'
        };
    }

    private initializeEnvironment(environment: EnvironmentInputs): void {
        this.worldState = {
            ...this.initializeWorldState(),
            environment: {
                timeOfDay: 0,
                weather: 'clear',
                visibility: 1.0,
                temperature: 20,
                humidity: 0.5
            }
        };
    }

    public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('▶️ AI System started');
    this.update();
  }

  public stop(): void {
    this.isRunning = false;
    console.log('⏹️ AI System stopped');
  }

  public addAgent(agent: SwarmAgent): void {
    this.swarmSystem.addAgent(agent);
  }

  private update(): void {
    if (!this.isRunning) return;

    const deltaTime = 0.016; // 60fps
    
    // Log system status every 5 seconds (approximately 300 frames)
    if (Math.floor(Date.now() / 5000) !== Math.floor((Date.now() - deltaTime * 1000) / 5000)) {
      console.log('📊 System Status:', {
        agents: this.swarmSystem.getAgents().length,
        time: new Date(this.worldState.time).toISOString(),
        environment: this.worldState.environment
      });
    }

    this.swarmSystem.update(deltaTime);

    // Update each agent's decision
    this.swarmSystem.getAgents().forEach(async agent => {
      const decision = await this.decisionSystem.makeDecision({
        agentState: agent.state,
        worldState: this.worldState,
        nearbyEntities: this.swarmSystem.getNearbyEntities(agent.position, 5),
      });
      this.applyDecision(agent, decision);
    });

    // Update world state
    this.updateWorldState(deltaTime);

    // Replace requestAnimationFrame with setInterval
    setTimeout(() => this.update(), 16); // approximately 60fps

    // Emit events when important things happen
    this.swarmSystem.getAgents().forEach(agent => {
      if (agent.state.type !== agent.previousState?.type) {
        this.emit('agentStateChange', {
          agentId: agent.id,
          oldState: agent.previousState?.type,
          newState: agent.state.type,
          timestamp: Date.now()
        });
      }
    });
  }

  private handleSystemEvent(event: SystemEvent): void {
    console.log('System Event:', event);
    // Handle system events (logging, metrics, etc.)
  }

  private initializeWorldState(): WorldState {
    return {
      time: Date.now(),
      entities: new Map(),
      resources: new Map(),
      environment: {
        timeOfDay: 0.5,
        weather: 'clear',
        visibility: 1.0,
        temperature: 20,
        humidity: 0.5,
      },
    };
  }

  private updateWorldState(deltaTime: number): void {
    this.worldState.time += deltaTime * 1000;
    // Update other world state properties
  }

  private applyDecision(agent: SwarmAgent, decision: any): void {
    // Apply decision effects to agent
    decision.actions.forEach((action: any) => {
      switch (action.variable) {
        case 'direction':
          // Update agent direction
          break;
        case 'speed':
          // Update agent speed
          break;
        // Handle other action types
      }
    });
  }

  private initializeAgents(inputs: SwarmInputs): void {
    console.log('👥 Initializing agents...');
    const totalAgents = inputs.agentCount;

    inputs.roles.forEach(role => {
      const count = Math.floor(totalAgents * role.distribution);
      for (let i = 0; i < count; i++) {
        const agent = this.createAgent(role, inputs.spawnArea);
        this.addAgent(agent);
      }
    });

    console.log(`✅ Created ${inputs.agentCount} agents with roles:`, 
      inputs.roles.map(r => `${r.name}: ${Math.floor(inputs.agentCount * r.distribution)}`));
  }
  private createAgent(role: any, spawnArea: any): SwarmAgent {
    return {
      id: `agent_${Math.random().toString(36).substr(2, 9)}`,
      position: new Vector3(
        Math.random() * (spawnArea.maxX - spawnArea.minX) + spawnArea.minX,
        0,
        Math.random() * (spawnArea.maxZ - spawnArea.minZ) + spawnArea.minZ
      ),
      velocity: new Vector3(),
      rotation: new Quaternion(),
      previousState: null,
      state: {
        type: 'exploring',
        data: {},
        timestamp: Date.now(),
      },
      role: role.name,
      neighbors: new Set(),
      attributes: role.attributes,
    };
  }

  // Add event emitter methods
  public on(event: string, callback: (data: any) => void): this {
    this.eventEmitter.on(event, callback);
    return this;
  }

  public emit(event: string, data: any): boolean {
    return this.eventEmitter.emit(event, data);
  }

  // Add statistics methods
  private initializeStatistics(): void {
    this.statistics.set('resourcesCollected', 0);
    this.statistics.set('threatsSurvived', 0);
    this.statistics.set('distanceTraveled', 0);
  }

  public getStatistics(): Record<string, number> {
    return Object.fromEntries(this.statistics);
  }
}

// Example inputs
const inputs: AISystemInputs = {
  swarm: {
    agentCount: 100,
    spawnArea: {
      minX: -50,
      maxX: 50,
      minZ: -50,
      maxZ: 50,
    },
    roles: [
      {
        name: 'scout',
        distribution: 0.4,
        attributes: new Map([
          ['speed', 2.0],
          ['vision', 10.0],
          ['stamina', 0.8],
        ]),
      },
      {
        name: 'defender',
        distribution: 0.3,
        attributes: new Map([
          ['speed', 1.5],
          ['strength', 2.0],
          ['armor', 0.9],
        ]),
      },
      {
        name: 'collector',
        distribution: 0.3,
        attributes: new Map([
          ['speed', 1.8],
          ['capacity', 2.0],
          ['efficiency', 0.9],
        ]),
      },
    ],
  },
  decision: {
    rules: [
      {
        id: 'avoid_danger',
        antecedents: [
          {
            variable: 'threat_level',
            set: 'high',
            operator: 'AND',
          },
          {
            variable: 'distance',
            set: 'close',
            operator: 'AND',
          },
        ],
        consequent: {
          variable: 'evasion',
          set: 'immediate',
          value: 1.0,
        },
        weight: 1.0,
      },
      // Add more rules...
    ],
    variables: [
      {
        name: 'threat_level',
        sets: [
          {
            name: 'low',
            domain: [0, 0.5],
            type: 'triangle',
            points: [0, 0, 0.5],
          },
          {
            name: 'high',
            domain: [0.5, 1],
            type: 'triangle',
            points: [0.5, 1, 1],
          },
        ],
      },
      // Add more variables...
    ],
  },
  environment: {
    timeScale: 1.0,
    weatherEnabled: true,
    weatherPatterns: [
      {
        type: 'clear',
        probability: 0.6,
        duration: [300, 600],
      },
      {
        type: 'storm',
        probability: 0.2,
        duration: [100, 300],
      },
    ],
    resources: [
      {
        type: 'food',
        spawnRate: 0.1,
        maxCount: 50,
        value: 1.0,
      },
    ],
  },
};

// Create AI system with inputs
console.log('🎮 Starting simulation...');
const aiSystem = new AISystem(inputs);
aiSystem.start();
