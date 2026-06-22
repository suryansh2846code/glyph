import { useState } from 'react'
import {
  Code,
  Copy,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Compass
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function GradientGenerator() {
  const [type, setType] = useState<'linear' | 'radial'>('linear')
  const [angle, setAngle] = useState<number>(135)
  
  // Stop colors
  const [color1, setColor1] = useState<string>('#a855f7') // Purple-500
  const [color2, setColor2] = useState<string>('#3b82f6') // Blue-500
  const [color3, setColor3] = useState<string>('#ec4899') // Pink-500
  const [useThirdStop, setUseThirdStop] = useState<boolean>(true)
  
  // Positions
  const [pos1, setPos1] = useState<number>(0)
  const [pos2, setPos2] = useState<number>(50)
  const [pos3, setPos3] = useState<number>(100)

  // Copy status
  const [codeTab, setCodeTab] = useState<'tailwind' | 'css'>('css')
  const [copied, setCopied] = useState(false)

  // Generate CSS Gradient string
  const getCssValue = () => {
    const stops = [
      `${color1} ${pos1}%`,
      `${color2} ${pos2}%`,
    ]
    if (useThirdStop) {
      stops.push(`${color3} ${pos3}%`)
    }
    
    if (type === 'linear') {
      return `linear-gradient(${angle}deg, ${stops.join(', ')})`
    } else {
      return `radial-gradient(circle at center, ${stops.join(', ')})`
    }
  }

  // Generate Tailwind estimation classes
  const getTailwindClasses = () => {
    // Map colors to nearest tailwind names
    const getTailwindColorName = (hex: string) => {
      // Very simple mapping for basic colors
      const lower = hex.toLowerCase()
      if (lower.startsWith('#a855')) return 'purple-500'
      if (lower.startsWith('#3b82')) return 'blue-500'
      if (lower.startsWith('#ec48')) return 'pink-500'
      if (lower.startsWith('#10b9')) return 'emerald-500'
      if (lower.startsWith('#f59e')) return 'amber-500'
      if (lower.startsWith('#f43f')) return 'rose-500'
      if (lower.startsWith('#06b6')) return 'cyan-500'
      
      // Fallback custom color mapping if they input custom hexes
      return `[${hex}]`
    }

    const c1Name = getTailwindColorName(color1)
    const c2Name = getTailwindColorName(color2)
    const c3Name = getTailwindColorName(color3)

    let dirClass = 'bg-gradient-to-br'
    if (type === 'linear') {
      if (angle >= 0 && angle < 45) dirClass = 'bg-gradient-to-t'
      else if (angle >= 45 && angle < 90) dirClass = 'bg-gradient-to-tr'
      else if (angle >= 90 && angle < 135) dirClass = 'bg-gradient-to-r'
      else if (angle >= 135 && angle < 180) dirClass = 'bg-gradient-to-br'
      else if (angle >= 180 && angle < 225) dirClass = 'bg-gradient-to-b'
      else if (angle >= 225 && angle < 270) dirClass = 'bg-gradient-to-bl'
      else if (angle >= 270 && angle < 315) dirClass = 'bg-gradient-to-l'
      else dirClass = 'bg-gradient-to-tl'
    } else {
      dirClass = 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]'
    }

    if (useThirdStop) {
      return `${dirClass} from-${c1Name} via-${c2Name} to-${c3Name}`
    } else {
      return `${dirClass} from-${c1Name} to-${c2Name}`
    }
  }

  const handleCopy = () => {
    const code = codeTab === 'css' 
      ? `background: ${getCssValue()};`
      : `<div className="w-full h-full ${getTailwindClasses()}" />`
    
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetAll = () => {
    setType('linear')
    setAngle(135)
    setColor1('#a855f7')
    setColor2('#3b82f6')
    setColor3('#ec4899')
    setUseThirdStop(true)
    setPos1(0)
    setPos2(50)
    setPos3(100)
  }

  // Presets list
  const presets = [
    { name: 'Peach Sparkle', c1: '#ff9a9e', c2: '#fecfef', c3: '#fecfef', use3: false },
    { name: 'Hyper Cyan', c1: '#00f2fe', c2: '#4facfe', c3: '#ec4899', use3: false },
    { name: 'Sunset Glow', c1: '#f857a6', c2: '#ff5858', c3: '#fec84e', use3: true },
    { name: 'Emerald Flow', c1: '#11998e', c2: '#38ef7d', c3: '#06b6d4', use3: false },
    { name: 'Royal Purple', c1: '#7f00ff', c2: '#e100ff', c3: '#ff007f', use3: true },
    { name: 'Cyberpunk Grid', c1: '#f3e500', c2: '#ff0055', c3: '#00f0ff', use3: true }
  ]

  const applyPreset = (p: typeof presets[0]) => {
    setColor1(p.c1)
    setColor2(p.c2)
    setColor3(p.c3)
    setUseThirdStop(p.use3)
    setPos1(0)
    setPos2(50)
    setPos3(100)
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" /> Gradient &amp; Mesh Flow Designer
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Design multi-stop linear and radial gradient backdrops. Export to pure CSS properties or Tailwind configs.
          </p>
        </div>
        <Button
          onClick={resetAll}
          variant="outline"
          size="sm"
          className="border-zinc-800 text-zinc-450 hover:bg-zinc-900 self-start"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Workspace Canvas (Left) */}
        <div className="space-y-4">
          <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs font-bold text-zinc-200 tracking-wide font-mono">Gradient Canvas Display</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">live build</span>
              </div>
            </div>

            {/* Canvas Rendering Frame */}
            <div
              style={{ background: getCssValue() }}
              className="flex min-h-[380px] items-center justify-center p-12 relative overflow-hidden transition-all duration-300"
            >
              {/* Glassmorphic title container overlaid on top */}
              <div className="bg-black/35 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center max-w-xs shadow-2xl select-none">
                <h3 className="text-xl font-black text-white tracking-tight">Vibrant Mesh Background</h3>
                <p className="text-xs text-white/80 mt-1.5 font-light leading-relaxed">
                  Adjust stop sliders to build high-end backgrounds for landing pages.
                </p>
              </div>
            </div>
          </div>

          {/* Export Code Frame */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <Code className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-zinc-300 font-mono">CSS Property / Tailwind Classes</span>
              </div>

              <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800">
                <button
                  onClick={() => setCodeTab('css')}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all duration-200",
                    codeTab === 'css' ? "bg-zinc-800 text-zinc-100 shadow" : "text-zinc-450 hover:text-zinc-350"
                  )}
                >
                  Standard CSS
                </button>
                <button
                  onClick={() => setCodeTab('tailwind')}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all duration-200",
                    codeTab === 'tailwind' ? "bg-zinc-800 text-zinc-100 shadow" : "text-zinc-450 hover:text-zinc-350"
                  )}
                >
                  Tailwind Class
                </button>
              </div>
            </div>

            <div className="relative font-mono text-xs bg-zinc-950 p-4 overflow-x-auto max-h-[140px] text-zinc-300">
              <pre className="text-[11px] leading-relaxed select-text pr-28">
                {codeTab === 'css' 
                  ? `background: ${getCssValue()};` 
                  : getTailwindClasses()}
              </pre>

              <button
                onClick={handleCopy}
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

        {/* Customization Inputs (Right Panel) */}
        <aside className="rounded-2xl border border-zinc-800 bg-zinc-950/65 p-5 shadow-xl space-y-5">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-zinc-200">Gradient Controls</h2>
          </div>

          <div className="space-y-4">
            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Quick Palette Presets</label>
              <div className="grid grid-cols-2 gap-1.5">
                {presets.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => applyPreset(p)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-zinc-850 bg-zinc-900/40 text-[10px] text-zinc-350 hover:text-white hover:bg-zinc-850 transition text-left"
                  >
                    <span className="h-3.5 w-3.5 rounded-full border border-white/10" style={{ background: `linear-gradient(135deg, ${p.c1}, ${p.c2})` }} />
                    <span className="truncate font-semibold">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gradient Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Style Form</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'linear', label: 'Linear Angle' },
                  { id: 'radial', label: 'Radial Centered' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setType(st.id as any)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all text-center",
                      type === st.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-zinc-850 bg-zinc-900/40 text-zinc-400 hover:text-zinc-250 hover:bg-zinc-850"
                    )}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Angle Input (if linear) */}
            {type === 'linear' && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-zinc-300">
                  <span>Linear Direction Angle</span>
                  <span className="font-mono text-zinc-500">{angle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            )}

            {/* Colors Pickers Stops */}
            <div className="border-t border-zinc-900 pt-3 space-y-4">
              <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">Gradient stops</div>
              
              {/* Stop 1 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full border border-white/10" style={{ backgroundColor: color1 }} />
                    Stop 1 Color
                  </span>
                  <input
                    type="color"
                    value={color1}
                    onChange={(e) => setColor1(e.target.value)}
                    className="h-6 w-8 rounded cursor-pointer border border-zinc-800 bg-transparent"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={pos1}
                  onChange={(e) => setPos1(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Stop 2 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full border border-white/10" style={{ backgroundColor: color2 }} />
                    Stop 2 Color
                  </span>
                  <input
                    type="color"
                    value={color2}
                    onChange={(e) => setColor2(e.target.value)}
                    className="h-6 w-8 rounded cursor-pointer border border-zinc-800 bg-transparent"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={pos2}
                  onChange={(e) => setPos2(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Stop 3 (Optional) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={useThirdStop}
                      onChange={(e) => setUseThirdStop(e.target.checked)}
                      id="chk-third"
                      className="h-4.5 w-4.5 rounded border-zinc-800 text-primary bg-zinc-900 focus:ring-primary/40 focus:ring-offset-zinc-950 cursor-pointer"
                    />
                    <label htmlFor="chk-third" className="text-xs font-semibold text-zinc-300 select-none cursor-pointer flex items-center gap-1.5">
                      {useThirdStop && <span className="h-3 w-3 rounded-full border border-white/10" style={{ backgroundColor: color3 }} />}
                      Enable Stop 3
                    </label>
                  </div>
                  {useThirdStop && (
                    <input
                      type="color"
                      value={color3}
                      onChange={(e) => setColor3(e.target.value)}
                      className="h-6 w-8 rounded cursor-pointer border border-zinc-800 bg-transparent animate-fade-in"
                    />
                  )}
                </div>
                {useThirdStop && (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={pos3}
                    onChange={(e) => setPos3(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary animate-fade-in"
                  />
                )}
              </div>
            </div>

          </div>
        </aside>
      </div>
    </div>
  )
}
export default GradientGenerator
