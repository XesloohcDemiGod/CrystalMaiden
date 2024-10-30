import { Vector3, Quaternion } from 'three';
import { QuadTree, BoundingBox } from '../spatial/QuadTree';
import { Observable, BehaviorSubject } from 'rxjs';
import {
  AgentEvent,
  AgentState,
  PerformanceMetrics,
  SwarmAgent,
  SwarmConfig,
} from '../types';

export class SwarmIntelligenceSystem {
  private agents: Map<string, SwarmAgent>;
  private spatialIndex: QuadTree<SwarmAgent>;
  private agentUpdates: BehaviorSubject<SwarmAgent[]>;
  config!: SwarmConfig;
  metrics: any;

  constructor(config: SwarmConfig) {
    this.agents = new Map();
    this.spatialIndex = new QuadTree<SwarmAgent>({
      x: -1000,
      y: -1000,
      width: 2000,
      height: 2000,
    });
    this.agentUpdates = new BehaviorSubject<SwarmAgent[]>([]);
    this.config = config;
    this.metrics = new BehaviorSubject<PerformanceMetrics>(this.initializeMetrics());
  }

  public addAgent(agent: SwarmAgent): void {
    this.agents.set(agent.id, agent);
    this.spatialIndex.insert(agent, agent.position);
    this.notifyAgentUpdates();
  }

  private notifyAgentUpdates(): void {
    const currentAgents = Array.from(this.agents.values());
    this.agentUpdates.next(currentAgents);
  }

  public getAgents(): SwarmAgent[] {
    return Array.from(this.agents.values());
  }

  public getAgentUpdates(): Observable<SwarmAgent[]> {
    return this.agentUpdates.asObservable();
  }

  public getNearbyEntities(position: Vector3, radius: number): SwarmAgent[] {
    const range: BoundingBox = {
      x: position.x - radius,
      y: position.z - radius,
      width: radius * 2,
      height: radius * 2,
    };

    return this.spatialIndex
      .query(range)
      .filter(agent => agent.position.distanceTo(position) <= radius);
  }

  public update(deltaTime: number): void {
    const startTime = performance.now();
    const updates: AgentEvent[] = [];

    // Clear and rebuild spatial index
    this.spatialIndex = new QuadTree<SwarmAgent>({
      x: -1000,
      y: -1000,
      width: 2000,
      height: 2000,
    });

    // Update each agent
    this.agents.forEach(agent => {
      const previousState = { ...agent.state };
      this.updateAgent(agent, deltaTime);
      this.spatialIndex.insert(agent, agent.position);

      updates.push({
        type: 'AGENT_UPDATED',
        agentId: agent.id,
        timestamp: Date.now(),
        previousState,
        newState: agent.state,
        data: { position: agent.position, velocity: agent.velocity },
      });
    });

    // Update performance metrics
    const endTime = performance.now();
    this.updateMetrics({
      updateDuration: endTime - startTime,
      updateCount: updates.length,
    });

    // Emit updates
    if (updates.length > 0) {
      // Convert AgentEvent[] to SwarmAgent[] before emitting
      const swarmAgents = updates.map(update => ({
        id: update.agentId,
        position: update.data.position,
        velocity: update.data.velocity,
        rotation: this.agents.get(update.agentId)?.rotation || new Quaternion(),
        state: update.newState,
        role: this.agents.get(update.agentId)?.role || 'default',
        neighbors: this.agents.get(update.agentId)?.neighbors || [],
        attributes: this.agents.get(update.agentId)?.attributes || {},
      })) as SwarmAgent[];
      this.agentUpdates.next(swarmAgents);
    }
  }

