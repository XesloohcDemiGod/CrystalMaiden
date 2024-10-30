<script lang="ts">
    import { T } from '@threlte/core';
    import { spring } from 'svelte/motion';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    export let difficulty: number;
    export let onComplete: (score: number) => void;

    const rotation = spring({ x: 0, y: 0, z: 0 });
    const scale = tweened(1, {
        duration: 400,
        easing: cubicOut
    });

    let shapes = [];
    let targetShape = null;
    let score = 0;

    function generatePuzzle() {
        // Generate random geometric puzzle based on difficulty
        shapes = Array(difficulty).fill(null).map((_, i) => ({
            type: ['cube', 'sphere', 'cylinder'][Math.floor(Math.random() * 3)],
            position: {
                x: Math.random() * 4 - 2,
                y: Math.random() * 4 - 2,
                z: 0
            },
            rotation: {
                x: Math.random() * Math.PI,
                y: Math.random() * Math.PI,
                z: Math.random() * Math.PI
            }
        }));
    }

    function handleShapeClick(shape) {
        if (shape === targetShape) {
            score += 100;
            if (score >= 500) {
                onComplete(score);
            } else {
                generatePuzzle();
            }
        }
    }

    $: {
        generatePuzzle();
    }
</script>

<T.Group>
    {#each shapes as shape}
        <T.Mesh
            position={[shape.position.x, shape.position.y, shape.position.z]}
            rotation={[shape.rotation.x, shape.rotation.y, shape.rotation.z]}
            on:click={() => handleShapeClick(shape)}
        >
            {#if shape.type === 'cube'}
                <T.BoxGeometry args={[1, 1, 1]} />
            {:else if shape.type === 'sphere'}
                <T.SphereGeometry args={[0.5, 32, 32]} />
            {:else}
                <T.CylinderGeometry args={[0.5, 0.5, 1, 32]} />
            {/if}
            <T.MeshStandardMaterial 
                color="#4f46e5"
                metalness={0.5}
                roughness={0.2}
            />
        </T.Mesh>
    {/each}
</T.Group>

<div class="absolute top-4 right-4 bg-black/50 p-4 rounded-lg">
    <h3 class="text-white">Score: {score}</h3>
</div> 