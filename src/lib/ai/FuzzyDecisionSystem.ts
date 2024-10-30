// src/lib/ai/FuzzyDecisionSystem.ts
import { BehaviorSubject, Observable } from 'rxjs';
import {
  FuzzySet,
  FuzzyRule,
  FuzzyAntecedent,
  FuzzyConsequent,
  DecisionConfig,
  WorldState,
  AgentState,
  SystemEvent,
} from '../types';

export class FuzzyDecisionSystem {
  [x: string]: any;
  private rules: Map<string, FuzzyRule>;
  private fuzzySets: Map<string, Map<string, FuzzySet>>;
  private config: DecisionConfig;
  private systemEvents: BehaviorSubject<SystemEvent>;

  constructor(config: DecisionConfig) {
    this.rules = new Map();
    this.fuzzySets = new Map();
    this.config = config;
    this.systemEvents = new BehaviorSubject<SystemEvent>({
      type: 'DECISION_SYSTEM_INIT',
      timestamp: Date.now(),
      data: null,
    });
    this.initializeFuzzySets();
  }

  public async makeDecision(input: {
    agentState: AgentState;
    worldState: WorldState;
    nearbyEntities: any[];
  }): Promise<DecisionOutput> {
    const startTime = performance.now();

    try {
      // Fuzzify input values
      const fuzzyValues = this.fuzzifyInputs(input);

      // Apply fuzzy rules
      const ruleOutputs = this.applyRules(fuzzyValues);

      // Aggregate results
      const aggregatedOutput = this.aggregateResults(ruleOutputs);

      // Defuzzify to get final decision
      const decision = this.defuzzify(aggregatedOutput);

      const endTime = performance.now();
      this.emitEvent('DECISION_MADE', {
        duration: endTime - startTime,
        decision,
      });

      return decision;
    } catch (error) {
      this.emitEvent('DECISION_ERROR', { error });
      throw error;
    }
  }

  public addRule(rule: FuzzyRule): void {
    this.validateRule(rule);
    this.rules.set(rule.id, rule);
    this.emitEvent('RULE_ADDED', { ruleId: rule.id });
  }

  public addFuzzySet(variable: string, set: FuzzySet): void {
    if (!this.fuzzySets.has(variable)) {
      this.fuzzySets.set(variable, new Map());
    }
    this.fuzzySets.get(variable)!.set(set.name, set);
    this.emitEvent('FUZZY_SET_ADDED', { variable, setName: set.name });
  }

  private initializeFuzzySets(): void {
    // Initialize standard fuzzy sets for common variables
    this.addFuzzySet('distance', {
      name: 'close',
      domain: [0, 10],
      membershipFunction: (x: number) => this.trapezoid(x, 0, 0, 3, 5),
    });

    this.addFuzzySet('distance', {
      name: 'medium',
      domain: [3, 15],
      membershipFunction: (x: number) => this.triangle(x, 3, 8, 13),
    });

    this.addFuzzySet('distance', {
      name: 'far',
      domain: [10, 20],
      membershipFunction: (x: number) => this.trapezoid(x, 10, 15, 20, 20),
    });

    // Add more fuzzy sets for other variables
    this.initializeHealthSets();
    this.initializeVelocitySets();
    this.initializeThreatSets();
  }

  private extractValue(input: any, variableName: string): number {
    // Handle nested object paths (e.g., 'agentState.health')
    const path = variableName.split('.');
    let value = input;
    
    for (const key of path) {
      if (value === undefined || value === null) return 0;
      value = value[key];
    }
    
    // Return 0 if value is not a number, otherwise return the value
    return typeof value === 'number' ? value : 0;
  }

  private fuzzifyInputs(input: any): Map<string, Map<string, number>> {
    const fuzzyValues = new Map<string, Map<string, number>>();

    for (const [variable, variableSets] of this.fuzzySets) {
      const value = this.extractValue(input, variable);
      const membershipValues = new Map<string, number>();

      for (const [setName, set] of variableSets) {
        const membership = set.membershipFunction(value);
        if (membership > 0) {
          membershipValues.set(setName, membership);
        }
      }

      if (membershipValues.size > 0) {
        fuzzyValues.set(variable, membershipValues);
      }
    }

    return fuzzyValues;
  }

  private applyRules(
    fuzzyValues: Map<string, Map<string, number>>
  ): RuleOutput[] {
    const outputs: RuleOutput[] = [];

    for (const rule of this.rules.values()) {
      const antecedentStrength = this.evaluateAntecedents(
        rule.antecedents,
        fuzzyValues
      );

      if (antecedentStrength > 0) {
        outputs.push({
          consequent: rule.consequent,
          strength: antecedentStrength * rule.weight,
        });
      }
    }

    return outputs;
  }

  private evaluateAntecedents(
    antecedents: FuzzyAntecedent[],
    fuzzyValues: Map<string, Map<string, number>>
  ): number {
    return antecedents.reduce((strength, antecedent) => {
      const variableValues = fuzzyValues.get(antecedent.variable);
      if (!variableValues) return 0;

      const membershipValue = variableValues.get(antecedent.set) || 0;

      switch (antecedent.operator) {
        case 'AND':
          return Math.min(strength, membershipValue);
        case 'OR':
          return Math.max(strength, membershipValue);
        case 'NOT':
          return Math.min(strength, 1 - membershipValue);
        default:
          return membershipValue;
      }
    }, 1);
  }

