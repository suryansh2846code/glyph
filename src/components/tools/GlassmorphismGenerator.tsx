import React, { useState } from 'react'
import {
  Sliders,
  Sparkles,
  Code,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function GlassmorphismGenerator() {
  // Styling settings
  const [blur, setBlur] = useState<number>(12)
  const [bgOpacity, setBgOpacity] = useState<number>(20) // 0-100
  const [bgColor, setBgColor] = useState<string>('ffffff') // Hex or class
  const [borderColor, setBorderColor] = useState<string>('ffffff')
  const [borderOpacity, setBorderOpacity] = useState<number>(10)
  const [borderWidth, setBorderWidth] = useState<number>(1)
  const [shadowOpacity, setShadowOpacity] = useState<number>(10)
  
  // Showcase card custom text
  const [titleText, setTitleText] = useState('Glassmorphic Card')
  const [bodyText, setBodyText] = useState('A sleek glass container with backdrop-blur, smooth drop shadows and borders.')
  
  // Code options
  const [codeTab, setCodeTab] = useState<'tailwind' | 'css'>('tailwind')
  const [copied, setCopied] = useState(false)
  const [bgPattern, setBgPattern] = useState<'spheres' | 'grid' | 'neon'>('spheres')

  // Convert Hex to RGBA
  const hexToRgba = (hex: string, alphaPercent: number) => {
    const cleanHex = hex.replace('#', '')
    const r = parseInt(cleanHex.substring(0, 2), 16) || 255
    const g = parseInt(cleanHex.substring(2, 4), 16) || 255
    const b = parseInt(cleanHex.substring(4, 6), 16) || 255
    return `rgba(${r}, ${g}, ${b}, ${alphaPercent / 100})`
  }

  const rgbaBg = hexToRgba(bgColor, bgOpacity)
  const rgbaBorder = hexToRgba(borderColor, borderOpacity)
  const rgbaShadow = `rgba(0, 0, 0, ${(shadowOpacity / 100).toFixed(2)})`

  const inlineStyles: React.CSSProperties = {
    background: rgbaBg,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: `${borderWidth}px solid ${rgbaBorder}`,
    boxShadow: `0 8px 32px 0 ${rgbaShadow}`,
    borderRadius: '16px',
  }

  // Generate codes
  const generateTailwind = () => {
    // Approx mapping to Tailwind values
    const twBlur = blur <= 4 ? 'backdrop-blur-sm' : blur <= 8 ? 'backdrop-blur' : blur <= 12 ? 'backdrop-blur-md' : blur <= 16 ? 'backdrop-blur-lg' : blur <= 24 ? 'backdrop-blur-xl' : 'backdrop-blur-2xl'
    const twBgColor = bgColor === 'ffffff' ? 'bg-white' : bgColor === '000000' ? 'bg-black' : 'bg-zinc-900'
    const twBorderColor = borderColor === 'ffffff' ? 'border-white' : 'border-zinc-800'
    
    // We construct a custom class representation as glassmorphism usually relies on inline opacity
    return `import React from 'react';

export default function GlassCard() {
  return (
    <div className="relative p-6 max-w-sm rounded-2xl border ${twBorderColor}/${borderOpacity} ${twBgColor}/${bgOpacity} ${twBlur} shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]">
      <h3 className="text-lg font-bold text-white mb-2">${titleText}</h3>
      <p className="text-sm text-zinc-300 font-light leading-relaxed">${bodyText}</p>
    </div>
  );
}`
  }

  const generateCss = () => {
    return `<!-- HTML Element -->
<div class="glass-container">
  <h3 class="glass-title">${titleText}</h3>
  <p class="glass-description">${bodyText}</p>
</div>

<!-- CSS Styling -->
<style>
.glass-container {
  background: ${rgbaBg};
  backdrop-filter: blur(${blur}px);
  -webkit-backdrop-filter: blur(${blur}px);
  border: ${borderWidth}px solid ${rgbaBorder};
  box-shadow: 0 8px 32px 0 ${rgbaShadow};
  border-radius: 16px;
  padding: 24px;
  max-width: 360px;
}

.glass-title {
  margin: 0 0 8px 0;
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  font-family: sans-serif;
}

.glass-description {
  margin: 0;
  color: #d4d4d8;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 300;
  font-family: sans-serif;
}
</style>`
  }

  const handleCopy = () => {
    const code = codeTab === 'tailwind' ? generateTailwind() : generateCss()
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetAll = () => {
    setBlur(12)
    setBgOpacity(20)
    setBgColor('ffffff')
    setBorderColor('ffffff')
    setBorderOpacity(10)
    setBorderWidth(1)
    setShadowOpacity(10)
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" /> Glassmorphism CSS Architect
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Build premium translucent glass components. Adjust blur, opacity, borders, and shadows in real-time.
          </p>
        </div>
        <Button
          onClick={resetAll}
          variant="outline"
          size="sm"
          className="border-zinc-800 text-zinc-450 hover:bg-zinc-900 self-start"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset Settings
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Workspace Canvas (Left) */}
        <div className="space-y-4">
          <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl flex flex-col">
            {/* Control Bar for background */}
            <div className="flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs font-bold text-zinc-200 tracking-wide font-mono">Backdrop Glass Workspace</span>
              </div>
              <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800">
                {(['spheres', 'grid', 'neon'] as const).map((pat) => (
                  <button
                    key={pat}
                    onClick={() => setBgPattern(pat)}
                    className={cn(
                      "px-2.5 py-1 text-[10px] font-bold rounded-md uppercase transition-all duration-200",
                      bgPattern === pat ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {pat}
                  </button>
                ))}
              </div>
            </div>

            {/* Rendering Canvas Frame */}
            <div className="flex min-h-[380px] items-center justify-center p-12 relative overflow-hidden bg-zinc-950">
              {/* Pattern overlays */}
              {bgPattern === 'spheres' && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute top-1/4 left-1/4 h-36 w-36 rounded-full bg-violet-600/40 blur-xl animate-pulse" />
                  <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-cyan-500/40 blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
                  <div className="absolute top-1/2 right-1/3 h-28 w-28 rounded-full bg-amber-500/30 blur-lg" />
                </div>
              )}

              {bgPattern === 'grid' && (
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
              )}

              {bgPattern === 'neon' && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]" />
              )}

              {/* The Glass Component itself */}
              <div style={inlineStyles} className="relative z-10 p-6 max-w-sm w-full transition-all duration-200">
                <h3 className="text-lg font-bold text-white mb-2 leading-tight">{titleText}</h3>
                <p className="text-sm text-zinc-200 font-light leading-relaxed">{bodyText}</p>
              </div>
            </div>
          </div>

          {/* Export Code Frame */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <Code className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-zinc-300 font-mono">Source CSS / Tailwind Code</span>
              </div>

              <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800">
                <button
                  onClick={() => setCodeTab('tailwind')}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all duration-200",
                    codeTab === 'tailwind' ? "bg-zinc-800 text-zinc-100 shadow" : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  React + Tailwind
                </button>
                <button
                  onClick={() => setCodeTab('css')}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all duration-200",
                    codeTab === 'css' ? "bg-zinc-800 text-zinc-100 shadow" : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  Pure CSS
                </button>
              </div>
            </div>

            <div className="relative font-mono text-xs bg-zinc-950 p-4 overflow-x-auto max-h-[300px] scrollbar-thin text-zinc-300">
              <pre className="text-[11px] leading-relaxed select-text">
                {codeTab === 'tailwind' ? generateTailwind() : generateCss()}
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
            <Sliders className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-zinc-200">Glass Architect Controls</h2>
          </div>

          <div className="space-y-4">
            {/* Backdrop Blur Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-zinc-300">
                <span>Backdrop Blur</span>
                <span className="font-mono text-zinc-500">{blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={blur}
                onChange={(e) => setBlur(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Background Color & Opacity */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-zinc-300">
                <span>BG Opacity</span>
                <span className="font-mono text-zinc-500">{bgOpacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={bgOpacity}
                onChange={(e) => setBgOpacity(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Glass Theme Surface</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { hex: 'ffffff', label: 'White Frost' },
                  { hex: '000000', label: 'Dark Void' },
                  { hex: '221144', label: 'Space Deep' }
                ].map((th) => (
                  <button
                    key={th.hex}
                    onClick={() => setBgColor(th.hex)}
                    className={cn(
                      "px-2 py-1.5 text-[10px] font-semibold rounded-lg border transition-all text-center",
                      bgColor === th.hex
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-zinc-850 bg-zinc-900/40 text-zinc-400 hover:text-zinc-250 hover:bg-zinc-850"
                    )}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Borders settings */}
            <div className="border-t border-zinc-900 pt-3 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-zinc-300">
                  <span>Border Opacity</span>
                  <span className="font-mono text-zinc-500">{borderOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={borderOpacity}
                  onChange={(e) => setBorderOpacity(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-zinc-300">
                  <span>Border Width</span>
                  <span className="font-mono text-zinc-500">{borderWidth}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.5"
                  value={borderWidth}
                  onChange={(e) => setBorderWidth(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            {/* Shadow Controls */}
            <div className="border-t border-zinc-900 pt-3 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-zinc-300">
                  <span>Shadow Opacity</span>
                  <span className="font-mono text-zinc-500">{shadowOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={shadowOpacity}
                  onChange={(e) => setShadowOpacity(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            {/* Custom Content fields */}
            <div className="border-t border-zinc-900 pt-3 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Card Header Text</label>
                <Input
                  type="text"
                  value={titleText}
                  onChange={(e) => setTitleText(e.target.value)}
                  className="bg-zinc-900 border-zinc-850 text-zinc-200 h-9 rounded-lg"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Card Body Content</label>
                <textarea
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 rounded-lg text-xs font-semibold text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary/45 focus:border-primary/45"
                />
              </div>
            </div>

          </div>
        </aside>
      </div>
    </div>
  )
}
export default GlassmorphismGenerator
