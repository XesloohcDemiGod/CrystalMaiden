// import { useRef } from 'react';
// import { useFrame } from '@react-three/fiber';
// import { Text } from '@react-three/drei';

// export function RealmPortal({ position, realm, onClick }) {
//     const portalRef = useRef();

//     useFrame((state) => {
//         portalRef.current.rotation.y += 0.01;
//     });

//     return (
//         <group position={position} onClick={onClick}>
//             <mesh ref={portalRef}>
//                 <torusGeometry args={[2, 0.3, 16, 100]} />
//                 <meshStandardMaterial 
//                     color="#4f46e5"
//                     emissive="#818cf8"
//                     roughness={0.2}
//                     metalness={0.8}
//                 />
//             </mesh>
//             <Text
//                 position={[0, 0, 0.5]}
//                 fontSize={0.5}
//                 color="#ffffff"
//                 anchorX="center"
//                 anchorY="middle"
//             >
//                 {realm || 'Choose a Realm'}
//             </Text>
//         </group>
//     );
// } 