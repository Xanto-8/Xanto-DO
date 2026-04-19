'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LogOut } from 'lucide-react'
import SubtleParticles from './SubtleParticles'
import GlassCard from './GlassCard'
import TodoList from './TodoList'
import PomodoroTimer from './PomodoroTimer'

import { useAuthStore } from '@/lib/store'

export default function MainPage() {
  const router = useRouter()
  const { logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="relative min-h-screen bg-black">
      <SubtleParticles />

      <div className="relative z-10 min-h-screen">
        <nav className="sticky top-0 z-50 backdrop-blur-md border-b bg-black/80 border-green-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <motion.button
              onClick={() => router.push('/')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-gray-300 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft size={20} />
              返回首页
            </motion.button>

            <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent text-glow">
              Xanto-do
            </h1>

            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              <LogOut size={18} />
              退出
            </motion.button>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2">
              <TodoList />
            </div>

            <div className="space-y-8">
              <PomodoroTimer />
              
              <GlassCard className="hover:!translate-y-0">
                <h3 className="font-semibold mb-3 text-green-400">💡 今日提示</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  使用番茄工作法可以显著提高专注度：每工作25分钟休息5分钟，
                  每完成4个番茄钟后进行一次长休息（15-30分钟）。
                  保持节奏，效率倍增！🚀
                </p>
              </GlassCard>
            </div>
          </motion.div>
        </main>

        <footer className="mt-20 pb-8 text-center text-sm text-gray-500">
          <p>writed by Xanto</p>
        </footer>
      </div>
    </div>
  )
}
