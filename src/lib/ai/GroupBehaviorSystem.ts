// import { Vector3 } from 'three';
// import { BehaviorTree } from './BehaviorTree';
// import { Observable, BehaviorSubject } from 'rxjs';

// interface GroupMember {
//   id: string;
//   position: Vector3;
//   role: GroupRole;
//   behavior: BehaviorTree;
//   relationships: Map<string, Relationship>;
//   capabilities: Set<Capability>;
// }

// class GroupAI {
//   private members: Map<string, GroupMember>;
//   private roles: Map<string, GroupRole>;
//   private objectives: PriorityQueue<GroupObjective>;
//   private formations: FormationController;
//   private tacticalAnalyzer: TacticalAnalyzer;

//   constructor() {
//     this.members = new Map();
//     this.roles = new Map();
//     this.objectives = new PriorityQueue();
//     this.formations = new FormationController();
//     this.tacticalAnalyzer = new TacticalAnalyzer();
//   }

//   public update(deltaTime: number): void {
//     // Update tactical analysis
//     const tacticalData = this.tacticalAnalyzer.analyze({
//       members: Array.from(this.members.values()),
//       environment: this.getCurrentEnvironment(),
//       threats: this.detectThreats(),
//     });

//     // Update group formation
//     this.formations.update(tacticalData);

//     // Assign and update roles
//     this.updateRoles(tacticalData);

//     // Process group objectives
//     this.processObjectives(tacticalData);

//     // Update individual behaviors
//     this.updateMemberBehaviors(deltaTime, tacticalData);
//   }

//   private updateRoles(tacticalData: TacticalData): void {
//     const roleAssignments = this.calculateOptimalRoleAssignments(tacticalData);

//     roleAssignments.forEach((role, memberId) => {
//       const member = this.members.get(memberId)!;
//       if (member.role !== role) {
//         this.transitionMemberRole(member, role);
//       }
//     });
//   }

//   private calculateOptimalRoleAssignments(
//     tacticalData: TacticalData
//   ): Map<string, GroupRole> {
//     const assignments = new Map<string, GroupRole>();
//     const unassignedMembers = new Set(this.members.keys());
//     const roleRequirements = this.calculateRoleRequirements(tacticalData);

//     // Assign critical roles first
//     roleRequirements.forEach((requirement, roleName) => {
//       if (requirement.priority === 'critical') {
//         const bestMember = this.findBestMemberForRole(
//           Array.from(unassignedMembers),
//           roleName,
//           tacticalData
//         );
//         if (bestMember) {
//           assignments.set(bestMember, this.roles.get(roleName)!);
//           unassignedMembers.delete(bestMember);
//         }
//       }
//     });

//     // Assign remaining roles
//     roleRequirements.forEach((requirement, roleName) => {
//       if (requirement.priority !== 'critical') {
//         const count =
//           requirement.count -
//           Array.from(assignments.values()).filter(
//             role => role.name === roleName
//           ).length;

//         for (let i = 0; i < count; i++) {
//           const bestMember = this.findBestMemberForRole(
//             Array.from(unassignedMembers),
//             roleName,
//             tacticalData
//           );
//           if (bestMember) {
//             assignments.set(bestMember, this.roles.get(roleName)!);
//             unassignedMembers.delete(bestMember);
//           }
//         }
//       }
//     });

//     return assignments;
//   }
// }

// class FormationController {
//   private formations: Map<string, Formation>;
//   private currentFormation: Formation;
//   private transitionState: FormationTransitionState;

//   public update(tacticalData: TacticalData): void {
//     // Select best formation based on tactical situation
//     const bestFormation = this.selectBestFormation(tacticalData);

//     if (bestFormation !== this.currentFormation) {
//       this.transitionToFormation(bestFormation, tacticalData);
//     }

//     // Update member positions within formation
//     this.updateFormationPositions(tacticalData);
//   }

//   private updateFormationPositions(tacticalData: TacticalData): void {
//     const positions = this.currentFormation.calculatePositions(
//       tacticalData.members.length,
//       tacticalData.center,
//       tacticalData.facing
//     );

//     // Assign positions to members based on roles and capabilities
//     this.assignPositionsToMembers(positions, tacticalData);
//   }
// }
