export const minigames = {
  'Mathematical Kingdom': [
    {
      id: 'number-puzzle',
      name: 'Number Matrix',
      type: '3D',
      description: 'Solve the 3D number matrix puzzle',
      difficulty: 1,
      config: {
        gridSize: 3,
        timeLimit: 120,
        points: 100,
      },
    },
    {
      id: 'geometry-challenge',
      name: 'Shape Builder',
      type: 'Interactive',
      description: 'Build complex shapes from basic geometric forms',
      difficulty: 2,
      config: {
        shapes: ['triangle', 'square', 'circle'],
        levels: 5,
        points: 150,
      },
    },
    // Add 3-4 more math minigames...
  ],
  'Scientific Realm': [
    {
      id: 'molecule-builder',
      name: 'Molecule Builder',
      type: '3D',
      description: 'Build molecules using atomic bonds',
      difficulty: 2,
      config: {
        elements: ['H', 'O', 'C', 'N'],
        targetMolecules: ['H2O', 'CO2', 'NH3'],
        points: 200,
      },
    },
    // Add 3-4 more science minigames...
  ],
};
