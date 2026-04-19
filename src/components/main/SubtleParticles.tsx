'use client'

import { useEffect, useMemo, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { ISourceOptions } from '@tsparticles/engine'

export default function SubtleParticles() {
  const [init, setInit] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setInit(true)
    })
  }, [])

  const config: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 60,
      particles: {
        number: {
          value: 40,
          density: {
            enable: true,
            area: 800,
          },
        },
        color: {
          value: '#22c55e',
        },
        shape: {
          type: 'circle',
        },
        opacity: {
          value: 0.3,
          random: true,
        },
        size: {
          value: { min: 1, max: 3 },
          random: true,
        },
        move: {
          enable: true,
          speed: 0.5,
          direction: 'none' as const,
          random: true,
          straight: false,
          outModes: {
            default: 'out' as const,
          },
        },
        links: {
          enable: true,
          distance: 150,
          color: '#22c55e',
          opacity: 0.1,
          width: 0.5,
        },
      },
      interactivity: {
        events: {
          onHover: {
            enable: false,
          },
          onClick: {
            enable: false,
          },
        },
      },
      detectRetina: true,
    }),
    []
  )

  if (!init) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <Particles
        id="subtle-particles"
        options={config}
        className="w-full h-full"
      />
    </div>
  )
}
