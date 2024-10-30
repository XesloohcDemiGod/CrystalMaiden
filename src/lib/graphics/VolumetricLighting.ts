import { WebGLRenderer, Scene, Camera, Vector3 } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';

class VolumetricLightingSystem {
  private renderer: WebGLRenderer;
  private composer: EffectComposer;
  private volumetricPass: VolumetricLightPass;
  private atmospherePass: AtmosphericScatteringPass;

  constructor(renderer: WebGLRenderer) {
    this.renderer = renderer;
    this.initializePipeline();
  }

  private initializePipeline(): void {
    this.composer = new EffectComposer(this.renderer);

    this.volumetricPass = new VolumetricLightPass({
      density: 0.1,
      decay: 0.95,
      weight: 0.5,
      samples: 100,
    });

    this.atmospherePass = new AtmosphericScatteringPass({
      rayleighCoefficient: 1.0,
      mieCoefficient: 0.1,
      mieDirectionalG: 0.8,
      sunPosition: new Vector3(0, 1000, 0),
    });

    this.composer.addPass(this.volumetricPass);
    this.composer.addPass(this.atmospherePass);
  }

  public update(scene: Scene, camera: Camera): void {
    this.updateLightSources(scene);
    this.updateAtmosphericParameters(camera);
    this.composer.render();
  }

  private updateLightSources(scene: Scene): void {
    const lights = [];
    scene.traverse(object => {
      if (object.isLight) {
        lights.push({
          position: object.position.clone(),
          color: object.color.clone(),
          intensity: object.intensity,
          decay: object.decay,
        });
      }
    });

    this.volumetricPass.setLights(lights);
  }
}

class VolumetricLightPass extends ShaderPass {
  constructor(params: VolumetricParams) {
    super(
      new ShaderMaterial({
        vertexShader: volumetricVertexShader,
        fragmentShader: volumetricFragmentShader,
        uniforms: {
          tDiffuse: { value: null },
          lightPositions: { value: [] },
          lightColors: { value: [] },
          density: { value: params.density },
          decay: { value: params.decay },
          weight: { value: params.weight },
          samples: { value: params.samples },
        },
      })
    );
  }
}
