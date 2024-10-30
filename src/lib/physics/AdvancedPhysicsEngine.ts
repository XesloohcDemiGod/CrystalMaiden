import RAPIER from '@dimforge/rapier3d-compat';
import { Vector3, Quaternion } from 'three';

interface PhysicsObject {
  body: RAPIER.RigidBody;
  collider: RAPIER.Collider;
  mesh?: THREE.Mesh;
}

export class AdvancedPhysicsEngine {
  private world: RAPIER.World;
  private objects: Map<string, PhysicsObject> = new Map();
  private constraints: Map<string, RAPIER.Joint> = new Map();
  private eventQueue: RAPIER.EventQueue;

  constructor() {
    RAPIER.init().then(() => {
      this.world = new RAPIER.World(new Vector3(0, -9.81, 0));
      this.eventQueue = new RAPIER.EventQueue(true);
    });
  }

  public addObject(
    id: string,
    position: Vector3,
    rotation: Quaternion,
    shape: RAPIER.ColliderDesc,
    options: {
      mass?: number;
      restitution?: number;
      friction?: number;
    } = {}
  ): void {
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(position.x, position.y, position.z)
      .setRotation(rotation)
      .setMass(options.mass || 1.0);

    const body = this.world.createRigidBody(bodyDesc);

    shape
      .setRestitution(options.restitution || 0.5)
      .setFriction(options.friction || 0.5);

    const collider = this.world.createCollider(shape, body);

    this.objects.set(id, { body, collider });
  }

  public update(deltaTime: number): void {
    this.world.step(this.eventQueue);

    this.eventQueue.drainCollisionEvents((handle1, handle2, started) => {
      // Handle collision events
      this.handleCollision(handle1, handle2, started);
    });
  }

  private handleCollision(
    handle1: number,
    handle2: number,
    started: boolean
  ): void {
    const object1 = Array.from(this.objects.entries()).find(
      ([_, obj]) => obj.collider.handle === handle1
    );
    const object2 = Array.from(this.objects.entries()).find(
      ([_, obj]) => obj.collider.handle === handle2
    );

    if (object1 && object2) {
      // Emit collision event
      this.emitCollisionEvent(object1[0], object2[0], started);
    }
  }

  private emitCollisionEvent(id1: string, id2: string, started: boolean): void {
    const event = new CustomEvent('physics-collision', {
      detail: { id1, id2, started },
    });
    window.dispatchEvent(event);
  }
}
