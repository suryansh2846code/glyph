import { useState, useEffect, useRef } from 'react'
import { COMPONENT_REGISTRY } from './ComponentRegistry'
import type { ComponentItem } from './ComponentRegistry'
import {
  Search,
  Check,
  Copy,
  ChevronRight,
  Sparkles,
  Sliders,
  Code,
  ArrowLeft,
  Grid,
  Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

function SingleCurveCanvasCompact({ curveId, props }: { curveId: string; props: Record<string, any> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderStyle = props.renderStyle || 'glow'
  const theme = props.theme || 'purple-indigo'
  const speed = Number(props.speed ?? 2.0)
  const breathScale = Number(props.breath ?? 15) / 100
  const trailLength = Number(props.trailLength ?? 80)
  const strokeWidth = Number(props.strokeWidth ?? 2.5) * 0.7
  const glowSize = Number(props.glowSize ?? 12) * 0.6

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let t = 0

    const resize = () => {
      canvas.width = canvas.clientWidth * (window.devicePixelRatio || 1)
      canvas.height = canvas.clientHeight * (window.devicePixelRatio || 1)
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1)
    }

    resize()

    const getThemeColors = (themeStr: string, opacity: number, theta = 0, time = 0) => {
      switch (themeStr) {
        case 'purple-indigo':
          return { line: `rgba(167, 139, 250, ${opacity})`, glow: `rgba(99, 102, 241, ${opacity})` }
        case 'cyan-blue':
          return { line: `rgba(34, 211, 238, ${opacity})`, glow: `rgba(37, 99, 235, ${opacity})` }
        case 'emerald-teal':
          return { line: `rgba(52, 211, 153, ${opacity})`, glow: `rgba(13, 148, 136, ${opacity})` }
        case 'rose-amber':
          return { line: `rgba(244, 63, 94, ${opacity})`, glow: `rgba(245, 158, 11, ${opacity})` }
        case 'rainbow': {
          const hue = Math.round(((theta * 180) / Math.PI + time * 0.8) % 360)
          return { line: `hsla(${hue}, 100%, 65%, ${opacity})`, glow: `hsla(${hue}, 100%, 50%, ${opacity})` }
        }
        default:
          return { line: `rgba(167, 139, 250, ${opacity})`, glow: `rgba(99, 102, 241, ${opacity})` }
      }
    }

    const getPoint = (theta: number, time: number, size: number) => {
      const breath = 1.0 + breathScale * Math.sin(time * 0.05)
      let x = 0
      let y = 0

      switch (curveId) {
        case 'original-thinking': {
          const radius = (0.6 + 0.3 * Math.cos(7 * theta)) * breath
          x = radius * Math.cos(theta + time * 0.015)
          y = radius * Math.sin(theta + time * 0.015)
          break
        }
        case 'thinking-five': {
          const radius = (0.65 + 0.25 * Math.cos(5 * theta)) * breath
          x = radius * Math.cos(theta - time * 0.012)
          y = radius * Math.sin(theta - time * 0.012)
          break
        }
        case 'thinking-nine': {
          const radius = (0.6 + 0.3 * Math.cos(9 * theta)) * breath
          x = radius * Math.cos(theta + time * 0.01)
          y = radius * Math.sin(theta + time * 0.01)
          break
        }
        case 'rose-curve': {
          const radius = Math.cos(5 * theta) * breath
          x = radius * Math.cos(theta)
          y = radius * Math.sin(theta)
          break
        }
        default:
          break
      }

      return {
        x: x * (size * 0.35),
        y: y * (size * 0.35)
      }
    }

    const draw = () => {
      const width = canvas.width / (window.devicePixelRatio || 1)
      const height = canvas.height / (window.devicePixelRatio || 1)
      ctx.clearRect(0, 0, width, height)

      if (renderStyle === 'halftone') {
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, width, height)
      }

      const size = Math.min(width, height)
      const cx = width / 2
      const cy = height / 2

      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      if (renderStyle !== 'halftone') {
        ctx.beginPath()
        for (let i = 0; i <= 100; i++) {
          const theta = (i / 100) * Math.PI * 2
          const pt = getPoint(theta, t, size)
          if (i === 0) ctx.moveTo(cx + pt.x, cy + pt.y)
          else ctx.lineTo(cx + pt.x, cy + pt.y)
        }
        ctx.strokeStyle = theme === 'rainbow' ? 'rgba(255, 255, 255, 0.04)' : getThemeColors(theme, 0.06).glow
        ctx.lineWidth = 0.7
        ctx.stroke()
      }

      const headTheta = t * 0.02 * speed
      const trailRad = (trailLength / 100) * Math.PI

      if (renderStyle === 'glow') {
        ctx.lineWidth = strokeWidth
        for (let i = 1; i <= 20; i++) {
          const ratio = i / 20
          const thetaStart = headTheta - trailRad * (1 - (i - 1) / 20)
          const thetaEnd = headTheta - trailRad * (1 - ratio)

          const pt1 = getPoint(thetaStart, t, size)
          const pt2 = getPoint(thetaEnd, t, size)

          ctx.beginPath()
          ctx.moveTo(cx + pt1.x, cy + pt1.y)
          ctx.lineTo(cx + pt2.x, cy + pt2.y)

          const op = ratio
          const colors = getThemeColors(theme, op, thetaEnd, t)
          ctx.strokeStyle = colors.line
          ctx.stroke()
        }
      } else if (renderStyle === 'dotted') {
        for (let i = 1; i <= 20; i++) {
          const ratio = i / 20
          const theta = headTheta - trailRad * (1 - ratio)
          const pt = getPoint(theta, t, size)
          const colors = getThemeColors(theme, ratio, theta, t)
          
          ctx.fillStyle = colors.line
          ctx.beginPath()
          ctx.arc(cx + pt.x, cy + pt.y, strokeWidth * 0.5 * ratio, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (renderStyle === 'halftone') {
        for (let i = 1; i <= 25; i++) {
          const ratio = i / 25
          const theta = headTheta - trailRad * (1 - ratio)
          const pt = getPoint(theta, t, size)
          const mod = 0.4 + 0.6 * Math.sin(theta * 6.0)
          const rad = strokeWidth * 1.2 * ratio * Math.abs(mod)

          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(cx + pt.x, cy + pt.y, Math.max(0.5, rad), 0, Math.PI * 2)
          ctx.fill()
        }
      } else {
        ctx.lineWidth = strokeWidth * 0.4
        for (let i = 1; i <= 25; i++) {
          const ratio = i / 25
          const thetaStart = headTheta - trailRad * (1 - (i - 1) / 25)
          const thetaEnd = headTheta - trailRad * (1 - ratio)

          const pt1 = getPoint(thetaStart, t, size)
          const pt2 = getPoint(thetaEnd, t, size)

          ctx.beginPath()
          ctx.moveTo(cx + pt1.x, cy + pt1.y)
          ctx.lineTo(cx + pt2.x, cy + pt2.y)

          const colors = getThemeColors(theme, ratio * 0.7, thetaEnd, t)
          ctx.strokeStyle = theme === 'rainbow' ? colors.line : `rgba(255, 255, 255, ${ratio * 0.6})`
          ctx.stroke()
        }
      }

      t += 1
      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [curveId, renderStyle, theme, speed, breathScale, trailLength, strokeWidth, glowSize])

  return <canvas ref={canvasRef} className="w-full h-full block" />
}

function SingleCurveCanvas({ curveId, props, name, equation }: { curveId: string; props: Record<string, any>; name: string; equation: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderStyle = props.renderStyle || 'glow'
  const theme = props.theme || 'purple-indigo'
  const speed = Number(props.speed ?? 2.0)
  const breathScale = Number(props.breath ?? 15) / 100
  const trailLength = Number(props.trailLength ?? 80)
  const strokeWidth = Number(props.strokeWidth ?? 2.5)
  const glowSize = Number(props.glowSize ?? 12)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let t = 0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      ctx.scale(dpr, dpr)
    }

    resize()
    const resizeObserver = new ResizeObserver(() => {
      resize()
    })
    resizeObserver.observe(canvas)

    const getThemeColors = (themeStr: string, opacity: number, theta = 0, time = 0) => {
      switch (themeStr) {
        case 'purple-indigo':
          return { line: `rgba(167, 139, 250, ${opacity})`, glow: `rgba(99, 102, 241, ${opacity})` }
        case 'cyan-blue':
          return { line: `rgba(34, 211, 238, ${opacity})`, glow: `rgba(37, 99, 235, ${opacity})` }
        case 'emerald-teal':
          return { line: `rgba(52, 211, 153, ${opacity})`, glow: `rgba(13, 148, 136, ${opacity})` }
        case 'rose-amber':
          return { line: `rgba(244, 63, 94, ${opacity})`, glow: `rgba(245, 158, 11, ${opacity})` }
        case 'rainbow': {
          const hue = Math.round(((theta * 180) / Math.PI + time * 0.8) % 360)
          return { line: `hsla(${hue}, 100%, 65%, ${opacity})`, glow: `hsla(${hue}, 100%, 50%, ${opacity})` }
        }
        default:
          return { line: `rgba(167, 139, 250, ${opacity})`, glow: `rgba(99, 102, 241, ${opacity})` }
      }
    }

    const getPoint = (theta: number, time: number, size: number) => {
      const breath = 1.0 + breathScale * Math.sin(time * 0.05)
      let x = 0
      let y = 0

      switch (curveId) {
        case 'original-thinking': {
          const radius = (0.6 + 0.3 * Math.cos(7 * theta)) * breath
          x = radius * Math.cos(theta + time * 0.015)
          y = radius * Math.sin(theta + time * 0.015)
          break
        }
        case 'thinking-five': {
          const radius = (0.65 + 0.25 * Math.cos(5 * theta)) * breath
          x = radius * Math.cos(theta - time * 0.012)
          y = radius * Math.sin(theta - time * 0.012)
          break
        }
        case 'thinking-nine': {
          const radius = (0.6 + 0.3 * Math.cos(9 * theta)) * breath
          x = radius * Math.cos(theta + time * 0.01)
          y = radius * Math.sin(theta + time * 0.01)
          break
        }
        case 'rose-curve': {
          const radius = Math.cos(5 * theta) * breath
          x = radius * Math.cos(theta)
          y = radius * Math.sin(theta)
          break
        }
        case 'rose-two': {
          const radius = Math.cos(2 * theta) * breath
          x = radius * Math.cos(theta)
          y = radius * Math.sin(theta)
          break
        }
        case 'rose-four': {
          const radius = Math.cos(4 * theta) * breath
          x = radius * Math.cos(theta)
          y = radius * Math.sin(theta)
          break
        }
        case 'lissajous': {
          x = Math.sin(3 * theta + time * 0.03) * breath
          y = Math.sin(4 * theta) * breath
          break
        }
        case 'lemniscate': {
          const denom = 1 + Math.sin(theta) * Math.sin(theta)
          x = (Math.cos(theta) / denom) * 1.2 * breath
          y = (Math.sin(theta) * Math.cos(theta) / denom) * 1.2 * breath
          break
        }
        case 'spirograph': {
          const r_inner = 0.45
          const d_dist = 0.38
          x = ((1 - r_inner) * Math.cos(theta) + d_dist * Math.cos(((1 - r_inner) / r_inner) * theta)) * breath
          y = ((1 - r_inner) * Math.sin(theta) - d_dist * Math.sin(((1 - r_inner) / r_inner) * theta)) * breath
          break
        }
        case 'spiral': {
          const base_r = ((theta % (2 * Math.PI)) / (2 * Math.PI)) * 0.5 * breath
          const r = base_r + 0.3 * Math.cos(3 * theta)
          x = r * Math.cos(theta)
          y = r * Math.sin(theta)
          break
        }
        default:
          break
      }

      return {
        x: x * (size * 0.4),
        y: y * (size * 0.4)
      }
    }

    const draw = () => {
      const width = canvas.width / (window.devicePixelRatio || 1)
      const height = canvas.height / (window.devicePixelRatio || 1)
      ctx.clearRect(0, 0, width, height)

      if (renderStyle === 'halftone') {
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, width, height)
      }

      const size = Math.min(width, height)
      const cx = width / 2
      const cy = height / 2

      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      if (renderStyle !== 'halftone') {
        ctx.beginPath()
        const traceSteps = 240
        for (let i = 0; i <= traceSteps; i++) {
          const theta = (i / traceSteps) * Math.PI * 2
          const pt = getPoint(theta, t, size)
          if (i === 0) ctx.moveTo(cx + pt.x, cy + pt.y)
          else ctx.lineTo(cx + pt.x, cy + pt.y)
        }
        ctx.strokeStyle = theme === 'rainbow' ? 'rgba(255, 255, 255, 0.05)' : getThemeColors(theme, 0.07).glow
        ctx.lineWidth = 1
        ctx.stroke()
      }

      const headTheta = t * 0.02 * speed
      const trailRad = (trailLength / 100) * Math.PI

      if (renderStyle === 'glow') {
        const layers = [
          { width: strokeWidth + glowSize, opacityScale: 0.15 },
          { width: strokeWidth + glowSize / 2, opacityScale: 0.4 },
          { width: strokeWidth, opacityScale: 1.0 }
        ]
        layers.forEach(({ width: w, opacityScale }) => {
          ctx.lineWidth = w
          for (let i = 1; i <= 40; i++) {
            const ratio = i / 40
            const thetaStart = headTheta - trailRad * (1 - (i - 1) / 40)
            const thetaEnd = headTheta - trailRad * (1 - ratio)

            const pt1 = getPoint(thetaStart, t, size)
            const pt2 = getPoint(thetaEnd, t, size)

            ctx.beginPath()
            ctx.moveTo(cx + pt1.x, cy + pt1.y)
            ctx.lineTo(cx + pt2.x, cy + pt2.y)

            const op = ratio * opacityScale
            const colors = getThemeColors(theme, op, thetaEnd, t)
            ctx.strokeStyle = colors.line
            ctx.stroke()
          }
        })
      } else if (renderStyle === 'dotted') {
        for (let i = 1; i <= 45; i++) {
          const ratio = i / 45
          const theta = headTheta - trailRad * (1 - ratio)
          const pt = getPoint(theta, t, size)
          const colors = getThemeColors(theme, ratio, theta, t)
          
          ctx.fillStyle = theme === 'rainbow' ? colors.glow : getThemeColors(theme, ratio * 0.3, theta, t).glow
          ctx.beginPath()
          ctx.arc(cx + pt.x, cy + pt.y, strokeWidth * ratio + glowSize * 0.2 * ratio, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = colors.line
          ctx.beginPath()
          ctx.arc(cx + pt.x, cy + pt.y, strokeWidth * 0.6 * ratio, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (renderStyle === 'halftone') {
        for (let i = 1; i <= 50; i++) {
          const ratio = i / 50
          const theta = headTheta - trailRad * (1 - ratio)
          const pt = getPoint(theta, t, size)
          const mod = 0.4 + 0.6 * Math.sin(theta * 6.0)
          const rad = strokeWidth * 1.5 * ratio * Math.abs(mod)

          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(cx + pt.x, cy + pt.y, Math.max(0.5, rad), 0, Math.PI * 2)
          ctx.fill()
        }
      } else {
        ctx.lineWidth = strokeWidth * 0.5
        for (let i = 1; i <= 55; i++) {
          const ratio = i / 55
          const thetaStart = headTheta - trailRad * (1 - (i - 1) / 55)
          const thetaEnd = headTheta - trailRad * (1 - ratio)

          const pt1 = getPoint(thetaStart, t, size)
          const pt2 = getPoint(thetaEnd, t, size)

          ctx.beginPath()
          ctx.moveTo(cx + pt1.x, cy + pt1.y)
          ctx.lineTo(cx + pt2.x, cy + pt2.y)

          const op = ratio * 0.8
          const colors = getThemeColors(theme, op, thetaEnd, t)
          ctx.strokeStyle = theme === 'rainbow' ? colors.line : `rgba(255, 255, 255, ${op})`
          ctx.stroke()
        }
      }

      if (renderStyle !== 'halftone') {
        const headPt = getPoint(headTheta, t, size)
        const colors = getThemeColors(theme, 1.0, headTheta, t)

        const glowGrad = ctx.createRadialGradient(
          cx + headPt.x, cy + headPt.y, 0,
          cx + headPt.x, cy + headPt.y, strokeWidth + glowSize / 2
        )
        glowGrad.addColorStop(0, colors.line)
        glowGrad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = glowGrad
        ctx.beginPath()
        ctx.arc(cx + headPt.x, cy + headPt.y, strokeWidth + glowSize / 2, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(cx + headPt.x, cy + headPt.y, Math.max(1.5, strokeWidth * 0.6), 0, Math.PI * 2)
        ctx.fill()
      }

      t += 1
      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      resizeObserver.disconnect()
      cancelAnimationFrame(animationFrameId)
    }
  }, [curveId, renderStyle, theme, speed, breathScale, trailLength, strokeWidth, glowSize])

  return (
    <div className={cn(
      "relative rounded-xl border border-zinc-900 overflow-hidden flex flex-col justify-between items-center p-3 text-center transition-all duration-300",
      renderStyle === 'halftone' ? 'bg-black border-zinc-950 shadow-inner' : 'bg-zinc-950/40 hover:bg-zinc-950/70 border-zinc-900/60 hover:border-zinc-800'
    )}>
      <div className="w-full aspect-square flex items-center justify-center relative">
        <canvas ref={canvasRef} className="w-[100px] h-[100px] sm:w-[135px] sm:h-[135px] block" />
      </div>
      
      <div className="mt-2 text-left w-full border-t border-zinc-900/40 pt-2">
        <div className="text-[11px] font-bold text-zinc-200 tracking-wide leading-none">{name}</div>
        <div className="text-[9px] font-mono text-zinc-500 mt-1 select-all">{equation}</div>
      </div>
    </div>
  )
}

function MathCurvePackPreview({ props }: { props: Record<string, any> }) {
  const isCompact = !!props.isCompact

  const loaders = [
    { id: 'original-thinking', name: 'Original Thinking', eq: 'R = 1 + 0.35 * COS(7θ)' },
    { id: 'thinking-five', name: 'Thinking Five', eq: 'R = 1 + 0.25 * COS(5θ)' },
    { id: 'thinking-nine', name: 'Thinking Nine', eq: 'R = 1 + 0.3 * COS(9θ)' },
    { id: 'rose-curve', name: 'Rose Curve', eq: 'R = COS(5θ)' },
    { id: 'rose-two', name: 'Rose Two', eq: 'R = COS(2θ)' },
    { id: 'rose-four', name: 'Rose Four', eq: 'R = COS(4θ)' },
    { id: 'lissajous', name: 'Lissajous Drift', eq: 'X = SIN(3θ), Y = SIN(4θ)' },
    { id: 'lemniscate', name: 'Lemniscate Bloom', eq: 'Bernoulli Lemniscate' },
    { id: 'spirograph', name: 'Hypotrochoid Loop', eq: 'Inner Spirograph' },
    { id: 'spiral', name: 'Three-Petal Spiral', eq: 'R = θ/(2π) + 0.3*COS(3θ)' }
  ]

  if (isCompact) {
    return (
      <div className="grid grid-cols-2 gap-2 w-full h-full max-w-[150px] max-h-[150px] items-center justify-center">
        {loaders.slice(0, 4).map((loader) => (
          <div key={loader.id} className="relative aspect-square flex items-center justify-center bg-black/45 border border-zinc-900 rounded-lg overflow-hidden">
            <SingleCurveCanvasCompact curveId={loader.id} props={props} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full max-h-[500px] overflow-y-auto scrollbar-thin p-1 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
        {loaders.map((loader) => (
          <SingleCurveCanvas
            key={loader.id}
            curveId={loader.id}
            props={props}
            name={loader.name}
            equation={loader.eq}
          />
        ))}
      </div>
    </div>
  )
}

// Dynamic component preview renderer to display selected states
function LivePreviewRenderer({ item, props }: { item: ComponentItem; props: Record<string, any> }) {
  if (item.id === 'math-curve-pack') {
    return <MathCurvePackPreview props={props} />
  }

  if (item.id === 'gradient-glow-btn') {
    const { text, colorTheme, rounded, size } = props
    let themeBg = 'from-violet-600 to-indigo-600 group-hover:from-violet-500 group-hover:to-indigo-500'
    if (colorTheme === 'cyan-blue') themeBg = 'from-cyan-500 to-blue-600 group-hover:from-cyan-400 group-hover:to-blue-500'
    else if (colorTheme === 'emerald-teal') themeBg = 'from-emerald-500 to-teal-600 group-hover:from-emerald-400 group-hover:to-teal-500'
    else if (colorTheme === 'rose-amber') themeBg = 'from-rose-500 to-amber-500 group-hover:from-rose-400 group-hover:to-amber-400'

    let sizeClass = 'px-5 py-2.5 text-sm'
    if (size === 'small') sizeClass = 'px-4 py-2 text-xs'
    else if (size === 'large') sizeClass = 'px-7 py-3.5 text-base'

    let roundedClass = 'rounded-xl'
    if (rounded === 'md') roundedClass = 'rounded-md'
    else if (rounded === 'lg') roundedClass = 'rounded-lg'
    else if (rounded === 'full') roundedClass = 'rounded-full'

    return (
      <div className="relative group select-none">
        <div className={cn(
          "absolute -inset-0.5 bg-gradient-to-r blur-md opacity-70 group-hover:opacity-100 transition duration-300 rounded-lg",
          themeBg
        )} />
        <button className={cn(
          "relative bg-zinc-950 border border-zinc-800 text-zinc-100 hover:text-white transition duration-200 active:scale-[0.98] flex items-center gap-2",
          sizeClass,
          roundedClass
        )}>
          {text} <span className="text-zinc-500 group-hover:translate-x-0.5 transition-transform duration-200">→</span>
        </button>
      </div>
    )
  }

  if (item.id === 'cyberpunk-btn') {
    const { text, neonColor, glitch } = props
    let borderStyle = 'border-cyan-400 text-cyan-400 hover:bg-cyan-500/10 hover:shadow-cyan-500/20'
    let dotStyle = 'bg-cyan-400'
    if (neonColor === 'yellow') {
      borderStyle = 'border-yellow-400 text-yellow-400 hover:bg-yellow-500/10 hover:shadow-yellow-500/20'
      dotStyle = 'bg-yellow-400'
    } else if (neonColor === 'magenta') {
      borderStyle = 'border-rose-500 text-rose-500 hover:bg-rose-500/10 hover:shadow-rose-500/20'
      dotStyle = 'bg-rose-500'
    } else if (neonColor === 'green') {
      borderStyle = 'border-green-400 text-green-400 hover:bg-green-400/10 hover:shadow-green-500/20'
      dotStyle = 'bg-green-400'
    }

    return (
      <button className={cn(
        "relative px-6 py-3 font-mono font-bold tracking-widest text-xs uppercase bg-black border transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2",
        borderStyle
      )} style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
        {glitch && <span className={cn("h-2 w-2 rounded-none animate-pulse", dotStyle)} />}
        {text}
      </button>
    )
  }

  if (item.id === 'glass-tilt-card') {
    const { title, body, blur, glowColor } = props
    let twBlur = 'backdrop-blur-md'
    if (blur === 'sm') twBlur = 'backdrop-blur-sm'
    else if (blur === 'lg') twBlur = 'backdrop-blur-lg'
    else if (blur === 'xl') twBlur = 'backdrop-blur-xl'

    let accentClass = 'group-hover:border-indigo-500/40 shadow-indigo-500/5'
    if (glowColor === 'emerald') accentClass = 'group-hover:border-emerald-500/40 shadow-emerald-500/5'
    else if (glowColor === 'amber') accentClass = 'group-hover:border-amber-500/40 shadow-amber-500/5'
    else if (glowColor === 'rose') accentClass = 'group-hover:border-rose-500/40 shadow-rose-500/5'

    return (
      <div className="relative group max-w-[280px] w-full">
        <div className={cn(
          "absolute -inset-2 bg-gradient-radial to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          glowColor === 'indigo' && 'from-indigo-500/10',
          glowColor === 'emerald' && 'from-emerald-500/10',
          glowColor === 'amber' && 'from-amber-500/10',
          glowColor === 'rose' && 'from-rose-500/10'
        )} />
        <div className={cn(
          "relative border border-white/5 bg-zinc-900/40 p-5 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 text-left",
          twBlur,
          accentClass
        )}>
          <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 mb-3 group-hover:scale-105 transition-all duration-300">
            <Sparkles className="h-4.5 w-4.5 text-zinc-300" />
          </div>
          <h3 className="text-sm font-bold text-zinc-100 mb-1 group-hover:text-white transition-colors duration-200">{title}</h3>
          <p className="text-xs leading-relaxed text-zinc-400 font-light">{body}</p>
        </div>
      </div>
    )
  }

  if (item.id === 'pulse-badge') {
    const { label, status, showPings } = props
    let colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    let dotColor = 'bg-emerald-400'
    if (status === 'amber') {
      colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      dotColor = 'bg-amber-400'
    } else if (status === 'rose') {
      colorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      dotColor = 'bg-rose-400'
    } else if (status === 'sky') {
      colorClass = 'bg-sky-500/10 text-sky-400 border-sky-500/20'
      dotColor = 'bg-sky-400'
    }

    return (
      <div className={cn("inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold border rounded-full", colorClass)}>
        <span className="relative flex h-2 w-2">
          {showPings && <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", dotColor)}></span>}
          <span className={cn("relative inline-flex rounded-full h-2 w-2", dotColor)}></span>
        </span>
        {label}
      </div>
    )
  }

  if (item.id === 'glow-slider') {
    const { minVal, maxVal, glowStyle } = props
    const [val, setVal] = useState(50)
    let activeColor = 'accent-cyan-400'
    let textGlow = 'text-cyan-400'
    let glowBg = 'bg-cyan-500/20'
    if (glowStyle === 'purple') {
      activeColor = 'accent-violet-500'
      textGlow = 'text-violet-400'
      glowBg = 'bg-violet-500/20'
    } else if (glowStyle === 'emerald') {
      activeColor = 'accent-emerald-400'
      textGlow = 'text-emerald-400'
      glowBg = 'bg-emerald-500/20'
    } else if (glowStyle === 'rose') {
      activeColor = 'accent-rose-500'
      textGlow = 'text-rose-400'
      glowBg = 'bg-rose-500/20'
    }

    return (
      <div className="w-full max-w-[240px] space-y-1 text-left">
        <div className="flex justify-between items-center text-[11px] font-mono text-zinc-400">
          <span>Scale</span>
          <span className={cn("font-bold", textGlow)}>{val}%</span>
        </div>
        <div className="relative group py-1.5">
          <div className={cn("absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 blur-[2px] rounded-lg pointer-events-none", glowBg)} />
          <input
            type="range"
            min={minVal}
            max={maxVal}
            value={val}
            onChange={(e) => setVal(Number(e.target.value))}
            className={cn("w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer outline-none transition-all duration-200", activeColor)}
          />
        </div>
      </div>
    )
  }

  if (item.id === 'cyber-skeleton') {
    const { lines, speed } = props
    let animSecs = '1.8s'
    if (speed === 'fast') animSecs = '1s'
    else if (speed === 'slow') animSecs = '3s'

    const widths = ['w-full', 'w-[85%]', 'w-[90%]', 'w-[75%]', 'w-[80%]']

    return (
      <div className="w-full max-w-[280px] border border-zinc-800 bg-zinc-950 p-4 rounded-xl space-y-3.5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-zinc-850 rounded-lg relative overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_infinite] -translate-x-full" style={{ animationDuration: animSecs }} />
          </div>
          <div className="space-y-1.5 flex-1 text-left">
            <div className="h-3 bg-zinc-850 rounded-md w-[60%] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_infinite] -translate-x-full" style={{ animationDuration: animSecs }} />
            </div>
            <div className="h-2.5 bg-zinc-850 rounded-md w-[40%] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_infinite] -translate-x-full" style={{ animationDuration: animSecs }} />
            </div>
          </div>
        </div>
        <div className="space-y-2 pt-1.5 text-left">
          {Array.from({ length: Number(lines) }).map((_, i) => (
            <div key={i} className={cn("h-3 bg-zinc-850 rounded-md relative overflow-hidden", widths[i % widths.length])}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_infinite] -translate-x-full" style={{ animationDuration: animSecs }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

export function MarketplaceView() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [activeItem, setActiveItem] = useState<ComponentItem | null>(null)
  
  // Customizer state
  const [customProps, setCustomProps] = useState<Record<string, any>>({})
  const [codeTab, setCodeTab] = useState<'tailwind' | 'css'>('tailwind')
  const [copied, setCopied] = useState(false)

  // Filter registry items
  const filteredItems = COMPONENT_REGISTRY.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const openCustomizer = (item: ComponentItem) => {
    setActiveItem(item)
    // Initialize customizer values with defaults
    const defaults: Record<string, any> = {}
    item.props.forEach(p => {
      defaults[p.id] = p.default
    })
    setCustomProps(defaults)
    setCopied(false)
  }

  const handlePropChange = (id: string, val: any) => {
    setCustomProps(prev => ({ ...prev, [id]: val }))
    setCopied(false)
  }

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const generatedCodes = activeItem ? activeItem.generateCode(customProps) : { tailwind: '', css: '' }

  return (
    <div className="w-full">
      {!activeItem ? (
        // BROWSE GRID
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                <Grid className="h-5 w-5 text-primary" /> UI Component Marketplace
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Browse, customize, and copy responsive code snippets styled with Tailwind CSS or raw HTML/CSS.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> Curated Design Suite
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                type="text"
                placeholder="Search premium components (e.g. glass, glow, button)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-zinc-950/50 border-zinc-800 text-zinc-200 placeholder-zinc-500 focus-visible:ring-primary/40 rounded-xl"
              />
            </div>
            
            {/* Category selection */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Library' },
                { id: 'buttons', label: 'Buttons & Badges' },
                { id: 'cards', label: 'Cards & Panels' },
                { id: 'inputs', label: 'Inputs & Controls' },
                { id: 'feedback', label: 'Loaders & Progress' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border",
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/10"
                      : "bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid display */}
          {filteredItems.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => {
                // Generate default preview props
                const defaultProps: Record<string, any> = {}
                item.props.forEach(p => { defaultProps[p.id] = p.default })

                return (
                  <div
                    key={item.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-950/40 hover:bg-zinc-950/70 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/[0.02]"
                  >
                    {/* Live Preview Header */}
                    <div className="relative flex items-center justify-center p-8 bg-zinc-900/30 border-b border-zinc-900 h-44 overflow-hidden chequered-pattern">
                      <LivePreviewRenderer item={item} props={defaultProps} />
                    </div>

                    {/* Metadata body */}
                    <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                          {item.category}
                        </span>
                        <h3 className="text-base font-bold text-zinc-100 group-hover:text-white transition-colors duration-200">
                          {item.name}
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed font-light line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <Button
                        onClick={() => openCustomizer(item)}
                        className="w-full bg-zinc-900 border border-zinc-850 hover:bg-primary hover:text-primary-foreground hover:border-primary text-zinc-200 font-semibold text-xs rounded-xl h-9 mt-1 group-hover:shadow-md transition-all duration-300"
                      >
                        Customize &amp; Copy Code <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/10">
              <span className="text-zinc-600 text-3xl">📭</span>
              <p className="mt-2 text-sm font-semibold text-zinc-300">No components matching your search</p>
              <p className="text-xs text-zinc-500 mt-1">Try selecting a different filter or clearing queries.</p>
            </div>
          )}
        </div>
      ) : (
        // ACTIVE CUSTOMIZER WORKSPACE
        <div className="space-y-4">
          {/* Top Return Header */}
          <button
            onClick={() => setActiveItem(null)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 font-medium group transition-colors duration-200 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" /> Back to library
          </button>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Left Screen: Live Interactive Canvas */}
            <div className="space-y-4">
              <div className="relative flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-950/20 overflow-hidden shadow-2xl">
                {/* Visual Canvas Info Header */}
                <div className="flex items-center justify-between border-b border-zinc-900/80 bg-zinc-950/60 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-bold text-zinc-200 tracking-wide font-mono">Live Interactive Preview</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">scale: 100%</span>
                </div>
                
                {/* Visual Workspace Canvas Frame */}
                <div className="flex min-h-[300px] items-center justify-center p-12 bg-zinc-900/30 chequered-pattern relative overflow-hidden">
                  <LivePreviewRenderer item={activeItem} props={customProps} />
                </div>
              </div>

              {/* Code Box Pane */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 px-4 py-2.5">
                  <div className="flex items-center gap-1">
                    <Code className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-zinc-300 font-mono">Source Code</span>
                  </div>
                  
                  {/* Select Tailwind / CSS Tabs */}
                  <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800">
                    <button
                      onClick={() => setCodeTab('tailwind')}
                      className={cn(
                        "px-2.5 py-1 text-[10px] font-bold tracking-wide rounded-md transition-all duration-200",
                        codeTab === 'tailwind'
                          ? "bg-zinc-800 text-zinc-100 shadow"
                          : "text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      React + Tailwind
                    </button>
                    <button
                      onClick={() => setCodeTab('css')}
                      className={cn(
                        "px-2.5 py-1 text-[10px] font-bold tracking-wide rounded-md transition-all duration-200",
                        codeTab === 'css'
                          ? "bg-zinc-800 text-zinc-100 shadow"
                          : "text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      HTML &amp; CSS
                    </button>
                  </div>
                </div>

                {/* Highlighted text container */}
                <div className="relative flex-1 font-mono text-xs bg-zinc-950 p-4 overflow-x-auto max-h-[320px] scrollbar-thin text-zinc-300">
                  <pre className="text-[11px] leading-relaxed select-text">
                    {codeTab === 'tailwind' ? generatedCodes.tailwind : generatedCodes.css}
                  </pre>
                  
                  <button
                    onClick={() => copyCodeToClipboard(codeTab === 'tailwind' ? generatedCodes.tailwind : generatedCodes.css)}
                    className={cn(
                      "absolute top-3 right-3 p-2 rounded-lg border text-zinc-300 transition-all duration-200",
                      copied
                        ? "bg-emerald-500/25 border-emerald-500 text-emerald-400"
                        : "bg-zinc-900 hover:bg-zinc-800 border-zinc-850 hover:border-zinc-700"
                    )}
                  >
                    {copied ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold">
                        <Check className="h-3.5 w-3.5" /> Copied!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold">
                        <Copy className="h-3.5 w-3.5" /> Copy Code
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Screen: Property Customizer Panel */}
            <aside className="rounded-2xl border border-zinc-800 bg-zinc-950/65 p-5 shadow-xl space-y-6">
              <div className="space-y-1.5 border-b border-zinc-900 pb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary font-mono">{activeItem.category}</span>
                <h2 className="text-lg font-extrabold text-zinc-100 leading-snug">{activeItem.name}</h2>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">{activeItem.description}</p>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs">
                  <Sliders className="h-3.5 w-3.5 text-primary" />
                  <span>Configure Attributes</span>
                </div>
                
                {/* Dynamically render property form fields */}
                {activeItem.props.map((p) => (
                  <div key={p.id} className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300 flex justify-between">
                      <span>{p.name}</span>
                      {p.type === 'number' && <span className="text-zinc-500 font-mono">{customProps[p.id]}</span>}
                    </label>
                    
                    {p.type === 'text' && (
                      <Input
                        type="text"
                        value={customProps[p.id] || ''}
                        onChange={(e) => handlePropChange(p.id, e.target.value)}
                        className="bg-zinc-900 border-zinc-850 text-zinc-200 placeholder-zinc-650 h-9 rounded-lg"
                      />
                    )}

                    {p.type === 'select' && (
                      <select
                        value={customProps[p.id] || ''}
                        onChange={(e) => handlePropChange(p.id, e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 rounded-lg text-xs font-semibold text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary/45 focus:border-primary/45"
                      >
                        {p.options?.map((opt) => (
                          <option key={opt} value={opt} className="bg-zinc-950 font-semibold">{opt}</option>
                        ))}
                      </select>
                    )}

                    {p.type === 'boolean' && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!!customProps[p.id]}
                          onChange={(e) => handlePropChange(p.id, e.target.checked)}
                          id={`chk-${p.id}`}
                          className="h-4.5 w-4.5 rounded border-zinc-800 text-primary bg-zinc-900 focus:ring-primary/40 focus:ring-offset-zinc-950 cursor-pointer"
                        />
                        <label htmlFor={`chk-${p.id}`} className="ml-2.5 text-xs text-zinc-400 select-none cursor-pointer">
                          Enable {p.name.toLowerCase()}
                        </label>
                      </div>
                    )}

                    {p.type === 'number' && (
                      <input
                        type="range"
                        min={p.min ?? 0}
                        max={p.max ?? 100}
                        step={p.step ?? 1}
                        value={customProps[p.id] ?? p.default}
                        onChange={(e) => handlePropChange(p.id, Number(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    )}
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  )
}
export default MarketplaceView
