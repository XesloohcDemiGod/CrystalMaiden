import * as tf from '@tensorflow/tfjs';
import { Sequential } from '@tensorflow/tfjs';

interface NetworkConfig {
  inputSize: number;
  hiddenLayers: number[];
  outputSize: number;
  learningRate: number;
}

export class AdaptiveNeuralNetwork {
  private model: tf.Sequential = new Sequential;
  private config: NetworkConfig;
  private history: tf.History[];

  constructor(config: NetworkConfig) {
    this.config = config;
    this.history = [];
    this.initializeNetwork();
  }

  private async initializeNetwork() {
    this.model = tf.sequential();

    // Input layer
    this.model.add(
      tf.layers.dense({
        units: this.config.hiddenLayers[0],
        inputShape: [this.config.inputSize],
        activation: 'relu',
      })
    );

    // Hidden layers
    for (let i = 1; i < this.config.hiddenLayers.length; i++) {
      this.model.add(
        tf.layers.dense({
          units: this.config.hiddenLayers[i],
          activation: 'relu',
        })
      );
    }

    // Output layer
    this.model.add(
      tf.layers.dense({
        units: this.config.outputSize,
        activation: 'softmax',
      })
    );

    this.model.compile({
      optimizer: tf.train.adam(this.config.learningRate),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });
  }

  async predict(input: number[]): Promise<number[]> {
    const tensorInput = tf.tensor2d([input]);
    const prediction = (await this.model.predict(tensorInput)) as tf.Tensor;
    return Array.from(prediction.dataSync());
  }

  async train(inputs: number[][], outputs: number[][]): Promise<void> {
    const xs = tf.tensor2d(inputs);
    const ys = tf.tensor2d(outputs);

    const history = await this.model.fit(xs, ys, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
    });

    this.history.push(history);
  }
}
