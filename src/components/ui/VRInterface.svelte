<script lang="ts">
    import { vrStore } from '$lib/vr/VRManager';
    import { spring } from 'svelte/motion';
    import { onMount } from 'svelte';

    const menuPosition = spring({ x: 0, y: 1.6, z: -1 });
    let menuVisible = false;

    function toggleMenu() {
        menuVisible = !menuVisible;
    }
</script>

{#if $vrStore.isActive}
    <T.Group position={[$menuPosition.x, $menuPosition.y, $menuPosition.z]}>
        <!-- VR UI Elements -->
        <T.Mesh visible={menuVisible}>
            <T.PlaneGeometry args={[1, 0.5]} />
            <T.MeshBasicMaterial transparent opacity={0.7} />
            <!-- Add interactive UI elements -->
        </T.Mesh>
    </T.Group>
{/if> 