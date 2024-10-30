import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise';
import { Vector3, Color } from 'three';

interface BiomeData {
  temperature: number;
  humidity: number;
  height: number;
  vegetation: number;
  color: Color;
}

class ProceduralWorldGenerator {
  private noise: SimplexNoise;
  private biomes: Map<string, BiomeData>;
  private heightMap: Float32Array;
  private temperatureMap: Float32Array;
  private humidityMap: Float32Array;

  constructor() {
    this.noise = new SimplexNoise();
    this.initializeBiomes();
  }

  public generateChunk(position: Vector3, size: number): WorldChunk {
    const heightData = this.generateHeightMap(position, size);
    const biomeData = this.generateBiomeData(position, size);
    const features = this.generateFeatures(heightData, biomeData);

    return new WorldChunk(position, size, {
      heightData,
      biomeData,
      features,
    });
  }

  private generateHeightMap(position: Vector3, size: number): Float32Array {
    const heightData = new Float32Array(size * size);

    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        const worldX = position.x + x;
        const worldZ = position.z + z;

        heightData[x + z * size] = this.calculateHeight(worldX, worldZ);
      }
    }

    return heightData;
  }

  private calculateHeight(x: number, z: number): number {
    const scale = 0.001;
    const octaves = 6;
    let amplitude = 1;
    let frequency = 1;
    let height = 0;

    for (let i = 0; i < octaves; i++) {
      height +=
        this.noise.noise(x * scale * frequency, z * scale * frequency) *
        amplitude;

      amplitude *= 0.5;
      frequency *= 2;
    }

    return height;
  }
}
