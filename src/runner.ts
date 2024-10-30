// src/runner.ts
import { defaultInputs } from './config/defaultInput';
import { AISystem } from './index';

const aiSystem = new AISystem(defaultInputs);
aiSystem.start();