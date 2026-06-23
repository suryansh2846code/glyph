import { useEffect, useRef, useState } from 'react'
import { Sparkles, ArrowRight, Grid, Zap, Code2, Palette, GitBranch } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Mini animated canvas for background decoration ───────────────────────────
function FloatingCurveCanvas({
  curveId,
  delay = 0,
  opacity = 0.5
}: {
  curveId: string
  delay?: number
  opacity?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let t = delay
    const speed = 2.0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      ctx.scale(dpr, dpr)
    }
    resize()

    const getPoint = (theta: number, time: number) => {
      const breath = 1.0 + 0.12 * Math.sin(time * 0.04)
      let x = 0, y = 0
      switch (curveId) {
        case 'rose-five': {
          const r = Math.cos(5 * theta) * breath
          x = r * Math.cos(theta)
          y = r * Math.sin(theta)
          break
        }
        case 'four-petal': {
          x = (0.5 * Math.cos(theta) + 0.5 * Math.cos(3 * theta)) * breath
          y = (0.5 * Math.sin(theta) - 0.5 * Math.sin(3 * theta)) * breath
          break
        }
        case 'lissajous': {
          x = Math.sin(3 * theta + time * 0.025) * breath
          y = Math.sin(4 * theta) * breath
          break
        }
        case 'cardioid': {
          const r = 0.55 * (1 - Math.cos(theta))
          x = r * Math.sin(theta) * 1.35 * breath
          y = (-r * Math.cos(theta) + 0.2) * 1.35 * breath
          break
        }
        case 'butterfly': {
          const rv = Math.exp(Math.sin(theta)) - 2 * Math.cos(4 * theta) + Math.pow(Math.sin((2 * theta - Math.PI) / 24), 5)
          x = rv * Math.cos(theta) * 0.26 * breath
          y = rv * Math.sin(theta) * 0.26 * breath
          break
        }
        case 'log-spiral': {
          const headT = time * 0.02 * speed
          const relTheta = theta - headT
          const r = Math.exp(0.18 * relTheta) * 0.75 * breath
          x = r * Math.cos(theta)
          y = r * Math.sin(theta)
          break
        }
        case 'lemniscate': {
          const denom = 1 + Math.sin(theta) * Math.sin(theta)
          const lx = (Math.cos(theta) / denom) * 1.2
          const ly = (Math.sin(theta) * Math.cos(theta) / denom) * 1.2
          const rot = time * 0.005
          x = (lx * Math.cos(rot) - ly * Math.sin(rot)) * breath
          y = (lx * Math.sin(rot) + ly * Math.cos(rot)) * breath
          break
        }
        case 'deltoid': {
          x = (0.6 * Math.cos(theta) + 0.3 * Math.cos(2 * theta)) * breath
          y = (0.6 * Math.sin(theta) - 0.3 * Math.sin(2 * theta)) * breath
          break
        }
        default: {
          const r = (0.6 + 0.3 * Math.cos(7 * theta)) * breath
          x = r * Math.cos(theta + time * 0.012)
          y = r * Math.sin(theta + time * 0.012)
        }
      }
      return { x: x * 38, y: y * 38 }
    }

    const draw = () => {
      const w = canvas.width / (window.devicePixelRatio || 1)
      const h = canvas.height / (window.devicePixelRatio || 1)
      ctx.clearRect(0, 0, w, h)

      const cx = w / 2
      const cy = h / 2
      const headTheta = t * 0.02 * speed
      const trailRad = 0.9 * Math.PI

      for (let i = 1; i <= 35; i++) {
        const ratio = i / 35
        const theta = headTheta - trailRad * (1 - ratio)
        const pt = getPoint(theta, t)
        const mod = 0.4 + 0.6 * Math.sin(theta * 6)
        const rad = 1.8 * ratio * Math.abs(mod)

        ctx.fillStyle = `rgba(255,255,255,${ratio * 0.85})`
        ctx.beginPath()
        ctx.arc(cx + pt.x, cy + pt.y, Math.max(0.5, rad), 0, Math.PI * 2)
        ctx.fill()
      }

      t += 1
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animId)
  }, [curveId, delay, opacity])

  return <canvas ref={canvasRef} className="w-full h-full block" style={{ opacity }} />
}

