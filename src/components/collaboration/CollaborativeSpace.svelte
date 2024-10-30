<script lang="ts">
    import { T } from '@threlte/core';
    import { YDoc, WebsocketProvider } from 'y-websocket';
    import { Awareness } from 'y-protocols/awareness';
    import { spring } from 'svelte/motion';

    interface User {
        id: string;
        position: { x: number; y: number; z: number };
        rotation: { x: number; y: number; z: number };
        avatar: string;
        action: string;
    }

    const ydoc = new YDoc();
    const provider = new WebsocketProvider('ws://localhost:1234', 'virtual-classroom', ydoc);
    const awareness = new Awareness(ydoc);

    let users = new Map<string, User>();
    let sharedObjects = ydoc.getMap('objects');

    awareness.on('change', () => {
        const states = awareness.getStates();
        users = new Map(Array.from(states).map(([key, state]) => [key, state.user]));
    });

    function updateUserPosition(position: { x: number; y: number; z: number }) {
        awareness.setLocalState({
            user: {
                id: ydoc.clientID,
                position,
                rotation: { x: 0, y: 0, z: 0 },
                avatar: 'default',
                action: 'idle'
            }
        });
    }
</script>

<T.Group>
    {#each Array.from(users.values()) as user}
        <T.Group 
            position={[user.position.x, user.position.y, user.position.z]}
            rotation={[user.rotation.x, user.rotation.y, user.rotation.z]}
        >
            <!-- User Avatar -->
            <T.Mesh>
                <T.BoxGeometry args={[1, 2, 1]} />
                <T.MeshStandardMaterial color="#4f46e5" />
            </T.Mesh>
            
            <!-- User Nametag -->
            <T.Sprite position={[0, 2.5, 0]}>
                <T.SpriteMaterial>
                    <T.CanvasTexture>
                        <!-- Render user name -->
                    </T.CanvasTexture>
                </T.SpriteMaterial>
            </T.Sprite>
        </T.Group>
    {/each}
</T.Group> 