import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from '../utils/audio';
import { LOGO_FRONT_URL, LOGO_BACK_URL } from '../utils/constants';

interface InteractiveCoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InteractiveCoinModal: React.FC<InteractiveCoinModalProps> = ({ isOpen, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [flipCount, setFlipCount] = useState(0);

  const handleFlip = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    soundEngine.playCoinSpinningRattleSound();

    // Trigger spin & flip animation
    setTimeout(() => {
      setIsFlipped((prev) => !prev);
      setFlipCount((c) => c + 1);
      setIsSpinning(false);
    }, 1600);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-0.5 flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-amber-500 text-[20px]">
              monetization_on
            </span>
            PaisaMeter Interactive 3D Coin
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Click the coin to flip between Front side & 3D Metallic Back side with realistic spinning coin sound!
          </p>

          {/* 3D Coin Container */}
          <div className="flex justify-center my-3">
            <div
              onClick={handleFlip}
              className="w-48 h-48 sm:w-56 sm:h-56 cursor-pointer select-none perspective-1000 group relative"
              title="Click to spin and flip coin with sound"
            >
              <motion.div
                animate={{
                  rotateY: (isFlipped ? 180 : 0) + (isSpinning ? 1080 : 0),
                  rotateZ: isSpinning ? [0, -8, 8, -4, 4, 0] : 0,
                  scale: isSpinning ? [1, 1.14, 1.05, 1] : 1,
                }}
                transition={{ duration: 1.6, ease: [0.25, 1, 0.5, 1] }}
                className="w-full h-full relative transform-style-3d shadow-xl rounded-full transition-shadow group-hover:shadow-2xl"
              >
                {/* Front Side */}
                <div className="absolute inset-0 w-full h-full rounded-full backface-hidden flex items-center justify-center bg-white p-2 border-3 border-blue-500/30 shadow-inner">
                  <img
                    src={LOGO_FRONT_URL}
                    alt="PaisaMeter Front Side Logo"
                    className="w-full h-full object-contain rounded-full"
                  />
                  <span className="absolute bottom-2 text-[10px] font-bold text-blue-700 bg-white/95 px-2.5 py-0.5 rounded-full shadow-2xs border border-blue-200">
                    Front side (Click to Spin)
                  </span>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 w-full h-full rounded-full backface-hidden rotate-y-180 flex items-center justify-center bg-slate-900 p-2 border-3 border-slate-400/40 shadow-inner">
                  <img
                    src={LOGO_BACK_URL}
                    alt="PaisaMeter Back Side 3D Coin"
                    className="w-full h-full object-contain rounded-full"
                  />
                  <span className="absolute bottom-2 text-[10px] font-bold text-emerald-400 bg-slate-950/95 px-2.5 py-0.5 rounded-full shadow-2xs border border-emerald-900">
                    Back side (3D Coin)
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center gap-2">
            <button
              onClick={handleFlip}
              disabled={isSpinning}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              {isSpinning ? 'Spinning with Sound...' : 'Flip 3D Coin (Play Sound)'}
            </button>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Total Flips: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{flipCount}</span> • Realistic spin rattle audio enabled
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
