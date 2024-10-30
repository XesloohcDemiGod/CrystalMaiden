interface EnvironmentState {
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  };
  obstacles: any[];
  resources: Map<any, any>;
  temperature: number;
  lighting: number;
  timeOfDay: number;
  weather: string;
} 