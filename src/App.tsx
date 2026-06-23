import { useEffect, useState } from 'react'
import {
  Sparkles,
  ArrowLeft,
  Grid,
  Wrench,
  Aperture
} from 'lucide-react'
import { MarketplaceView } from '@/components/marketplace/MarketplaceView'
import { ToolsHub } from '@/components/tools/ToolsHub'
import { GlyphStudioWrapper } from '@/components/tools/GlyphStudioWrapper'
import { GlassmorphismGenerator } from '@/components/tools/GlassmorphismGenerator'
import { GradientGenerator } from '@/components/tools/GradientGenerator'
import { LandingPage } from '@/components/LandingPage'
import { cn } from '@/lib/utils'

type Tab = 'marketplace' | 'tools'

export default function App() {
  const [showLanding, setShowLanding] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('marketplace')
  const [activeTool, setActiveTool] = useState<string | null>(null)

  // Force dark mode class globally on load for premium look
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  // Clear active tool when changing main tabs
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setActiveTool(null)
  }

  const handleEnterApp = () => {
    setShowLanding(false)
  }

  const renderActiveContent = () => {
    if (activeTab === 'marketplace') {
      return <MarketplaceView />
    }

    if (activeTab === 'tools') {
      if (activeTool === null) {
        return <ToolsHub onSelectTool={(id) => setActiveTool(id)} />
      }
      
      if (activeTool === 'glyph-studio') {
        return <GlyphStudioWrapper onBack={() => setActiveTool(null)} />
      }

      if (activeTool === 'glass-generator') {
        return (
          <div className="space-y-4">
            <button
              onClick={() => setActiveTool(null)}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 font-medium group transition-colors duration-200"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" /> Back to tools
            </button>
            <GlassmorphismGenerator />
          </div>
        )
      }

      if (activeTool === 'gradient-generator') {
        return (
          <div className="space-y-4">
            <button
              onClick={() => setActiveTool(null)}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 font-medium group transition-colors duration-200"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" /> Back to tools
            </button>
            <GradientGenerator />
          </div>
        )
      }
    }

    return null
  }

  // Adjust container padding based on active states (GlyphStudioWrapper manages its own inner margins & header)
  const isGlyphStudioActive = activeTab === 'tools' && activeTool === 'glyph-studio'

  // ── Landing page (full-screen, no nav) ────────────────────────────────────
  if (showLanding) {
    return (
      <div className="bg-zinc-950 text-zinc-100 font-sans antialiased overflow-x-hidden">
        <LandingPage onEnter={handleEnterApp} />
      </div>
    )
  }

  // ── Main app shell ────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-full flex-col bg-zinc-950 text-zinc-100 selection:bg-primary selection:text-primary-foreground font-sans antialiased overflow-x-hidden">
      
      {/* Visual background lights */}
      <div className="absolute top-0 left-1/4 h-[400px] w-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 h-[350px] w-[450px] rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />

      {/* Main Top Header Navbar (hidden if Glyph Studio is full screen) */}
      {!isGlyphStudioActive && (
        <header className="sticky top-0 z-40 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6">
            
            {/* Logo Group — click to go back to landing */}
            <button
              onClick={() => setShowLanding(true)}
              className="flex items-center gap-2 select-none hover:opacity-80 transition-opacity duration-200"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-violet-600 text-white shadow-lg shadow-primary/10">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="leading-tight text-left">
                <p className="text-sm font-black tracking-tight text-zinc-100">Glyph Studio</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Marketplace &amp; Suite</p>
              </div>
            </button>

            {/* Navigation Tabs */}
            <nav className="flex space-x-1 bg-zinc-900/60 p-0.5 rounded-xl border border-zinc-850">
              <button
                onClick={() => handleTabChange('marketplace')}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
                  activeTab === 'marketplace'
                    ? "bg-zinc-800 text-zinc-100 shadow-md"
                    : "text-zinc-450 hover:text-zinc-200"
                )}
              >
                <Grid className="h-3.5 w-3.5" /> Component Library
              </button>
              <button
                onClick={() => handleTabChange('tools')}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
                  activeTab === 'tools'
                    ? "bg-zinc-800 text-zinc-100 shadow-md"
                    : "text-zinc-450 hover:text-zinc-200"
                )}
              >
                <Wrench className="h-3.5 w-3.5" /> Designer Tools
              </button>
            </nav>

            {/* Right Action Info */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/suryansh2846code/glyph"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
              >
                <span className="text-xs font-semibold font-mono tracking-wider">GitHub →</span>
              </a>
            </div>

          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 min-w-0",
        isGlyphStudioActive ? "p-0" : "mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 relative z-10"
      )}>
        {renderActiveContent()}
      </main>

      {/* Standard Footer (hidden if Glyph Studio is active) */}
      {!isGlyphStudioActive && (
        <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-500">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Glyph Design Suite. Open-source customizers.</p>
            <p className="flex items-center gap-1.5">
              Powered by <Aperture className="h-3.5 w-3.5 text-primary animate-spin" style={{ animationDuration: '4s' }} /> WebGL and CSS.
            </p>
          </div>
        </footer>
      )}

    </div>
  )
}
