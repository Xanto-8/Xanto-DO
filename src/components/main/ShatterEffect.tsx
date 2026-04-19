'use client'

import { useEffect, useRef, useCallback } from 'react'

interface Fragment {
  x: number
  y: number
  vx: number
  vy: number
  width: number
  height: number
  opacity: number
  color: string
  rotation: number
  rotationSpeed: number
  delay: number
}

interface ShatterEffectProps {
  containerRef: React.RefObject<HTMLDivElement>
  onComplete: () => void
  duration?: number
}

export default function ShatterEffect({ containerRef, onComplete, duration = 700 }: ShatterEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fragmentsRef = useRef<Fragment[]>([])
  const animationRef = useRef<number>()
  const completedRef = useRef(false)

  const initFragments = useCallback(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    
    ctx.scale(dpr, dpr)

    const fragmentSize = 12
    const cols = Math.ceil(rect.width / fragmentSize)
    const rows = Math.ceil(rect.height / fragmentSize)
    const newFragments: Fragment[] = []

    const colors = [
      '#ffffff', '#f5f5f5', '#e5e5e5', '#d4d4d4', 
      '#a3a3a3', '#888888', '#cccccc', '#b0b0b0',
      '#999999', '#777777', '#f0f0f0', '#e0e0e0'
    ]

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (Math.random() > 0.85) continue

        const x = col * fragmentSize + Math.random() * fragmentSize
        const y = row * fragmentSize + Math.random() * fragmentSize
        
        const dx = x - rect.width / 2
        const dy = y - rect.height / 2
        const distFromCenter = Math.sqrt(dx * dx + dy * dy) || 1
        
        const force = (distFromCenter / (rect.width / 2)) * 15 + Math.random() * 8
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 2
        
        const width = fragmentSize * (0.5 + Math.random() * 1.5)
        const height = fragmentSize * (0.5 + Math.random() * 1.5)
        
        const edgeFactor = Math.max(
          Math.abs(x - rect.width / 2) / (rect.width / 2),
          Math.abs(y - rect.height / 2) / (rect.height / 2)
        )

        newFragments.push({
          x,
          y,
          vx: Math.cos(angle) * force * (0.8 + Math.random() * 0.4),
          vy: Math.sin(angle) * force * (0.8 + Math.random() * 0.4) - Math.random() * 5 - 2,
          width,
          height,
          opacity: 0.8 + Math.random() * 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 40 * (edgeFactor + 0.5),
          delay: Math.random() * 80,
        })
      }
    }

    fragmentsRef.current = newFragments
  }, [containerRef])

  useEffect(() => {
    initFragments()
    
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let startTime = Date.now()

    const drawIrregularShape = (
      ctx: CanvasRenderingContext2D, 
      width: number, 
      height: number,
      seed: number
    ) => {
      ctx.beginPath()
      
      const points = 5 + Math.floor(Math.random() * 4)
      const centerX = 0
      const centerY = 0
      
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2
        const radiusX = (width / 2) * (0.4 + Math.random() * 0.6)
        const radiusY = (height / 2) * (0.4 + Math.random() * 0.6)
        
        const px = centerX + Math.cos(angle) * radiusX
        const py = centerY + Math.sin(angle) * radiusY
        
        if (i === 0) {
          ctx.moveTo(px, py)
        } else {
          const cpAngle = angle - Math.PI / points
          const cpRadiusX = radiusX * (0.5 + Math.random() * 0.5)
          const cpRadiusY = radiusY * (0.5 + Math.random() * 0.5)
          const cpx = centerX + Math.cos(cpAngle) * cpRadiusX
          const cpy = centerY + Math.sin(cpAngle) * cpRadiusY
          
          ctx.quadraticCurveTo(cpx, cpy, px, py)
        }
      }
      
      ctx.closePath()
    }

    const animate = () => {
      if (completedRef.current || !ctx) return

      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)

      const width = canvas.width / (window.devicePixelRatio || 1)
      const height = canvas.height / (window.devicePixelRatio || 1)
      
      ctx.clearRect(0, 0, width, height)

      let activeFragments = 0

      fragmentsRef.current.forEach((f) => {
        if (elapsed < f.delay) {
          activeFragments++
          return
        }

        const localProgress = Math.min(1, (elapsed - f.delay) / (duration * 0.85))
        
        if (localProgress >= 1) return

        const gravity = 0.8
        const airResistance = 0.97
        
        const currentX = f.x + f.vx * localProgress * 8
        const currentY = f.y + f.vy * localProgress * 8 + 0.5 * gravity * localProgress * localProgress * 400
        const currentOpacity = 1 - localProgress * 0.8
        const currentRotation = f.rotation + f.rotationSpeed * localProgress * 5
        const currentWidth = f.width * (1 - localProgress * 0.2)
        const currentHeight = f.height * (1 - localProgress * 0.2)

        activeFragments++

        ctx.save()
        ctx.translate(currentX, currentY)
        ctx.rotate((currentRotation * Math.PI) / 180)
        ctx.globalAlpha = currentOpacity
        
        ctx.fillStyle = f.color
        ctx.shadowBlur = 3 * (1 - localProgress)
        ctx.shadowColor = 'rgba(255, 255, 255, 0.3)'

        drawIrregularShape(ctx, currentWidth, currentHeight, f.x + f.y)
        ctx.fill()

        ctx.strokeStyle = `rgba(200, 200, 200, ${currentOpacity * 0.5})`
        ctx.lineWidth = 0.5
        ctx.stroke()

        ctx.restore()
      })

      if (progress < 1 && activeFragments > 0) {
        animationRef.current = requestAnimationFrame(animate)
      } else if (!completedRef.current) {
        completedRef.current = true
        ctx.clearRect(0, 0, width, height)
        onComplete()
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [containerRef, duration, onComplete, initFragments])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-50"
      style={{ borderRadius: 'inherit' }}
    />
  )
}
