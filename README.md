// src/config/defaultInput.ts
import { AISystemInputs } from '../lib/types';

export const defaultInputs: AISystemInputs = {
    swarm: {
        agentCount: 100,
        spawnArea: {
            minX: -50,
            maxX: 50,
            minZ: -50,
            maxZ: 50
        },
        roles: [
            {
                name: 'scout',
                distribution: 0.4,
                attributes: new Map([
                    ['speed', 2.0],
                    ['vision', 10.0],
                    ['stamina', 0.8]
                ])
            },
            {
                name: 'collector',
                distribution: 0.6,
                attributes: new Map([
                    ['speed', 1.5],
                    ['capacity', 2.0],
                    ['efficiency', 0.9]
                ])
            }
        ]
    },
    decision: {
        rules: [
            {
                id: 'find_resources',
                antecedents: [
                    {
                        variable: 'resource_distance',
                        set: 'close',
                        operator: 'AND'
                    }
                ],
                consequent: {
                    variable: 'collect',
                    set: 'active',
                    value: 1.0
                },
                weight: 1.0
            }
        ],
        variables: [
            {
                name: 'resource_distance',
                sets: [
                    {
                        name: 'close',
                        domain: [0, 10],
                        type: 'triangle',
                        points: [0, 0, 10]
                    }
                ]
            }
        ]
    },
    environment: {
        timeScale: 1.0,
        weatherEnabled: true,
        weatherPatterns: [
            {
                type: 'clear',
                probability: 0.7,
                duration: [300, 600]
            }
        ],
        resources: [
            {
                type: 'food',
                spawnRate: 0.1,
                maxCount: 20,
                value: 1.0
            }
        ]
    }
};
