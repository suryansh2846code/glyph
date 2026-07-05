import { useState, useEffect, useRef } from 'react'
import { COMPONENT_REGISTRY } from './ComponentRegistry'
import type { ComponentItem } from './ComponentRegistry'
import GlobeView from '../GlobeView'
import LampLogin from './LampLogin'
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
    const colorIdx = ['White', 'Blue', 'Cyan', 'Green', 'Purple', 'Pink', 'Amber', 'Red'].indexOf(props.defaultColor ?? 'White');
    return (
      <GlobeView
        defaultColor={colorIdx >= 0 ? colorIdx : 0}
        defaultSpeed={props.defaultSpeed ?? 'Smooth'}
        defaultMode={props.defaultMode ?? 'spin'}
        showSettings={props.showSettings !== false}
        onSubmit={(val) => alert(`Submitted: ${val.e164}`)}
      />
    );
  }

  if (item.id === 'lamp-login') {
    return (
      <LampLogin
        lampColor={props.lampColor ?? 'amber'}
        title={props.title ?? 'Welcome Back'}
        buttonLabel={props.buttonLabel ?? 'Sign In'}
        showGoogle={props.showGoogle !== false}
        compact={!!props.isCompact}
      />
    )
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
