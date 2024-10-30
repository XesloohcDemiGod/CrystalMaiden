<script lang="ts">
    import { T } from '@threlte/core';
    import { XR, VRButton, Controllers } from '@threlte/xr';
    import { spring } from 'svelte/motion';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    interface DNABase {
        type: 'A' | 'T' | 'C' | 'G';
        position: { x: number; y: number; z: number };
        paired: boolean;
    }

    export let difficulty: number;
    export let onComplete: (score: number) => void;

    let bases: DNABase[] = [];
    let score = 0;
    let helix = spring({ rotation: 0 });

    function generateSequence() {
        const types: ('A' | 'T' | 'C' | 'G')[] = ['A', 'T', 'C', 'G'];
        bases = Array(difficulty * 4).fill(null).map((_, i) => ({
            type: types[Math.floor(Math.random() * types.length)],
            position: { x: 0, y: 0, z: 0 },
            paired: false
        }));
    }
</script> 