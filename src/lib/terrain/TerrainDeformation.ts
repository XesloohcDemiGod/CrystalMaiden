import { Vector3 } from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';

class TerrainDeformationSystem {
  private heightField: Float32Array;
  private deformationBuffer: Float32Array;
  private materialLayers: MaterialLayer[];
  private gpuCompute: GPUComputationRenderer;

  constructor(resolution: number) {
    this.initializeHeightField(resolution);
    this.initializeGPUCompute(resolution);
  }

  public deform(
    position: Vector3,
    radius: number,
    strength: number,
    type: DeformationType
  ): void {
    const deformation = this.calculateDeformation(
      position,
      radius,
      strength,
      type
    );
    this.applyDeformation(deformation);
    this.updatePhysics();
    this.updateMaterials();
  }

  private calculateDeformation(
    position: Vector3,
    radius: number,
    strength: number,
    type: DeformationType
  ): DeformationData {
    const deformationShader = `
            uniform sampler2D heightMap;
            uniform vec3 deformPosition;
            uniform float radius;
            uniform float strength;
            uniform int deformType;

            void main() {
                vec2 uv = gl_FragCoord.xy / resolution.xy;
                float height = texture2D(heightMap, uv).x;
                
                vec2 delta = uv - deformPosition.xz;
                float distance = length(delta);
                float influence = smoothstep(radius, 0.0, distance);
                
                // Apply different deformation types
                if (deformType == 0) { // Raise/Lower
                    height += strength * influence;
                } else if (deformType == 1) { // Smooth
                    float avgHeight = calculateAverageHeight(uv, radius);
                    height = mix(height, avgHeight, influence * strength);
                } else if (deformType == 2) { // Noise
                    height += noise(uv * 10.0) * influence * strength;
                }
                
                gl_FragColor = vec4(height, 0.0, 0.0, 1.0);
            }
        `;

    return this.gpuCompute.compute();
  }

  private updateMaterials(): void {
    const materialUpdateShader = `
            uniform sampler2D heightMap;
            uniform sampler2D slopeMap;
            uniform sampler2D moistureMap;
            
            void main() {
                vec2 uv = gl_FragCoord.xy / resolution.xy;
                float height = texture2D(heightMap, uv).x;
                float slope = texture2D(slopeMap, uv).x;
                float moisture = texture2D(moistureMap, uv).x;
                
                // Determine material layers based on height, slope, and moisture
                vec4 materialWeights = calculateMaterialWeights(height, slope, moisture);
                
                gl_FragColor = materialWeights;
            }
        `;

    this.gpuCompute.setShader('materialUpdate', materialUpdateShader);
    this.gpuCompute.compute();
  }
}
