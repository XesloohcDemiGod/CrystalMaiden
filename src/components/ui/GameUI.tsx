// import { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// export function GameUI({ gameState, onAction }) {
//     const [showInventory, setShowInventory] = useState(false);

//     return (
//         <div className="absolute inset-0 pointer-events-none">
//             {/* Score and Progress */}
//             <div className="absolute top-4 right-4 bg-black/50 p-4 rounded-lg">
//                 <p className="text-white">Score: {gameState.score}</p>
//                 <p className="text-white">Progress: {gameState.progress}%</p>
//             </div>

//             {/* Action Buttons */}
//             <div className="absolute bottom-4 left-4 flex gap-2">
//                 <button 
//                     className="pointer-events-auto px-4 py-2 bg-indigo-600 text-white rounded-lg"
//                     onClick={() => setShowInventory(!showInventory)}
//                 >
//                     Inventory
//                 </button>
//                 {/* Add more action buttons */}
//             </div>

//             {/* Inventory Panel */}
//             <AnimatePresence>
//                 {showInventory && (
//                     <motion.div
//                         initial={{ x: -300 }}
//                         animate={{ x: 0 }}
//                         exit={{ x: -300 }}
//                         className="absolute left-0 top-0 h-full w-72 bg-black/80 p-4"
//                     >
//                         <h2 className="text-white text-xl mb-4">Inventory</h2>
//                         {/* Inventory items */}
//                     </motion.div>
//                 )}
//             </AnimatePresence>
//         </div>
//     );
// } 