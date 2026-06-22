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
        curveFormulaJS = `const zoom = (time * 0.01) % 1.0;
      const th = (theta % (Math.PI * 4));
      const scaleFactor = Math.exp(-0.15 * zoom * Math.PI * 2);
      const r = Math.exp(0.15 * th) * 0.15 * scaleFactor * breath;
      x = r * Math.cos(theta + zoom * Math.PI * 2);
      y = r * Math.sin(theta + zoom * Math.PI * 2);`
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
  }
]
