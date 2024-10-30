import { Mesh, SkinnedMesh, Vector3 } from 'three';

interface BlendShapeData {
  name: string;
  weight: number;
  targetPositions: Float32Array;
  targetNormals: Float32Array;
}

interface TransitionData {
  startWeight: number;
  targetWeight: number;
  duration: number;
  elapsed: number;
}

class FacialAnimationController {
  private mesh: SkinnedMesh;
  private blendShapes: Map<string, BlendShapeData>;
  private currentExpression: Map<string, number>;
  private transitionState: Map<string, TransitionData>;

  constructor(mesh: SkinnedMesh) {
    this.mesh = mesh;
    this.blendShapes = new Map();
    this.currentExpression = new Map();
    this.transitionState = new Map();
    this.initializeBlendShapes();
  }

  private initializeBlendShapes(): void {
    const geometry = this.mesh.geometry;
    if (!geometry.morphAttributes.position) return;

    // Store original geometry data
    geometry.userData.originalPositions = Float32Array.from(geometry.attributes.position.array);
    geometry.userData.originalNormals = Float32Array.from(geometry.attributes.normal.array);

    // Initialize blend shapes from morph targets
    for (let i = 0; i < geometry.morphAttributes.position.length; i++) {
      const name = (geometry as any).morphTargetDictionary?.[i] ?? `morphTarget${i}`;
      this.blendShapes.set(name, {
        name,
        weight: 0,
        targetPositions: Float32Array.from(geometry.morphAttributes.position[i].array),
        targetNormals: Float32Array.from(geometry.morphAttributes.normal?.[i]?.array ?? []),
      });
    }
  }

  public async setExpression(
    expression: Map<string, number>,
    duration = 0.3
  ): Promise<void> {
    // Start transition for each blend shape
    expression.forEach((targetWeight, shapeName) => {
      const currentWeight = this.currentExpression.get(shapeName) || 0;

      this.transitionState.set(shapeName, {
        startWeight: currentWeight,
        targetWeight,
        duration,
        elapsed: 0,
      });
    });

    // Wait for transition to complete
    await new Promise(resolve => setTimeout(resolve, duration * 1000));
  }

  public update(deltaTime: number): void {
    // Update transitions
    this.transitionState.forEach((transition, shapeName) => {
      transition.elapsed += deltaTime;
      const t = Math.min(transition.elapsed / transition.duration, 1);

      // Apply easing
      const weight = this.interpolateWeight(
        transition.startWeight,
        transition.targetWeight,
        this.easeInOutCubic(t)
      );

      // Update blend shape
      this.setBlendShapeWeight(shapeName, weight);

      // Remove completed transitions
      if (t >= 1) {
        this.transitionState.delete(shapeName);
        this.currentExpression.set(shapeName, transition.targetWeight);
      }
    });

    // Update mesh geometry
    this.updateGeometry();
  }

  private updateGeometry(): void {
    const geometry = this.mesh.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    const normals = geometry.attributes.normal.array as Float32Array;

    // Reset to base geometry
    positions.set(geometry.userData.originalPositions);
    normals.set(geometry.userData.originalNormals);

    // Apply blend shapes
    this.currentExpression.forEach((weight, shapeName) => {
      if (weight === 0) return;

      const blendShape = this.blendShapes.get(shapeName)!;
      for (let i = 0; i < positions.length; i++) {
        positions[i] += blendShape.targetPositions[i] * weight;
        normals[i] += blendShape.targetNormals[i] * weight;
      }
    });

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.normal.needsUpdate = true;
  }

  private interpolateWeight(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private setBlendShapeWeight(shapeName: string, weight: number): void {
    const blendShape = this.blendShapes.get(shapeName);
    if (blendShape) {
      blendShape.weight = weight;
    }
  }
}
