<script lang="ts">
    import { onMount } from 'svelte';
    import { Canvas } from '@threlte/core';
    import { gameState } from '$lib/stores/gameStore';
    import RealmPortal from './3d/RealmPortal.svelte';
    import GameUI from './ui/GameUI.svelte';
    import { websocketStore } from '$lib/stores/websocketStore';

    let currentRealm: string;
    let ws: WebSocket;

    onMount(() => {
        ws = websocketStore.connect('ws://localhost:3000');
        
        return () => {
            ws.close();
        };
    });

    $: {
        if ($gameState.realm !== currentRealm) {
            currentRealm = $gameState.realm;
            // Handle realm change
        }
    }
</script>

<div class="w-full h-screen relative">
    <Canvas>
        <RealmPortal 
            realm={currentRealm}
            on:select={(event) => {
                gameState.update(s => ({ ...s, realm: event.detail }));
            }}
        />
    </Canvas>

    <GameUI />
</div>

<style>
    :global(canvas) {
        touch-action: none;
    }
</style> 