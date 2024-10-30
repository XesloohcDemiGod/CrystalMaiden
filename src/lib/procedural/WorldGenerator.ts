import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise';
import { Vector3 } from 'three';

interface BiomeSettings {
  temperature: number;
  humidity: number;
  height: number;
  vegetation: number;
}

export class WorldGenerator {
  private noise: SimplexNoise;
  private biomes: Map<string, BiomeSettings>;
  private chunks: Map<string, THREE.Mesh>;

  constructor() {
    this.noise = new SimplexNoise();
    this.initializeBiomes();
  }

  private initializeBiomes() {
    this.biomes = new Map([
      [
        'forest',
        {
          temperature: 0.6,
          humidity: 0.7,
          height: 0.5,
          vegetation: 0.8,
        },
      ],
      // Add more biomes...
    ]);
  }

  public generateChunk(position: Vector3): THREE.Mesh {
    const size = 16;
    const resolution = 1;
    const vertices = [];
    const indices = [];
    const uvs = [];

    for (let x = 0; x < size; x += resolution) {
      for (let z = 0; z < size; z += resolution) {
        const height = this.generateHeight(x + position.x, z + position.z);
        const biome = this.determineBiome(x + position.x, z + position.z);

        // Generate mesh data based on height and biome
        this.generateVertexData(x, height, z, vertices, indices, uvs);
      }
    }

    return this.createMesh(vertices, indices, uvs);
  }

  private generateHeight(x: number, z: number): number {
    const scale = 0.01;
    const octaves = 4;
    let height = 0;
    let amplitude = 1;
    let frequency = 1;

    for (let i = 0; i < octaves; i++) {
      height +=
        this.noise.noise(x * scale * frequency, z * scale * frequency) *
        amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return height;
  }

  private determineBiome(x: number, z: number): string {
    const temperature = this.noise.noise(x * 0.001, z * 0.001);
    const humidity = this.noise.noise(x * 0.001 + 1000, z * 0.001 + 1000);

    // Determine biome based on temperature and humidity
    return this.findClosestBiome(temperature, humidity);
  }
}
