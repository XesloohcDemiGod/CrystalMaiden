// import { useState, useEffect } from 'react';
// import { Canvas } from '@react-three/fiber';
// import { OrbitControls, Stars } from '@react-three/drei';
// import { RealmPortal } from './3d/RealmPortal';
// import { GameUI } from './ui/GameUI';
// import { useWebSocket } from '../hooks/useWebSocket';

// export default function Journey() {
//     const [gameState, setGameState] = useState({
//         realm: '',
//         score: 0,
//         progress: 0
//     });

//     const { messages, sendMessage } = useWebSocket('ws://localhost:3000');

//     useEffect(() => {
//         if (messages.length) {
//             const lastMessage = messages[messages.length - 1];
//             // Update game state based on websocket messages
//             setGameState(prev => ({ ...prev, ...lastMessage.data }));
//         }
//     }, [messages]);

//     return (
//         <div className="w-full h-screen">
//             <Canvas>
//                 <OrbitControls />
//                 <Stars />
//                 <ambientLight intensity={0.5} />
//                 <pointLight position={[10, 10, 10]} />
//                 <RealmPortal 
//                     position={[0, 0, 0]} 
//                     realm={gameState.realm}
//                     onClick={() => {/* Handle portal click */}}
//                 />
//             </Canvas>
//             <GameUI 
//                 gameState={gameState}
//                 onAction={(action, data) => {
//                     sendMessage({ type: action, data });
//                 }}
//             />
//         </div>
//     );
// } 