import { WebXRManager } from 'three';
import { writable } from 'svelte/store';

interface VRState {
  isAvailable: boolean;
  isActive: boolean;
  controllers: any[];
}

function createVRStore() {
  const { subscribe, set, update } = writable<VRState>({
    isAvailable: false,
    isActive: false,
    controllers: [],
  });

  let xrManager: WebXRManager;

  return {
    subscribe,
    initialize: async (renderer: THREE.WebGLRenderer) => {
      try {
        const session = await navigator.xr?.requestSession('immersive-vr');
        xrManager = new WebXRManager(renderer, session);

        update(state => ({
          ...state,
          isAvailable: true,
        }));
      } catch (error) {
        console.error('VR not available:', error);
      }
    },
    updateControllers: (controllers: any[]) => {
      update(state => ({
        ...state,
        controllers,
      }));
    },
  };
}

export const vrStore = createVRStore();
