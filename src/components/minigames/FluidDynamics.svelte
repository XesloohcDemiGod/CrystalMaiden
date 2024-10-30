<script lang="ts">
    import { T } from '@threlte/core';
    import { FluidSimulator } from '$lib/physics/FluidSimulator';
    
    let simulator: FluidSimulator;
    let particles: Float32Array;
    let velocities: Float32Array;

    function initializeSimulation() {
        simulator = new FluidSimulator({
            particleCount: 1000,
            viscosity: 0.5,
            density: 1.0
        });
    }

    function updateParticles(deltaTime: number) {
        simulator.step(deltaTime);
        particles = simulator.getParticlePositions();
        velocities = simulator.getParticleVelocities();
    }
</script>

<T.Group>
    <T.Points>
        <T.BufferGeometry>
            <T.Float32BufferAttribute 
                attach="attributes-position"
                count={particles.length / 3}
                array={particles}
                itemSize={3}
            />
            <T.Float32BufferAttribute 
                attach="attributes-velocity"
                count={velocities.length / 3}
                array={velocities}
                itemSize={3}
            />
        </T.BufferGeometry>
        <T.ShaderMaterial
            vertexShader={fluidVertexShader}
            fragmentShader={fluidFragmentShader}
            uniforms={{
                time: { value: 0 },
                viscosity: { value: 0.5 }
            }}
        />
    </T.Points>
</T.Group> 