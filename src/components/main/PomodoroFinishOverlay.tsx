'use client'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

interface PomodoroFinishOverlayProps {
  onComplete: () => void
  onRetry: () => void
}

export default function PomodoroFinishOverlay({ onComplete, onRetry }: PomodoroFinishOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl backdrop-blur-[1px] bg-black/35"
    >
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="text-lg font-bold text-green-300 tracking-wide drop-shadow-[0_0_8px_rgba(34,197,94,0.4)] mb-4"
      >
        任务完成了吗？
      </motion.h3>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08, ease: 'easeInOut' }}
        className="flex items-center gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onComplete}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_16px_rgba(34,197,94,0.5)] transition-all"
        >
          <Check size={14} />
          已完成
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="px-5 py-2 rounded-lg bg-white/10 border border-red-400/20 text-red-300 font-semibold text-xs flex items-center gap-2 hover:bg-white/15 hover:border-red-400/40 transition-all"
        >
          <X size={14} />
          未完成
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
