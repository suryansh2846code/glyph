export interface ComponentProp {
  id: string
  name: string
  type: 'select' | 'text' | 'number' | 'boolean' | 'color'
  default: any
  options?: string[]
  min?: number
  max?: number
  step?: number
}

export interface ComponentItem {
  id: string
  name: string
  description: string
  category: 'buttons' | 'cards' | 'inputs' | 'feedback'
  props: ComponentProp[]
  generateCode: (props: Record<string, any>) => {
    tailwind: string
    css: string
  }
}

export const COMPONENT_REGISTRY: ComponentItem[] = [
  {
    id: 'gradient-glow-btn',
    name: 'Gradient Glow Button',
    description: 'A button with a fluid moving gradient background glow and sleek glass-like interactive core.',
    category: 'buttons',
    props: [
      { id: 'text', name: 'Button Text', type: 'text', default: 'Deploy changes' },
      { id: 'colorTheme', name: 'Glow Theme', type: 'select', default: 'purple-indigo', options: ['purple-indigo', 'cyan-blue', 'emerald-teal', 'rose-amber'] },
      { id: 'rounded', name: 'Roundedness', type: 'select', default: 'xl', options: ['md', 'lg', 'xl', 'full'] },
      { id: 'size', name: 'Button Size', type: 'select', default: 'medium', options: ['small', 'medium', 'large'] },
    ],
    generateCode: (props) => {
      const { text, colorTheme, rounded, size } = props
      
      let themeClasses = 'from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-500/20'
      let gradientColors = '#8b5cf6, #4f46e5'
      if (colorTheme === 'cyan-blue') {
        themeClasses = 'from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/20'
        gradientColors = '#06b6d4, #2563eb'
      } else if (colorTheme === 'emerald-teal') {
        themeClasses = 'from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/20'
        gradientColors = '#10b981, #0d9488'
      } else if (colorTheme === 'rose-amber') {
        themeClasses = 'from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 shadow-rose-500/20'
        gradientColors = '#f43f5e, #f59e0b'
      }

      let sizeClasses = 'px-5 py-2.5 text-sm font-medium'
      let padding = '10px 20px'
      let fontSize = '14px'
      if (size === 'small') {
        sizeClasses = 'px-4 py-2 text-xs font-medium'
        padding = '8px 16px'
        fontSize = '12px'
      } else if (size === 'large') {
        sizeClasses = 'px-7 py-3.5 text-base font-semibold'
        padding = '14px 28px'
        fontSize = '16px'
      }

      const twRounded = `rounded-${rounded}`
      let cssRounded = '12px'
      if (rounded === 'md') cssRounded = '6px'
      else if (rounded === 'lg') cssRounded = '8px'
      else if (rounded === 'full') cssRounded = '9999px'

      return {
        tailwind: `import React from 'react';

export default function ButtonGlow() {
  return (
    <div className="relative group">
      {/* Outer blurred glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r ${themeClasses.split(' ').slice(0,2).join(' ')} rounded-${rounded} blur-md opacity-75 group-hover:opacity-100 transition duration-300 group-hover:duration-200" />
      
      {/* Active button surface */}
      <button className="relative ${sizeClasses} ${twRounded} bg-zinc-950 border border-zinc-800 text-zinc-100 hover:text-white transition duration-200 active:scale-[0.98]">
        <span className="flex items-center gap-2">
          {text}
          <span className="text-zinc-500 group-hover:translate-x-0.5 transition-transform duration-200">→</span>
        </span>
      </button>
    </div>
  );
}`,
        css: `<!-- HTML Structure -->
<div class="glow-btn-container">
  <div class="btn-glow-shadow"></div>
  <button class="glow-btn">
    ${text} <span class="arrow">→</span>
  </button>
</div>

<!-- CSS Styling -->
<style>
.glow-btn-container {
  position: relative;
  display: inline-block;
}

.btn-glow-shadow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(90deg, ${gradientColors});
  border-radius: ${cssRounded};
  filter: blur(8px);
  opacity: 0.75;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.glow-btn-container:hover .btn-glow-shadow {
  opacity: 1.0;
}

.glow-btn {
  position: relative;
  z-index: 2;
  padding: ${padding};
  font-size: ${fontSize};
  font-family: inherit;
  font-weight: 500;
  color: #f4f4f5;
  background-color: #09090b;
  border: 1px solid #27272a;
  border-radius: ${cssRounded};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.2s ease, transform 0.1s ease;
}

.glow-btn:hover {
  color: #ffffff;
}

.glow-btn:active {
  transform: scale(0.98);
}

.arrow {
  color: #71717a;
  transition: transform 0.2s ease;
}

.glow-btn-container:hover .arrow {
  transform: translateX(2px);
}
</style>`
      }
    }
  },
  {
    id: 'cyberpunk-btn',
    name: 'Cyberpunk Command Button',
    description: 'A blocky glitch-inspired buttons style with clip-path cuts, bright neon colors, and scanline hover overlay.',
    category: 'buttons',
    props: [
      { id: 'text', name: 'Button Text', type: 'text', default: 'INITIALIZE CORE' },
      { id: 'neonColor', name: 'Neon Glow', type: 'select', default: 'cyan', options: ['cyan', 'yellow', 'magenta', 'green'] },
      { id: 'glitch', name: 'Include Glitch Dot', type: 'boolean', default: true },
    ],
    generateCode: (props) => {
      const { text, neonColor, glitch } = props
      
      let neonHex = '#00f0ff'
      let textHex = '#09090b'
      let borderStyle = 'border-cyan-400 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:shadow-cyan-500/50'
      if (neonColor === 'yellow') {
        neonHex = '#f3e500'
        borderStyle = 'border-yellow-400 text-yellow-400 hover:bg-yellow-500 hover:text-black hover:shadow-yellow-500/50'
      } else if (neonColor === 'magenta') {
        neonHex = '#ff0055'
        borderStyle = 'border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white hover:shadow-rose-500/50'
        textHex = '#ffffff'
      } else if (neonColor === 'green') {
        neonHex = '#39ff14'
        borderStyle = 'border-green-400 text-green-400 hover:bg-green-400 hover:text-black hover:shadow-green-500/50'
      }

      return {
        tailwind: `import React from 'react';

export default function CyberButton() {
  return (
    <button className="relative px-6 py-3 font-mono font-bold tracking-widest text-sm uppercase bg-black border ${borderStyle.split(' ').slice(0, 2).join(' ')} shadow-[0_0_15px_rgba(0,0,0,0.4)] ${borderStyle.split(' ').slice(2).join(' ')} transition-all duration-200 overflow-hidden clip-cyber active:scale-95 group">
      {/* Glitch slash slice */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      
      <span className="flex items-center justify-center gap-3">
        ${glitch ? `<span className="h-2 w-2 rounded-none bg-current animate-ping" />` : ''}
        {text}
      </span>
    </button>
  );
}`,
        css: `<!-- HTML Structure -->
<button class="cyber-btn ${neonColor}">
  ${glitch ? '<span class="status-box"></span>' : ''}
  <span class="btn-text">${text}</span>
</button>

<!-- CSS Styling -->
<style>
.cyber-btn {
  position: relative;
  padding: 12px 24px;
  background-color: #000000;
  border: 1px solid ${neonHex};
  color: ${neonHex};
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
  font-size: 14px;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.cyber-btn:hover {
  background-color: ${neonHex};
  color: ${textHex};
  box-shadow: 0 0 20px ${neonHex}80;
}

.cyber-btn:active {
  transform: scale(0.96);
}

.status-box {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: currentColor;
  animation: pulse-glow 1.5s infinite;
}

@keyframes pulse-glow {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}
</style>`
      }
    }
  },
  {
    id: 'glass-tilt-card',
    name: 'Glassmorphic Hover Card',
    description: 'A frosted glass container with a subtle glowing border and a multi-layer drop shadow that expands on hover.',
    category: 'cards',
    props: [
      { id: 'title', name: 'Card Title', type: 'text', default: 'Advanced Analytics' },
      { id: 'body', name: 'Card Content', type: 'text', default: 'Track processing latency, user sessions and live stream conversions in real-time.' },
      { id: 'blur', name: 'Blur Level', type: 'select', default: 'md', options: ['sm', 'md', 'lg', 'xl'] },
      { id: 'glowColor', name: 'Border Accent', type: 'select', default: 'indigo', options: ['indigo', 'emerald', 'amber', 'rose'] },
    ],
    generateCode: (props) => {
      const { title, body, blur, glowColor } = props
      
      let blurVal = '12px'
      let twBlur = 'backdrop-blur-md'
      if (blur === 'sm') { blurVal = '6px'; twBlur = 'backdrop-blur-sm'; }
      else if (blur === 'lg') { blurVal = '20px'; twBlur = 'backdrop-blur-lg'; }
      else if (blur === 'xl') { blurVal = '40px'; twBlur = 'backdrop-blur-xl'; }

      let accentClass = 'group-hover:border-indigo-500/40 shadow-indigo-500/5'
      let accentHex = '#6366f1'
      if (glowColor === 'emerald') {
        accentClass = 'group-hover:border-emerald-500/40 shadow-emerald-500/5'
        accentHex = '#10b981'
      } else if (glowColor === 'amber') {
        accentClass = 'group-hover:border-amber-500/40 shadow-amber-500/5'
        accentHex = '#f59e0b'
      } else if (glowColor === 'rose') {
        accentClass = 'group-hover:border-rose-500/40 shadow-rose-500/5'
        accentHex = '#f43f5e'
      }

      return {
        tailwind: `import React from 'react';

export default function GlassCard() {
  return (
    <div className="relative group max-w-sm">
      {/* Background radial soft light */}
      <div className="absolute -inset-2 bg-gradient-radial from-${glowColor}-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative border border-white/5 bg-zinc-900/40 ${twBlur} p-6 rounded-2xl transition-all duration-300 ${accentClass} hover:shadow-2xl hover:-translate-y-1">
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 mb-4 group-hover:scale-110 transition-all duration-300">
          <svg className="h-5 w-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-zinc-100 mb-1 group-hover:text-white transition-colors duration-200">${title}</h3>
        <p className="text-sm leading-relaxed text-zinc-400 font-light">${body}</p>
      </div>
    </div>
  );
}`,
        css: `<!-- HTML Structure -->
<div class="glass-card-wrapper">
  <div class="radial-glow"></div>
  <div class="glass-card">
    <div class="card-icon">
      <svg class="icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
    <h3 class="card-title">${title}</h3>
    <p class="card-body">${body}</p>
  </div>
</div>

<!-- CSS Styling -->
<style>
.glass-card-wrapper {
  position: relative;
  max-width: 320px;
  width: 100%;
}

.radial-glow {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  background: radial-gradient(circle, ${accentHex}1a 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
  z-index: 1;
}

.glass-card-wrapper:hover .radial-glow {
  opacity: 1;
}

.glass-card {
  position: relative;
  z-index: 2;
  background: rgba(24, 24, 27, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(${blurVal});
  -webkit-backdrop-filter: blur(${blurVal});
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
}

.glass-card-wrapper:hover .glass-card {
  border-color: ${accentHex}66;
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px ${accentHex}10;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  transition: transform 0.3s ease;
}

.glass-card-wrapper:hover .card-icon {
  transform: scale(1.1);
}

.icon-svg {
  width: 20px;
  height: 20px;
  color: #d4d4d8;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #f4f4f5;
  margin: 0 0 6px 0;
}

.glass-card-wrapper:hover .card-title {
  color: #ffffff;
}

.card-body {
  font-size: 14px;
  color: #a1a1aa;
  line-height: 1.5;
  margin: 0;
  font-weight: 300;
}
</style>`
      }
    }
  },
  {
    id: 'pulse-badge',
    name: 'Interactive Status Badge',
    description: 'A micro-badge containing a glowing status indicator dot, useful for representing servers, nodes, or build processes.',
    category: 'feedback',
    props: [
      { id: 'label', name: 'Badge Label', type: 'text', default: 'Live Node' },
      { id: 'status', name: 'Status Color', type: 'select', default: 'emerald', options: ['emerald', 'amber', 'rose', 'sky'] },
      { id: 'showPings', name: 'Pulse Ring', type: 'boolean', default: true },
    ],
    generateCode: (props) => {
      const { label, status, showPings } = props
      
      let colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      let dotColor = 'bg-emerald-400'
      let colorHex = '#10b981'
      if (status === 'amber') {
        colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        dotColor = 'bg-amber-400'
        colorHex = '#f59e0b'
      } else if (status === 'rose') {
        colorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        dotColor = 'bg-rose-400'
        colorHex = '#f43f5e'
      } else if (status === 'sky') {
        colorClass = 'bg-sky-500/10 text-sky-400 border-sky-500/20'
        dotColor = 'bg-sky-400'
        colorHex = '#0ea5e9'
      }

      return {
        tailwind: `import React from 'react';

export default function StatusBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium border rounded-full ${colorClass}">
      <span className="relative flex h-2 w-2">
        ${showPings ? `<span className="animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75"></span>` : ''}
        <span className="relative inline-flex rounded-full h-2 w-2 ${dotColor}"></span>
      </span>
      {label}
    </div>
  );
}`,
        css: `<!-- HTML Structure -->
<div class="status-badge ${status}">
  <span class="dot-wrapper">
    ${showPings ? '<span class="ping-ring"></span>' : ''}
    <span class="core-dot"></span>
  </span>
  <span class="badge-text">${label}</span>
</div>

<!-- CSS Styling -->
<style>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  font-family: system-ui, -apple-system, sans-serif;
  background-color: ${colorHex}15;
  color: ${colorHex};
  border: 1px solid ${colorHex}30;
}

.dot-wrapper {
  position: relative;
  display: flex;
  width: 8px;
  height: 8px;
}

.core-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${colorHex};
}

.ping-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: ${colorHex};
  opacity: 0.75;
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2.5);
    opacity: 0;
  }
}
</style>`
      }
    }
  },
  {
    id: 'glow-slider',
    name: 'Glow Slider Control',
    description: 'An interactive modern slide bar featuring glowing paths and responsive drag thumbs.',
    category: 'inputs',
    props: [
      { id: 'minVal', name: 'Minimum Range', type: 'number', default: 0 },
      { id: 'maxVal', name: 'Maximum Range', type: 'number', default: 100 },
      { id: 'glowStyle', name: 'Glow Hue', type: 'select', default: 'cyan', options: ['cyan', 'purple', 'emerald', 'rose'] },
    ],
    generateCode: (props) => {
      const { minVal, maxVal, glowStyle } = props
      
      let activeColor = 'accent-cyan-400 shadow-cyan-400/50'
      let activeHex = '#22d3ee'
      if (glowStyle === 'purple') {
        activeColor = 'accent-violet-500 shadow-violet-500/50'
        activeHex = '#8b5cf6'
      } else if (glowStyle === 'emerald') {
        activeColor = 'accent-emerald-400 shadow-emerald-400/50'
        activeHex = '#34d399'
      } else if (glowStyle === 'rose') {
        activeColor = 'accent-rose-500 shadow-rose-500/50'
        activeHex = '#f43f5e'
      }

      return {
        tailwind: `import React, { useState } from 'react';

export default function GlowSlider() {
  const [val, setVal] = useState(50);
  
  return (
    <div className="w-full max-w-sm space-y-2">
      <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
        <span>Range</span>
        <span className="text-${glowStyle}-400 font-bold">{val}%</span>
      </div>
      
      <div className="relative group py-2">
        {/* Glow behind the track */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-${glowStyle}-500/20 blur-[3px] rounded-lg pointer-events-none" />
        
        <input 
          type="range"
          min="${minVal}"
          max="${maxVal}"
          value={val}
          onChange={(e) => setVal(Number(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer outline-none ${activeColor} transition-all duration-200"
        />
      </div>
    </div>
  );
}`,
        css: `<!-- HTML Structure -->
<div class="slider-box">
  <div class="slider-header">
    <span class="label">Range</span>
    <span class="value" id="val-display">50%</span>
  </div>
  <div class="slider-track-wrap">
    <div class="slider-glow-layer"></div>
    <input type="range" min="${minVal}" max="${maxVal}" value="50" class="neon-slider" id="neon-slider">
  </div>
</div>

<!-- CSS Styling & Script -->
<style>
.slider-box {
  width: 100%;
  max-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: monospace;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #a1a1aa;
}

.value {
  color: ${activeHex};
  font-weight: bold;
}

.slider-track-wrap {
  position: relative;
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.slider-glow-layer {
  position: absolute;
  left: 0;
  right: 0;
  height: 4px;
  background: ${activeHex}30;
  filter: blur(4px);
  border-radius: 4px;
  pointer-events: none;
}

.neon-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 4px;
  background: #27272a;
  outline: none;
  cursor: pointer;
}

/* Thumb details */
.neon-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid ${activeHex};
  box-shadow: 0 0 10px ${activeHex};
  transition: transform 0.1s ease;
}

.neon-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}
</style>
<script>
  const slider = document.getElementById('neon-slider');
  const display = document.getElementById('val-display');
  if (slider && display) {
    slider.addEventListener('input', (e) => {
      display.textContent = e.target.value + '%';
    });
  }
</script>`
      }
    }
  },
  {
    id: 'cyber-skeleton',
    name: 'Cyberpunk Load Shimmer',
    description: 'An elegant placeholder layout simulating skeleton loaders with custom high-contrast shimmer gradient scans.',
    category: 'feedback',
    props: [
      { id: 'lines', name: 'Number of Rows', type: 'number', default: 3, min: 1, max: 5 },
      { id: 'speed', name: 'Sweep Speed', type: 'select', default: 'normal', options: ['fast', 'normal', 'slow'] },
    ],
    generateCode: (props) => {
      const { lines, speed } = props
      
      let animSecs = '1.8s'
      if (speed === 'fast') { animSecs = '1s'; }
      else if (speed === 'slow') { animSecs = '3s'; }

      const itemsArr = Array.from({ length: Number(lines) }).map((_, i) => {
        const widths = ['w-full', 'w-[85%]', 'w-[90%]', 'w-[75%]', 'w-[80%]']
        return widths[i % widths.length]
      })

      const twRows = itemsArr.map(w => `<div className="h-3.5 bg-zinc-800 rounded-md ${w} relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_${animSecs}_infinite] -translate-x-full" />
      </div>`).join('\n        ')

      const htmlRows = itemsArr.map(w => `<div class="skel-row" style="width: ${w.replace('w-[', '').replace('%]', '%').replace('w-full', '100%')}">
    <div class="shimmer-glare"></div>
  </div>`).join('\n  ')

      return {
        tailwind: `import React from 'react';

// Make sure to add this animation inside your tailwind.config.js:
// keyframes: {
//   shimmer: {
//     '100%': { transform: 'translateX(100%)' }
//   }
// }

export default function CyberSkeleton() {
  return (
    <div className="w-full max-w-sm border border-zinc-800 bg-zinc-950 p-5 rounded-xl space-y-4">
      {/* Header mock */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-zinc-800 rounded-lg relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_${animSecs}_infinite] -translate-x-full" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="h-4 bg-zinc-800 rounded-md w-[60%] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_${animSecs}_infinite] -translate-x-full" />
          </div>
          <div className="h-3 bg-zinc-800 rounded-md w-[40%] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_${animSecs}_infinite] -translate-x-full" />
          </div>
        </div>
      </div>
      
      {/* Dynamic rows */}
      <div className="space-y-2.5 pt-2">
        ${twRows}
      </div>
    </div>
  );
}`,
        css: `<!-- HTML Structure -->
<div class="skeleton-panel">
  <div class="skel-header">
    <div class="skel-avatar"><div class="shimmer-glare"></div></div>
    <div class="skel-text-headers">
      <div class="skel-title-row"><div class="shimmer-glare"></div></div>
      <div class="skel-subtitle-row"><div class="shimmer-glare"></div></div>
    </div>
  </div>
  <div class="skel-body">
    ${htmlRows}
  </div>
</div>

<!-- CSS Styling -->
<style>
.skeleton-panel {
  width: 100%;
  max-width: 320px;
  background-color: #09090b;
  border: 1px solid #27272a;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
}

.skel-header {
  display: flex;
  gap: 12px;
  align-items: center;
}

.skel-avatar {
  position: relative;
  width: 40px;
  height: 40px;
  background-color: #1e1e24;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.skel-text-headers {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-grow: 1;
}

.skel-title-row {
  position: relative;
  height: 16px;
  width: 60%;
  background-color: #1e1e24;
  border-radius: 4px;
  overflow: hidden;
}

.skel-subtitle-row {
  position: relative;
  height: 12px;
  width: 40%;
  background-color: #1e1e24;
  border-radius: 4px;
  overflow: hidden;
}

.skel-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skel-row {
  position: relative;
  height: 14px;
  background-color: #1e1e24;
  border-radius: 4px;
  overflow: hidden;
}

/* Sweeping light glare */
.shimmer-glare {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
  transform: translateX(-100%);
  animation: sweep ${animSecs} infinite linear;
}

@keyframes sweep {
  100% {
    transform: translateX(100%);
  }
}
</style>`
      }
    }
  },
  {
    id: 'math-curve-pack',
    name: 'Mathematical Curve Loader Pack',
    description: 'A showcase of 28 organic, high-performance mathematical loaders (spirals, rose curves, lissajous, cardioids, hearts, butterfly, Fourier flows, deltoids, astroids, and superformula stars) animating in a unified grid.',
    category: 'feedback',
    props: [
      { id: 'renderStyle', name: 'Render Styling', type: 'select', default: 'halftone', options: ['glow', 'dotted', 'halftone', 'minimalist'] },
      { id: 'lineColor', name: 'Primary Line Color', type: 'color', default: '#ffffff' },
      { id: 'glowColor', name: 'Glow Accent Color', type: 'color', default: '#ffffff' },
      { id: 'exportCurve', name: 'Select Loader to Export', type: 'select', default: 'rose-curve', options: ['four-petal-spiral', 'five-petal-spiral', 'six-petal-spiral', 'butterfly-phase', 'cardioid-glow', 'cardioid-heart', 'heart-wave', 'spiral-search', 'lissajous-drift', 'lemniscate-bloom', 'rose-curve', 'fourier-flow', 'superformula-star', 'maurer-rose', 'deltoid-loop', 'cochleoid-shell', 'original-thinking', 'thinking-five', 'thinking-nine', 'rose-two', 'rose-four', 'spirograph', 'spiral', 'astroid-wave', 'fermat-spiral', 'folium-wave', 'lituus-coil', 'logarithmic-spiral'] },
      { id: 'speed', name: 'Trace Speed multiplier', type: 'number', default: 2.0, min: 0.5, max: 5.0, step: 0.1 },
      { id: 'breath', name: 'Pulse breathing size (%)', type: 'number', default: 15, min: 0, max: 40, step: 1 },
      { id: 'trailLength', name: 'Trail Length (%)', type: 'number', default: 80, min: 20, max: 200, step: 5 },
      { id: 'strokeWidth', name: 'Core Line Width', type: 'number', default: 2.5, min: 1.0, max: 5.0, step: 0.5 },
      { id: 'glowSize', name: 'Neon Glow Size', type: 'number', default: 12, min: 0, max: 25, step: 1 }
    ],
    generateCode: (props) => {
      const { renderStyle, lineColor, glowColor, exportCurve, speed, breath, trailLength, strokeWidth, glowSize } = props
      
      const hexToRgbaJS = `const hexToRgba = (hex, alpha) => {
    let c = hex.substring(1);
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    const num = parseInt(c, 16);
    return \`rgba(\${(num >> 16) & 255}, \${(num >> 8) & 255}, \${num & 255}, \${alpha})\`;
  };`

      // Define mathematical curve equations
      let curveFormulaJS = ''
      if (exportCurve === 'four-petal-spiral') {
        curveFormulaJS = `x = (0.5 * Math.cos(theta) + 0.5 * Math.cos(3 * theta)) * breath;
      y = (0.5 * Math.sin(theta) - 0.5 * Math.sin(3 * theta)) * breath;`
      } else if (exportCurve === 'five-petal-spiral') {
        curveFormulaJS = `x = ((4 * Math.cos(theta) + 3 * Math.cos(4 * theta)) / 7) * breath;
      y = ((4 * Math.sin(theta) - 3 * Math.sin(4 * theta)) / 7) * breath;`
      } else if (exportCurve === 'six-petal-spiral') {
        curveFormulaJS = `x = ((5 * Math.cos(theta) + 3 * Math.cos(5 * theta)) / 8) * breath;
      y = ((5 * Math.sin(theta) - 3 * Math.sin(5 * theta)) / 8) * breath;`
      } else if (exportCurve === 'butterfly-phase') {
        curveFormulaJS = `const r_val = Math.exp(Math.sin(theta)) - 2 * Math.cos(4 * theta) + Math.pow(Math.sin((2 * theta - Math.PI) / 24), 5);
      x = r_val * Math.cos(theta) * 0.28 * breath;
      y = r_val * Math.sin(theta) * 0.28 * breath;`
      } else if (exportCurve === 'cardioid-glow') {
        curveFormulaJS = `const r_val = 0.5 * (1 - Math.cos(theta));
      x = (r_val * Math.cos(theta) + 0.1) * 1.5 * breath;
      y = (r_val * Math.sin(theta)) * 1.5 * breath;`
      } else if (exportCurve === 'cardioid-heart') {
        curveFormulaJS = `const r_val = 0.55 * (1 - Math.cos(theta));
      x = r_val * Math.sin(theta) * 1.35 * breath;
      y = (-r_val * Math.cos(theta) + 0.2) * 1.35 * breath;`
      } else if (exportCurve === 'heart-wave') {
        curveFormulaJS = `const x_val = Math.sqrt(3.3) * Math.sin(theta);
      const y_val = Math.pow(Math.abs(x_val), 2/3) + 0.9 * Math.sqrt(3.3) * Math.cos(theta) * Math.sin(6.9 * Math.PI * x_val + time * 0.05);
      x = x_val * 0.45 * breath;
      y = -y_val * 0.45 * breath;`
      } else if (exportCurve === 'spiral-search') {
        curveFormulaJS = `const base_r = ((theta % (2 * Math.PI)) / (2 * Math.PI)) * 0.65;
      const r = (base_r + 0.25 * Math.cos(3 * theta)) * breath;
      x = r * Math.cos(theta);
      y = r * Math.sin(theta);`
      } else if (exportCurve === 'lissajous-drift') {
        curveFormulaJS = `x = Math.sin(3 * theta + time * 0.03) * breath;
      y = Math.sin(4 * theta) * breath;`
      } else if (exportCurve === 'lemniscate-bloom') {
        curveFormulaJS = `const denom = 1 + Math.sin(theta) * Math.sin(theta);
      const lx = (Math.cos(theta) / denom) * 1.25;
      const ly = (Math.sin(theta) * Math.cos(theta) / denom) * 1.25;
      const rot = time * 0.006;
      x = (lx * Math.cos(rot) - ly * Math.sin(rot)) * breath;
      y = (lx * Math.sin(rot) + ly * Math.cos(rot)) * breath;`
      } else if (exportCurve === 'rose-curve') {
        curveFormulaJS = `const radius = Math.cos(5 * theta) * breath;
      x = radius * Math.cos(theta);
      y = radius * Math.sin(theta);`
      } else if (exportCurve === 'fourier-flow') {
        curveFormulaJS = `const x_val = 17.8 * Math.cos(theta) + 7.5 * Math.cos(3 * theta + time * 0.02) + 3.2 * Math.sin(5 * theta - time * 0.015);
      const y_val = 15.0 * Math.sin(theta) + 8.2 * Math.sin(2 * theta + time * 0.025) - 4.2 * Math.cos(4 * theta - time * 0.01);
      x = x_val * 0.032 * breath;
      y = y_val * 0.032 * breath;`
      } else if (exportCurve === 'superformula-star') {
        curveFormulaJS = `const pulseM = 5 + 2 * Math.sin(time * 0.02);
      const t1 = Math.abs(Math.cos(pulseM * theta / 4));
      const t2 = Math.abs(Math.sin(pulseM * theta / 4));
      const r = Math.pow(Math.pow(t1, 1.7) + Math.pow(t2, 1.7), -1 / 0.2) * 0.5 * breath;
      x = r * Math.cos(theta);
      y = r * Math.sin(theta);`
      } else if (exportCurve === 'maurer-rose') {
        curveFormulaJS = `const angle = (theta * 180 / Math.PI);
      const k = angle * (71 + 2 * Math.sin(time * 0.005)) * Math.PI / 180;
      const r = Math.sin(6 * k) * 0.95 * breath;
      x = r * Math.cos(k);
      y = r * Math.sin(k);`
      } else if (exportCurve === 'deltoid-loop') {
        curveFormulaJS = `const d_breath = breath * (1.0 + 0.12 * Math.sin(time * 0.04));
      x = (0.6 * Math.cos(theta) + 0.3 * Math.cos(2 * theta)) * d_breath;
      y = (0.6 * Math.sin(theta) - 0.3 * Math.sin(2 * theta)) * d_breath;`
      } else if (exportCurve === 'cochleoid-shell') {
        curveFormulaJS = `const th = ((theta + Math.PI) % (Math.PI * 2)) - Math.PI;
      const thVal = Math.abs(th) < 0.0001 ? 0.0001 : th;
      const r = (Math.sin(3 * thVal) / thVal) * 0.28 * breath;
      x = r * Math.cos(theta) - 0.2 * breath;
      y = r * Math.sin(theta);`
      } else if (exportCurve === 'original-thinking') {
        curveFormulaJS = `const radius = (0.6 + 0.3 * Math.cos(7 * theta)) * breath;
      x = radius * Math.cos(theta + time * 0.015);
      y = radius * Math.sin(theta + time * 0.015);`
      } else if (exportCurve === 'thinking-five') {
        curveFormulaJS = `const radius = (0.65 + 0.25 * Math.cos(5 * theta)) * breath;
      x = radius * Math.cos(theta - time * 0.012);
      y = radius * Math.sin(theta - time * 0.012);`
      } else if (exportCurve === 'thinking-nine') {
        curveFormulaJS = `const radius = (0.6 + 0.3 * Math.cos(9 * theta)) * breath;
      x = radius * Math.cos(theta + time * 0.01);
      y = radius * Math.sin(theta + time * 0.01);`
      } else if (exportCurve === 'rose-two') {
        curveFormulaJS = `const radius = Math.cos(2 * theta) * breath;
      x = radius * Math.cos(theta);
      y = radius * Math.sin(theta);`
      } else if (exportCurve === 'rose-four') {
        curveFormulaJS = `const radius = Math.cos(4 * theta) * breath;
      x = radius * Math.cos(theta);
      y = radius * Math.sin(theta);`
      } else if (exportCurve === 'spirograph') {
        curveFormulaJS = `const r_inner = 0.45;
      const d_dist = 0.38;
      x = ((1 - r_inner) * Math.cos(theta) + d_dist * Math.cos(((1 - r_inner) / r_inner) * theta)) * breath;
      y = ((1 - r_inner) * Math.sin(theta) - d_dist * Math.sin(((1 - r_inner) / r_inner) * theta)) * breath;`
      } else if (exportCurve === 'spiral') {
        curveFormulaJS = `const base_r = ((theta % (2 * Math.PI)) / (2 * Math.PI)) * 0.5 * breath;
      const r = base_r + 0.3 * Math.cos(3 * theta);
      x = r * Math.cos(theta);
      y = r * Math.sin(theta);`
      } else if (exportCurve === 'astroid-wave') {
        curveFormulaJS = `const rad = time * 0.005;
      const ax = Math.pow(Math.cos(theta), 3) * breath;
      const ay = Math.pow(Math.sin(theta), 3) * breath;
      x = (ax * Math.cos(rad) - ay * Math.sin(rad));
      y = (ax * Math.sin(rad) + ay * Math.cos(rad));`
      } else if (exportCurve === 'fermat-spiral') {
        curveFormulaJS = `const th = (theta % (Math.PI * 4));
      const r = Math.sqrt(th / (Math.PI * 4)) * breath;
      x = r * Math.cos(theta + time * 0.01);
      y = r * Math.sin(theta + time * 0.01);`
      } else if (exportCurve === 'folium-wave') {
        curveFormulaJS = `const r = (Math.cos(theta) * (2 * Math.cos(theta) - 1)) * breath;
      x = r * Math.cos(theta);
      y = r * Math.sin(theta);`
      } else if (exportCurve === 'lituus-coil') {
        curveFormulaJS = `const th = (theta % (Math.PI * 4)) + 0.1;
      const r = (1 / Math.sqrt(th)) * 0.7 * breath;
      x = r * Math.cos(theta);
      y = r * Math.sin(theta);`
      } else { // logarithmic-spiral
        curveFormulaJS = `// Continuous logarithmic spiral — rotates without discontinuity
      const headTheta = time * 0.02 * speed;
      const relTheta = theta - headTheta;
      const r = Math.exp(0.18 * relTheta) * 0.75 * breath;
      x = r * Math.cos(theta);
      y = r * Math.sin(theta);`
      }

      // Define drawing render script
      let renderLogicJS = ''
      if (renderStyle === 'glow') {
        renderLogicJS = `const layers = [
        { width: strokeWidth + glowSize, opacityScale: 0.15 },
        { width: strokeWidth + glowSize / 2, opacityScale: 0.4 },
        { width: strokeWidth, opacityScale: 1.0 }
      ];

      layers.forEach(({ width: w, opacityScale }) => {
        ctx.lineWidth = w;
        for (let i = 1; i <= 50; i++) {
          const ratio = i / 50;
          const thetaStart = headTheta - trailRad * (1 - (i - 1) / 50);
          const thetaEnd = headTheta - trailRad * (1 - ratio);

          const pt1 = getPoint(thetaStart, t, size);
          const pt2 = getPoint(thetaEnd, t, size);

          ctx.beginPath();
          ctx.moveTo(cx + pt1.x, cy + pt1.y);
          ctx.lineTo(cx + pt2.x, cy + pt2.y);

          const op = ratio * opacityScale;
          ctx.strokeStyle = hexToRgba('${lineColor}', op);
          ctx.stroke();
        }
      });`
      } else if (renderStyle === 'dotted') {
        renderLogicJS = `for (let i = 1; i <= 60; i++) {
        const ratio = i / 60;
        const theta = headTheta - trailRad * (1 - ratio);
        const pt = getPoint(theta, t, size);

        // Outer glow
        ctx.fillStyle = hexToRgba('${glowColor}', ratio * 0.35);
        ctx.beginPath();
        ctx.arc(cx + pt.x, cy + pt.y, strokeWidth * ratio + glowSize * 0.3 * ratio, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = hexToRgba('${lineColor}', ratio);
        ctx.beginPath();
        ctx.arc(cx + pt.x, cy + pt.y, strokeWidth * 0.7 * ratio, 0, Math.PI * 2);
        ctx.fill();
      }`
      } else if (renderStyle === 'halftone') {
        renderLogicJS = `for (let i = 1; i <= 70; i++) {
        const ratio = i / 70;
        const theta = headTheta - trailRad * (1 - ratio);
        const pt = getPoint(theta, t, size);

        const mod = 0.4 + 0.6 * Math.sin(theta * 6.0);
        const rad = strokeWidth * 1.8 * ratio * Math.abs(mod);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx + pt.x, cy + pt.y, Math.max(0.5, rad), 0, Math.PI * 2);
        ctx.fill();
      }`
      } else { // minimalist
        renderLogicJS = `ctx.lineWidth = strokeWidth * 0.5;
      for (let i = 1; i <= 80; i++) {
        const ratio = i / 80;
        const thetaStart = headTheta - trailRad * (1 - (i - 1) / 80);
        const thetaEnd = headTheta - trailRad * (1 - ratio);

        const pt1 = getPoint(thetaStart, t, size);
        const pt2 = getPoint(thetaEnd, t, size);

        ctx.beginPath();
        ctx.moveTo(cx + pt1.x, cy + pt1.y);
        ctx.lineTo(cx + pt2.x, cy + pt2.y);

        const op = ratio * 0.8;
        ctx.strokeStyle = hexToRgba('${lineColor}', op);
        ctx.stroke();
      }`
      }

      // Glowing dot head logic (only for glow, dotted, minimalist)
      const drawHeadNodeJS = renderStyle !== 'halftone' ? `const headPt = getPoint(headTheta, t, size);

      const glowGrad = ctx.createRadialGradient(
        cx + headPt.x, cy + headPt.y, 0,
        cx + headPt.x, cy + headPt.y, strokeWidth + glowSize / 2
      );
      glowGrad.addColorStop(0, hexToRgba('${glowColor}', 1.0));
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx + headPt.x, cy + headPt.y, strokeWidth + glowSize / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + headPt.x, cy + headPt.y, Math.max(1.5, strokeWidth * 0.6), 0, Math.PI * 2);
      ctx.fill();` : ''

      return {
        tailwind: `import React, { useEffect, useRef } from 'react';

export default function MathWaveLoader() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let t = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Configuration
    const speed = ${speed};
    const breathScale = ${breath / 100};
    const trailLength = ${trailLength};
    const strokeWidth = ${strokeWidth};
    const glowSize = ${glowSize};

    ${hexToRgbaJS.replace(/\n/g, '\n    ')}

    const getPoint = (theta, time, size) => {
      const breath = 1.0 + breathScale * Math.sin(time * 0.05);
      let x = 0;
      let y = 0;

      ${curveFormulaJS.replace(/\n/g, '\n      ')}

      return {
        x: x * (size * 0.4),
        y: y * (size * 0.4)
      };
    };

    const draw = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, width, height);

      if ('${renderStyle}' === 'halftone') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
      }

      const size = Math.min(width, height);
      const cx = width / 2;
      const cy = height / 2;

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 1. Trace Background Guide Outline (except in high-contrast halftone)
      if ('${renderStyle}' !== 'halftone') {
        ctx.beginPath();
        const traceSteps = 300;
        for (let i = 0; i <= traceSteps; i++) {
          const theta = (i / traceSteps) * Math.PI * 2;
          const pt = getPoint(theta, t, size);
          if (i === 0) ctx.moveTo(cx + pt.x, cy + pt.y);
          else ctx.lineTo(cx + pt.x, cy + pt.y);
        }
        ctx.strokeStyle = hexToRgba('${glowColor}', 0.08);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 2. Draw moving trail path
      const headTheta = t * 0.02 * speed;
      const trailRad = (trailLength / 100) * Math.PI;

      ${renderLogicJS.replace(/\n/g, '\n      ')}

      // 3. Draw head dot
      ${drawHeadNodeJS.replace(/\n/g, '\n      ')}

      t += 1;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="flex items-center justify-center w-full aspect-square max-w-[320px] mx-auto rounded-2xl ${renderStyle === 'halftone' ? 'bg-black' : 'bg-zinc-950/40'} border border-zinc-900 shadow-inner p-6">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}`,
        css: `<!-- HTML Structure -->
<div class="loader-card">
  <canvas id="math-loader-canvas" class="loader-canvas"></canvas>
</div>

<!-- CSS Styling -->
<style>
.loader-card {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 320px;
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  border-radius: 16px;
  background-color: ${renderStyle === 'halftone' ? '#000000' : 'rgba(9, 9, 11, 0.4)'};
  border: 1px solid #18181b;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.6);
  padding: 24px;
  box-sizing: border-box;
}

.loader-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>

<script>
(function() {
  const canvas = document.getElementById('math-loader-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let animationFrameId;
  let t = 0;

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
  };

  resize();
  window.addEventListener('resize', resize);

  // Configuration
  const speed = ${speed};
  const breathScale = ${breath / 100};
  const trailLength = ${trailLength};
  const strokeWidth = ${strokeWidth};
  const glowSize = ${glowSize};

  ${hexToRgbaJS.replace(/\n/g, '\n  ')}

  const getPoint = (theta, time, size) => {
    const breath = 1.0 + breathScale * Math.sin(time * 0.05);
    let x = 0;
    let y = 0;

    ${curveFormulaJS.replace(/\n/g, '\n    ')}

    return {
      x: x * (size * 0.4),
      y: y * (size * 0.4)
    };
  };

  const draw = () => {
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, width, height);

    if ('${renderStyle}' === 'halftone') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
    }

    const size = Math.min(width, height);
    const cx = width / 2;
    const cy = height / 2;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Trace Outline
    if ('${renderStyle}' !== 'halftone') {
      ctx.beginPath();
      const traceSteps = 300;
      for (let i = 0; i <= traceSteps; i++) {
        const theta = (i / traceSteps) * Math.PI * 2;
        const pt = getPoint(theta, t, size);
        if (i === 0) ctx.moveTo(cx + pt.x, cy + pt.y);
        else ctx.lineTo(cx + pt.x, cy + pt.y);
      }
      ctx.strokeStyle = hexToRgba('${glowColor}', 0.08);
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 2. Glowing trail
    const headTheta = t * 0.02 * speed;
    const trailRad = (trailLength / 100) * Math.PI;

    ${renderLogicJS.replace(/\n/g, '\n    ')}

    // 3. Glow dot
    ${drawHeadNodeJS.replace(/\n/g, '\n    ')}

    t += 1;
    animationFrameId = requestAnimationFrame(draw);
  };

  draw();

  window.addEventListener('beforeunload', () => {
    window.removeEventListener('resize', resize);
    cancelAnimationFrame(animationFrameId);
  });
})();
</script>`
      }
    }
  },
  {
    id: 'phone-onboarding',
    name: '3D Globe Phone Onboarding',
    description: 'An onboarding phone country/code selector card inside a mock smartphone, featuring a dynamic 3D dot-matrix particle globe that morphs to continent maps and country silhouettes.',
    category: 'inputs',
    props: [
      { id: 'defaultColor', name: 'Default Glow Color', type: 'select', default: 'White', options: ['White', 'Blue', 'Cyan', 'Green', 'Purple', 'Pink', 'Amber', 'Red'] },
      { id: 'defaultSpeed', name: 'Default Speed', type: 'select', default: 'Smooth', options: ['Calm', 'Smooth', 'Fast'] },
      { id: 'defaultMode', name: 'Default View Mode', type: 'select', default: 'spin', options: ['spin', 'static', 'map'] },
      { id: 'showSettings', name: 'Show Settings Menu', type: 'boolean', default: true }
    ],
    generateCode: (props) => {
      const { defaultColor, defaultSpeed, defaultMode, showSettings } = props;
      const colorIdx = ['White', 'Blue', 'Cyan', 'Green', 'Purple', 'Pink', 'Amber', 'Red'].indexOf(defaultColor ?? 'White');
      
      let code = `// components/GlobeView.tsx
import { useEffect, useRef, useState } from "react";
import { geoContains, geoBounds } from "d3-geo";
import dots from "./globeDots.json";
import countries from "./countries.json";
import shapes from "./countryShapes.json";

type Dot = { x: number; y: number; z: number; c: string };
type Country = { name: string; iso: string; dial: string; lat: number; lon: number; flag: string };
const COUNTRIES = countries as Country[];
const SHAPES = shapes as Record<string, any>;

const CONTINENTS: Record<string, [number, number] | null> = {
    GLOBE: null, NA: [40, -100], SA: [-15, -60], EU: [50, 15], AF: [5, 20], AS: [35, 90], OC: [-25, 133],
};

type Mode = "spin" | "static" | "map";
const ZOOM_CONTINENT = 1.7;
const EXIT_MS = 320;
const toRad = (d: number) => (d * Math.PI) / 180;

const GLOW_COLORS: { name: string; rgb: [number, number, number] }[] = [
    { name: "White", rgb: [235, 240, 255] },
    { name: "Blue", rgb: [120, 195, 255] },
    { name: "Cyan", rgb: [120, 255, 235] },
    { name: "Green", rgb: [130, 255, 150] },
    { name: "Purple", rgb: [190, 150, 255] },
    { name: "Pink", rgb: [255, 150, 210] },
    { name: "Amber", rgb: [255, 200, 110] },
    { name: "Red", rgb: [255, 130, 130] },
];

// speed presets the user can pick in settings
const SPEEDS: Record<string, { ease: number; blackout: number; grow: number }> = {
    Calm: { ease: 0.06, blackout: 0.55, grow: 1.0 },
    Smooth: { ease: 0.08, blackout: 0.45, grow: 0.8 },
    Fast: { ease: 0.1, blackout: 0.35, grow: 0.6 },
};

const WORLD_COVER: Record<string, number> = {};
for (const d of dots as Dot[]) if (d.c) WORLD_COVER[d.c] = (WORLD_COVER[d.c] || 0) + 1;

function countrySpan(iso: string): number {
    const geom = SHAPES[iso];
    if (!geom) return 30;
    const [[w, s], [e, n]] = geoBounds({ type: "Feature", geometry: geom, properties: {} } as any);
    return Math.min(Math.max(e - w, n - s), 90);
}

function zoomForSpan(span: number): number {
    const s = Math.max(3, Math.min(90, span));
    const t = (Math.log(s) - Math.log(3)) / (Math.log(90) - Math.log(3));
    return 7.0 - t * (7.0 - 2.0);
}

function genDetail(iso: string): { x: number; y: number; z: number }[] {
    const geom = SHAPES[iso];
    if (!geom) return [];
    const feat = { type: "Feature", geometry: geom, properties: {} } as any;
    const [[w, s], [e, n]] = geoBounds(feat);
    const spanLon = Math.max(e - w, 0.1), spanLat = Math.max(n - s, 0.1);
    const sp = Math.max(spanLon, spanLat);
    if (sp > 60) return [];
    const step = Math.max(0.02, sp / 70);
    const out: { x: number; y: number; z: number }[] = [];
    for (let lat = s; lat <= n; lat += step) {
        for (let lon = w; lon <= e; lon += step) {
            if (geoContains(feat, [lon, lat])) {
                const la = toRad(lat), lo = toRad(lon);
                out.push({ x: Math.cos(la) * Math.cos(lo), y: Math.sin(la), z: Math.cos(la) * Math.sin(lo) });
            }
        }
    }
    return out;
}

// ---- Props: marketplace-ready ----
export type GlobeViewProps = {
    onSubmit?: (value: { iso: string; dial: string; number: string; e164: string }) => void;
    defaultColor?: number;        // index into GLOW_COLORS
    defaultSpeed?: keyof typeof SPEEDS;
    defaultMode?: Mode;
    showSettings?: boolean;       // show the gear menu
    className?: string;
    style?: React.CSSProperties;
};

export default function GlobeView({
    onSubmit,
    defaultColor = __COLOR_IDX__,
    defaultSpeed = "__DEFAULT_SPEED__",
    defaultMode = "__DEFAULT_MODE__",
    showSettings = __SHOW_SETTINGS__,
    className,
    style,
}: GlobeViewProps) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sizeRef = useRef(320); // live canvas size (responsive)

    const rot = useRef({ yaw: 0.6, pitch: 0.3 });
    const target = useRef({ yaw: 0.6, pitch: 0.3, active: false });
    const zoom = useRef(1);
    const zoomTarget = useRef(1);
    const glowIso = useRef<string | null>(null);
    const glowStart = useRef(0);
    const arrived = useRef(false);
    const detail = useRef<{ x: number; y: number; z: number }[]>([]);
    const glowColor = useRef<[number, number, number]>(GLOW_COLORS[defaultColor].rgb);
    const center = useRef({ x: 0, y: 0, z: 0 });
    const maxDist = useRef(0.3);
    const fadeIso = useRef<string | null>(null);
    const fadeStart = useRef(0);
    const fadeCenter = useRef({ x: 0, y: 0, z: 0 });
    const fadeMax = useRef(0.3);
    const speedRef = useRef(SPEEDS[defaultSpeed]);

    const [mode, setMode] = useState<Mode>(defaultMode);
    const [region, setRegion] = useState("GLOBE");
    const [country, setCountry] = useState<Country | null>(null);
    const [number, setNumber] = useState("");
    const [query, setQuery] = useState("");
    const [pickerOpen, setPickerOpen] = useState(false);
    const [colorIdx, setColorIdx] = useState(defaultColor);
    const [speedName, setSpeedName] = useState<keyof typeof SPEEDS>(defaultSpeed);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const modeRef = useRef(mode);
    modeRef.current = mode;

    function aimAt(lat: number, lon: number, z: number) {
        target.current = { yaw: toRad(lon) - Math.PI / 2, pitch: toRad(lat), active: true };
        zoomTarget.current = z;
    }
    function computeCenter(iso: string, lat: number, lon: number) {
        const cv = {
            x: Math.cos(toRad(lat)) * Math.cos(toRad(lon)),
            y: Math.sin(toRad(lat)),
            z: Math.cos(toRad(lat)) * Math.sin(toRad(lon)),
        };
        let mx = 0.0001;
        const all = [...(dots as Dot[]).filter((d) => d.c === iso).map((d) => ({ x: d.x, y: d.y, z: d.z })), ...detail.current];
        for (const p of all) {
            const dx = p.x - cv.x, dy = p.y - cv.y, dz = p.z - cv.z;
            const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (d > mx) mx = d;
        }
        return { cv, mx };
    }
    function startFade() {
        if (glowIso.current) {
            fadeIso.current = glowIso.current; fadeStart.current = performance.now();
            fadeCenter.current = center.current; fadeMax.current = maxDist.current;
        }
    }
    function selectRegion(name: string) {
        setRegion(name); setCountry(null);
        startFade(); glowIso.current = null;
        detail.current = []; arrived.current = false;
        const c = CONTINENTS[name];
        if (c) aimAt(c[0], c[1], ZOOM_CONTINENT);
        else { target.current.active = false; zoomTarget.current = 1; }
    }
    function selectCountry(c: Country) {
        setCountry(c); setPickerOpen(false); setQuery("");
        const hadGlow = !!glowIso.current;
        startFade(); glowIso.current = null; arrived.current = false;
        const go = () => {
            aimAt(c.lat, c.lon, zoomForSpan(countrySpan(c.iso)));
            glowIso.current = c.iso;
            detail.current = (WORLD_COVER[c.iso] || 0) >= 12 ? [] : genDetail(c.iso);
            const { cv, mx } = computeCenter(c.iso, c.lat, c.lon);
            center.current = cv; maxDist.current = mx;
        };
        if (hadGlow) setTimeout(go, EXIT_MS); else go();
    }
    function pickColor(i: number) { setColorIdx(i); glowColor.current = GLOW_COLORS[i].rgb; }
    function pickSpeed(n: keyof typeof SPEEDS) { setSpeedName(n); speedRef.current = SPEEDS[n]; }

    function submit() {
        if (!country || number.length < 5) return;
        onSubmit?.({ iso: country.iso, dial: country.dial, number, e164: \`\${country.dial}\${number}\` });
    }

    // ---- responsive canvas + render loop ----
    useEffect(() => {
        const rawCanvas = canvasRef.current;
        const rawWrap = wrapRef.current;
        if (!rawCanvas || !rawWrap) return;
        const canvas = rawCanvas;
        const wrap = rawWrap;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const c2d = ctx;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

        function resize() {
            const w = Math.max(160, Math.min(wrap.clientWidth, 560)); // clamp
            sizeRef.current = w;
            canvas.width = w * dpr; canvas.height = w * dpr;
            canvas.style.width = w + "px"; canvas.style.height = w + "px";
            c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(wrap);

        let frame = 0;
        const wrapAngle = (d: number) => Math.atan2(Math.sin(d), Math.cos(d));

        function radial(p: { x: number; y: number; z: number }, cv: { x: number; y: number; z: number }, mx: number) {
            const dx = p.x - cv.x, dy = p.y - cv.y, dz = p.z - cv.z;
            return Math.min(1, Math.sqrt(dx * dx + dy * dy + dz * dz) / mx);
        }

        function draw() {
            const SIZE = sizeRef.current;
            const BASE_R = SIZE * 0.42, cx = SIZE / 2, cy = SIZE / 2;
            const { ease: EASE, blackout: BLACKOUT, grow: GROW } = speedRef.current;
            c2d.clearRect(0, 0, SIZE, SIZE);
            const m = modeRef.current;
            zoom.current += (zoomTarget.current - zoom.current) * EASE;
            const R = BASE_R * zoom.current;
            const now = performance.now();
            const [gr, gg, gb] = glowColor.current;
            const softPulse = 0.7 + 0.15 * Math.sin(now / 700);
            const ds = SIZE / 320; // dot-size scale relative to the original 320px design

            if (m === "map") {
                for (const p of dots as Dot[]) {
                    const lat = Math.asin(p.y), lon = Math.atan2(p.z, p.x);
                    const sx = cx - (lon / Math.PI) * R;
                    const sy = cy - (lat / (Math.PI / 2)) * R * 0.6;
                    c2d.beginPath(); c2d.fillStyle = \`rgba(235,240,255,\${0.85 * softPulse + 0.15})\`;
                    c2d.arc(sx, sy, 0.6 * ds, 0, Math.PI * 2); c2d.fill();
                }
                frame = requestAnimationFrame(draw); return;
            }

            if (target.current.active) {
                rot.current.yaw += wrapAngle(target.current.yaw - rot.current.yaw) * EASE;
                rot.current.pitch += (target.current.pitch - rot.current.pitch) * EASE;
            }
            if (m === "spin" && !target.current.active) rot.current.yaw += 0.003;

            if (glowIso.current && !arrived.current) {
                const dY = Math.abs(wrapAngle(target.current.yaw - rot.current.yaw));
                const dP = Math.abs(target.current.pitch - rot.current.pitch);
                if (dY < 0.25 && dP < 0.25) { arrived.current = true; glowStart.current = now; }
            }
            if (fadeIso.current && (now - fadeStart.current) / 1000 > BLACKOUT + 0.3) fadeIso.current = null;

            const yaw = rot.current.yaw, pitch = rot.current.pitch;
            const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
            const cosP = Math.cos(pitch), sinP = Math.sin(pitch);
            const gi = glowIso.current, fi = fadeIso.current;
            const cv = center.current, mx = maxDist.current;
            const fcv = fadeCenter.current, fmx = fadeMax.current;

            for (const p of dots as Dot[]) {
                const x1 = p.x * cosY + p.z * sinY;
                const z1 = -p.x * sinY + p.z * cosY;
                const y1 = p.y;
                const y2 = y1 * cosP - z1 * sinP;
                const z2 = y1 * sinP + z1 * cosP;
                if (z2 <= 0) continue;
                const sx = cx - x1 * R, sy = cy - y2 * R;

                const baseA = (0.55 + 0.45 * z2) * softPulse;
                c2d.beginPath();
                c2d.fillStyle = \`rgba(225,232,250,\${baseA})\`;
                c2d.arc(sx, sy, 0.55 * ds, 0, Math.PI * 2); c2d.fill();
                c2d.beginPath();
                c2d.fillStyle = \`rgba(200,215,255,\${0.12 * baseA})\`;
                c2d.arc(sx, sy, 1.6 * ds, 0, Math.PI * 2); c2d.fill();

                if (gi && p.c === gi && arrived.current) {
                    const t = (now - glowStart.current) / 1000;
                    const r = radial(p, cv, mx);
                    const darkFront = 1 - Math.min(1, t / BLACKOUT);
                    const dark = r >= darkFront ? Math.min(1, (t / BLACKOUT) * 1.5) : 0;
                    const t2 = t - (BLACKOUT + 0.15);
                    const growFront = Math.min(1, t2 / GROW);
                    let bright = 0;
                    if (t2 > 0 && r <= growFront) {
                        const settle = Math.max(0, Math.min(1, (t2 - GROW - 0.4) / 1.0));
                        const pulseNow = settle >= 1 ? (0.95 + 0.1 * Math.sin(now / 500)) : 1.3;
                        bright = Math.min(1, ((growFront - r) / 0.25 + 0.3)) * pulseNow;
                    }
                    if (bright > 0.001) {
                        c2d.beginPath();
                        c2d.fillStyle = \`rgba(\${gr},\${gg},\${gb},\${0.4 * bright})\`;
                        c2d.arc(sx, sy, 3.0 * ds, 0, Math.PI * 2); c2d.fill();
                        c2d.beginPath();
                        c2d.fillStyle = \`rgba(\${gr},\${gg},\${gb},\${Math.min(1, 1.3 * bright)})\`;
                        c2d.arc(sx, sy, 1.2 * ds, 0, Math.PI * 2); c2d.fill();
                    } else if (dark > 0.001) {
                        c2d.beginPath();
                        c2d.fillStyle = \`rgba(8,8,10,\${0.92 * dark})\`;
                        c2d.arc(sx, sy, 0.9 * ds, 0, Math.PI * 2); c2d.fill();
                    }
                } else if (fi && p.c === fi) {
                    const t = (now - fadeStart.current) / 1000;
                    const r = radial(p, fcv, fmx);
                    const off = Math.min(1, t / BLACKOUT);
                    const lev = r >= (1 - off) ? 0 : 1;
                    if (lev > 0.001) {
                        c2d.beginPath();
                        c2d.fillStyle = \`rgba(\${gr},\${gg},\${gb},0.95)\`;
                        c2d.arc(sx, sy, 1.1 * ds, 0, Math.PI * 2); c2d.fill();
                    }
                }
            }

            for (const p of detail.current) {
                const x1 = p.x * cosY + p.z * sinY;
                const z1 = -p.x * sinY + p.z * cosY;
                const y1 = p.y;
                const y2 = y1 * cosP - z1 * sinP;
                const z2 = y1 * sinP + z1 * cosP;
                if (z2 <= 0) continue;
                const sx = cx - x1 * R, sy = cy - y2 * R;
                if (!arrived.current) continue;
                const t = (now - glowStart.current) / 1000;
                const r = radial(p, cv, mx);
                const t2 = t - (BLACKOUT + 0.15);
                const growFront = Math.min(1, t2 / GROW);
                let bright = 0;
                if (t2 > 0 && r <= growFront) {
                    const settle = Math.max(0, Math.min(1, (t2 - GROW - 0.4) / 1.0));
                    const pulseNow = settle >= 1 ? (0.95 + 0.1 * Math.sin(now / 500)) : 1.3;
                    bright = Math.min(1, ((growFront - r) / 0.25 + 0.3)) * pulseNow;
                }
                if (bright > 0.001) {
                    c2d.beginPath();
                    c2d.fillStyle = \`rgba(\${gr},\${gg},\${gb},\${0.35 * bright})\`;
                    c2d.arc(sx, sy, 2.2 * ds, 0, Math.PI * 2); c2d.fill();
                    c2d.beginPath();
                    c2d.fillStyle = \`rgba(\${gr},\${gg},\${gb},\${Math.min(1, 1.3 * bright)})\`;
                    c2d.arc(sx, sy, 0.7 * ds, 0, Math.PI * 2); c2d.fill();
                }
            }

            frame = requestAnimationFrame(draw);
        }
        draw();
        return () => { cancelAnimationFrame(frame); ro.disconnect(); };
    }, []);

    const filtered = query
        ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
        : COUNTRIES;

    const btn = (active: boolean): React.CSSProperties => ({
        padding: "6px 10px", borderRadius: 8, fontSize: 12, cursor: "pointer",
        border: "1px solid #333", background: active ? "#1e3a5f" : "transparent",
        color: active ? "#7db9ff" : "#aaa", whiteSpace: "nowrap",
    });

    return (
        <div className={className}
            style={{
                background: "#08080a", padding: 20, borderRadius: 16, width: "100%", maxWidth: 560,
                color: "#fff", fontFamily: "system-ui", position: "relative", boxSizing: "border-box", ...style
            }}>

            {/* header + gear */}
            <div style={{ position: "relative", marginBottom: 14 }}>
                <h2 style={{ textAlign: "center", margin: "0 0 4px", fontSize: 20 }}>Enter your phone</h2>
                <p style={{ textAlign: "center", margin: 0, fontSize: 13, color: "#888" }}>Select your country and number</p>
                {showSettings && (
                    <button onClick={() => setSettingsOpen((o) => !o)} title="Settings"
                        style={{
                            position: "absolute", top: -2, right: 0, width: 30, height: 30, borderRadius: 8,
                            border: "1px solid #2a2a2a", background: "#141414", color: "#aaa", cursor: "pointer", fontSize: 15
                        }}>
                        ⚙
                    </button>
                )}
            </div>

            {/* settings menu */}
            {showSettings && settingsOpen && (
                <div style={{ background: "#121212", border: "1px solid #2a2a2a", borderRadius: 12, padding: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Speed</div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                        {(Object.keys(SPEEDS) as (keyof typeof SPEEDS)[]).map((n) => (
                            <button key={n} onClick={() => pickSpeed(n)} style={btn(speedName === n)}>{n}</button>
                        ))}
                    </div>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Mode</div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                        {([["spin", "3D Spin"], ["static", "3D Static"], ["map", "2D Map"]] as [Mode, string][]).map(([key, label]) => (
                            <button key={key} onClick={() => setMode(key)} style={btn(mode === key)}>{label}</button>
                        ))}
                    </div>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Glow color</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {GLOW_COLORS.map((col, i) => (
                            <button key={col.name} onClick={() => pickColor(i)} title={col.name}
                                style={{
                                    width: 22, height: 22, borderRadius: "50%", cursor: "pointer",
                                    background: \`rgb(\${col.rgb[0]},\${col.rgb[1]},\${col.rgb[2]})\`,
                                    border: colorIdx === i ? "2px solid #fff" : "2px solid #333"
                                }} />
                        ))}
                    </div>
                </div>
            )}

            {/* responsive globe */}
            <div ref={wrapRef} style={{ width: "100%", aspectRatio: "1 / 1", overflow: "hidden", margin: "0 auto", maxWidth: 420 }}>
                <canvas ref={canvasRef} style={{ display: "block", margin: "0 auto" }} />
            </div>

            {/* continent quick-jumps */}
            <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "center", flexWrap: "wrap" }}>
                {Object.keys(CONTINENTS).map((name) => (
                    <button key={name} onClick={() => selectRegion(name)} style={btn(region === name)}>{name}</button>
                ))}
            </div>

            {/* code picker + number */}
            <div style={{ display: "flex", gap: 8, marginTop: 14, position: "relative" }}>
                <button onClick={() => setPickerOpen((o) => !o)}
                    style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "10px 12px", borderRadius: 10,
                        border: "1px solid #2a2a2a", background: "#141414", fontSize: 14, color: "#fff",
                        cursor: "pointer", minWidth: 86, justifyContent: "center"
                    }}>
                    {country ? <>{country.flag} {country.dial}</> : <span style={{ color: "#888" }}>🌐 +—</span>}
                    <span style={{ color: "#666", fontSize: 10 }}>▼</span>
                </button>

                <input value={number} onChange={(e) => setNumber(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Phone number"
                    style={{
                        flex: 1, minWidth: 0, padding: "10px 12px", borderRadius: 10, fontSize: 14,
                        border: "1px solid #2a2a2a", background: "#141414", color: "#fff", outline: "none"
                    }} />

                {pickerOpen && (
                    <div style={{
                        position: "absolute", top: "100%", left: 0, width: 260, marginTop: 6,
                        background: "#121212", border: "1px solid #2a2a2a", borderRadius: 10, zIndex: 20, overflow: "hidden"
                    }}>
                        <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search country..."
                            style={{
                                width: "100%", boxSizing: "border-box", padding: "9px 12px", fontSize: 13,
                                border: "none", borderBottom: "1px solid #2a2a2a", background: "#181818", color: "#fff", outline: "none"
                            }} />
                        <div style={{ maxHeight: 220, overflowY: "auto" }}>
                            {filtered.map((c) => (
                                <div key={c.iso} onClick={() => selectCountry(c)}
                                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", cursor: "pointer", fontSize: 14 }}>
                                    <span>{c.flag}</span><span style={{ flex: 1 }}>{c.name}</span>
                                    <span style={{ color: "#888" }}>{c.dial}</span>
                                </div>
                            ))}
                            {filtered.length === 0 && <div style={{ padding: 12, color: "#666", fontSize: 13 }}>No match</div>}
                        </div>
                    </div>
                )}
            </div>

            <button disabled={!country || number.length < 5} onClick={submit}
                style={{
                    width: "100%", marginTop: 14, padding: 12, borderRadius: 12, fontSize: 15,
                    cursor: country && number.length >= 5 ? "pointer" : "not-allowed", border: "none",
                    background: country && number.length >= 5 ? "#fff" : "#222",
                    color: country && number.length >= 5 ? "#000" : "#666", fontWeight: 600
                }}>
                Continue
            </button>
        </div>
    );
}`;
      code = code.replace('__COLOR_IDX__', String(colorIdx >= 0 ? colorIdx : 0));
      code = code.replace('__DEFAULT_SPEED__', String(defaultSpeed ?? 'Smooth'));
      code = code.replace('__DEFAULT_MODE__', String(defaultMode ?? 'spin'));
      code = code.replace('__SHOW_SETTINGS__', String(showSettings !== false));
      
      return {
        tailwind: code,
        css: `.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
.scrollbar-thin::-webkit-scrollbar { width: 4px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }`
      };
    }
  },
  {
    id: 'otp-verify',
    name: 'OTP Verification',
    description: 'A polished OTP input with glowing rounded digit boxes that converge and collapse into a single success box with an animated checkmark when verification completes.',
    category: 'inputs',
    props: [
      { id: 'codeLength', name: 'Code Length', type: 'select', default: '4', options: ['4', '6'] },
      { id: 'accentColor', name: 'Accent Color', type: 'color', default: '#22c55e' },
      { id: 'verifyMode', name: 'Verify Mode', type: 'select', default: 'auto', options: ['auto', 'button'] },
      { id: 'title', name: 'Title Text', type: 'text', default: "We've sent a code to your phone." },
      { id: 'subtitle', name: 'Subtitle Text', type: 'text', default: "It'll auto-verify once entered." },
    ],
    generateCode: (props) => {
      const len = Number(props.codeLength ?? 4)
      const accent = props.accentColor ?? '#22c55e'
      const mode = props.verifyMode ?? 'auto'
      const title = props.title ?? "We've sent a code to your phone."
      const subtitle = props.subtitle ?? "It'll auto-verify once entered."

      return {
        tailwind: `import React, { useEffect, useRef, useState } from 'react';

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map(c => c+c).join('') : h;
  const r=parseInt(f.slice(0,2),16), g=parseInt(f.slice(2,4),16), b=parseInt(f.slice(4,6),16);
  return \`rgba(\${r},\${g},\${b},\${alpha})\`;
}

const ACCENT = '${accent}';
const LENGTH = ${len};

export default function OtpVerify() {
  const [digits, setDigits] = useState(Array(LENGTH).fill(''));
  const [phase, setPhase] = useState('input'); // input | verifying | success | error
  const refs = useRef([]);
  const allFilled = digits.every(d => d !== '');

  useEffect(() => {
    if ('${mode}' !== 'auto' || !allFilled || phase !== 'input') return;
    const t = setTimeout(verify, 280);
    return () => clearTimeout(t);
  }, [allFilled, phase]);

  function verify() {
    setPhase('verifying');
    setTimeout(() => setPhase('success'), 480);
  }

  function handleChange(i, raw) {
    if (phase !== 'input') return;
    const ch = raw.replace(/\\D/g, '').slice(-1);
    const next = [...digits]; next[i] = ch; setDigits(next);
    if (ch && i < LENGTH - 1) refs.current[i+1]?.focus();
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace') {
      if (digits[i]) { const n=[...digits]; n[i]=''; setDigits(n); }
      else if (i > 0) { refs.current[i-1]?.focus(); const n=[...digits]; n[i-1]=''; setDigits(n); }
    }
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i-1]?.focus();
    if (e.key === 'ArrowRight' && i < LENGTH-1) refs.current[i+1]?.focus();
  }

  function handlePaste(e) {
    e.preventDefault();
    const p = e.clipboardData.getData('text').replace(/\\D/g,'').slice(0,LENGTH);
    if (!p) return;
    setDigits(Array(LENGTH).fill('').map((_,i) => p[i] ?? ''));
    refs.current[Math.min(p.length,LENGTH)-1]?.focus();
  }

  const BOX = 64, GAP = 14;
  const total = LENGTH * BOX + (LENGTH-1) * GAP;

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:28, fontFamily:'system-ui' }}>
      <div style={{ textAlign:'center' }}>
        <p style={{ color:'#e4e4e7', fontSize:14, fontWeight:500, margin:'0 0 6px' }}>${title}</p>
        <p style={{ color:'#71717a', fontSize:12, margin:0 }}>${subtitle}</p>
      </div>

      <div style={{ position:'relative', width:total, height:BOX }}>
        {phase === 'success' ? (
          <div style={{ position:'absolute', left:'50%', width:BOX, height:BOX, borderRadius:20,
            border:\`2.5px solid \${ACCENT}\`, boxShadow:\`0 0 24px \${hexToRgba(ACCENT,.55)}\`,
            backgroundColor:hexToRgba(ACCENT,.09), display:'flex', alignItems:'center',
            justifyContent:'center', animation:'otpPop .44s cubic-bezier(.34,1.56,.64,1) both' }}>
            <svg width={BOX*.4} height={BOX*.4} viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round"
                strokeLinejoin="round"
                style={{ strokeDasharray:30, strokeDashoffset:30, animation:'otpCheck .36s ease-out .3s forwards' }} />
            </svg>
          </div>
        ) : digits.map((digit, i) => {
          const left = i*(BOX+GAP), dx = (total/2)-(left+BOX/2);
          const isNext = !digit && digits.slice(0,i).every(d => d !== '');
          const bc = (digit||isNext) ? ACCENT : '#3f3f46';
          return (
            <div key={i} style={{
              position:'absolute', left, width:BOX, height:BOX, borderRadius:20,
              border:\`2px solid \${bc}\`,
              backgroundColor: digit ? hexToRgba(ACCENT,.07) : 'transparent',
              boxShadow: (digit||isNext) ? \`0 0 16px \${hexToRgba(ACCENT,.24)}\` : 'none',
              display:'flex', alignItems:'center', justifyContent:'center',
              transform: phase==='verifying' ? \`translateX(\${dx}px) scale(0.72)\` : 'translateX(0) scale(1)',
              opacity: phase==='verifying' ? 0 : 1,
              transition:'transform 420ms cubic-bezier(.4,0,.2,1), opacity 400ms ease, border-color 180ms, box-shadow 180ms',
            }}>
              <input ref={el => refs.current[i]=el} type="text" inputMode="numeric" maxLength={1}
                value={digit} onChange={e => handleChange(i,e.target.value)}
                onKeyDown={e => handleKeyDown(i,e)} onPaste={i===0 ? handlePaste : undefined}
                disabled={phase!=='input'} autoComplete={i===0 ? 'one-time-code' : 'off'}
                style={{ width:'100%', height:'100%', background:'transparent', border:'none',
                  outline:'none', textAlign:'center', fontSize:26, fontWeight:700, color:'#f4f4f5',
                  caretColor:'transparent', cursor:'text', borderRadius:20 }} />
            </div>
          );
        })}
      </div>

      ${mode === 'button' ? `{phase === 'input' && allFilled && (
        <button onClick={verify} style={{ padding:'10px 36px', borderRadius:12, border:'none',
          fontSize:13, fontWeight:700, cursor:'pointer', backgroundColor:ACCENT, color:'#000',
          boxShadow:\`0 0 22px \${hexToRgba(ACCENT,.42)}\` }}>
          Verify Code
        </button>
      )}` : ''}

      <p style={{ color:phase==='success' ? ACCENT : '#52525b', fontSize:12, margin:0 }}>
        {phase === 'success' ? 'Verified successfully' : (
          <>Didn't receive? <button onClick={() => { setDigits(Array(LENGTH).fill('')); setPhase('input'); }}
            style={{ color:'#a1a1aa', fontWeight:700, background:'none', border:'none', cursor:'pointer', padding:0, fontSize:12 }}>
            Resend
          </button></>
        )}
      </p>

      <style>{\`
        @keyframes otpPop {
          from { transform:translateX(-50%) scale(.5); opacity:0; }
          to   { transform:translateX(-50%) scale(1);  opacity:1; }
        }
        @keyframes otpCheck { to { stroke-dashoffset:0; } }
      \`}</style>
    </div>
  );
}`,
        css: `<!-- OTP Verification — HTML + CSS + Vanilla JS -->
<div class="otp-root" id="otpRoot">
  <div class="otp-header">
    <p class="otp-title">${title}</p>
    <p class="otp-sub">${subtitle}</p>
  </div>
  <div class="otp-row" id="otpRow"></div>
  <p class="otp-status" id="otpStatus">
    Didn't receive? <button class="otp-resend" onclick="otpReset()">Resend</button>
  </p>
</div>

<style>
.otp-root { display:flex; flex-direction:column; align-items:center; gap:24px; font-family:system-ui,-apple-system,sans-serif; }
.otp-header { text-align:center; }
.otp-title { color:#e4e4e7; font-size:14px; font-weight:500; margin:0 0 6px; line-height:1.5; }
.otp-sub   { color:#71717a; font-size:12px; margin:0; }
.otp-row   { display:flex; gap:14px; }
.otp-box   { width:64px; height:64px; border-radius:20px; border:2px solid #3f3f46;
             background:transparent; display:flex; align-items:center; justify-content:center;
             transition:transform 420ms cubic-bezier(.4,0,.2,1),opacity 400ms ease,border-color 180ms,box-shadow 180ms; }
.otp-box input { width:100%; height:100%; background:transparent; border:none; outline:none;
                 text-align:center; font-size:26px; font-weight:700; color:#f4f4f5;
                 caret-color:transparent; cursor:text; border-radius:20px; font-family:inherit; }
.otp-status { color:#52525b; font-size:12px; margin:0; }
.otp-resend { color:#a1a1aa; font-weight:700; background:none; border:none; cursor:pointer;
              padding:0; font-size:12px; font-family:inherit; }
@keyframes otpPop { from{transform:scale(.5);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes otpCheck { to{stroke-dashoffset:0} }
</style>

<script>
(function() {
  const LEN=${len}, ACCENT='${accent}';
  const digits=Array(LEN).fill('');
  const row=document.getElementById('otpRow');
  const status=document.getElementById('otpStatus');
  let phase='input';

  function rgba(hex,a){const h=hex.replace('#','');const f=h.length===3?h.split('').map(c=>c+c).join(''):h;return'rgba('+parseInt(f.slice(0,2),16)+','+parseInt(f.slice(2,4),16)+','+parseInt(f.slice(4,6),16)+','+a+')';}

  function buildBoxes() {
    row.innerHTML='';
    for(let i=0;i<LEN;i++){
      const box=document.createElement('div');box.className='otp-box';box.id='b'+i;
      const inp=document.createElement('input');inp.type='text';inp.inputMode='numeric';inp.maxLength=1;
      const ii=i;
      inp.addEventListener('input',e=>{onInput(ii,e.target.value);e.target.value='';});
      inp.addEventListener('keydown',e=>onKey(ii,e));
      if(i===0)inp.addEventListener('paste',onPaste);
      box.appendChild(inp);row.appendChild(box);
    }
  }
  buildBoxes();

  function inp(i){return row.children[i]?.querySelector('input');}
  function box(i){return document.getElementById('b'+i);}

  function updateBoxes(){
    const ne=digits.findIndex(d=>!d);
    for(let i=0;i<LEN;i++){
      const b=box(i),active=digits[i]||(i===ne);
      b.style.borderColor=active?ACCENT:'#3f3f46';
      b.style.boxShadow=active?'0 0 16px '+rgba(ACCENT,.24):'none';
      b.style.backgroundColor=digits[i]?rgba(ACCENT,.07):'transparent';
      inp(i).value=digits[i];
    }
  }

  function onInput(i,raw){
    if(phase!=='input')return;
    const ch=raw.replace(/\\D/g,'').slice(-1);
    digits[i]=ch;updateBoxes();
    if(ch&&i<LEN-1)inp(i+1)?.focus();
    if(digits.every(d=>d!==''))setTimeout(verify,280);
  }
  function onKey(i,e){
    if(e.key==='Backspace'){if(digits[i]){digits[i]='';updateBoxes();}else if(i>0){inp(i-1)?.focus();digits[i-1]='';updateBoxes();}}
    if(e.key==='ArrowLeft'&&i>0)inp(i-1)?.focus();
    if(e.key==='ArrowRight'&&i<LEN-1)inp(i+1)?.focus();
  }
  function onPaste(e){
    e.preventDefault();const p=e.clipboardData.getData('text').replace(/\\D/g,'').slice(0,LEN);
    if(!p)return;p.split('').forEach((c,i)=>digits[i]=c);updateBoxes();
    inp(Math.min(p.length,LEN)-1)?.focus();
    if(digits.every(d=>d!==''))setTimeout(verify,280);
  }

  function verify(){
    phase='verifying';
    const total=LEN*64+(LEN-1)*14,cx=total/2;
    for(let i=0;i<LEN;i++){const b=box(i),left=i*(64+14),dx=cx-(left+32);b.style.transform='translateX('+dx+'px) scale(0.72)';b.style.opacity='0';}
    setTimeout(()=>{
      row.innerHTML='';
      const sb=document.createElement('div');
      sb.style.cssText='width:64px;height:64px;border-radius:20px;border:2.5px solid '+ACCENT+';box-shadow:0 0 24px '+rgba(ACCENT,.55)+';background:'+rgba(ACCENT,.09)+';display:flex;align-items:center;justify-content:center;animation:otpPop .44s cubic-bezier(.34,1.56,.64,1) both;';
      sb.innerHTML='<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="'+ACCENT+'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:30;stroke-dashoffset:30;animation:otpCheck .36s ease-out .3s forwards"/></svg>';
      row.appendChild(sb);
      status.innerHTML='<span style="color:'+ACCENT+';font-weight:600">Verified successfully</span>';
      phase='success';
    },480);
  }

  window.otpReset=function(){digits.fill('');phase='input';buildBoxes();updateBoxes();status.innerHTML='Didn\'t receive? <button class="otp-resend" onclick="otpReset()">Resend</button>';inp(0)?.focus();};
})();
</script>`
      }
    }
  },
  {
    id: 'lamp-login',
    name: 'Lamp Toggle Login',
    description: 'A cinematic login screen with a pull-string lamp. Pull the hanging bead to toggle it — the lamp flickers on, casting a light cone that reveals the login form. Four distinct lamp styles available.',
    category: 'inputs',
    props: [
      { id: 'lampType',   name: 'Lamp Style',  type: 'select', default: 'modern',   options: ['modern', 'floor', 'pendant', 'lantern'] },
      { id: 'lightColor', name: 'Light Color', type: 'color',  default: '#f59e0b' },
      { id: 'title', name: 'Form Title', type: 'text', default: 'Welcome Back' },
      { id: 'buttonLabel', name: 'Button Label', type: 'text', default: 'Sign In' },
      { id: 'showGoogle', name: 'Show Google Button', type: 'boolean', default: true },
    ],
    generateCode: (props) => {
      const { lampColor, title, buttonLabel, showGoogle } = props

      const colors: Record<string, { beam: string; cone: string; coneEdge: string; glow: string; btnGrad: string }> = {
        amber: { beam: '#f59e0b', cone: 'rgba(245,158,11,0.22)', coneEdge: 'rgba(245,158,11,0)', glow: 'rgba(245,158,11,0.55)', btnGrad: 'linear-gradient(135deg,#7c3aed,#6d28d9)' },
        cool:  { beam: '#93c5fd', cone: 'rgba(147,197,253,0.20)', coneEdge: 'rgba(147,197,253,0)',  glow: 'rgba(147,197,253,0.50)', btnGrad: 'linear-gradient(135deg,#0ea5e9,#2563eb)' },
        rose:  { beam: '#f9a8d4', cone: 'rgba(249,168,212,0.22)', coneEdge: 'rgba(249,168,212,0)', glow: 'rgba(249,168,212,0.50)', btnGrad: 'linear-gradient(135deg,#ec4899,#be185d)' },
      }
      const col = colors[lampColor ?? 'amber']

      const googleBlock = showGoogle ? `
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 1, background: '#222228' }} />
                <span style={{ fontSize: 10, color: '#44444e' }}>or</span>
                <div style={{ flex: 1, height: 1, background: '#222228' }} />
              </div>
              <button style={{ width: '100%', padding: '9px', borderRadius: 9, border: '1px solid #242430', background: '#111118', color: '#a0a0b0', fontSize: 12, cursor: isOn ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <GoogleIcon />
                Continue with Google
              </button>
            </>` : ''

      return {
        tailwind: `import { useState } from 'react';

// ── Lamp Toggle Login ──────────────────────────────────────────────────
// Click the golden bead on the hanging string to toggle the lamp.
// The login form is only visible when the lamp is on.

function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function LampLogin() {
  const [isOn, setIsOn] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [pulling, setPulling] = useState(false);

  function pull() {
    if (pulling) return;
    setPulling(true);
    setTimeout(() => { setPulling(false); setIsOn(o => !o); }, 220);
  }

  return (
    <div style={{ position: 'relative', background: '#08080b', borderRadius: 16, overflow: 'hidden', width: '100%', minHeight: 400, display: 'flex', alignItems: 'center', padding: '24px 20px', boxSizing: 'border-box', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: 16, left: 20, width: 100, height: 60, borderRadius: '50%', background: '${col.glow}', filter: 'blur(22px)', opacity: isOn ? 1 : 0, transition: 'opacity 0.65s ease', pointerEvents: 'none', zIndex: 0 }} />

      {/* Light cone */}
      <div style={{ position: 'absolute', top: 52, left: 10, width: 300, height: 360, background: \`linear-gradient(180deg, ${col.cone} 0%, ${col.coneEdge} 100%)\`, clipPath: 'polygon(38% 0%, 62% 0%, 100% 100%, 0% 100%)', opacity: isOn ? 1 : 0, transition: 'opacity 0.7s ease', pointerEvents: 'none', zIndex: 0 }} />

      {/* Lamp SVG */}
      <div style={{ position: 'relative', width: 120, flexShrink: 0, zIndex: 1, alignSelf: 'stretch', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
        <svg viewBox="0 0 100 320" width="100" height="300" style={{ display: 'block', overflow: 'visible' }}>
          <ellipse cx="50" cy="46" rx="44" ry="8" fill="#222226" stroke="#3a3a40" strokeWidth="1.5" />
          <path d="M12 44 L88 44 L80 60 L20 60 Z" fill="#1a1a1e" stroke="#2e2e34" strokeWidth="1" />
          {isOn && <ellipse cx="50" cy="60" rx="30" ry="4" fill="${col.beam}" opacity="0.7" />}
          <rect x="48" y="60" width="4" height="218" rx="2" fill="#141418" stroke="#26262c" strokeWidth="1" />
          <rect x="12" y="278" width="76" height="10" rx="5" fill="#1a1a1e" stroke="#2e2e34" strokeWidth="1.5" />
          <ellipse cx="50" cy="278" rx="38" ry="7" fill="#1a1a1e" stroke="#303036" strokeWidth="1" />
          {/* Clickable string + bead */}
          <g style={{ transform: pulling ? 'translateY(13px)' : 'translateY(0px)', transition: pulling ? 'transform 0.18s ease-in' : 'transform 0.32s cubic-bezier(0.34,1.56,0.64,1)', cursor: 'pointer' }} onClick={pull}>
            <rect x="42" y="60" width="16" height="60" fill="transparent" />
            <line x1="50" y1="60" x2="50" y2="96" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="50" cy="102" r="5.5" fill="#c8a84b" stroke="#e8c866" strokeWidth="1.5" />
          </g>
        </svg>
        <p style={{ fontSize: 9, color: '#3d3d44', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginTop: -4, userSelect: 'none' }}>Pull to {isOn ? 'off' : 'on'}</p>
      </div>

      {/* Login form */}
      <div style={{ flex: 1, minWidth: 0, marginLeft: 16, opacity: isOn ? 1 : 0.07, filter: isOn ? 'none' : 'blur(3px)', transition: 'opacity 0.7s ease, filter 0.7s ease', zIndex: 1 }}>
        <div style={{ background: 'rgba(18,18,24,0.88)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '22px 20px', backdropFilter: 'blur(14px)' }}>
          <h2 style={{ textAlign: 'center', margin: '0 0 18px', fontSize: 17, fontWeight: 700, color: '#ececf4', letterSpacing: '-0.01em' }}>${title}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input readOnly placeholder="Email address" type="email" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #242430', background: '#0e0e14', color: '#d8d8e8', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            <div style={{ position: 'relative' }}>
              <input readOnly placeholder="Password" type={showPass ? 'text' : 'password'} style={{ width: '100%', padding: '10px 36px 10px 12px', borderRadius: 8, border: '1px solid #242430', background: '#0e0e14', color: '#d8d8e8', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              <button onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 12 }}>{showPass ? '◉' : '◎'}</button>
            </div>
            <p style={{ textAlign: 'right', margin: '0 0 2px', fontSize: 11, color: '#7b6ef6', cursor: 'pointer' }}>Forgot Password?</p>
            <button style={{ width: '100%', padding: '11px', borderRadius: 9, border: 'none', background: '${col.btnGrad}', color: '#fff', fontSize: 13, fontWeight: 700, cursor: isOn ? 'pointer' : 'default', letterSpacing: '0.06em', textTransform: 'uppercase' }}>${buttonLabel}</button>${googleBlock}
          </div>
        </div>
      </div>
    </div>
  );
}`,
        css: `<!-- Lamp Toggle Login — Vanilla HTML/CSS/JS -->
<div class="lamp-scene" id="lampScene">

  <!-- Ambient glow -->
  <div class="lamp-glow" id="lampGlow"></div>

  <!-- Light cone -->
  <div class="light-cone" id="lightCone"></div>

  <!-- Lamp -->
  <div class="lamp-wrap">
    <svg viewBox="0 0 100 320" width="100" height="300" overflow="visible">
      <ellipse cx="50" cy="46" rx="44" ry="8" fill="#222226" stroke="#3a3a40" stroke-width="1.5"/>
      <path d="M12 44 L88 44 L80 60 L20 60 Z" fill="#1a1a1e" stroke="#2e2e34" stroke-width="1"/>
      <ellipse id="shadeGlow" cx="50" cy="60" rx="30" ry="4" fill="${col.beam}" opacity="0"/>
      <rect x="48" y="60" width="4" height="218" rx="2" fill="#141418" stroke="#26262c" stroke-width="1"/>
      <rect x="12" y="278" width="76" height="10" rx="5" fill="#1a1a1e" stroke="#2e2e34" stroke-width="1.5"/>
      <ellipse cx="50" cy="278" rx="38" ry="7" fill="#1a1a1e" stroke="#303036" stroke-width="1"/>
      <g id="stringGroup" class="string-group" onclick="toggleLamp()">
        <rect x="42" y="60" width="16" height="60" fill="transparent"/>
        <line x1="50" y1="60" x2="50" y2="96" stroke="#888" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="50" cy="102" r="5.5" fill="#c8a84b" stroke="#e8c866" stroke-width="1.5"/>
      </g>
    </svg>
    <p class="pull-hint" id="pullHint">Pull to on</p>
  </div>

  <!-- Login form -->
  <div class="login-wrap" id="loginWrap">
    <div class="login-card">
      <h2>${title}</h2>
      <div class="form-body">
        <input type="email" placeholder="Email address" class="field"/>
        <div class="field-wrap">
          <input type="password" placeholder="Password" class="field" id="passField"/>
          <button class="eye-btn" onclick="document.getElementById('passField').type==='password'?document.getElementById('passField').type='text':document.getElementById('passField').type='password'">◎</button>
        </div>
        <p class="forgot">Forgot Password?</p>
        <button class="cta-btn">${buttonLabel}</button>${showGoogle ? `
        <div class="or-row"><span class="or-line"></span><span class="or-text">or</span><span class="or-line"></span></div>
        <button class="google-btn">🌐 Continue with Google</button>` : ''}
      </div>
    </div>
  </div>
</div>

<style>
.lamp-scene {
  position: relative;
  background: #08080b;
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
  min-height: 400px;
  display: flex;
  align-items: center;
  padding: 24px 20px;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, sans-serif;
  gap: 16px;
}
.lamp-glow {
  position: absolute;
  top: 16px; left: 20px;
  width: 100px; height: 60px;
  border-radius: 50%;
  background: ${col.glow};
  filter: blur(22px);
  opacity: 0;
  transition: opacity 0.65s ease;
  pointer-events: none;
  z-index: 0;
}
.light-cone {
  position: absolute;
  top: 52px; left: 10px;
  width: 300px; height: 360px;
  background: linear-gradient(180deg, ${col.cone} 0%, ${col.coneEdge} 100%);
  clip-path: polygon(38% 0%, 62% 0%, 100% 100%, 0% 100%);
  opacity: 0;
  transition: opacity 0.7s ease;
  pointer-events: none;
  z-index: 0;
}
.lamp-wrap { position: relative; width: 120px; flex-shrink: 0; z-index: 1; display: flex; flex-direction: column; align-items: center; }
.string-group { cursor: pointer; transition: transform 0.32s cubic-bezier(0.34,1.56,0.64,1); }
.string-group.pulling { transform: translateY(13px); transition: transform 0.18s ease-in; }
.pull-hint { font-size: 9px; color: #3d3d44; text-transform: uppercase; letter-spacing: 0.1em; text-align: center; margin: -4px 0 0; user-select: none; }
.login-wrap {
  flex: 1; min-width: 0; z-index: 1;
  opacity: 0.07;
  filter: blur(3px);
  transition: opacity 0.7s ease, filter 0.7s ease;
}
.login-wrap.lit { opacity: 1; filter: none; }
.login-card {
  background: rgba(18,18,24,0.88);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 22px 20px;
  backdrop-filter: blur(14px);
}
.login-card h2 { text-align: center; margin: 0 0 18px; font-size: 17px; font-weight: 700; color: #ececf4; }
.form-body { display: flex; flex-direction: column; gap: 10px; }
.field { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #242430; background: #0e0e14; color: #d8d8e8; font-size: 13px; outline: none; box-sizing: border-box; font-family: inherit; }
.field-wrap { position: relative; }
.field-wrap .field { padding-right: 36px; }
.eye-btn { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #555; cursor: pointer; font-size: 12px; }
.forgot { text-align: right; margin: 0 0 2px; font-size: 11px; color: #7b6ef6; cursor: pointer; }
.cta-btn { width: 100%; padding: 11px; border-radius: 9px; border: none; background: ${col.btnGrad}; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; letter-spacing: 0.06em; text-transform: uppercase; font-family: inherit; }
.or-row { display: flex; align-items: center; gap: 8px; }
.or-line { flex: 1; height: 1px; background: #222228; }
.or-text { font-size: 10px; color: #44444e; }
.google-btn { width: 100%; padding: 9px; border-radius: 9px; border: 1px solid #242430; background: #111118; color: #a0a0b0; font-size: 12px; cursor: pointer; font-family: inherit; }

/* lit state */
.lamp-scene.lit .lamp-glow { opacity: 1; }
.lamp-scene.lit .light-cone { opacity: 1; }
.lamp-scene.lit #shadeGlow { opacity: 0.7; }
.lamp-scene.lit .login-wrap { opacity: 1; filter: none; }
</style>

<script>
let isOn = false;
let pulling = false;

function toggleLamp() {
  if (pulling) return;
  pulling = true;
  const sg = document.getElementById('stringGroup');
  sg.classList.add('pulling');
  document.getElementById('pullHint').textContent = isOn ? 'Pull to on' : 'Pull to off';
  setTimeout(() => {
    sg.classList.remove('pulling');
    isOn = !isOn;
    pulling = false;
    const scene = document.getElementById('lampScene');
    const login = document.getElementById('loginWrap');
    const hint  = document.getElementById('pullHint');
    if (isOn) { scene.classList.add('lit'); login.classList.add('lit'); hint.textContent = 'Pull to off'; }
    else       { scene.classList.remove('lit'); login.classList.remove('lit'); hint.textContent = 'Pull to on'; }
  }, 220);
}
</script>`
      }
    }
  }
]
