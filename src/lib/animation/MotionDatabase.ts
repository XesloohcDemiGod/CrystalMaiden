export class MotionDatabase {
  getJointNames(): string[] {
    // Return list of joint names your animation system uses
    return ['root', 'spine', 'head', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];
  }
} 