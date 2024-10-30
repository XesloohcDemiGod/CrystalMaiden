import { Vector3, Quaternion, Matrix4 } from 'three';

class IKSolver {
  private joints: IKJoint[];
  private target: Vector3;
  private constraints: IKConstraints;
  private iterations = 10;

  constructor(joints: IKJoint[], constraints: IKConstraints) {
    this.joints = joints;
    this.constraints = constraints;
  }

  public solve(target: Vector3): void {
    this.target = target;

    for (let i = 0; i < this.iterations; i++) {
      // Forward pass
      this.forwardPass();

      // Backward pass
      this.backwardPass();

      // Apply constraints
      this.applyConstraints();

      // Check convergence
      if (this.checkConvergence()) break;
    }
  }

  private forwardPass(): void {
    let currentPos = this.joints[0].position.clone();
    const currentRot = new Quaternion();

    for (let i = 0; i < this.joints.length; i++) {
      const joint = this.joints[i];

      // Apply joint rotation
      const rotMatrix = new Matrix4().makeRotationFromQuaternion(
        joint.rotation
      );
      const nextPos = currentPos
        .clone()
        .add(new Vector3(0, joint.length, 0).applyMatrix4(rotMatrix));

      // Update joint positions
      joint.worldPosition = currentPos.clone();
      currentPos = nextPos;
      currentRot.multiply(joint.rotation);
    }
  }

  private backwardPass(): void {
    let targetPos = this.target.clone();

    for (let i = this.joints.length - 1; i >= 0; i--) {
      const joint = this.joints[i];
      const toTarget = targetPos.clone().sub(joint.worldPosition);
      const toEnd = joint.endPosition.clone().sub(joint.worldPosition);

      // Calculate rotation to align with target
      const rotation = new Quaternion().setFromUnitVectors(
        toEnd.normalize(),
        toTarget.normalize()
      );

      // Apply rotation limits
      this.applyRotationLimits(joint, rotation);

      // Update joint rotation
      joint.rotation.multiply(rotation);

      // Update target for next joint
      targetPos = joint.worldPosition;
    }
  }

  private applyConstraints(): void {
    this.joints.forEach(joint => {
      const constraint = this.constraints.get(joint.id);
      if (!constraint) return;

      // Apply angular limits
      if (constraint.angleLimit) {
        const euler = new THREE.Euler().setFromQuaternion(joint.rotation);
        euler.x = Math.max(
          constraint.angleLimit.minX,
          Math.min(constraint.angleLimit.maxX, euler.x)
        );
        euler.y = Math.max(
          constraint.angleLimit.minY,
          Math.min(constraint.angleLimit.maxY, euler.y)
        );
        euler.z = Math.max(
          constraint.angleLimit.minZ,
          Math.min(constraint.angleLimit.maxZ, euler.z)
        );
        joint.rotation.setFromEuler(euler);
      }

      // Apply distance constraints
      if (constraint.distanceLimit) {
        const distance = joint.worldPosition.distanceTo(
          joint.parent.worldPosition
        );
        if (distance > constraint.distanceLimit) {
          const direction = joint.worldPosition
            .clone()
            .sub(joint.parent.worldPosition)
            .normalize();
          joint.worldPosition = joint.parent.worldPosition
            .clone()
            .add(direction.multiplyScalar(constraint.distanceLimit));
        }
      }
    });
  }
}
