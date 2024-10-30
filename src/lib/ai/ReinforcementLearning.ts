// import * as tf from  '@tensorflow/tfjs';
// import { Vector3 } from 'three';
// import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';
// import { Entity } from '../types';
// import { ExperienceBuffer } from './ExperienceBuffer';

// interface State {
//   position: Vector3;
//   health: number;
//   inventory: Item[];
//   nearbyEntities: Entity[];
//   environmentData: EnvironmentData;
// }

// class DeepQLearningAgent {
//   private model: tf.LayersModel;
//   private targetModel: tf.LayersModel;
//   private replayBuffer: ExperienceBuffer;
//   private epsilon = 1.0;
//   private readonly MIN_EPSILON = 0.01;
//   private readonly EPSILON_DECAY = 0.995;

//   constructor(stateSize: number, actionSize: number) {
//     this.model = this.buildNetwork(stateSize, actionSize);
//     this.targetModel = this.buildNetwork(stateSize, actionSize);
//     this.replayBuffer = new ExperienceBuffer(10000);
//   }

//   private buildNetwork(stateSize: number, actionSize: number): tf.LayersModel {
//     const model = tf.sequential();

//     model.add(
//       tf.layers.dense({
//         units: 256,
//         activation: 'relu',
//         inputShape: [stateSize],
//       })
//     );

//     model.add(
//       tf.layers.dense({
//         units: 256,
//         activation: 'relu',
//       })
//     );

//     model.add(
//       tf.layers.dense({
//         units: actionSize,
//         activation: 'linear',
//       })
//     );

//     model.compile({
//       optimizer: tf.train.adam(0.001),
//       loss: 'meanSquaredError',
//     });

//     return model;
//   }

//   public async act(state: State): Promise<Action> {
//     if (Math.random() < this.epsilon) {
//       return this.randomAction();
//     }

//     const stateTensor = this.preprocessState(state);
//     const actionValues = (await this.model.predict(stateTensor)) as tf.Tensor;
//     const action = tf.argMax(actionValues, 1).dataSync()[0];

//     return this.mapActionIndexToAction(action);
//   }

//   public async learn(experience: Experience): Promise<void> {
//     this.replayBuffer.add(experience);

//     if (this.replayBuffer.size() >= this.BATCH_SIZE) {
//       const batch = this.replayBuffer.sample(this.BATCH_SIZE);
//       await this.trainOnBatch(batch);

//       this.epsilon = Math.max(
//         this.MIN_EPSILON,
//         this.epsilon * this.EPSILON_DECAY
//       );

//       this.updateTargetModel();
//     }
//   }

//   private async trainOnBatch(batch: Experience[]): Promise<void> {
//     const states = tf.stack(batch.map(exp => this.preprocessState(exp.state)));
//     const nextStates = tf.stack(
//       batch.map(exp => this.preprocessState(exp.nextState))
//     );

//     const currentQValues = (await this.model.predict(states)) as tf.Tensor;
//     const nextQValues = (await this.targetModel.predict(
//       nextStates
//     )) as tf.Tensor;

//     const updatedQValues = this.calculateUpdatedQValues(
//       currentQValues,
//       nextQValues,
//       batch
//     );

//     await this.model.trainOnBatch(states, updatedQValues);
//   }
// }