  private updateAgent(agent: SwarmAgent, deltaTime: number): void {
    const neighbors = this.getNearbyEntities(
      agent.position,
      this.config.neighborhoodRadius
    );

    // Calculate flocking behaviors
    const separation = this.calculateSeparation(
      agent,
      neighbors
    ).multiplyScalar(this.config.separationWeight);
    const alignment = this.calculateAlignment(agent, neighbors).multiplyScalar(
      this.config.alignmentWeight
    );
    const cohesion = this.calculateCohesion(agent, neighbors).multiplyScalar(
      this.config.cohesionWeight
    );

    // Apply forces
    agent.velocity.add(separation);
    agent.velocity.add(alignment);
    agent.velocity.add(cohesion);

    // Apply additional behaviors based on agent role and state
    this.applyRoleBehavior(agent);
    this.applyStateBehavior(agent);

    // Limit velocity
    if (agent.velocity.length() > this.config.maxSpeed) {
      agent.velocity.normalize().multiplyScalar(this.config.maxSpeed);
    }

    // Update position
    agent.position.add(agent.velocity.clone().multiplyScalar(deltaTime));

    // Update rotation to face movement direction
    if (agent.velocity.length() > 0.01) {
      const targetRotation = new Quaternion().setFromUnitVectors(
        new Vector3(0, 0, 1),
        agent.velocity.clone().normalize()
      );
      agent.rotation.slerp(targetRotation, 0.1);
    }

    // Update agent state
    this.updateAgentState(agent);
  }

  private calculateSeparation(
    agent: SwarmAgent,
    neighbors: SwarmAgent[]
  ): Vector3 {
    const steering = new Vector3();
    let count = 0;

    neighbors.forEach(neighbor => {
      if (neighbor.id !== agent.id) {
        const diff = agent.position.clone().sub(neighbor.position);
        const distance = diff.length();
        if (distance < this.config.neighborhoodRadius * 0.5) {
          steering.add(diff.normalize().divideScalar(distance));
          count++;
        }
      }
    });

    if (count > 0) {
      steering.divideScalar(count);
    }

    return steering;
  }

  private calculateAlignment(
    agent: SwarmAgent,
    neighbors: SwarmAgent[]
  ): Vector3 {
    const steering = new Vector3();
    let count = 0;

    neighbors.forEach(neighbor => {
      if (neighbor.id !== agent.id) {
        steering.add(neighbor.velocity);
        count++;
      }
    });

    if (count > 0) {
      steering.divideScalar(count);
      steering.sub(agent.velocity);
    }

    return steering;
  }

  private calculateCohesion(
    agent: SwarmAgent,
    neighbors: SwarmAgent[]
  ): Vector3 {
    const steering = new Vector3();
    let count = 0;

    neighbors.forEach(neighbor => {
      if (neighbor.id !== agent.id) {
        steering.add(neighbor.position);
        count++;
      }
    });

    if (count > 0) {
      steering.divideScalar(count);
      return steering.sub(agent.position);
    }

    return steering;
  }

  private applyRoleBehavior(agent: SwarmAgent): void {
    switch (agent.role) {
      case 'scout':
        this.applyScoutBehavior(agent);
        break;
      case 'defender':
        this.applyDefenderBehavior(agent);
        break;
      case 'collector':
        this.applyCollectorBehavior(agent);
        break;
      default:
        break;
    }
  }

  private applyScoutBehavior(agent: SwarmAgent): void {
    // Scouts move in a wider exploration pattern and maintain higher speeds
    const wanderForce = new Vector3(
      Math.sin(Date.now() * 0.001) * 0.5,
      0,
      Math.cos(Date.now() * 0.001) * 0.5
    );
    
    agent.velocity.add(wanderForce);
    agent.velocity.multiplyScalar(1.5); // Scouts move faster than other agents
  }

  private applyDefenderBehavior(agent: SwarmAgent): void {
    // Defenders maintain a protective formation around their assigned area
    const center = new Vector3(0, 0, 0); // Or whatever point they're defending
    const distanceToCenter = agent.position.distanceTo(center);
    
    if (distanceToCenter > this.config.neighborhoodRadius) {
      const returnForce = center.clone()
        .sub(agent.position)
        .normalize()
        .multiplyScalar(0.5);
      agent.velocity.add(returnForce);
    }
  }

  private applyCollectorBehavior(agent: SwarmAgent): void {
    // Collectors prioritize moving towards resources and maintaining efficient paths
    const nearestResource = this.findNearestResource(agent);
    if (nearestResource) {
      const resourceForce = nearestResource.clone()
        .sub(agent.position)
        .normalize()
        .multiplyScalar(0.8);
      agent.velocity.add(resourceForce);
    }
  }

  // Helper method for collector behavior
  private findNearestResource(agent: SwarmAgent): Vector3 | null {
    // This should be implemented based on your resource management system
    // For now, returning null as placeholder
    return null;
  }

