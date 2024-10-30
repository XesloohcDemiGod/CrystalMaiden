import { Vector3, Color, Texture } from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';

interface ParticleSettings {
  count: number;
  lifetime: number;
  size: number;
  velocity: Vector3;
  color: Color;
  texture?: Texture;
  forces: Force[];
}

interface Force {
  type: 'gravity' | 'wind' | 'vortex' | 'attraction';
  strength: number;
  position?: Vector3;
  direction?: Vector3;
}

export class AdvancedParticleSystem {
  private gpuCompute: GPUComputationRenderer;
  private positionVariable: any;
  private velocityVariable: any;

  constructor(renderer: THREE.WebGLRenderer, settings: ParticleSettings) {
    const SIZE = Math.ceil(Math.sqrt(settings.count));
    this.gpuCompute = new GPUComputationRenderer(SIZE, SIZE, renderer);

    // Position computation shader
    const positionShader = `
            uniform float deltaTime;
            void main() {
                vec2 uv = gl_FragCoord.xy / resolution.xy;
                vec4 pos = texture2D(texturePosition, uv);
                vec4 vel = texture2D(textureVelocity, uv);
                
                // Update position based on velocity
                pos.xyz += vel.xyz * deltaTime;
                
                // Apply forces
                ${this.generateForceComputation(settings.forces)}
                
                gl_FragColor = pos;
            }
        `;

    // Velocity computation shader
    const velocityShader = `
            uniform float deltaTime;
            void main() {
                vec2 uv = gl_FragCoord.xy / resolution.xy;
                vec4 vel = texture2D(textureVelocity, uv);
                
                // Apply forces to velocity
                ${this.generateVelocityComputation(settings.forces)}
                
                gl_FragColor = vel;
            }
        `;

    this.initializeComputeRenderer(positionShader, velocityShader);
  }

  private generateForceComputation(forces: Force[]): string {
    return forces
      .map(force => {
        switch (force.type) {
          case 'gravity':
            return `pos.y -= ${force.strength} * deltaTime * deltaTime;`;
          case 'vortex':
            return `
                        vec3 toCenter = ${force.position.toArray()} - pos.xyz;
                        float dist = length(toCenter);
                        vec3 perpendicular = normalize(cross(toCenter, vec3(0.0, 1.0, 0.0)));
                        pos.xyz += perpendicular * ${
                          force.strength
                        } * deltaTime / dist;
                    `;
          // Add more force types...
        }
      })
      .join('\n');
  }

  public update(deltaTime: number): void {
    this.gpuCompute.compute();
    // Update uniforms and render particles
  }
}
