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
  Heart,
  Globe,
  ShieldCheck,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const hexToRgba = (hex: string, alpha: number) => {
  let c = hex.substring(1)
  if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2]
  const num = parseInt(c, 16)
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`
}

const CURVE_LOADERS = [
  {
    id: 'four-petal-spiral',
    name: 'Four-Petal Spiral',
    eq: 'R = 4, R = 1, D = 3',
    desc: 'With R = 4, the rolling-circle path settles into four looping petals, rotating and breathing as one ring.'
  },
  {
    id: 'five-petal-spiral',
    name: 'Five-Petal Spiral',
    eq: 'R = 5, R = 1, D = 3',
    desc: 'With R = 5, the loop count increases to five petals, giving the spiral flower a denser and more ornate rhythm.'
  },
  {
    id: 'six-petal-spiral',
    name: 'Six-Petal Spiral',
    eq: 'R = 6, R = 1, D = 3',
    desc: 'The rolling-circle path splits into six petals, and the whole ring breathes in one unified pulse.'
  },
  {
    id: 'butterfly-phase',
    name: 'Butterfly Phase',
    eq: 'BUTTERFLY CURVE',
    desc: 'Exponential and high-frequency cosine terms stretch the wings unevenly, giving the path its unpredictably fluttering shape.'
  },
  {
    id: 'cardioid-glow',
    name: 'Cardioid Glow',
    eq: 'CARDIOID',
    desc: 'Because r = a(1 - cos t) collapses to zero at one side and swells on the other, the curve reads like a soft pulsing heart wave.'
  },
  {
    id: 'cardioid-heart',
    name: 'Cardioid Heart',
    eq: 'R = A(1 - COS T)',
    desc: 'Starting from r = a(1 - cos t) and rotating the coordinates turns the textbook cardioid into a more legible upright heart.'
  },
  {
    id: 'heart-wave',
    name: 'Heart Wave',
    eq: 'F(X) HEART WAVE',
    desc: 'The x^(2/3) envelope supplies the heart outline, while sin(6.9*pi*x) fills its interior with adjustable horizontal ripples.'
  },
  {
    id: 'spiral-search',
    name: 'Spiral Search',
    eq: 'ARCHIMEDEAN SPIRAL',
    desc: 'A fast-growing angle combined with a cosine-modulated radius creates a spiral that opens out and closes cleanly back into itself.'
  },
  {
    id: 'lissajous-drift',
    name: 'Lissajous Drift',
    eq: 'X = SIN(3θ), Y = SIN(4θ)',
    desc: 'Driven by integer harmonic ratios on two axes, the drifting phase makes the path slowly orbit and morph over time.'
  },
  {
    id: 'lemniscate-bloom',
    name: 'Lemniscate Bloom',
    eq: 'BERNOULLI LEMNISCATE',
    desc: 'The infinity loop expands and contracts, rotating slightly around its center node to create an endless cosmic bloom.'
  },
  {
    id: 'rose-curve',
    name: 'Rose Curve',
    eq: 'R = COS(5θ)',
    desc: 'A classic polar rose whose odd integer multiplier yields five symmetrical lobes sweeping outwards.'
  },
  {
    id: 'fourier-flow',
    name: 'Fourier Flow',
    eq: 'FOURIER CURVE',
    desc: 'Several sine and cosine components interfere with one another, so the shape keeps mutating like a living waveform.'
  },
  {
    id: 'superformula-star',
    name: 'Superformula Star',
    eq: 'GIELIS STAR',
    desc: 'Using Gielis superellipse symmetry, the path morphs between sharp star configurations and soft organic polygons.'
  },
  {
    id: 'maurer-rose',
    name: 'Maurer Rose',
    eq: 'MAURER n=6, d=71',
    desc: 'Connecting vertices of a rose curve in a fixed angular step creates a complex geometric grid web pattern.'
  },
  {
    id: 'deltoid-loop',
    name: 'Deltoid Loop',
    eq: 'DELTOID CURVE',
    desc: 'A three-cusped hypocycloid path pulsing inward and outward like a futuristic delta shield.'
  },
  {
    id: 'cochleoid-shell',
    name: 'Cochleoid Shell',
    eq: 'COCHLEOID SHELL',
    desc: 'A spiral-like shell curve that tightly coils around the origin before ballooning out into a smooth dome.'
  },
  {
    id: 'original-thinking',
    name: 'Original Thinking',
    eq: 'R = 1 + 0.35 * COS(7θ)',
    desc: 'A seven-fold breathing cosine ring that expands and contracts, pulsing like an organic loader.'
  },
  {
    id: 'thinking-five',
    name: 'Thinking Five',
    eq: 'R = 1 + 0.25 * COS(5θ)',
    desc: 'A five-fold breathing cosine ring that pulses with a slow, hypnotic rotational offset.'
  },
  {
    id: 'thinking-nine',
    name: 'Thinking Nine',
    eq: 'R = 1 + 0.3 * COS(9θ)',
    desc: 'A nine-fold breathing cosine ring with high-frequency ripples that rotate around its circular body.'
  },
  {
    id: 'rose-two',
    name: 'Rose Two',
    eq: 'R = COS(2θ)',
    desc: 'A two-petal rose curve sweeping left to right, creating a dual-loop horizontal shape.'
  },
  {
    id: 'rose-four',
    name: 'Rose Four',
    eq: 'R = COS(4θ)',
    desc: 'A four-petal rose curve whose symmetrical lobes rotate in a balanced quadrant layout.'
  },
  {
    id: 'spirograph',
    name: 'Hypotrochoid Loop',
    eq: 'R = 0.55, r = 0.45, d = 0.38',
    desc: 'A spirograph loop created by rolling an inner circle, producing complex nested orbits.'
  },
  {
    id: 'spiral',
    name: 'Three-Petal Spiral',
    eq: 'R = θ/(2π) + 0.3*COS(3θ)',
    desc: 'A lobed spiral whose path wind outwards while modulated by a three-fold cosine wave.'
  },
  {
    id: 'astroid-wave',
    name: 'Astroid Wave',
    eq: 'X³ + Y³ = A³',
    desc: 'A four-cusped hypocycloid forming a sharp star-like diamond that expands and rotates over time.'
  },
  {
    id: 'fermat-spiral',
    name: 'Fermat Spiral',
    eq: 'R² = A²θ',
    desc: 'A double-branched parabolic spiral that unfurls symmetrically outwards like winding solar rays.'
  },
  {
    id: 'folium-wave',
    name: 'Folium Wave',
    eq: 'FOLIUM CURVE',
    desc: 'A loop with twin symmetrical wings that breathe and flutter like small flower petals.'
  },
  {
    id: 'lituus-coil',
    name: 'Lituus Coil',
    eq: 'R²θ = A',
    desc: 'A trumpet-like spiral that wraps infinitely around the origin before flaring out into outer space.'
  },
  {
    id: 'logarithmic-spiral',
    name: 'Logarithmic Spiral',
    eq: 'R = EXP(0.15θ)',
    desc: 'A classic logarithmic spiral that grows exponentially, tracing the perfect golden ratio zoom.'
  }
]

function SingleCurveCanvasCompact({ curveId, props }: { curveId: string; props: Record<string, any> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderStyle = props.renderStyle || 'halftone'
  const lineColor = props.lineColor || '#ffffff'
  const glowColor = props.glowColor || '#ffffff'
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

    const getPoint = (theta: number, time: number, size: number) => {
      const breath = 1.0 + breathScale * Math.sin(time * 0.05)
      let x = 0
      let y = 0

      switch (curveId) {
        case 'four-petal-spiral': {
          x = (0.5 * Math.cos(theta) + 0.5 * Math.cos(3 * theta)) * breath
          y = (0.5 * Math.sin(theta) - 0.5 * Math.sin(3 * theta)) * breath
          break
        }
        case 'five-petal-spiral': {
          x = ((4 * Math.cos(theta) + 3 * Math.cos(4 * theta)) / 7) * breath
          y = ((4 * Math.sin(theta) - 3 * Math.sin(4 * theta)) / 7) * breath
          break
        }
        case 'six-petal-spiral': {
          x = ((5 * Math.cos(theta) + 3 * Math.cos(5 * theta)) / 8) * breath
          y = ((5 * Math.sin(theta) - 3 * Math.sin(5 * theta)) / 8) * breath
          break
        }
        case 'butterfly-phase': {
          const r_val = Math.exp(Math.sin(theta)) - 2 * Math.cos(4 * theta) + Math.pow(Math.sin((2 * theta - Math.PI) / 24), 5)
          x = r_val * Math.cos(theta) * 0.28 * breath
          y = r_val * Math.sin(theta) * 0.28 * breath
          break
        }
        case 'cardioid-glow': {
          const r_val = 0.5 * (1 - Math.cos(theta))
          x = (r_val * Math.cos(theta) + 0.1) * 1.5 * breath
          y = (r_val * Math.sin(theta)) * 1.5 * breath
          break
        }
        case 'cardioid-heart': {
          const r_val = 0.55 * (1 - Math.cos(theta))
          x = r_val * Math.sin(theta) * 1.35 * breath
          y = (-r_val * Math.cos(theta) + 0.2) * 1.35 * breath
          break
        }
        case 'heart-wave': {
          const x_val = Math.sqrt(3.3) * Math.sin(theta)
          const y_val = Math.pow(Math.abs(x_val), 2/3) + 0.9 * Math.sqrt(3.3) * Math.cos(theta) * Math.sin(6.9 * Math.PI * x_val + time * 0.05)
          x = x_val * 0.45 * breath
          y = -y_val * 0.45 * breath
          break
        }
        case 'spiral-search': {
          const base_r = ((theta % (2 * Math.PI)) / (2 * Math.PI)) * 0.65
          const r = (base_r + 0.25 * Math.cos(3 * theta)) * breath
          x = r * Math.cos(theta)
          y = r * Math.sin(theta)
          break
        }
        case 'lissajous-drift': {
          x = Math.sin(3 * theta + time * 0.03) * breath
          y = Math.sin(4 * theta) * breath
          break
        }
        case 'lemniscate-bloom': {
          const denom = 1 + Math.sin(theta) * Math.sin(theta)
          const lx = (Math.cos(theta) / denom) * 1.25
          const ly = (Math.sin(theta) * Math.cos(theta) / denom) * 1.25
          const rot = time * 0.006
          x = (lx * Math.cos(rot) - ly * Math.sin(rot)) * breath
          y = (lx * Math.sin(rot) + ly * Math.cos(rot)) * breath
          break
        }
        case 'rose-curve': {
          const radius = Math.cos(5 * theta) * breath
          x = radius * Math.cos(theta)
          y = radius * Math.sin(theta)
          break
        }
        case 'fourier-flow': {
          const x_val = 17.8 * Math.cos(theta) + 7.5 * Math.cos(3 * theta + time * 0.02) + 3.2 * Math.sin(5 * theta - time * 0.015)
          const y_val = 15.0 * Math.sin(theta) + 8.2 * Math.sin(2 * theta + time * 0.025) - 4.2 * Math.cos(4 * theta - time * 0.01)
          x = x_val * 0.032 * breath
          y = y_val * 0.032 * breath
          break
        }
        case 'superformula-star': {
          const pulseM = 5 + 2 * Math.sin(time * 0.02)
          const t1 = Math.abs(Math.cos(pulseM * theta / 4))
          const t2 = Math.abs(Math.sin(pulseM * theta / 4))
          const r = Math.pow(Math.pow(t1, 1.7) + Math.pow(t2, 1.7), -1 / 0.2) * 0.5 * breath
          x = r * Math.cos(theta)
          y = r * Math.sin(theta)
          break
        }
        case 'maurer-rose': {
          const angle = (theta * 180 / Math.PI)
          const k = angle * (71 + 2 * Math.sin(time * 0.005)) * Math.PI / 180
          const r = Math.sin(6 * k) * 0.95 * breath
          x = r * Math.cos(k)
          y = r * Math.sin(k)
          break
        }
        case 'deltoid-loop': {
          const d_breath = breath * (1.0 + 0.12 * Math.sin(time * 0.04))
          x = (0.6 * Math.cos(theta) + 0.3 * Math.cos(2 * theta)) * d_breath
          y = (0.6 * Math.sin(theta) - 0.3 * Math.sin(2 * theta)) * d_breath
          break
        }
        case 'cochleoid-shell': {
          const th = ((theta + Math.PI) % (Math.PI * 2)) - Math.PI
          const thVal = Math.abs(th) < 0.0001 ? 0.0001 : th
          const r = (Math.sin(3 * thVal) / thVal) * 0.28 * breath
          x = r * Math.cos(theta) - 0.2 * breath
          y = r * Math.sin(theta)
          break
        }
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
        case 'astroid-wave': {
          const rad = time * 0.005
          const ax = Math.pow(Math.cos(theta), 3) * breath
          const ay = Math.pow(Math.sin(theta), 3) * breath
          x = (ax * Math.cos(rad) - ay * Math.sin(rad))
          y = (ax * Math.sin(rad) + ay * Math.cos(rad))
          break
        }
        case 'fermat-spiral': {
          const th = (theta % (Math.PI * 4))
          const r = Math.sqrt(th / (Math.PI * 4)) * breath
          x = r * Math.cos(theta + time * 0.01)
          y = r * Math.sin(theta + time * 0.01)
          break
        }
        case 'folium-wave': {
          const r = (Math.cos(theta) * (2 * Math.cos(theta) - 1)) * breath
          x = r * Math.cos(theta)
          y = r * Math.sin(theta)
          break
        }
        case 'lituus-coil': {
          const th = (theta % (Math.PI * 4)) + 0.1
          const r = (1 / Math.sqrt(th)) * 0.7 * breath
          x = r * Math.cos(theta)
          y = r * Math.sin(theta)
          break
        }
        case 'logarithmic-spiral': {
          const headTheta = time * 0.02 * speed
          const relTheta = theta - headTheta
          // relTheta is in range [-trailRad, 0] during rendering;
          // keep the profile continuous by using relTheta directly
          const r = Math.exp(0.18 * relTheta) * 0.75 * breath
          x = r * Math.cos(theta)
          y = r * Math.sin(theta)
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
        ctx.strokeStyle = hexToRgba(glowColor, 0.06)
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

          ctx.strokeStyle = hexToRgba(lineColor, ratio)
          ctx.stroke()
        }
      } else if (renderStyle === 'dotted') {
        for (let i = 1; i <= 20; i++) {
          const ratio = i / 20
          const theta = headTheta - trailRad * (1 - ratio)
          const pt = getPoint(theta, t, size)
          
          ctx.fillStyle = hexToRgba(lineColor, ratio)
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

          ctx.strokeStyle = hexToRgba(lineColor, ratio * 0.6)
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
  }, [curveId, renderStyle, lineColor, glowColor, speed, breathScale, trailLength, strokeWidth, glowSize])

  return <canvas ref={canvasRef} className="w-full h-full block" />
}

function SingleCurveCanvas({ curveId, props, name, equation, desc, onClick, isLarge }: { curveId: string; props: Record<string, any>; name: string; equation: string; desc?: string; onClick?: () => void; isLarge?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderStyle = props.renderStyle || 'halftone'
  const lineColor = props.lineColor || '#ffffff'
  const glowColor = props.glowColor || '#ffffff'
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

    const getPoint = (theta: number, time: number, size: number) => {
      const breath = 1.0 + breathScale * Math.sin(time * 0.05)
      let x = 0
      let y = 0

      switch (curveId) {
        case 'four-petal-spiral': {
          x = (0.5 * Math.cos(theta) + 0.5 * Math.cos(3 * theta)) * breath
          y = (0.5 * Math.sin(theta) - 0.5 * Math.sin(3 * theta)) * breath
          break
        }
        case 'five-petal-spiral': {
          x = ((4 * Math.cos(theta) + 3 * Math.cos(4 * theta)) / 7) * breath
          y = ((4 * Math.sin(theta) - 3 * Math.sin(4 * theta)) / 7) * breath
          break
        }
        case 'six-petal-spiral': {
          x = ((5 * Math.cos(theta) + 3 * Math.cos(5 * theta)) / 8) * breath
          y = ((5 * Math.sin(theta) - 3 * Math.sin(5 * theta)) / 8) * breath
          break
        }
        case 'butterfly-phase': {
          const r_val = Math.exp(Math.sin(theta)) - 2 * Math.cos(4 * theta) + Math.pow(Math.sin((2 * theta - Math.PI) / 24), 5)
          x = r_val * Math.cos(theta) * 0.28 * breath
          y = r_val * Math.sin(theta) * 0.28 * breath
          break
        }
        case 'cardioid-glow': {
          const r_val = 0.5 * (1 - Math.cos(theta))
          x = (r_val * Math.cos(theta) + 0.1) * 1.5 * breath
          y = (r_val * Math.sin(theta)) * 1.5 * breath
          break
        }
        case 'cardioid-heart': {
          const r_val = 0.55 * (1 - Math.cos(theta))
          x = r_val * Math.sin(theta) * 1.35 * breath
          y = (-r_val * Math.cos(theta) + 0.2) * 1.35 * breath
          break
        }
        case 'heart-wave': {
          const x_val = Math.sqrt(3.3) * Math.sin(theta)
          const y_val = Math.pow(Math.abs(x_val), 2/3) + 0.9 * Math.sqrt(3.3) * Math.cos(theta) * Math.sin(6.9 * Math.PI * x_val + time * 0.05)
          x = x_val * 0.45 * breath
          y = -y_val * 0.45 * breath
          break
        }
        case 'spiral-search': {
          const base_r = ((theta % (2 * Math.PI)) / (2 * Math.PI)) * 0.65
          const r = (base_r + 0.25 * Math.cos(3 * theta)) * breath
          x = r * Math.cos(theta)
          y = r * Math.sin(theta)
          break
        }
        case 'lissajous-drift': {
          x = Math.sin(3 * theta + time * 0.03) * breath
          y = Math.sin(4 * theta) * breath
          break
        }
        case 'lemniscate-bloom': {
          const denom = 1 + Math.sin(theta) * Math.sin(theta)
          const lx = (Math.cos(theta) / denom) * 1.25
          const ly = (Math.sin(theta) * Math.cos(theta) / denom) * 1.25
          const rot = time * 0.006
          x = (lx * Math.cos(rot) - ly * Math.sin(rot)) * breath
          y = (lx * Math.sin(rot) + ly * Math.cos(rot)) * breath
          break
        }
        case 'rose-curve': {
          const radius = Math.cos(5 * theta) * breath
          x = radius * Math.cos(theta)
          y = radius * Math.sin(theta)
          break
        }
        case 'fourier-flow': {
          const x_val = 17.8 * Math.cos(theta) + 7.5 * Math.cos(3 * theta + time * 0.02) + 3.2 * Math.sin(5 * theta - time * 0.015)
          const y_val = 15.0 * Math.sin(theta) + 8.2 * Math.sin(2 * theta + time * 0.025) - 4.2 * Math.cos(4 * theta - time * 0.01)
          x = x_val * 0.032 * breath
          y = y_val * 0.032 * breath
          break
        }
        case 'superformula-star': {
          const pulseM = 5 + 2 * Math.sin(time * 0.02)
          const t1 = Math.abs(Math.cos(pulseM * theta / 4))
          const t2 = Math.abs(Math.sin(pulseM * theta / 4))
          const r = Math.pow(Math.pow(t1, 1.7) + Math.pow(t2, 1.7), -1 / 0.2) * 0.5 * breath
          x = r * Math.cos(theta)
          y = r * Math.sin(theta)
          break
        }
        case 'maurer-rose': {
          const angle = (theta * 180 / Math.PI)
          const k = angle * (71 + 2 * Math.sin(time * 0.005)) * Math.PI / 180
          const r = Math.sin(6 * k) * 0.95 * breath
          x = r * Math.cos(k)
          y = r * Math.sin(k)
          break
        }
        case 'deltoid-loop': {
          const d_breath = breath * (1.0 + 0.12 * Math.sin(time * 0.04))
          x = (0.6 * Math.cos(theta) + 0.3 * Math.cos(2 * theta)) * d_breath
          y = (0.6 * Math.sin(theta) - 0.3 * Math.sin(2 * theta)) * d_breath
          break
        }
        case 'cochleoid-shell': {
          const th = ((theta + Math.PI) % (Math.PI * 2)) - Math.PI
          const thVal = Math.abs(th) < 0.0001 ? 0.0001 : th
          const r = (Math.sin(3 * thVal) / thVal) * 0.28 * breath
          x = r * Math.cos(theta) - 0.2 * breath
          y = r * Math.sin(theta)
          break
        }
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
        case 'astroid-wave': {
          const rad = time * 0.005
          const ax = Math.pow(Math.cos(theta), 3) * breath
          const ay = Math.pow(Math.sin(theta), 3) * breath
          x = (ax * Math.cos(rad) - ay * Math.sin(rad))
          y = (ax * Math.sin(rad) + ay * Math.cos(rad))
          break
        }
        case 'fermat-spiral': {
          const th = (theta % (Math.PI * 4))
          const r = Math.sqrt(th / (Math.PI * 4)) * breath
          x = r * Math.cos(theta + time * 0.01)
          y = r * Math.sin(theta + time * 0.01)
          break
        }
        case 'folium-wave': {
          const r = (Math.cos(theta) * (2 * Math.cos(theta) - 1)) * breath
          x = r * Math.cos(theta)
          y = r * Math.sin(theta)
          break
        }
        case 'lituus-coil': {
          const th = (theta % (Math.PI * 4)) + 0.1
          const r = (1 / Math.sqrt(th)) * 0.7 * breath
          x = r * Math.cos(theta)
          y = r * Math.sin(theta)
          break
        }
        case 'logarithmic-spiral': {
          const headTheta = time * 0.02 * speed
          const relTheta = theta - headTheta
          // Continuous spiral: radius grows with relative angular distance from head
          const r = Math.exp(0.18 * relTheta) * 0.75 * breath
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
        ctx.strokeStyle = hexToRgba(glowColor, 0.07)
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
            ctx.strokeStyle = hexToRgba(lineColor, op)
            ctx.stroke()
          }
        })
      } else if (renderStyle === 'dotted') {
        for (let i = 1; i <= 45; i++) {
          const ratio = i / 45
          const theta = headTheta - trailRad * (1 - ratio)
          const pt = getPoint(theta, t, size)
          
          ctx.fillStyle = hexToRgba(glowColor, ratio * 0.3)
          ctx.beginPath()
          ctx.arc(cx + pt.x, cy + pt.y, strokeWidth * ratio + glowSize * 0.2 * ratio, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = hexToRgba(lineColor, ratio)
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
          ctx.strokeStyle = hexToRgba(lineColor, op)
          ctx.stroke()
        }
      }

      if (renderStyle !== 'halftone') {
        const headPt = getPoint(headTheta, t, size)

        const glowGrad = ctx.createRadialGradient(
          cx + headPt.x, cy + headPt.y, 0,
          cx + headPt.x, cy + headPt.y, strokeWidth + glowSize / 2
        )
        glowGrad.addColorStop(0, hexToRgba(lineColor, 1.0))
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
  }, [curveId, renderStyle, lineColor, glowColor, speed, breathScale, trailLength, strokeWidth, glowSize])

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-xl border overflow-hidden flex flex-col justify-between transition-all duration-300",
        isLarge
          ? "border-0 bg-transparent w-full max-w-[320px] h-auto items-center text-center p-3"
          : (renderStyle === 'halftone'
              ? 'bg-black border-zinc-950 shadow-inner p-0'
              : 'bg-zinc-950/40 hover:bg-zinc-950/70 border-zinc-900/60 hover:border-zinc-800 p-0'),
        onClick && "cursor-pointer hover:border-primary/50 hover:bg-zinc-950/85 hover:shadow-lg hover:shadow-primary/[0.02] hover:-translate-y-0.5"
      )}
    >
      <div className={cn("flex items-center justify-center relative w-full", isLarge ? "w-[220px] h-[220px] sm:w-[280px] sm:h-[280px]" : "h-[160px] sm:h-[185px] border-b-2 border-zinc-900/80 bg-zinc-950/60")}>
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
      
      {!isLarge && (
        <div className="p-3.5 flex flex-col text-left w-full">
          <div className="flex justify-between items-baseline gap-1.5 w-full">
            <div className="text-[11px] font-bold text-zinc-200 tracking-wide truncate">{name}</div>
            <div className="text-[9px] font-mono text-zinc-500 font-semibold tracking-wider uppercase flex-shrink-0 select-all">{equation}</div>
          </div>
          {desc && (
            <p className="text-[10px] text-zinc-400 leading-relaxed font-light mt-1.5 line-clamp-3">
              {desc}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function MathCurvePackPreview({ props, onSelect }: { props: Record<string, any>; onSelect?: (id: string) => void }) {
  const isCompact = !!props.isCompact

  const loaders = CURVE_LOADERS

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
            desc={loader.desc}
            onClick={() => onSelect?.(loader.id)}
          />
        ))}
      </div>
    </div>
  )
}

const ONBOARDING_CONTINENTS = [
  { id: 'GLOBAL', name: 'Globe', label: 'Globe' },
  { id: 'NA', name: 'North America', label: 'N. America' },
  { id: 'SA', name: 'South America', label: 'S. America' },
  { id: 'EU', name: 'Europe', label: 'Europe' },
  { id: 'AF', name: 'Africa', label: 'Africa' },
  { id: 'AS', name: 'Asia & Oceania', label: 'Asia / Oc' }
]

const ONBOARDING_COUNTRIES = [
  // North America
  { code: 'US', dial: '+1', name: 'United States', continent: 'NA', flag: '🇺🇸' },
  { code: 'CA', dial: '+1', name: 'Canada', continent: 'NA', flag: '🇨🇦' },
  { code: 'MX', dial: '+52', name: 'Mexico', continent: 'NA', flag: '🇲🇽' },
  { code: 'PA', dial: '+507', name: 'Panama', continent: 'NA', flag: '🇵🇦' },
  // South America
  { code: 'BR', dial: '+55', name: 'Brazil', continent: 'SA', flag: '🇧🇷' },
  { code: 'AR', dial: '+54', name: 'Argentina', continent: 'SA', flag: '🇦🇷' },
  { code: 'CO', dial: '+57', name: 'Colombia', continent: 'SA', flag: '🇨🇴' },
  { code: 'CL', dial: '+56', name: 'Chile', continent: 'SA', flag: '🇨🇱' },
  // Europe
  { code: 'GB', dial: '+44', name: 'United Kingdom', continent: 'EU', flag: '🇬🇧' },
  { code: 'FR', dial: '+33', name: 'France', continent: 'EU', flag: '🇫🇷' },
  { code: 'DE', dial: '+49', name: 'Germany', continent: 'EU', flag: '🇩🇪' },
  { code: 'IT', dial: '+39', name: 'Italy', continent: 'EU', flag: '🇮🇹' },
  { code: 'SE', dial: '+46', name: 'Sweden', continent: 'EU', flag: '🇸🇪' },
  { code: 'NO', dial: '+47', name: 'Norway', continent: 'EU', flag: '🇳🇴' },
  // Africa
  { code: 'EG', dial: '+20', name: 'Egypt', continent: 'AF', flag: '🇪🇬' },
  { code: 'ZA', dial: '+27', name: 'South Africa', continent: 'AF', flag: '🇿🇦' },
  { code: 'NG', dial: '+234', name: 'Nigeria', continent: 'AF', flag: '🇳🇬' },
  { code: 'KE', dial: '+254', name: 'Kenya', continent: 'AF', flag: '🇰🇪' },
  // Asia
  { code: 'CN', dial: '+86', name: 'China', continent: 'AS', flag: '🇨🇳' },
  { code: 'IN', dial: '+91', name: 'India', continent: 'AS', flag: '🇮🇳' },
  { code: 'JP', dial: '+81', name: 'Japan', continent: 'AS', flag: '🇯🇵' },
  { code: 'AU', dial: '+61', name: 'Australia', continent: 'AS', flag: '🇦🇺' },
  { code: 'SG', dial: '+65', name: 'Singapore', continent: 'AS', flag: '🇸🇬' }
]


const ONBOARDING_CONTINENT_CENTERS: Record<string, { lon: number; lat: number }> = {
  GLOBAL: { lon: 0, lat: 10 },
  NA: { lon: -100, lat: 40 },
  SA: { lon: -60, lat: -15 },
  EU: { lon: 15, lat: 50 },
  AF: { lon: 20, lat: 5 },
  AS: { lon: 100, lat: 25 }
}

const ONBOARDING_COUNTRY_CENTERS: Record<string, { lon: number; lat: number }> = {
  US: { lon: -100, lat: 38 },
  CA: { lon: -105, lat: 58 },
  MX: { lon: -102, lat: 23 },
  PA: { lon: -80, lat: 9 },
  BR: { lon: -55, lat: -10 },
  AR: { lon: -65, lat: -35 },
  CO: { lon: -73, lat: 4 },
  CL: { lon: -71, lat: -30 },
  GB: { lon: -2, lat: 54 },
  FR: { lon: 2, lat: 46 },
  DE: { lon: 10, lat: 51 },
  IT: { lon: 12, lat: 42 },
  SE: { lon: 18, lat: 62 },
  NO: { lon: 8, lat: 61 },
  EG: { lon: 30, lat: 26 },
  ZA: { lon: 24, lat: -29 },
  NG: { lon: 8, lat: 9 },
  KE: { lon: 38, lat: -1 },
  CN: { lon: 104, lat: 35 },
  IN: { lon: 78, lat: 21 },
  JP: { lon: 138, lat: 36 },
  AU: { lon: 134, lat: -25 },
  SG: { lon: 103.8, lat: 1.3 }
}

const COUNTRY_POLYGONS: Record<string, [number, number][]> = {
  US: [[-125, 48], [-110, 48], [-90, 48], [-70, 45], [-75, 25], [-100, 25], [-120, 30]],
  CA: [[-130, 50], [-60, 50], [-65, 70], [-130, 65]],
  MX: [[-115, 30], [-100, 25], [-90, 20], [-95, 15], [-105, 20]],
  PA: [[-83, 8], [-77, 7], [-78, 9], [-82, 9]],
  BR: [[-70, -10], [-60, 5], [-45, 2], [-35, -6], [-40, -22], [-55, -25], [-60, -15]],
  AR: [[-70, -22], [-55, -25], [-65, -50], [-72, -50]],
  CO: [[-78, 2], [-72, 12], [-68, 6], [-70, -4], [-76, -4]],
  CL: [[-74, -18], [-70, -18], [-72, -54], [-75, -50]],
  GB: [[-6, 50], [-5, 56], [-2, 58], [1, 51]],
  FR: [[-4, 48], [7, 51], [7, 43], [-1, 43]],
  DE: [[6, 50], [14, 54], [14, 48], [6, 48]],
  IT: [[8, 45], [13, 45], [18, 40], [16, 38], [10, 40]],
  SE: [[11, 56], [16, 68], [22, 69], [17, 60], [12, 56]],
  NO: [[5, 58], [10, 62], [20, 70], [26, 71], [15, 60], [5, 58]],
  EG: [[25, 22], [35, 22], [35, 31], [25, 31]],
  ZA: [[16, -29], [32, -29], [28, -34], [18, -34]],
  NG: [[3, 4], [14, 4], [14, 13], [3, 13]],
  KE: [[34, -4], [41, -4], [41, 4], [34, 4]],
  CN: [[75, 40], [100, 42], [120, 45], [122, 23], [105, 22], [95, 29]],
  IN: [[68, 23], [74, 30], [78, 35], [90, 28], [97, 26], [88, 22], [78, 8]],
  JP: [[130, 31], [135, 34], [140, 38], [145, 44], [142, 44], [136, 36]],
  AU: [[113, -21], [130, -12], [143, -12], [152, -25], [148, -38], [115, -34]],
  SG: [[103.6, 1.2], [104, 1.2], [104, 1.4], [103.6, 1.4]]
};

const CONTINENT_POLYGONS: Record<string, [number, number][]> = {
  NA: [[-168, 65], [-120, 70], [-60, 80], [-50, 60], [-55, 45], [-95, 25], [-80, 25], [-80, 9], [-100, 16], [-115, 30], [-125, 48], [-165, 54]],
  SA: [[-80, 9], [-40, -10], [-35, -5], [-40, -20], [-70, -55], [-75, -45], [-70, -20], [-80, -5]],
  EU: [[-10, 36], [-10, 60], [30, 70], [45, 60], [45, 35], [20, 35]],
  AF: [[-17, 32], [30, 32], [50, 12], [40, -30], [20, -35], [10, 5]],
  AS: [[45, 35], [45, 60], [170, 70], [140, 30], [120, 10], [100, 1], [80, 6], [60, 25]],
  AU: [[113, -25], [115, -35], [145, -38], [153, -28], [140, -12], [130, -12]]
};

const isPointInPolygon = (x: number, y: number, vs: [number, number][]) => {
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

const getPolygonBounds = (poly: [number, number][]) => {
  let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;
  poly.forEach(([lon, lat]) => {
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  });
  return { minLon, maxLon, minLat, maxLat };
};

interface OnboardingParticle {
  x: number; y: number; z: number;
  tx: number; ty: number; tz: number;
  lon: number; lat: number;
  continent: string;
  country: string;
  idx: number;
}

function PhoneOnboardingPreview({ props }: { props: Record<string, any> }) {
  const highlightColor = props.highlightColor || '#06b6d4'
  const renderStyle = props.renderStyle || 'glow'
  const particleCount = Number(props.particleCount) || 800
  const autoRotate = props.autoRotate !== false

  const [selectedContinent, setSelectedContinent] = useState('GLOBAL')
  const [projectionMode, setProjectionMode] = useState<'3d-spin' | '3d-static' | '2d-map'>('3d-spin')
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const landPointsRef = useRef<{ lon: number; lat: number }[]>([])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<OnboardingParticle[]>([])

  // Load and sample map image offscreen using latitudinal rings for premium quality
  useEffect(() => {
    const img = new Image()
    img.src = '/worldmap2.jpg'
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      if (!tempCtx) return

      const w = img.naturalWidth || img.width
      const h = img.naturalHeight || img.height
      tempCanvas.width = w
      tempCanvas.height = h
      tempCtx.drawImage(img, 0, 0)

      try {
        const imgData = tempCtx.getImageData(0, 0, w, h)
        const data = imgData.data
        const pts: { lon: number; lat: number }[] = []

        // Image Flat Map boundaries: X in [142, 906] (width 765), Y in [255, 647] (height 393)
        const x_start = 142, x_end = 906
        const y_start = 255, y_end = 647
        const map_w = x_end - x_start + 1
        const map_h = y_end - y_start + 1

        const lat_min = -66, lat_max = 81
        const lon_min = -180, lon_max = 180

        // Sample along latitude rings
        for (let lat = -75; lat <= 80; lat += 2.0) {
          const rLat = (lat * Math.PI) / 180
          const cosLat = Math.cos(rLat)
          
          // Density along the ring is proportional to cos(lat)
          // We want around 220 points on the equator
          const numPoints = Math.round(220 * cosLat)
          if (numPoints < 1) continue

          for (let i = 0; i < numPoints; i++) {
            const lon = -180 + (i / numPoints) * 360

            // Map (lon, lat) to image pixel coordinate (x, y)
            const imgX = Math.round(x_start + (lon - lon_min) / (lon_max - lon_min) * (map_w - 1))
            const imgY = Math.round(y_start + (lat_max - lat) / (lat_max - lat_min) * (map_h - 1))

            // Perform neighborhood check (3x3) to decide if it is land
            let isLand = false
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const px = imgX + dx
                const py = imgY + dy
                if (px >= 0 && px < w && py >= 0 && py < h) {
                  const idx = (py * w + px) * 4
                  const r = data[idx]
                  const g = data[idx + 1]
                  const b = data[idx + 2]
                  if (r < 120 && g < 120 && b < 120) {
                    isLand = true
                    break
                  }
                }
              }
              if (isLand) break
            }

            if (isLand) {
              pts.push({ lon, lat })
            }
          }
        }

        landPointsRef.current = pts
        setMapLoaded(true)
      } catch (err) {
        console.error("Error reading map image data, falling back", err)
      }
    }
  }, [])

  // Camera settings
  const camZoom = useRef(1.0)
  const currentZoom = useRef(1.0)
  const camAngleX = useRef(0.1)
  const currentAngleX = useRef(0.1)
  const camOffX = useRef(0)
  const currentOffX = useRef(0)
  const camOffY = useRef(0)
  const currentOffY = useRef(0)

  const activeCountryObj = ONBOARDING_COUNTRIES.find(c => c.code === selectedCountry) || null

  const parseHexToRgb = (hex: string) => {
    let c = hex.substring(1)
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2]
    const num = parseInt(c, 16)
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`
  }
  const themeRgb = parseHexToRgb(highlightColor)

  const renderContinentIcon = (id: string) => {
    switch (id) {
      case 'GLOBAL':
        return <Globe className="h-6 w-6 stroke-[1.2]" />
      case 'NA':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6">
            <path d="M3 4c1-1 3.5 0 4.5 1s2.5 2 3.5.5 1.5-2.5 3.5-1.5 1.5 2.5.5 4.5-.5 2.5-1.5 3.5-2.5 1-2.5 2.5.5 3.5-1 4.5c-.8.2-1.5-1-2.5-1s-2.5 1-3.5-1-1-2.5-2.5-3.5c-1-.5-1.5-.5-1.5-2s1-3 2-6z" />
          </svg>
        )
      case 'SA':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6">
            <path d="M8 4c1.5-1 3.5 0 5 1.5s2 4.5 1.2 7c-.8 2.5-2.5 5-3.5 6.5s-2 1.5-2-1c0-2 .8-3.5 0-5s-2-2.5-2-4c0-1.5 1-3 1.3-5z" />
          </svg>
        )
      case 'EU':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6">
            <path d="M3 9c1.5-1.5 4-.8 5.5-.8s2.5 1.5 3.5.8 1.5-1.5 3-.8 1.5 1.5.8 3c-.8.8-2.5.8-2.5 2.5s-1.5 1.5-3 .8c-1.5 0-2.5-1.5-4-.8s-2.5 1.5-3.5-1.5c0-1.5 0-3 .2-4.2z" />
          </svg>
        )
      case 'AF':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6">
            <path d="M5.5 5c2.5-1.5 6-.8 7.5.8s2.5 3.5 1.7 6c-.8 1.5.8 3.5 0 5s-2.5 2.5-4 .8c-1.5-.8-1.5-2.5-2.5-3.5S5 12 5 9.5c0-2.5 0-4 .5-4.5z" />
          </svg>
        )
      case 'AS':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6">
            <path d="M3 9c1.5-2.5 4-2.5 6.5-.8s3 3.5 4.5 2c1.5-.8 2.5-2.5 3.5-.8s-.8 3.5-2.5 4.5-3 .8-4 2.5c-.8 1.7-2.5 1.7-3.5 0s-1.7-1.7-3.5-2.5c-1.7-.8-2.5-1.7-1.7-4.2z" />
          </svg>
        )
      default:
        return null
    }
  }

  // Initialize particles once (or when particleCount/mapLoaded changes)
  useEffect(() => {
    const list: OnboardingParticle[] = []
    const pts = landPointsRef.current

    if (pts.length > 0) {
      // Precise sampling from loaded image
      const step = pts.length / particleCount
      for (let i = 0; i < particleCount; i++) {
        const pt = pts[Math.min(pts.length - 1, Math.floor(i * step))]
        const lon = pt.lon
        const lat = pt.lat

        // Classify particle using polygons
        const country = ONBOARDING_COUNTRIES.find(c => {
          const poly = COUNTRY_POLYGONS[c.code]
          return poly && isPointInPolygon(lon, lat, poly)
        })

        let continent = ''
        if (country) {
          continent = country.continent
        } else {
          continent = Object.keys(CONTINENT_POLYGONS).find(key => {
            const poly = CONTINENT_POLYGONS[key]
            return poly && isPointInPolygon(lon, lat, poly)
          }) || ''
        }

        list.push({
          x: (Math.random() - 0.5) * 300,
          y: (Math.random() - 0.5) * 300,
          z: (Math.random() - 0.5) * 300,
          tx: 0, ty: 0, tz: 0,
          lon,
          lat,
          continent,
          country: country ? country.code : '',
          idx: i
        })
      }
    } else {
      // Procedural fallback
      const countryCount = Math.floor(particleCount * 0.6)
      const bgCount = particleCount - countryCount

      for (let i = 0; i < countryCount; i++) {
        const c = ONBOARDING_COUNTRIES[i % ONBOARDING_COUNTRIES.length]
        const center = ONBOARDING_COUNTRY_CENTERS[c.code]
        const poly = COUNTRY_POLYGONS[c.code]

        let lon = center.lon
        let lat = center.lat
        if (poly) {
          const bounds = getPolygonBounds(poly)
          for (let attempt = 0; attempt < 30; attempt++) {
            const testLon = bounds.minLon + Math.random() * (bounds.maxLon - bounds.minLon)
            const testLat = bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat)
            if (isPointInPolygon(testLon, testLat, poly)) {
              lon = testLon
              lat = testLat
              break
            }
          }
        }

        list.push({
          x: (Math.random() - 0.5) * 300,
          y: (Math.random() - 0.5) * 300,
          z: (Math.random() - 0.5) * 300,
          tx: 0, ty: 0, tz: 0,
          lon,
          lat,
          continent: c.continent,
          country: c.code,
          idx: i
        })
      }

      const continentKeys = ['NA', 'SA', 'EU', 'AF', 'AS', 'AU']
      for (let i = 0; i < bgCount; i++) {
        const cont = continentKeys[i % continentKeys.length]
        const poly = CONTINENT_POLYGONS[cont]

        let lon = 0
        let lat = 0
        if (poly) {
          const bounds = getPolygonBounds(poly)
          for (let attempt = 0; attempt < 30; attempt++) {
            const testLon = bounds.minLon + Math.random() * (bounds.maxLon - bounds.minLon)
            const testLat = bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat)
            if (isPointInPolygon(testLon, testLat, poly)) {
              lon = testLon
              lat = testLat
              break
            }
          }
        }

        list.push({
          x: (Math.random() - 0.5) * 300,
          y: (Math.random() - 0.5) * 300,
          z: (Math.random() - 0.5) * 300,
          tx: 0, ty: 0, tz: 0,
          lon,
          lat,
          continent: cont,
          country: '', // Empty country code so it doesn't highlight
          idx: countryCount + i
        })
      }
    }

    particlesRef.current = list
  }, [particleCount, mapLoaded])

  // Morph targets calculation whenever selection changes
  useEffect(() => {
    const isGlobe = projectionMode === '3d-spin' || projectionMode === '3d-static'

    if (isGlobe) {
      camZoom.current = 1.0
      camOffX.current = 0
      camOffY.current = 0

      let targetLat = -12 // default tilt looking from above
      if (selectedCountry) {
        const center = ONBOARDING_COUNTRY_CENTERS[selectedCountry]
        if (center) targetLat = center.lat
      } else if (selectedContinent && selectedContinent !== 'GLOBAL') {
        const center = ONBOARDING_CONTINENT_CENTERS[selectedContinent]
        if (center) targetLat = center.lat
      }
      camAngleX.current = - (targetLat * Math.PI) / 180
    } else {
      // Keep the whole flat map visible and centered
      camZoom.current = 0.65
      camOffX.current = 0
      camOffY.current = 0
      camAngleX.current = 0
    }

    const list = particlesRef.current
    list.forEach(p => {
      const rLon = (p.lon * Math.PI) / 180
      const rLat = (p.lat * Math.PI) / 180
      const R = 85

      if (isGlobe) {
        p.tx = R * Math.cos(rLat) * Math.sin(rLon)
        p.ty = -R * Math.sin(rLat)
        p.tz = R * Math.cos(rLat) * Math.cos(rLon)
      } else {
        // ALWAYS keep the full world map visible and normally scaled
        p.tx = p.lon
        p.ty = -p.lat
        p.tz = 0
      }
    })
  }, [projectionMode, selectedContinent, selectedCountry, particleCount, mapLoaded])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let autoRot = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cx = canvas.width / 2
      const cy = canvas.height / 2

      // Solid background for halftone style
      if (renderStyle === 'halftone') {
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      const isGlobe = projectionMode === '3d-spin' || projectionMode === '3d-static'

      if (isGlobe) {
        if (selectedCountry) {
          const center = ONBOARDING_COUNTRY_CENTERS[selectedCountry]
          if (center) {
            const targetRot = (center.lon * Math.PI) / 180
            autoRot += (targetRot - autoRot) * 0.08
          }
        } else if (selectedContinent && selectedContinent !== 'GLOBAL') {
          const center = ONBOARDING_CONTINENT_CENTERS[selectedContinent]
          if (center) {
            const targetRot = (center.lon * Math.PI) / 180
            autoRot += (targetRot - autoRot) * 0.08
          }
        } else if (projectionMode === '3d-spin' && autoRotate) {
          autoRot += 0.004
        }
      } else {
        autoRot += (0 - autoRot) * 0.1
      }

      currentZoom.current += (camZoom.current - currentZoom.current) * 0.08
      currentAngleX.current += (camAngleX.current - currentAngleX.current) * 0.08
      currentOffX.current += (camOffX.current - currentOffX.current) * 0.08
      currentOffY.current += (camOffY.current - currentOffY.current) * 0.08

      const zScale = currentZoom.current
      const particles = particlesRef.current

      // Draw globe outline circle
      if (isGlobe) {
        ctx.beginPath()
        ctx.arc(cx, cy, 85 * zScale, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
        ctx.lineWidth = 0.8
        ctx.stroke()
      }

      const projected = particles.map(p => {
        p.x += (p.tx - p.x) * 0.1
        p.y += (p.ty - p.y) * 0.1
        p.z += (p.tz - p.z) * 0.1

        let rx = p.x
        let ry = p.y
        let rz = p.z

        if (isGlobe) {
          const cosR = Math.cos(autoRot)
          const sinR = Math.sin(autoRot)
          rx = p.x * cosR - p.z * sinR
          rz = p.x * sinR + p.z * cosR
        }

        const cosX = Math.cos(currentAngleX.current)
        const sinX = Math.sin(currentAngleX.current)
        const finalY = ry * cosX - rz * sinX
        const finalZ = ry * sinX + rz * cosX

        const scale = 250 / (250 - finalZ * 0.2)
        const px = (rx + currentOffX.current) * zScale * scale + cx
        const py = (finalY + currentOffY.current) * zScale * scale + cy

        return { px, py, pz: finalZ, p }
      })

      // Sort from back to front (painter's algorithm)
      projected.sort((a, b) => a.pz - b.pz)

      projected.forEach(({ px, py, pz, p }) => {
        const isHighlight = selectedCountry 
          ? (p.country === selectedCountry) 
          : (selectedContinent !== 'GLOBAL' && p.continent === selectedContinent)

        let baseAlpha = 0.15
        let radius = 1.0
        let isBright = isHighlight

        if (isGlobe) {
          const normZ = (pz + 85) / 170
          if (isHighlight) {
            baseAlpha = 0.95
            radius = 2.0
            isBright = true
          } else {
            baseAlpha = 0.05 + normZ * 0.35
            radius = 0.5 + normZ * 1.0
            isBright = false
          }

          // Back-side point culling/fading
          if (pz < 0) {
            baseAlpha = isHighlight ? 0.15 : 0.03
            radius = isHighlight ? 1.0 : 0.4
          }
        } else {
          baseAlpha = isHighlight ? 0.95 : 0.08
          radius = isHighlight ? 2.0 : 0.7
          isBright = isHighlight
        }

        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          ctx.beginPath()

          if (renderStyle === 'glow') {
            if (isBright) {
              ctx.fillStyle = `rgba(${themeRgb}, ${baseAlpha * 0.35})`
              ctx.arc(px, py, radius * 3.2, 0, Math.PI * 2)
              ctx.fill()
              ctx.beginPath()
              ctx.fillStyle = `rgba(255, 255, 255, ${pz < 0 ? 0.2 : 0.95})`
              ctx.arc(px, py, radius, 0, Math.PI * 2)
            } else {
              ctx.fillStyle = `rgba(255, 255, 255, ${baseAlpha})`
              ctx.arc(px, py, radius, 0, Math.PI * 2)
            }
            ctx.fill()
          } 
          else if (renderStyle === 'dotted') {
            ctx.fillStyle = isBright ? highlightColor : `rgba(255, 255, 255, ${baseAlpha * 0.7})`
            ctx.arc(px, py, radius * (isBright ? 1.25 : 0.8), 0, Math.PI * 2)
            ctx.fill()
          } 
          else if (renderStyle === 'halftone') {
            const mod = 0.4 + 0.6 * Math.sin(p.idx * 0.5)
            const rad = radius * (isBright ? 1.6 : 0.9) * Math.abs(mod)
            ctx.fillStyle = isBright ? highlightColor : `rgba(255, 255, 255, ${baseAlpha * 0.35})`
            ctx.arc(px, py, Math.max(0.3, rad), 0, Math.PI * 2)
            ctx.fill()
            if (isBright && pz >= 0) {
              ctx.beginPath()
              ctx.fillStyle = '#ffffff'
              ctx.arc(px, py, rad * 0.4, 0, Math.PI * 2)
              ctx.fill()
            }
          } 
          else { // minimalist
            ctx.fillStyle = isBright ? highlightColor : `rgba(255, 255, 255, ${baseAlpha * 0.4})`
            ctx.arc(px, py, radius * (isBright ? 1.0 : 0.6), 0, Math.PI * 2)
            ctx.fill()
          }
        }
      })

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animId)
  }, [projectionMode, selectedContinent, selectedCountry, autoRotate, themeRgb, renderStyle, highlightColor])

  const handleContinentSelect = (id: string) => {
    setSelectedContinent(id)
    setSelectedCountry(null)
  }

  const handleCountrySelect = (code: string) => {
    setSelectedCountry(code)
    const country = ONBOARDING_COUNTRIES.find(c => c.code === code)
    if (country && projectionMode === '2d-map') {
      setSelectedContinent(country.continent)
    }
  }

  const filteredCountries = selectedContinent === 'GLOBAL'
    ? ONBOARDING_COUNTRIES
    : ONBOARDING_COUNTRIES.filter(c => c.continent === selectedContinent)

  return (
    <div className="w-full flex items-center justify-center p-4 md:p-8 bg-zinc-950/20 text-white select-none">
      <div 
        className="relative w-full max-w-4xl bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 md:gap-12 shadow-2xl backdrop-blur-md transition-all duration-300"
        style={{ 
          boxShadow: `0 0 40px rgba(${themeRgb}, 0.05), 0 20px 50px rgba(0, 0, 0, 0.5)`
        }}
      >
        {/* Left Side: interactive 3D canvas viewport */}
        <div className="flex-1 w-full flex flex-col items-center justify-center relative">
          <div className="relative w-full aspect-square max-w-[340px] bg-gradient-to-b from-transparent to-black/30 rounded-2xl flex items-center justify-center border border-zinc-900/60 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={340}
              height={340}
              className="w-full h-full block cursor-pointer active:scale-[0.99] transition-transform"
              onClick={() => {
                setSelectedContinent('GLOBAL')
                setSelectedCountry(null)
              }}
            />
            {selectedContinent !== 'GLOBAL' && (
              <button
                onClick={() => {
                  setSelectedContinent('GLOBAL')
                  setSelectedCountry(null)
                }}
                className="absolute top-3 right-3 px-2.5 py-1 text-[9px] font-semibold bg-zinc-900/90 border border-zinc-800 rounded-full text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Reset
              </button>
            )}
            <div className="absolute bottom-2 left-3 text-[9px] font-mono text-zinc-650 uppercase tracking-widest pointer-events-none">
              {selectedCountry
                ? `Country: ${selectedCountry}`
                : selectedContinent === 'GLOBAL'
                  ? 'Globe Mode'
                  : `Region: ${selectedContinent}`}
            </div>
          </div>

          {/* Projection Mode Selector */}
          <div className="w-full max-w-[340px] flex justify-center bg-zinc-950/60 p-0.5 rounded-lg border border-zinc-900/80 mt-3.5">
            {[
              { id: '3d-spin', label: '3D Spin' },
              { id: '3d-static', label: '3D Static' },
              { id: '2d-map', label: '2D Map' }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => {
                  setProjectionMode(mode.id as any)
                  if (mode.id === '2d-map') {
                    if (!selectedCountry) {
                      setSelectedContinent('GLOBAL')
                    }
                  } else {
                    setSelectedContinent('GLOBAL')
                  }
                }}
                className={cn(
                  "flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all duration-200",
                  projectionMode === mode.id
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm shadow-black/40'
                    : 'text-zinc-500 hover:text-zinc-355'
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: onboarding controls & text details */}
        <div className="flex-1 w-full max-w-[360px] flex flex-col justify-center gap-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-150">Enter your phone</h2>
            <p className="text-xs text-zinc-500 mt-1 font-light">Select your country and number to secure your account</p>
          </div>

          <div className="w-full space-y-3">
            {/* Continent Dock Selector */}
            <div className="w-full">
              <div className="flex items-center justify-between px-1.5 py-2 bg-zinc-950/30 rounded-2xl border border-zinc-900/50">
                {ONBOARDING_CONTINENTS.map(c => {
                  const isActive = selectedContinent === c.id
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleContinentSelect(c.id)}
                      className="flex-1 flex flex-col items-center gap-1.5 py-1.5 transition-all duration-200 select-none outline-none group"
                    >
                      <div 
                        className="transition-all duration-200 transform group-hover:scale-105"
                        style={{ 
                          color: isActive ? highlightColor : '#52525b',
                          filter: isActive ? `drop-shadow(0 0 5px rgba(${themeRgb}, 0.6))` : 'none'
                        }}
                      >
                        {renderContinentIcon(c.id)}
                      </div>
                      <span 
                        className={cn(
                          "text-[9px] tracking-wider uppercase transition-colors duration-200",
                          isActive ? "text-zinc-200 font-extrabold" : "text-zinc-650 font-bold"
                        )}
                      >
                        {c.id === 'GLOBAL' ? 'Globe' : c.id}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Countries chips list */}
            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none my-1">
              {filteredCountries.map(c => {
                const isActive = selectedCountry === c.code
                return (
                  <button
                    key={c.code}
                    onClick={() => handleCountrySelect(c.code)}
                    className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-semibold border transition-all duration-200"
                    style={isActive ? {
                      borderColor: highlightColor,
                      color: '#ffffff',
                      backgroundColor: `rgba(${themeRgb}, 0.12)`,
                      boxShadow: `0 0 10px rgba(${themeRgb}, 0.25)`
                    } : {
                      borderColor: 'rgba(255,255,255,0.05)',
                      color: '#a1a1aa',
                      backgroundColor: 'rgba(24, 24, 27, 0.4)'
                    }}
                  >
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Onboarding fields input */}
          <div className="w-full flex items-stretch gap-2.5 relative">
            <div className="relative">
              <button
                onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                className="h-full flex items-center gap-2 px-3.5 py-3 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-200 transition-colors"
              >
                <span>{activeCountryObj ? activeCountryObj.flag : '🌎'}</span>
                <span>{activeCountryObj ? activeCountryObj.dial : '+..'}</span>
              </button>

              {countryDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-[210px] max-h-[180px] overflow-y-auto bg-zinc-900 border border-zinc-850 rounded-xl p-1.5 shadow-2xl z-40 scrollbar-thin">
                  <div className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest px-2.5 py-1.5 border-b border-zinc-800/50 mb-1.5">
                    Dial Code Selector
                  </div>
                  {ONBOARDING_COUNTRIES.map(c => (
                    <button
                      key={c.code}
                      onClick={() => {
                        handleCountrySelect(c.code)
                        setCountryDropdownOpen(false)
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-zinc-850 rounded-lg text-xs text-zinc-300 hover:text-white transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span className="truncate max-w-[100px]">{c.name}</span>
                      </span>
                      <span className="text-zinc-500 font-mono font-medium">{c.dial}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="Phone number"
              className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-200 placeholder-zinc-700 outline-none focus:border-zinc-700 transition-all font-mono"
            />
          </div>

          {/* Security indicator */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 font-light mt-1">
            <ShieldCheck className="h-3.5 w-3.5" style={{ color: highlightColor }} />
            <span>Secure 256-bit encrypted verification</span>
          </div>

          {/* Continue trigger */}
          <button
            onClick={() => alert(`Submitted: ${activeCountryObj?.dial} ${phone}`)}
            disabled={!phone}
            className={cn(
              "group w-full relative inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold transition-all duration-200",
              phone
                ? 'bg-zinc-100 text-black hover:bg-white shadow-lg active:scale-[0.98]'
                : 'bg-zinc-900/50 border border-zinc-850 text-zinc-650 cursor-not-allowed'
            )}
            style={phone ? { backgroundColor: highlightColor, color: '#000000' } : {}}
          >
            <span>Continue</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}

function LivePreviewRenderer({ item, props, selectedSubLoader, onSelectSubLoader }: { item: ComponentItem; props: Record<string, any>; selectedSubLoader?: string | null; onSelectSubLoader?: (id: string | null) => void }) {
  if (item.id === 'math-curve-pack') {
    if (selectedSubLoader) {
      const loaders = CURVE_LOADERS
      const loader = loaders.find(l => l.id === selectedSubLoader) || loaders[0]
      return (
        <SingleCurveCanvas
          curveId={selectedSubLoader}
          props={props}
          name={loader.name}
          equation={loader.eq}
          desc={loader.desc}
          isLarge={true}
        />
      )
    } else {
      return <MathCurvePackPreview props={props} onSelect={onSelectSubLoader} />
    }
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
  
  if (item.id === 'phone-onboarding') {
    return <PhoneOnboardingPreview props={props} />
  }

  return null
}

export function MarketplaceView() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [activeItem, setActiveItem] = useState<ComponentItem | null>(null)
  const [selectedSubLoader, setSelectedSubLoader] = useState<string | null>(null)
  
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
    setSelectedSubLoader(null)
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
                      <LivePreviewRenderer
                        item={item}
                        props={item.id === 'math-curve-pack' ? { ...defaultProps, isCompact: true } : defaultProps}
                      />
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
            onClick={() => {
              setActiveItem(null)
              setSelectedSubLoader(null)
            }}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 font-medium group transition-colors duration-200 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" /> Back to library
          </button>

          {activeItem.id === 'math-curve-pack' && selectedSubLoader === null ? (
            /* Mathematical Curve Loader Pack Gallery */
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                  <Grid className="h-5 w-5 text-primary animate-pulse" /> Mathematical Curve Loader Pack
                </h2>
                <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">
                  Explore organic, high-performance mathematical loaders rendered dynamically in real-time. Choose a curve pattern below to inspect parameters, adjust styles/colors, and copy generated code.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
                {CURVE_LOADERS.map((loader) => (
                  <SingleCurveCanvas
                    key={loader.id}
                    curveId={loader.id}
                    props={customProps}
                    name={loader.name}
                    equation={loader.eq}
                    desc={loader.desc}
                    onClick={() => {
                      setSelectedSubLoader(loader.id)
                      handlePropChange('exportCurve', loader.id)
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* STANDARD SPLIT CUSTOMIZER WORKSPACE */
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
              {/* Left Screen: Live Interactive Canvas */}
              <div className="space-y-4 min-w-0">
                <div className="relative flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-950/20 overflow-hidden shadow-2xl">
                  {/* Visual Canvas Info Header */}
                  <div className="flex items-center justify-between border-b border-zinc-900/80 bg-zinc-950/60 px-4 py-3">
                    <div className="flex items-center gap-2">
                      {activeItem.id === 'math-curve-pack' && (
                        <button
                          onClick={() => setSelectedSubLoader(null)}
                          className="flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors mr-2 border border-primary/20 bg-primary/5 rounded px-2 py-0.5 font-mono"
                        >
                          ← Gallery
                        </button>
                      )}
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs font-bold text-zinc-200 tracking-wide font-mono">Live Interactive Preview</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">scale: 100%</span>
                  </div>
                  
                  {/* Visual Workspace Canvas Frame */}
                  <div className="flex min-h-[300px] items-center justify-center p-12 bg-zinc-900/30 chequered-pattern relative overflow-hidden">
                    <LivePreviewRenderer item={activeItem} props={customProps} selectedSubLoader={selectedSubLoader} />
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
              <aside className="rounded-2xl border border-zinc-800 bg-zinc-950/65 p-5 shadow-xl space-y-6 min-w-0 overflow-hidden">
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
                  {activeItem.props.filter((p) => p.id !== 'exportCurve').map((p) => (
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

                      {p.type === 'color' && (
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-850/80 px-3 py-2 rounded-xl hover:border-zinc-800 transition-colors">
                            <div className="relative w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-rose-500 via-yellow-500 to-cyan-500 shadow-lg cursor-pointer group active:scale-95 transition-all">
                              <div className="w-full h-full rounded-full bg-zinc-950 p-[2px] flex items-center justify-center">
                                <div
                                  className="w-full h-full rounded-full shadow-inner relative overflow-hidden"
                                  style={{ backgroundColor: customProps[p.id] || p.default }}
                                >
                                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.25)_100%)] pointer-events-none" />
                                  <input
                                    type="color"
                                    value={customProps[p.id] || p.default}
                                    onChange={(e) => handlePropChange(p.id, e.target.value)}
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex-grow">
                              <input
                                type="text"
                                value={customProps[p.id] || p.default}
                                onChange={(e) => handlePropChange(p.id, e.target.value)}
                                className="bg-transparent border-0 p-0 text-xs font-mono font-bold text-zinc-200 focus:ring-0 w-24 uppercase"
                              />
                              <p className="text-[9px] text-zinc-500 font-medium">Click circle for custom color wheel</p>
                            </div>
                          </div>

                          {/* Preset Color Grid */}
                          <div className="flex flex-wrap gap-1.5 px-1 py-0.5">
                            {[
                              { label: 'Cyan', value: '#06b6d4' },
                              { label: 'Purple', value: '#8b5cf6' },
                              { label: 'Emerald', value: '#10b981' },
                              { label: 'Rose', value: '#f43f5e' },
                              { label: 'Amber', value: '#f59e0b' },
                              { label: 'Blue', value: '#3b82f6' },
                              { label: 'Pink', value: '#ec4899' },
                              { label: 'White', value: '#ffffff' }
                            ].map((preset) => {
                              const currColor = (customProps[p.id] || p.default).toLowerCase()
                              const isSelected = currColor === preset.value.toLowerCase()
                              return (
                                <button
                                  key={preset.value}
                                  type="button"
                                  onClick={() => handlePropChange(p.id, preset.value)}
                                  title={preset.label}
                                  className={cn(
                                    "w-6 h-6 rounded-full border transition-all relative flex items-center justify-center",
                                    isSelected 
                                      ? "border-zinc-200 scale-110 shadow-md shadow-black/40" 
                                      : "border-zinc-800 hover:border-zinc-550 hover:scale-105"
                                  )}
                                  style={{ backgroundColor: preset.value }}
                                >
                                  {isSelected && (
                                    <div className={cn(
                                      "w-1.5 h-1.5 rounded-full",
                                      preset.value === '#ffffff' ? "bg-black" : "bg-white"
                                    )} />
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
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
          )}
        </div>
      )}
    </div>
  )
}
export default MarketplaceView
