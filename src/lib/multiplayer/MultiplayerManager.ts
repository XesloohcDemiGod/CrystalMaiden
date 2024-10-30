import { io, Socket } from 'socket.io-client';
import { writable } from 'svelte/store';
import type { GameState } from '$lib/stores/gameStore';

export interface Player {
  id: string;
  name: string;
  realm: string;
  position: { x: number; y: number; z: number };
  state: GameState;
}

export interface Room {
  id: string;
  players: Player[];
  maxPlayers: number;
  gameMode: string;
}

function createMultiplayerStore() {
  const { subscribe, set, update } = writable<{
    socket: Socket | null;
    players: Map<string, Player>;
    currentRoom: Room | null;
  }>({
    socket: null,
    players: new Map(),
    currentRoom: null,
  });

  let socket: Socket;

  return {
    subscribe,
    connect: (serverUrl: string) => {
      socket = io(serverUrl);

      socket.on('playerJoined', (player: Player) => {
        update(state => {
          state.players.set(player.id, player);
          return state;
        });
      });

      socket.on('playerLeft', (playerId: string) => {
        update(state => {
          state.players.delete(playerId);
          return state;
        });
      });

      socket.on('stateUpdate', (updates: Partial<GameState>) => {
        update(state => {
          const player = state.players.get(socket.id);
          if (player) {
            player.state = { ...player.state, ...updates };
          }
          return state;
        });
      });

      set({
        socket,
        players: new Map(),
        currentRoom: null,
      });
    },
    joinRoom: (roomId: string) => {
      socket?.emit('joinRoom', roomId);
    },
    updateState: (updates: Partial<GameState>) => {
      socket?.emit('stateUpdate', updates);
    },
    disconnect: () => {
      socket?.disconnect();
      set({
        socket: null,
        players: new Map(),
        currentRoom: null,
      });
    },
  };
}

export const multiplayerStore = createMultiplayerStore();
