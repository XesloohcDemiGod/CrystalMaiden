import { Quaternion, Vector3 } from 'three';
import { AnimationMixer, AnimationAction } from 'three';

// Add this interface before the class definition
interface BlendState {
  weight: number;
  targetWeight: number;
  blendTime: number;
  timeScale: number;
}

class AdvancedAnimationController {
  private mixer: AnimationMixer;
  private animations: Map<string, AnimationAction>;
  private blendStates: Map<string, BlendState>;

  constructor(model: THREE.Object3D) {
    this.mixer = new AnimationMixer(model);
    this.animations = new Map();
    this.blendStates = new Map();
  }

  public addAnimation(name: string, clip: THREE.AnimationClip): void {
    const action = this.mixer.clipAction(clip);
    this.animations.set(name, action);

    this.blendStates.set(name, {
      weight: 0,
      targetWeight: 0,
      blendTime: 0.3,
      timeScale: 1,
    });
  }

  public async transitionTo(
    animationName: string,
    targetWeight: number,
    blendTime: number,
    timeScale: number
  ): Promise<void> {
    const action = this.animations.get(animationName);
    if (!action) {
      throw new Error(`Animation "${animationName}" not found`);
    }

    const currentWeight = this.blendStates.get(animationName)?.weight || 0;
    const blendState = this.blendStates.get(animationName);
    if (!blendState) {
      throw new Error(`Blend state for animation "${animationName}" not found`);
    }

    blendState.targetWeight = targetWeight;
    blendState.blendTime = blendTime;
    blendState.timeScale = timeScale;

    action.setEffectiveTimeScale(timeScale);
    action.setEffectiveWeight(targetWeight);
    action.enabled = true;
    action.play();
    
    // Fade from current state to the target action
    action.crossFadeTo(action, blendTime, true);
  }
}
