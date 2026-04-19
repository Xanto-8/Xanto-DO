'use client'

import { useCallback, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Circle, Trash2, Timer } from 'lucide-react'
import { useTodoStore } from '@/lib/store'
import ShatterCard from './ShatterCard'
import TodoPomodoro from './TodoPomodoro'
import PomodoroFinishOverlay from './PomodoroFinishOverlay'

interface TodoCardProps {
  todo: { id: string; text: string; completed: boolean; pomodoroCount: number }
  shatteringId: string | null
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onPomodoroCompleted: (id: string) => void
  onPomodoroRetry: (id: string) => void
}

export default function TodoCard({ todo, shatteringId, onToggle, onDelete, onPomodoroCompleted, onPomodoroRetry }: TodoCardProps) {
  const { getPomodoro } = useTodoStore()
  const pomodoroState = getPomodoro(todo.id)

  const isActuallyFinished = pomodoroState.isFinished || (
    pomodoroState.timeLeft === 0 && pomodoroState.duration > 0 && !pomodoroState.isRunning
  )

  const [isCardFlashing, setIsCardFlashing] = useState(false)
  const [cardFlashOn, setCardFlashOn] = useState(false)

  const pomodoroFlashActive = pomodoroState.isRunning && !isActuallyFinished && pomodoroState.timeLeft <= 300 && pomodoroState.timeLeft > 60
  const cardFlashActive = pomodoroState.isRunning && !isActuallyFinished && pomodoroState.timeLeft <= 60

  useEffect(() => {
    if (!pomodoroFlashActive) {
      setIsCardFlashing(false)
      return
    }
    const timer = setInterval(() => setIsCardFlashing(prev => !prev), 1000)
    return () => clearInterval(timer)
  }, [pomodoroFlashActive])

  useEffect(() => {
    if (!cardFlashActive) {
      setCardFlashOn(false)
      return
    }
    const timer = setInterval(() => setCardFlashOn(prev => !prev), 500)
    return () => clearInterval(timer)
  }, [cardFlashActive])

  const showOverlay = isActuallyFinished && !todo.completed && !shatteringId

  const cardBorderClass = showOverlay
    ? 'border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
    : cardFlashActive && cardFlashOn
      ? 'border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.2)]'
      : 'border-green-500/10'

  const pomodoroFlashing = !!(pomodoroFlashActive && isCardFlashing)

  return (
    <ShatterCard
      onDelete={() => onDelete(todo.id)}
      isShattering={shatteringId === todo.id}
      className={`group relative rounded-xl mb-3 border transition-all duration-300 bg-black/30 backdrop-blur-sm ${cardBorderClass}`}
    >
      <motion.div
        layout
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`relative flex items-center p-4 ${
          showOverlay ? 'py-6' : 'py-4'
        }`}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <motion.button
            onClick={() => !shatteringId && onToggle(todo.id)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="flex-shrink-0"
            disabled={!!shatteringId}
          >
            <Circle className="text-gray-500" size={24} />
          </motion.button>

          <span className="text-green-100 font-medium truncate">{todo.text}</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {todo.pomodoroCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
              <Timer size={12} />
              {todo.pomodoroCount}
            </span>
          )}
          {!shatteringId && (
            <TodoPomodoro
              todoId={todo.id}
              taskName={todo.text}
              onCompleted={() => onPomodoroCompleted(todo.id)}
              onRetry={() => onPomodoroRetry(todo.id)}
              pomodoroFlashing={pomodoroFlashing}
            />
          )}
        </div>

        <motion.button
          onClick={() => !shatteringId && onDelete(todo.id)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 ml-3 flex-shrink-0"
          disabled={!!shatteringId}
        >
          <Trash2 size={20} />
        </motion.button>

        <AnimatePresence>
          {showOverlay && (
            <PomodoroFinishOverlay
              onComplete={() => onPomodoroCompleted(todo.id)}
              onRetry={() => onPomodoroRetry(todo.id)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </ShatterCard>
  )
}