// ─── Stats counter ────────────────────────────────────────────────────────────
function StatItem({ value, label, delay }: { value: string; label: string; delay: number }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <div className={cn('text-center transition-all duration-700', show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')}>
      <div className="text-4xl font-black text-zinc-100 tracking-tight">{value}</div>
      <div className="text-[11px] text-zinc-500 font-semibold uppercase tracking-widest mt-1">{label}</div>
    </div>
  )
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export interface LandingPageProps {
  onEnter: () => void
}

const BG_CURVES = [
  { id: 'rose-five',   delay: 0,    opacity: 0.45 },
  { id: 'lissajous',  delay: 300,  opacity: 0.40 },
  { id: 'four-petal', delay: 600,  opacity: 0.42 },
  { id: 'butterfly',  delay: 900,  opacity: 0.38 },
  { id: 'cardioid',   delay: 1200, opacity: 0.44 },
  { id: 'lemniscate', delay: 1500, opacity: 0.40 },
  { id: 'log-spiral', delay: 200,  opacity: 0.38 },
  { id: 'deltoid',    delay: 800,  opacity: 0.42 },
  { id: 'rose-five',  delay: 400,  opacity: 0.36 },
]

export function LandingPage({ onEnter }: LandingPageProps) {
  const [hero, setHero] = useState(false)
  const [sub, setSub] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setHero(true), 80)
    const t2 = setTimeout(() => setSub(true), 350)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-zinc-950 select-none">

      {/* ── Ambient gradient blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[20%] h-[600px] w-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[15%] h-[500px] w-[500px] rounded-full bg-violet-600/6 blur-[100px]" />
        <div className="absolute top-[40%] left-[-5%] h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-[90px]" />
      </div>

      {/* ── Animated math curve grid background ── */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
        {BG_CURVES.map((c, i) => (
          <div key={i} className="relative overflow-hidden flex items-center justify-center bg-black/10">
            <div className="absolute inset-0 border border-white/[0.025]" />
            <div className="w-[110px] h-[110px]">
              <FloatingCurveCanvas curveId={c.id} delay={c.delay} opacity={c.opacity} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Dark vignette overlay to pull focus to center ── */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,transparent_20%,rgba(9,9,11,0.92)_100%)]" />

      {/* ── Top edge accent line ── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* ── Main hero content ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto w-full">

        {/* Badge */}
        <div className={cn(
          'inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-[11px] font-bold tracking-widest uppercase mb-8 transition-all duration-600',
          hero ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        )}>
          <Sparkles className="h-3 w-3" />
          Open-source design system
        </div>

        {/* Title */}
        <h1 className={cn(
          'text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6 transition-all duration-700 delay-75',
          hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        )}>
          <span className="text-zinc-100">Glyph</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-300">
            Studio
          </span>
        </h1>

        {/* Subtitle */}
        <p className={cn(
          'text-lg sm:text-xl text-zinc-400 max-w-2xl font-light leading-relaxed mb-10 transition-all duration-700 delay-100',
          sub ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}>
          A premium component marketplace with{' '}
          <span className="text-zinc-200 font-medium">28 mathematical curve loaders</span>,
          glassmorphism cards, glow buttons, and more —
          fully customizable with live preview and instant code export.
        </p>

        {/* Stats row */}
        <div className={cn(
          'flex flex-wrap justify-center gap-10 mb-12 transition-all duration-700 delay-150',
          sub ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}>
          <StatItem value="28" label="Math Loaders" delay={450} />
          <div className="w-px bg-zinc-800/60 self-stretch hidden sm:block" />
          <StatItem value="4" label="Render Styles" delay={550} />
          <div className="w-px bg-zinc-800/60 self-stretch hidden sm:block" />
          <StatItem value="∞" label="Color Combos" delay={650} />
          <div className="w-px bg-zinc-800/60 self-stretch hidden sm:block" />
          <StatItem value="0" label="Dependencies" delay={750} />
        </div>

        {/* CTA Buttons */}
        <div className={cn(
          'flex flex-col sm:flex-row items-center gap-4 mb-16 transition-all duration-700 delay-200',
          sub ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}>
          <button
            onClick={onEnter}
            className="group relative inline-flex items-center gap-3 px-8 py-4 text-sm font-bold rounded-2xl bg-primary hover:bg-primary/90 text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/25 active:scale-95"
          >
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary to-orange-400 opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300" />
            <span className="relative">Explore Component Library</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200 relative" />
          </button>

          <a
            href="https://github.com/suryansh2846code/glyph"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2.5 px-6 py-4 text-sm font-semibold rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 transition-all duration-200"
          >
            <GitBranch className="h-4 w-4" />
            View on GitHub
          </a>
        </div>
      </div>

      {/* ── Feature pill strip ── */}
      <div className={cn(
        'absolute bottom-10 left-0 right-0 flex justify-center gap-3 flex-wrap px-6 transition-all duration-700 delay-300',
        sub ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      )}>
        {[
          { Icon: Grid,    label: 'Browse & Filter' },
          { Icon: Palette, label: 'Live Customizer' },
          { Icon: Code2,   label: 'Copy Code' },
          { Icon: Zap,     label: 'Canvas Powered' },
        ].map(({ Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/70 backdrop-blur-sm border border-zinc-800/70 text-zinc-400 text-[11px] font-medium"
          >
            <Icon className="h-3 w-3 text-primary" />
            {label}
          </div>
        ))}
      </div>

      {/* ── Bottom edge accent line ── */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-700/40 to-transparent" />
    </div>
  )
}

export default LandingPage
