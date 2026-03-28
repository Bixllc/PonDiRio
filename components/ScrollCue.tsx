// "use client";

// import { motion } from "framer-motion";
// import { ChevronDown } from "lucide-react";

// export default function ScrollCue() {
//   return (
//     <motion.div
//       className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30"
//       initial={{ y: 10, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       transition={{ duration: 0.6, delay: 1 }}
//     >
//       <motion.div
//         animate={{ y: [0, 8, 0] }}
//         transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
//         className="flex flex-col items-center text-white/80"
//       >
//         <p className="text-sm mb-1">Scroll to explore</p>
//         <ChevronDown className="h-5 w-5" />
//       </motion.div>
//     </motion.div>
//   );
// }