  private applyStateBehavior(agent: SwarmAgent): void {
    switch (agent.state.type) {
      case 'exploring':
        this.applyExplorationBehavior(agent);
        break;
      case 'pursuing':
        this.applyPursuitBehavior(agent);
        break;
      case 'evading':
        this.applyEvasionBehavior(agent);
        break;
      default:
        break;
    }
  }

  private applyExplorationBehavior(agent: SwarmAgent): void {
    // Add random wandering behavior for exploration
    const noise = 0.2;
    const wanderForce = new Vector3(
      (Math.random() - 0.5) * noise,
      0,
      (Math.random() - 0.5) * noise
    );
    
    // Add a tendency to explore unexplored areas
    const currentRegion = this.getExploredRegion(agent.position);
    if (currentRegion) {
      const explorationForce = this.calculateExplorationForce(agent, currentRegion);
      wanderForce.add(explorationForce);
    }
    
    agent.velocity.add(wanderForce);
  }

  private applyPursuitBehavior(agent: SwarmAgent): void {
    // Get target from agent state
    const target = agent.state.data?.target;
    if (!target) return;

    // Calculate intercept point based on target velocity
    const interceptPoint = this.calculateInterceptPoint(
      agent.position,
      target.position,
      target.velocity,
      this.config.maxSpeed
    );

    // Create pursuit force towards intercept point
    const pursuitForce = interceptPoint
      .sub(agent.position)
      .normalize()
      .multiplyScalar(this.config.maxSpeed);
    
    agent.velocity.add(pursuitForce);
  }

  private applyEvasionBehavior(agent: SwarmAgent): void {
    // Get threat from agent state
    const threat = agent.state.data?.threat;
    if (!threat) return;

    // Calculate evasion direction (opposite of threat direction)
    const evasionForce = agent.position
      .clone()
      .sub(threat.position)
      .normalize()
      .multiplyScalar(this.config.maxSpeed * 1.2); // Slightly faster when evading
    
    // Add some randomness to make evasion less predictable
    const jitter = new Vector3(
      (Math.random() - 0.5) * 0.3,
      0,
      (Math.random() - 0.5) * 0.3
    );
    
    agent.velocity.add(evasionForce).add(jitter);
  }

  // Helper methods for the behaviors
  private getExploredRegion(position: Vector3): any {
    // Implement based on your exploration tracking system
    return null;
  }

  private calculateExplorationForce(agent: SwarmAgent, region: any): Vector3 {
    // Implement based on your exploration strategy
    return new Vector3();
  }

  private calculateInterceptPoint(
    pursuerPos: Vector3,
    targetPos: Vector3,
    targetVel: Vector3,
    pursuerSpeed: number
  ): Vector3 {
    // Simple intercept calculation
    const toTarget = targetPos.clone().sub(pursuerPos);
    const distance = toTarget.length();
    const interceptTime = distance / pursuerSpeed;
    
    return targetPos.clone().add(
      targetVel.clone().multiplyScalar(interceptTime)
    );
  }

  private updateAgentState(agent: SwarmAgent): void {
    // Update state based on current conditions
    const newState = this.determineNewState(agent);
    if (newState.type !== agent.state.type) {
      this.emitAgentEvent('STATE_CHANGED', agent, newState);
      agent.state = newState;
    }
  }

  private determineNewState(agent: SwarmAgent): AgentState {
    // Implement state transition logic
    return {
      type: agent.state.type,
      data: agent.state.data,
      timestamp: Date.now(),
    };
  }

  private emitAgentEvent(
    type: string,
    agent: SwarmAgent,
    newState?: AgentState
  ): void {
    // Convert to SwarmAgent array before emitting
    this.agentUpdates.next([
      {
        ...agent,
        state: newState || agent.state,
      },
    ]);
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      fps: 0,
      agentCount: 0,
      activeGoals: 0,
      completedGoals: 0,
      failedGoals: 0,
      averageUtility: 0,
      systemLoad: 0,
    };
  }

  private updateMetrics(data?: {
    updateDuration: number;
    updateCount: number;
  }): void {
    const currentMetrics = this.metrics.value;
    const newMetrics: PerformanceMetrics = {
      ...currentMetrics,
      agentCount: this.agents.size,
      systemLoad: data
        ? data.updateDuration / 16.67
        : currentMetrics.systemLoad, // 16.67ms = 60fps
      fps: data ? 1000 / data.updateDuration : currentMetrics.fps,
    };
    this.metrics.next(newMetrics);
  }
}
