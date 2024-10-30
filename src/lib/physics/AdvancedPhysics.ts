import RAPIER from '@dimforge/rapier3d-compat';
import { Vector3 } from 'three';

export class PhysicsWorld {
  private world: RAPIER.World;
  private bodies: Map<string, RAPIER.RigidBody>;
  private constraints: Map<string, RAPIER.Joint>;

  constructor() {
    RAPIER.init().then(() => {
      this.world = new RAPIER.World(new Vector3(0, -9.81, 0));
      this.bodies = new Map();
      this.constraints = new Map();
    });
  }

  addBody(id: string, position: Vector3, shape: RAPIER.ColliderDesc): void {
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
      position.x,
      position.y,
      position.z
    );

    const body = this.world.createRigidBody(bodyDesc);
    const collider = this.world.createCollider(shape, body);

    this.bodies.set(id, body);
  }

  update(deltaTime: number): void {
    this.world.step();
    // Update physics state
  }
}
