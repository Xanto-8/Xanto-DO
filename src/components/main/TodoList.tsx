'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, CheckCircle2, Circle, Timer, Sparkles } from 'lucide-react'
import { useTodoStore } from '@/lib/store'
import GlassCard from './GlassCard'
import ShatterCard from './ShatterCard'
import TodoPomodoro from './TodoPomodoro'
import TodoCard from './TodoCard'

export default function TodoList() {
  const { todos, addTodo, toggleTodo, deleteTodo, getPomodoro, resetPomodoro, clearPomodoroFinish } = useTodoStore()
  const [newTodo, setNewTodo] = useState('')
  const [shatteringId, setShatteringId] = useState<string | null>(null)

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodo.trim()) {
      addTodo(newTodo.trim())
      setNewTodo('')
    }
  }

  const handleDelete = useCallback((id: string) => {
    setShatteringId(id)
  }, [])

  const handleDeleteComplete = useCallback((id: string) => {
    deleteTodo(id)
    setShatteringId(null)
  }, [deleteTodo])

  const handlePomodoroCompleted = (id: string) => {
    toggleTodo(id)
    clearPomodoroFinish(id)
  }

  const handlePomodoroRetry = (id: string) => {
    resetPomodoro(id)
    clearPomodoroFinish(id)
  }

  const pendingTodos = todos.filter((todo) => !todo.completed)
  const completedTodos = todos.filter((todo) => todo.completed)

  return (
    <GlassCard className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-green-400">
        <Sparkles size={28} />
        任务管理
      </h2>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="添加新任务..."
          className="flex-1 px-4 py-3 rounded-xl bg-black/50 backdrop-blur-sm border border-green-500/20 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-green-300 placeholder:text-gray-500"
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all shadow-lg"
        >
          <Plus size={20} />
          添加
        </motion.button>
      </form>

      {pendingTodos.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            待完成 ({pendingTodos.length})
          </h3>
          {pendingTodos.map((todo) => (
            <ShatterCard
              key={todo.id}
              onDelete={() => handleDeleteComplete(todo.id)}
              isShattering={shatteringId === todo.id}
              className="group relative rounded-xl mb-3 border border-green-500/10 transition-all bg-black/30 backdrop-blur-sm"
            >
              <motion.div
                layout
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <TodoCard
                  todo={todo}
                  shatteringId={shatteringId}
                  onToggle={toggleTodo}
                  onDelete={handleDelete}
                  onPomodoroCompleted={handlePomodoroCompleted}
                  onPomodoroRetry={handlePomodoroRetry}
                />
              </motion.div>
            </ShatterCard>
          ))}
        </div>
      )}

      {completedTodos.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            已完成 ({completedTodos.length})
          </h3>
          {completedTodos.map((todo) => (
            <ShatterCard
              key={todo.id}
              onDelete={() => handleDeleteComplete(todo.id)}
              isShattering={shatteringId === todo.id}
              className="group relative rounded-xl mb-3 border border-green-500/10 transition-all bg-black/30 backdrop-blur-sm"
            >
              <motion.div
                layout
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className="flex items-center p-4">
                  <motion.button
                    onClick={() => !shatteringId && toggleTodo(todo.id)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex-shrink-0"
                    disabled={!!shatteringId}
                  >
                    <CheckCircle2 className="text-green-500" size={24} />
                  </motion.button>

                  <span className="flex-1 text-gray-500 line-through truncate ml-4">{todo.text}</span>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    {todo.pomodoroCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                        <Timer size={12} />
                        {todo.pomodoroCount}
                      </span>
                    )}
                    <CheckCircle2 className="text-green-500/50" size={16} />
                  </div>

                  <motion.button
                    onClick={() => !shatteringId && handleDelete(todo.id)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 ml-3 flex-shrink-0"
                    disabled={!!shatteringId}
                  >
                    <Trash2 size={20} />
                  </motion.button>
                </div>
              </motion.div>
            </ShatterCard>
          ))}
        </div>
      )}

      {todos.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 text-gray-500"
        >
          <p className="text-lg">暂无任务</p>
          <p className="text-sm mt-2">添加你的第一个任务吧！</p>
        </motion.div>
      )}
    </GlassCard>
  )
}
