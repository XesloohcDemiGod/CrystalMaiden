import { XRSystem, XRSession, XRFrame } from 'webxr';
import { Vector3, Quaternion } from 'three';

interface VRController {
  position: Vector3;
  rotation: Quaternion;
  buttons: Map<string, boolean>;
  hapticActuator?: GamepadHapticActuator;
}

export class AdvancedVRSystem {
  private session: XRSession | null = null;
  private frameOfReference: XRReferenceSpace | null = null;
  private controllers: Map<string, VRController> = new Map();
  private gestures: GestureRecognizer;

  constructor() {
    this.gestures = new GestureRecognizer();
  }

  async initialize(): Promise<void> {
    if (!navigator.xr) {
      throw new Error('WebXR not supported');
    }

    this.session = await navigator.xr.requestSession('immersive-vr', {
      requiredFeatures: ['local-floor', 'hand-tracking', 'mesh-detection'],
    });

    this.frameOfReference = await this.session.requestReferenceSpace(
      'local-floor'
    );
    this.setupControllers();
  }

  private setupControllers(): void {
    this.session?.addEventListener(
      'inputsourceschange',
      (event: XRInputSourceChangeEvent) => {
        for (const inputSource of event.added) {
          this.controllers.set(inputSource.handedness, {
            position: new Vector3(),
            rotation: new Quaternion(),
            buttons: new Map(),
            hapticActuator: inputSource.gamepad?.hapticActuators[0],
          });
        }
      }
    );
  }

  public provideFeedback(intensity: number, duration: number): void {
    this.controllers.forEach(controller => {
      controller.hapticActuator?.playEffect('dual-rumble', {
        duration,
        strongMagnitude: intensity,
      });
    });
  }
}
