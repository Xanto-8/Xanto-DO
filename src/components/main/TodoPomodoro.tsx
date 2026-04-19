'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Timer, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTodoStore } from '@/lib/store'

interface TodoPomodoroProps {
  todoId: string
  taskName?: string
  onCompleted?: () => void
  onRetry?: () => void
  pomodoroFlashing?: boolean
}

type PanelState = 'collapsed' | 'expanded' | 'running'

export default function TodoPomodoro({ todoId, taskName, onCompleted, onRetry, pomodoroFlashing = false }: TodoPomodoroProps) {
  const [panelState, setPanelState] = useState<PanelState>('collapsed')
  const [mode, setMode] = useState<'fixed' | 'custom'>('fixed')
  const [customMinutes, setCustomMinutes] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<number | 'custom'>(25)
  const [inputError, setInputError] = useState(false)

  const { initPomodoro, updatePomodoro, getPomodoro, incrementPomodoro, resetPomodoro, clearPomodoroFinish } = useTodoStore()

  const validateAndSetCustom = useCallback((value: string) => {
    const num = parseInt(value, 10)
    if (isNaN(num) || num < 1 || num > 120) {
      setInputError(true)
      setTimeout(() => {
        setCustomMinutes('')
        setInputError(false)
      }, 1000)
    } else {
      setCustomMinutes(value)
      setMode('custom')
      setSelectedPreset('custom')
      setInputError(false)
    }
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d]/g, '')
    setCustomMinutes(val)
    setInputError(false)
    if (val === '') {
      setMode('fixed')
      setSelectedPreset(25)
    } else {
      const num = parseInt(val, 10)
      if (num >= 1 && num <= 120) {
        setMode('custom')
        setSelectedPreset('custom')
      }
    }
  }, [])

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (customMinutes) {
        validateAndSetCustom(customMinutes)
      }
    }
  }, [customMinutes, validateAndSetCustom])

  const handleInputConfirm = useCallback(() => {
    if (customMinutes) {
      validateAndSetCustom(customMinutes)
    }
  }, [customMinutes, validateAndSetCustom])

  const pomodoro = getPomodoro(todoId)
  const timeLeft = pomodoro.timeLeft
  const duration = pomodoro.duration
  const isRunning = pomodoro.isRunning
  const storeIsFinished = pomodoro.isFinished

  const isFinished = storeIsFinished || (timeLeft === 0 && duration > 0 && !isRunning)
  const hasActiveTimer = duration > 0

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeLeftRef = useRef(timeLeft)
  const isRunningRef = useRef(isRunning)
  const collapseTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    timeLeftRef.current = timeLeft
  }, [timeLeft])

  useEffect(() => {
    isRunningRef.current = isRunning
  }, [isRunning])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const currentTime = timeLeftRef.current
        const currentRunning = isRunningRef.current
        if (!currentRunning) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return
        }
        if (currentTime > 0) {
          updatePomodoro(todoId, { timeLeft: currentTime - 1 })
        } else {
          updatePomodoro(todoId, { timeLeft: 0, isRunning: false, isFinished: true })
          incrementPomodoro(todoId)
          playSound()
          showNotification(`${taskName || '番茄钟'} 计时已结束，休息一下吧`, `${taskName || '番茄钟'} 计时已结束，休息一下吧`)
        }
      }, 1000)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, todoId, updatePomodoro, incrementPomodoro])

  useEffect(() => {
    if (isRunning && panelState === 'expanded') {
      setPanelState('running')
    }
  }, [isRunning, panelState])

  useEffect(() => {
    return () => {
      if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current)
    }
  }, [])

  const handleInit = useCallback((seconds: number) => {
    initPomodoro(todoId, seconds)
  }, [todoId, initPomodoro])

  const handleStart = useCallback(() => {
    if (mode === 'fixed') {
      handleInit(25 * 60)
    } else {
      const mins = parseInt(customMinutes, 10)
      if (mins >= 1 && mins <= 120) {
        handleInit(mins * 60)
      } else {
        return
      }
    }
    updatePomodoro(todoId, { isRunning: true })
  }, [mode, customMinutes, handleInit, updatePomodoro])

  const handleStartPause = useCallback(() => {
    if (timeLeft === 0) {
      handleInit(duration)
      updatePomodoro(todoId, { isRunning: true })
      return
    }
    updatePomodoro(todoId, { isRunning: !isRunning })
  }, [timeLeft, duration, handleInit, isRunning, updatePomodoro])

  const handleReset = useCallback(() => {
    updatePomodoro(todoId, { isRunning: false })
    handleInit(duration)
  }, [handleInit, duration, updatePomodoro])

  const handleAutoComplete = useCallback(() => {
    updatePomodoro(todoId, { isFinished: false })
    clearPomodoroFinish(todoId)
    if (onCompleted) {
      onCompleted()
    }
  }, [updatePomodoro, clearPomodoroFinish, onCompleted])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  const playSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 880
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.8)
    } catch {
      // Audio not supported
    }
  }, [])

  const showNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body })
    }
  }, [])

  const togglePanel = useCallback(() => {
    if (panelState === 'collapsed') {
      setPanelState('expanded')
    } else if (panelState === 'running') {
      if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current)
      collapseTimeoutRef.current = window.setTimeout(() => {
        setPanelState('collapsed')
      }, 300)
    }
  }, [panelState])

  const handleClose = useCallback(() => {
    if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current)
    collapseTimeoutRef.current = window.setTimeout(() => {
      setPanelState('collapsed')
    }, 300)
  }, [])

  const isExpanded = panelState === 'expanded'
  const isRunningPanel = panelState === 'running'

  const panelBorderStyle = pomodoroFlashing
    ? 'border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.25)]'
    : 'border-green-500/20'

  const runningBorderStyle = isFinished
    ? 'border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
    : pomodoroFlashing
      ? 'border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.25)]'
      : 'border-green-500/30'

  return (
    <div className="flex flex-row-reverse items-center gap-2">
      <motion.button
        layout
        onClick={togglePanel}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-green-500/10 text-xs transition-all whitespace-nowrap ${
          isFinished
            ? 'border border-red-500/60 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
            : pomodoroFlashing
              ? 'border-red-500/50 text-green-400 shadow-[0_0_6px_rgba(239,68,68,0.2)]'
              : 'border border-green-500/20 text-green-400 hover:bg-green-500/20'
        }`}
      >
        <Timer size={12} />
        {isFinished ? (
          <span>完成！</span>
        ) : hasActiveTimer ? (
          <span className="font-mono tabular-nums">{formatTime(timeLeft)}</span>
        ) : (
          <span>番茄</span>
        )}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : isRunningPanel ? 0 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <ChevronLeft size={10} className="opacity-60" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, width: 0, x: -20 }}
            animate={{ opacity: 1, width: 'auto', x: 0 }}
            exit={{ opacity: 0, width: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className={`flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg p-2 border ${panelBorderStyle}`}
            >
              <button
                onClick={() => {
                  setMode('fixed')
                  setSelectedPreset(25)
                  handleInit(25 * 60)
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                  selectedPreset === 25
                    ? 'bg-green-500 text-white shadow-[0_0_8px_rgba(0,224,138,0.3)]'
                    : 'bg-black/40 text-green-400/70 hover:bg-black/60 hover:text-green-400'
                }`}
              >
                25m
              </button>
              <button
                onClick={() => {
                  setMode('fixed')
                  setSelectedPreset(15)
                  handleInit(15 * 60)
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                  selectedPreset === 15
                    ? 'bg-green-500 text-white shadow-[0_0_8px_rgba(0,224,138,0.3)]'
                    : 'bg-black/40 text-green-400/70 hover:bg-black/60 hover:text-green-400'
                }`}
              >
                15m
              </button>
              <button
                onClick={() => {
                  setMode('fixed')
                  setSelectedPreset(5)
                  handleInit(5 * 60)
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                  selectedPreset === 5
                    ? 'bg-green-500 text-white shadow-[0_0_8px_rgba(0,224,138,0.3)]'
                    : 'bg-black/40 text-green-400/70 hover:bg-black/60 hover:text-green-400'
                }`}
              >
                5m
              </button>

              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <input
                    type="text"
                    value={customMinutes}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    onBlur={() => {
                      if (customMinutes && !inputError) {
                        handleInputConfirm()
                      }
                    }}
                    placeholder="分钟"
                    inputMode="numeric"
                    className={`w-16 px-2.5 py-1.5 text-xs rounded-lg border text-center font-medium transition-all duration-200 focus:outline-none focus:ring-1 ${
                      inputError
                        ? 'bg-red-500/20 border-red-500/50 text-red-400 placeholder:text-red-400/50 focus:ring-red-500/50'
                        : selectedPreset === 'custom' && customMinutes !== '' && parseInt(customMinutes, 10) >= 1 && parseInt(customMinutes, 10) <= 120
                          ? 'bg-green-500 border-green-500 text-white placeholder:text-white/70 focus:ring-white/50'
                          : 'bg-black/40 border-green-500/20 text-green-300 placeholder:text-green-400/50 focus:border-green-500/50 focus:ring-green-500/50'
                    }`}
                  />
                </div>

                <button
                  onClick={handleInputConfirm}
                  className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                    selectedPreset === 'custom' && customMinutes !== '' && parseInt(customMinutes, 10) >= 1 && parseInt(customMinutes, 10) <= 120
                      ? 'bg-green-500 text-white shadow-[0_0_8px_rgba(0,224,138,0.3)]'
                      : 'bg-black/40 text-green-400/70 hover:bg-black/60 hover:text-green-400'
                  }`}
                >
                  确认
                </button>
              </div>

              <button
                onClick={handleStart}
                className="ml-2 p-1.5 rounded-full bg-green-600 text-white hover:bg-green-500 transition-all duration-200"
              >
                <Play size={12} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRunningPanel && (
          <motion.div
            key="running"
            initial={{ opacity: 0, scale: 0.95, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex items-center gap-2"
          >
            <motion.div
              className={`flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 border transition-all ${runningBorderStyle}`}
              animate={!isFinished && isRunning ? { boxShadow: ['0 0 0px rgba(34,197,94,0)', '0 0 8px rgba(34,197,94,0.3)', '0 0 0px rgba(34,197,94,0)'] } : {}}
              transition={{ duration: 2, repeat: !isFinished && isRunning ? Infinity : 0 }}
            >
              <span className={`text-sm font-mono tabular-nums min-w-[50px] ${
                isFinished ? 'text-red-400' : pomodoroFlashing ? 'text-red-400' : 'text-green-300'
              }`}>
                {isFinished ? '完成！' : formatTime(timeLeft)}
              </span>
              <button
                onClick={handleStartPause}
                className="p-1 rounded bg-green-600/20 text-green-400 hover:bg-green-600/40 transition-all"
              >
                {isRunning ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button
                onClick={handleReset}
                className="p-1 rounded bg-white/10 text-gray-400 hover:bg-white/20 transition-all"
              >
                <RotateCcw size={14} />
              </button>
            </motion.div>

            <button
              onClick={handleClose}
              className="p-1 rounded bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300 transition-all"
            >
              <ChevronRight size={12} />
            </button>

            {isFinished && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-xs text-red-400"
              >
                <span>计时结束</span>
                <button
                  onClick={handleAutoComplete}
                  className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-500 transition-all flex items-center gap-1"
                >
                  <Check size={12} />
                  标记完成
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
