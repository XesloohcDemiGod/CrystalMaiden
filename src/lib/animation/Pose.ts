import { Quaternion, Vector3 } from 'three';

export interface Joint {
  rotation: Quaternion;
  position: Vector3;
}

export class Pose {
  constructor(private joints: Map<string, Joint>) {}

  getJoints(): Map<string, Joint> {
    return this.joints;
  }
} 