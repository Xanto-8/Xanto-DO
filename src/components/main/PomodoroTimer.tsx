'use client'

import GlassCard from './GlassCard'

export default function PomodoroTimer() {
  return (
    <GlassCard className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-3 text-green-400 flex items-center gap-2">
        🍅 番茄钟
      </h2>
      <p className="text-sm text-gray-400 leading-relaxed">
        每个任务卡片都内置了独立的番茄钟。<br />
        点击卡片右侧的 <span className="text-green-300">「番茄」</span> 按钮即可启动计时。<br />
        支持固定时长（25/15/5分钟）和自定义时长。<br />
        计时完成后会提示你，并可一键标记任务为已完成。
      </p>
    </GlassCard>
  )
}
