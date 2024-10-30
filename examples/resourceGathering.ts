import { AISystem } from '../src/index';
import { AISystemInputs } from '../src/lib/types';

// Define the simulation inputs
const resourceGatheringSimulation: AISystemInputs = {
  swarm: {
    agentCount: 50,  // Start with 50 agents
    spawnArea: {
      minX: -100,
      maxX: 100,
      minZ: -100,
      maxZ: 100,
    },
    roles: [
      {
        name: 'scout',
        distribution: 0.3,  // 30% scouts
        attributes: new Map([
          ['speed', 2.5],
          ['vision', 15.0],
          ['stamina', 0.7],
        ]),
      },
      {
        name: 'harvester',
        distribution: 0.5,  // 50% harvesters
        attributes: new Map([
          ['speed', 1.5],
          ['carryCapacity', 3.0],
          ['harvestSpeed', 1.2],
        ]),
      },
      {
        name: 'guard',
        distribution: 0.2,  // 20% guards
        attributes: new Map([
          ['speed', 2.0],
          ['strength', 2.5],
          ['armor', 1.5],
        ]),
      },
    ],
  },
  decision: {
    rules: [
      // Resource gathering rules
      {
        id: 'find_resources',
        antecedents: [
          {
            variable: 'resource_distance',
            set: 'close',
            operator: 'AND',
          },
          {
            variable: 'carry_capacity',
            set: 'available',
            operator: 'AND',
          },
        ],
        consequent: {
          variable: 'gather_action',
          set: 'harvest',
          value: 1.0,
        },
        weight: 1.0,
      },
      // Danger avoidance rules
      {
        id: 'avoid_danger',
        antecedents: [
          {
            variable: 'threat_level',
            set: 'high',
            operator: 'AND',
          },
          {
            variable: 'distance_to_threat',
            set: 'close',
            operator: 'AND',
          },
        ],
        consequent: {
          variable: 'escape_action',
          set: 'flee',
          value: 1.0,
        },
        weight: 1.2, // Higher priority than gathering
      },
    ],
    variables: [
      {
        name: 'resource_distance',
        sets: [
          {
            name: 'close',
            type: 'triangle',
            domain: [0, 20],
            points: [0, 5, 20],
          },
          {
            name: 'far',
            type: 'triangle',
            domain: [15, 50],
            points: [15, 35, 50],
          },
        ],
      },
      {
        name: 'carry_capacity',
        sets: [
          {
            name: 'available',
            type: 'triangle',
            domain: [0, 1],
            points: [0, 1, 1],
          },
          {
            name: 'full',
            type: 'triangle',
            domain: [0, 1],
            points: [0, 0, 1],
          },
        ],
      },
      {
        name: 'threat_level',
        sets: [
          {
            name: 'low',
            type: 'triangle',
            domain: [0, 1],
            points: [0, 0, 0.5],
          },
          {
            name: 'high',
            type: 'triangle',
            domain: [0, 1],
            points: [0.5, 1, 1],
          },
        ],
      },
    ],
  },
  environment: {
    timeScale: 1.0,
    weatherEnabled: true,
    weatherPatterns: [
      {
        type: 'clear',
        probability: 0.7,
        duration: [300, 600],
      },
      {
        type: 'storm',
        probability: 0.3,
        duration: [100, 200],
      },
    ],
    resources: [
      {
        type: 'food',
        spawnRate: 0.2,
        maxCount: 30,
        value: 1.0,
      },
      {
        type: 'water',
        spawnRate: 0.15,
        maxCount: 20,
        value: 1.0,
      },
    ],
  },
};

// Create and run the simulation
async function runResourceGatheringSimulation() {
  console.log('🌟 Starting Resource Gathering Simulation');
  
  const simulation = new AISystem(resourceGatheringSimulation);
  
  // Add event listeners for important events
  simulation.on('resourceCollected', (data: any) => {
    console.log('📦 Resource collected:', data);
  });

  simulation.on('agentStateChange', (data: any) => {
    console.log('🔄 Agent state changed:', data);
  });
}

runResourceGatheringSimulation(); 