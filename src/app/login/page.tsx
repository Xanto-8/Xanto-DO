'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, User, Lock, Check } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<{ username?: string; password?: string; confirmPassword?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const { login, register } = useAuthStore()

  const validate = () => {
    const newErrors: typeof errors = {}
    if (!username.trim()) {
      newErrors.username = '请输入账号'
    }
    if (!password) {
      newErrors.password = '请输入密码'
    } else if (password.length < 6) {
      newErrors.password = '密码至少6位'
    }
    if (!isLogin) {
      if (password !== confirmPassword) {
        newErrors.confirmPassword = '两次密码不一致'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 1000))

    if (isLogin) {
      const result = login(username, password)
      if (result.success) {
        router.push('/main')
      } else {
        setErrors({ password: result.error })
      }
    } else {
      const result = register(username, password)
      if (result.success) {
        router.push('/main')
      } else {
        setErrors({ username: result.error })
      }
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white">
      {/* 左侧装饰区域 */}
      <div className="w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-48 h-32 bg-purple-500/20 rounded-lg absolute top-1/4 left-1/4"
          />
          <motion.div
            animate={{
              y: [0, 15, 0],
              rotate: [0, -3, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-40 h-24 bg-black/40 rounded-lg absolute top-1/3 right-1/4"
          />
          <motion.div
            animate={{
              y: [0, -25, 0],
              rotate: [0, 8, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-32 h-32 bg-orange-500/20 rounded-t-full absolute bottom-1/3 left-1/3"
          />
          <motion.div
            animate={{
              y: [0, 20, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-36 h-28 bg-yellow-500/20 rounded-xl absolute bottom-1/4 right-1/3"
          />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent"
          >
            Xanto-do
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-gray-400 text-lg"
          >
            高效的任务管理工具，让你的工作更有条理
          </motion.p>
        </div>
      </div>

      {/* 右侧登录/注册区域 */}
      <div className="w-1/2 flex items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* 切换按钮 */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => {
                setIsLogin(true)
                setErrors({})
                setConfirmPassword('')
              }}
              className={`flex-1 py-3 text-center font-semibold rounded-xl transition-all ${
                isLogin
                  ? 'bg-green-600 text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => {
                setIsLogin(false)
                setErrors({})
              }}
              className={`flex-1 py-3 text-center font-semibold rounded-xl transition-all ${
                !isLogin
                  ? 'bg-green-600 text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              注册
            </button>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    if (errors.username) setErrors(prev => ({ ...prev, username: undefined }))
                  }}
                  placeholder="请输入账号"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-green-500/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                />
              </div>
              {errors.username && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-2"
                >
                  {errors.username}
                </motion.p>
              )}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }))
                  }}
                  placeholder="请输入密码"
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-green-500/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-2"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value)
                          if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }))
                        }}
                        placeholder="请确认密码"
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-green-500/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-2"
                      >
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                  rememberMe ? 'bg-green-500 border-green-500' : 'border-gray-500'
                }`}>
                  {rememberMe && <Check size={12} className="text-white" />}
                </div>
                <span className="text-sm">记住我30天</span>
              </button>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  {isLogin ? '正在登录...' : '正在注册...'}
                </span>
              ) : (
                isLogin ? '登录' : '注册'
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
