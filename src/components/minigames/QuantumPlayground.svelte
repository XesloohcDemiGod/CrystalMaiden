<script lang="ts">
    import { T, useFrame } from '@threlte/core';
    import { RigidBody, Physics } from '@threlte/rapier';
    import { spring } from 'svelte/motion';
    import { onMount } from 'svelte';
    import { ParticleSystem } from '$lib/effects/particles';
    import type { Vector3 } from 'three';

    interface Particle {
        position: Vector3;
        entangledWith?: Particle;
        state: 'up' | 'down';
        measured: boolean;
    }

    export let difficulty: number;
    export let onComplete: (score: number) => void;

    let particles: Particle[] = [];
    let score = 0;
    let particleSystem: ParticleSystem;

    const position = spring({ x: 0, y: 0, z: 0 }, {
        stiffness: 0.1,
        damping: 0.4
    });

    onMount(() => {
        particleSystem = new ParticleSystem(100);
        initializeParticles();
    });

    function initializeParticles() {
        particles = Array(difficulty * 2).fill(null).map((_, i) => ({
            position: new Vector3(
                Math.random() * 10 - 5,
                Math.random() * 10 - 5,
                Math.random() * 10 - 5
            ),
            state: Math.random() > 0.5 ? 'up' : 'down',
            measured: false
        }));

        // Create entangled pairs
        for (let i = 0; i < particles.length; i += 2) {
            particles[i].entangledWith = particles[i + 1];
            particles[i + 1].entangledWith = particles[i];
        }
    }

    function measureParticle(particle: Particle) {
        if (particle.measured) return;

        particle.measured = true;
        score += 10;

        if (particle.entangledWith) {
            particle.entangledWith.state = particle.state === 'up' ? 'down' : 'up';
            particle.entangledWith.measured = true;
        }

        particleSystem.emit(particle.position);

        if (particles.every(p => p.measured)) {
            onComplete(score);
        }
    }

    useFrame((state) => {
        // Update particle positions and effects
        particleSystem.update(state.clock.getDelta());
    });
</script>

<Physics>
    <T.Group>
        {#each particles as particle (particle.position.toArray().join(','))}
            <RigidBody position={particle.position}>
                <T.Mesh
                    on:click={() => measureParticle(particle)}
                    scale={particle.measured ? 1.5 : 1}
                >
                    <T.SphereGeometry args={[0.2, 32, 32]} />
                    <T.MeshStandardMaterial
                        color={particle.state === 'up' ? '#4f46e5' : '#e54646'}
                        emissive={particle.measured ? '#ffffff' : '#000000'}
                        emissiveIntensity={0.5}
                        metalness={0.8}
                        roughness={0.2}
                    />
                </T.Mesh>
                {#if particle.entangledWith && !particle.measured}
                    <T.Line
                        points={[particle.position, particle.entangledWith.position]}
                        color="#ffffff"
                        linewidth={1}
                        dashed
                    />
                {/if}
            </RigidBody>
        {/each}
    </T.Group>
</Physics>

<div class="absolute top-4 right-4 bg-black/50 p-4 rounded-lg">
    <h3 class="text-white">Score: {score}</h3>
    <p class="text-white">Measured: {particles.filter(p => p.measured).length}/{particles.length}</p>
</div> 