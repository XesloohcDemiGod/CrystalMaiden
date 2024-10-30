import { Vector3, Quaternion } from 'three';
import { RigidBody } from '@dimforge/rapier3d';
import { Joint } from './Pose';
import { MotionController } from './MotionController';
class PhysicsAnimationController {
  private skeleton: Map<string, RigidBody>;
  private joints: Map<string, Joint>;
  private muscles: Map<string, MuscleController>;
  private motionController: MotionController;
    physicsWorld: any;

  constructor() {
    this.skeleton = new Map();
    this.joints = new Map();
    this.muscles = new Map();
    this.motionController = new MotionController();
  }

  public update(deltaTime: number): void {
    // Update desired pose
    this.motionController.update(deltaTime);

    // Apply muscle forces to achieve desired pose
    this.updateMuscleForces();

    // Update physics simulation
    this.updatePhysics(deltaTime);

    // Apply final positions to visual mesh
    this.updateVisualMesh();
  }
    updateVisualMesh() {
        throw new Error('Method not implemented.');
    }

  private updateMuscleForces(): void {
    const targetPose = this.motionController.getCurrentPose();

    this.muscles.forEach((muscle, name) => {
      const currentRotation = this.getJointRotation(name);
      const targetRotation = targetPose.getJointRotation(name);

      // Calculate required torque to reach target rotation
      const torque = muscle.calculateRequiredTorque(
        this.getJointRotation(name),
        targetRotation,
        new Vector3(
          this.skeleton.get(name)!.linvel().x,
          this.skeleton.get(name)!.linvel().y,
          this.skeleton.get(name)!.linvel().z
        )
      );

      // Apply muscle forces
      muscle.applyForce(torque);
    });
  }
    getJointRotation(name: string): Quaternion {
        const body = this.skeleton.get(name);
        if (!body) {
            throw new Error(`No rigid body found for joint ${name}`);
        }
        const rot = body.rotation();
        return new Quaternion(rot.x, rot.y, rot.z, rot.w);
    }

  private updatePhysics(deltaTime: number): void {
    // Apply external forces (gravity, contact forces, etc.)
    this.applyExternalForces();

    // Update joint constraints
    this.updateJointConstraints();

    // Step physics simulation
    this.physicsWorld.step();

    // Handle collisions
    this.handleCollisions();
  }
    applyExternalForces() {
        throw new Error('Method not implemented.');
    }
    updateJointConstraints() {
        throw new Error('Method not implemented.');
    }
    handleCollisions() {
        throw new Error('Method not implemented.');
    }
}

class MuscleController {
  private maxForce: number = 100;
  private damping: number = 0.1;
  private stiffness: number = 1;
  private attachments: { body: RigidBody; point: Vector3 }[] = [];

  public calculateRequiredTorque(
    currentRot: Quaternion,
    targetRot: Quaternion,
    velocity: Vector3
  ): Vector3 {
    // Calculate angular difference
    const diff = targetRot.multiply(currentRot.invert());
    const angle = 2 * Math.acos(diff.w);
    const axis = new Vector3(diff.x, diff.y, diff.z).normalize();

    // Apply PD control
    const torque = axis.multiplyScalar(
      this.stiffness * angle - this.damping * velocity.length()
    );

    // Limit maximum force
    if (torque.length() > this.maxForce) {
      torque.normalize().multiplyScalar(this.maxForce);
    }

    return torque;
  }

  applyForce(torque: Vector3) {
    // Use attachments to apply forces to connected bodies
    this.attachments.forEach(({ body, point }) => {
      body.applyImpulseAtPoint(torque, point, true);
    });
  }
}
