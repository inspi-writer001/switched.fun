import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface EmojiReactionProps {
  isVisible: boolean;
  emoji: string;
  onComplete: () => void;
}

export const EmojiReaction = ({
  isVisible,
  emoji,
  onComplete,
}: EmojiReactionProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isVisible) {
      // Add some randomness to the starting position
      setPosition({
        x: Math.random() * 20 - 10, // Random value between -10 and 10
        y: 0,
      });
    }
  }, [isVisible]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{
            opacity: [1, 1, 0],
            y: -60,
            x: position.x,
            scale: [1, 1.2, 1],
          }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute pointer-events-none text-2xl"
        >
          {emoji}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
