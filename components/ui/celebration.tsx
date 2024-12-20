import Confetti from 'react-confetti';
import { motion } from 'framer-motion';

export function Celebration() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <Confetti
        numberOfPieces={200}
        recycle={false}
        gravity={0.2}
      />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="celebration-message"
      >
        <h2 className="text-4xl font-bold text-primary mb-4">🎉 Amazing Work! 🎉</h2>
        <p className="text-xl">You're making fantastic progress!</p>
      </motion.div>
    </div>
  );
} 