  private aggregateResults(ruleOutputs: RuleOutput[]): AggregatedOutput {
    const aggregated = new Map<string, Map<string, number>>();

    for (const output of ruleOutputs) {
      const { consequent, strength } = output;

      if (!aggregated.has(consequent.variable)) {
        aggregated.set(consequent.variable, new Map());
      }

      const variableOutputs = aggregated.get(consequent.variable)!;
      const currentStrength = variableOutputs.get(consequent.set) || 0;
      variableOutputs.set(
        consequent.set,
        Math.max(currentStrength, strength * consequent.value)
      );
    }

    return aggregated;
  }

  private defuzzify(aggregatedOutput: AggregatedOutput): DecisionOutput {
    const decision: DecisionOutput = {
      actions: [],
      confidence: 0,
      timestamp: Date.now(),
    };

    for (const [variable, outputs] of aggregatedOutput) {
      let numerator = 0;
      let denominator = 0;

      for (const [setName, strength] of outputs) {
        const set = this.fuzzySets.get(variable)?.get(setName);
        if (set) {
          const centroid = this.calculateCentroid(set);
          numerator += centroid * strength;
          denominator += strength;
        }
      }

      if (denominator > 0) {
        const crispValue = numerator / denominator;
        decision.actions.push({
          variable,
          value: crispValue,
          confidence: denominator,
        });
      }
    }

    decision.confidence =
      decision.actions.reduce((acc, action) => acc + action.confidence, 0) /
      decision.actions.length;

    return decision;
  }

  // Membership function helpers
  private triangle(x: number, a: number, b: number, c: number): number {
    if (x <= a || x >= c) return 0;
    if (x === b) return 1;
    if (x < b) return (x - a) / (b - a);
    return (c - x) / (c - b);
  }

  private trapezoid(
    x: number,
    a: number,
    b: number,
    c: number,
    d: number
  ): number {
    if (x <= a || x >= d) return 0;
    if (x >= b && x <= c) return 1;
    if (x < b) return (x - a) / (b - a);
    return (d - x) / (d - c);
  }

  private calculateCentroid(set: FuzzySet): number {
    const samples = 100;
    const dx = (set.domain[1] - set.domain[0]) / samples;
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i <= samples; i++) {
      const x = set.domain[0] + i * dx;
      const membership = set.membershipFunction(x);
      numerator += x * membership;
      denominator += membership;
    }

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private validateRule(rule: FuzzyRule): void {
    if (!rule.id || !rule.antecedents || !rule.consequent) {
      throw new Error('Invalid rule structure');
    }

    // Validate antecedents
    for (const antecedent of rule.antecedents) {
      if (!this.fuzzySets.has(antecedent.variable)) {
        throw new Error(
          `Unknown variable in antecedent: ${antecedent.variable}`
        );
      }
      if (!this.fuzzySets.get(antecedent.variable)?.has(antecedent.set)) {
        throw new Error(
          `Unknown set in antecedent: ${antecedent.variable}.${antecedent.set}`
        );
      }
    }

    // Validate consequent
    if (!this.fuzzySets.has(rule.consequent.variable)) {
      throw new Error(
        `Unknown variable in consequent: ${rule.consequent.variable}`
      );
    }
    if (
      !this.fuzzySets.get(rule.consequent.variable)?.has(rule.consequent.set)
    ) {
      throw new Error(
        `Unknown set in consequent: ${rule.consequent.variable}.${rule.consequent.set}`
      );
    }
  }

  private emitEvent(type: string, data: any): void {
    this.systemEvents.next({
      type,
      timestamp: Date.now(),
      data,
    });
  }

  public getSystemEvents(): Observable<SystemEvent> {
    return this.systemEvents.asObservable();
  }

  private initializeHealthSets(): void {
    this.addFuzzySet('health', {
      name: 'low',
      domain: [0, 50],
      membershipFunction: (x: number) => this.trapezoid(x, 0, 0, 20, 40),
    });

    this.addFuzzySet('health', {
      name: 'medium',
      domain: [30, 70],
      membershipFunction: (x: number) => this.triangle(x, 30, 50, 70),
    });

    this.addFuzzySet('health', {
      name: 'high',
      domain: [60, 100],
      membershipFunction: (x: number) => this.trapezoid(x, 60, 80, 100, 100),
    });
  }

  private initializeVelocitySets(): void {
    this.addFuzzySet('velocity', {
      name: 'slow',
      domain: [0, 5],
      membershipFunction: (x: number) => this.trapezoid(x, 0, 0, 2, 4),
    });

    this.addFuzzySet('velocity', {
      name: 'moderate',
      domain: [3, 7],
      membershipFunction: (x: number) => this.triangle(x, 3, 5, 7),
    });

    this.addFuzzySet('velocity', {
      name: 'fast',
      domain: [6, 10],
      membershipFunction: (x: number) => this.trapezoid(x, 6, 8, 10, 10),
    });
  }

  private initializeThreatSets(): void {
    this.addFuzzySet('threat', {
      name: 'low',
      domain: [0, 50],
      membershipFunction: (x: number) => this.trapezoid(x, 0, 0, 20, 40),
    });

    this.addFuzzySet('threat', {
      name: 'medium',
      domain: [30, 70],
      membershipFunction: (x: number) => this.triangle(x, 30, 50, 70),
    });

    this.addFuzzySet('threat', {
      name: 'high',
      domain: [60, 100],
      membershipFunction: (x: number) => this.trapezoid(x, 60, 80, 100, 100),
    });
  }
}

interface RuleOutput {
  consequent: FuzzyConsequent;
  strength: number;
}

interface DecisionOutput {
  actions: Array<{
    variable: string;
    value: number;
    confidence: number;
  }>;
  confidence: number;
  timestamp: number;
}

type AggregatedOutput = Map<string, Map<string, number>>;
