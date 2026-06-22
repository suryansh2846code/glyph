import React from 'react'
import {
  Aperture,
  Sparkles,
  Compass,
  ArrowRight,
  Palette,
  LayoutTemplate
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToolItem {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  tag: string
  accentColor: string
}

interface ToolsHubProps {
  onSelectTool: (toolId: string) => void
}

export function ToolsHub({ onSelectTool }: ToolsHubProps) {
  const tools: ToolItem[] = [
    {
      id: 'glyph-studio',
      name: 'Glyph Halftone Studio',
      description: 'Convert any image, GIF, or video into a fully customizable 2D or 3D halftone glyph mesh. Export to PNG, WebM, OBJ, or GLB.',
      icon: <Aperture className="h-6 w-6" />,
      tag: 'Halftone & 3D WebGL',
      accentColor: 'from-violet-500 to-indigo-500 shadow-violet-500/10 hover:border-violet-500/40'
    },
    {
      id: 'glass-generator',
      name: 'Glassmorphism CSS Architect',
      description: 'Design and customize translucent elements with real-time sliders for backdrop filter blur, background opacity, borders, and shadows.',
      icon: <Sparkles className="h-6 w-6" />,
      tag: 'Backdrop CSS FX',
      accentColor: 'from-cyan-500 to-blue-500 shadow-cyan-500/10 hover:border-cyan-500/40'
    },
    {
      id: 'gradient-generator',
      name: 'Gradient & Mesh Designer',
      description: 'Build smooth linear or radial gradients with multi-color stops. Adjust angles and positions, then grab Tailwind classes or standard CSS.',
      icon: <Compass className="h-6 w-6" />,
      tag: 'Visual Gradients',
      accentColor: 'from-pink-500 to-amber-500 shadow-pink-500/10 hover:border-pink-500/40'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" /> Visual Designer Tools
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Explore powerful visual design and asset manipulation tools. Generate production-ready assets and styling codes instantly.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className={cn(
              "group flex flex-col justify-between p-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/45 cursor-pointer hover:bg-zinc-950 hover:shadow-2xl transition-all duration-300",
              tool.accentColor.split(' ').slice(2).join(' ') // Hover border styling
            )}
          >
            <div className="space-y-4">
              {/* Icon Container with Gradient glow on Hover */}
              <div className={cn(
                "h-12 w-12 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-850 group-hover:scale-110 group-hover:text-white transition-all duration-300 bg-gradient-to-br text-zinc-350",
                "group-hover:" + tool.accentColor.split(' ').slice(0, 2).join(' group-hover:')
              )}>
                {tool.icon}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-wider uppercase font-bold text-zinc-500 group-hover:text-primary transition-colors duration-200">
                    {tool.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-zinc-100 group-hover:text-white transition-colors duration-250">
                  {tool.name}
                </h3>
                <p className="text-xs leading-relaxed text-zinc-450 font-light font-sans">
                  {tool.description}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-zinc-400 group-hover:text-primary transition-colors duration-250">
              <span>Open Tool Workspace</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-250" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Decorative guidelines bottom box */}
      <div className="rounded-xl border border-zinc-900 bg-zinc-950/20 p-4 flex gap-3 items-center">
        <LayoutTemplate className="h-5 w-5 text-zinc-500" />
        <p className="text-[11px] text-zinc-500 leading-normal font-medium">
          💡 Pro-tip: Assets generated inside our <strong>Halftone Studio</strong> can be coupled with our <strong>Glassmorphic Cards</strong> to build striking high-contrast mock designs. All codes update dynamically as you drag sliders!
        </p>
      </div>
    </div>
  )
}
export default ToolsHub
