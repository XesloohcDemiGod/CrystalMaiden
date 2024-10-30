<script lang="ts">
    import { T } from '@threlte/core';
    import { interactivity } from '@threlte/extras';
    import { spring } from 'svelte/motion';
    import type { Molecule } from '$lib/types';

    export let molecules: Molecule[];
    export let onComplete: (score: number) => void;

    const position = spring({ x: 0, y: 0, z: 0 }, {
        stiffness: 0.1,
        damping: 0.4
    });

    let selectedAtoms: string[] = [];
    let currentMolecule: Molecule | null = null;

    function handleAtomClick(atom: string) {
        selectedAtoms = [...selectedAtoms, atom];
        checkMolecule();
    }

    function checkMolecule() {
        const formula = selectedAtoms.join('');
        const match = molecules.find(m => m.formula === formula);
        if (match) {
            onComplete(100);
            currentMolecule = match;
        }
    }
</script>

<T.Group>
    <T.PointLight position={[10, 10, 10]} />
    <T.AmbientLight intensity={0.5} />
    
    {#each molecules as molecule}
        <T.Group position={[molecule.position.x, molecule.position.y, molecule.position.z]}>
            {#each molecule.atoms as atom}
                <T.Mesh
                    position={[atom.x, atom.y, atom.z]}
                    on:click={() => handleAtomClick(atom.type)}
                    use:interactivity
                >
                    <T.SphereGeometry args={[0.5, 32, 32]} />
                    <T.MeshStandardMaterial 
                        color={atom.color}
                        metalness={0.5}
                        roughness={0.2}
                    />
                </T.Mesh>
            {/each}
        </T.Group>
    {/each}
</T.Group>

<div class="absolute bottom-4 left-4 bg-black/50 p-4 rounded-lg">
    <h3 class="text-white">Current Formula: {selectedAtoms.join('')}</h3>
    {#if currentMolecule}
        <p class="text-green-400">Correct! You've built {currentMolecule.name}</p>
    {/if}
</div> 