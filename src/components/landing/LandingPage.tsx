'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Sparkles, Rocket } from 'lucide-react'
import ParticleBackground from './ParticleBackground'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <ParticleBackground />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-6"
          >
            <Sparkles
              size={64}
              className="text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.8)]"
            />
          </motion.div>

          <motion.h1
            className="text-6xl md:text-7xl lg:text-8xl font-bold mb-4 bg-gradient-to-r from-green-400 via-green-500 to-emerald-600 bg-clip-text text-transparent text-glow"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Xanto-do
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl font-light tracking-wide text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            让效率成为一种艺术
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="space-y-4 text-center"
        >
          <motion.p
            className="text-base md:text-lg max-w-md mx-auto text-gray-400"
          >
            结合番茄钟技术，沉浸式任务管理体验
          </motion.p>

          <motion.button
            onClick={() => router.push('/login')}
            className="
              group relative px-12 py-5 rounded-full text-lg font-semibold overflow-hidden
              transition-all duration-300 transform hover:scale-105
              bg-gradient-to-r from-green-600 to-emerald-500 text-white box-glow hover:shadow-[0_0_60px_rgba(34,197,94,0.8)]
            "
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                '0 0 20px rgba(34,197,94,0.5)',
                '0 0 40px rgba(34,197,94,0.8)',
                '0 0 20px rgba(34,197,94,0.5)',
              ],
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          >
            <span className="relative z-10 flex items-center gap-3">
              <Rocket size={24} className="animate-bounce" />
              开始进入 ToDo
            </span>
            
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {[
            { icon: '🎯', title: '专注管理', desc: '高效的任务追踪系统' },
            { icon: '🍅', title: '番茄时钟', desc: '科学的时间管理方法' },
            { icon: '✨', title: '视觉盛宴', desc: '惊艳的交互体验设计' },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + index * 0.2, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="
                p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 cursor-pointer
                bg-white/5 border-white/10 hover:bg-white/10 hover:border-green-500/50
              "
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-lg mb-2 text-white">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
