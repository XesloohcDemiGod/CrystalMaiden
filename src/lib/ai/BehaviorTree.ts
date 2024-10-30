import { Observable, Subject } from 'rxjs';

export enum NodeStatus {
  SUCCESS,
  FAILURE,
  RUNNING
}

type BlackboardKey = string;

interface Blackboard {
  get<T>(key: BlackboardKey): T | undefined;
  set<T>(key: BlackboardKey, value: T): void;
}

abstract class BehaviorNode {
  protected blackboard: Blackboard;
  protected status$: Subject<NodeStatus>;

  constructor(blackboard: Blackboard) {
    this.blackboard = blackboard;
    this.status$ = new Subject<NodeStatus>();
  }

  abstract tick(): Promise<NodeStatus>;
  abstract reset(): void;

  get status(): Observable<NodeStatus> {
    return this.status$.asObservable();
  }
}

export class Sequence extends BehaviorNode {
  private children: BehaviorNode[];
  private currentChild = 0;

  constructor(blackboard: Blackboard, children: BehaviorNode[]) {
    super(blackboard);
    this.children = children;
  }

  async tick(): Promise<NodeStatus> {
    while (this.currentChild < this.children.length) {
      const status = await this.children[this.currentChild].tick();

      if (status === NodeStatus.RUNNING) {
        this.status$.next(NodeStatus.RUNNING);
        return NodeStatus.RUNNING;
      }

      if (status === NodeStatus.FAILURE) {
        this.reset();
        this.status$.next(NodeStatus.FAILURE);
        return NodeStatus.FAILURE;
      }

      this.currentChild++;
    }

    this.reset();
    this.status$.next(NodeStatus.SUCCESS);
    return NodeStatus.SUCCESS;
  }

  reset(): void {
    this.currentChild = 0;
    this.children.forEach(child => child.reset());
  }
}

// Example complex behavior
export class AdvancedAIController {
  initializePlan(bestPlan: any) {
      throw new Error('Method not implemented.');
  }
  private blackboard: Blackboard;

  constructor() {
    this.blackboard = new Map();
    this.initializeBehaviorTree();
  }

  private initializeBehaviorTree(): void {
  }
}
