import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
export type LampType = 'modern' | 'floor' | 'pendant' | 'lantern'
type LampColor = 'amber' | 'cool' | 'rose'
type Phase = 'off' | 'flicker' | 'on'

// ── Color palettes ────────────────────────────────────────────────────────────
const LAMP_COLORS: Record<LampColor, {
  beam: string; cone: string; mid: string; glow: string; spot: string; btnGrad: string
}> = {
  amber: { beam: '#f59e0b', cone: 'rgba(245,158,11,0.22)', mid: 'rgba(245,158,11,0.07)', glow: 'rgba(245,158,11,0.70)', spot: 'rgba(245,158,11,0.55)', btnGrad: 'linear-gradient(135deg,#7c3aed,#6d28d9)' },
  cool:  { beam: '#93c5fd', cone: 'rgba(147,197,253,0.20)', mid: 'rgba(147,197,253,0.06)', glow: 'rgba(147,197,253,0.65)', spot: 'rgba(147,197,253,0.50)', btnGrad: 'linear-gradient(135deg,#0ea5e9,#2563eb)' },
  rose:  { beam: '#f9a8d4', cone: 'rgba(249,168,212,0.22)', mid: 'rgba(249,168,212,0.07)', glow: 'rgba(249,168,212,0.68)', spot: 'rgba(249,168,212,0.52)', btnGrad: 'linear-gradient(135deg,#ec4899,#be185d)' },
}

// ── Keyframes ─────────────────────────────────────────────────────────────────
const KF = `
@keyframes ll-flicker {
  0%,100%{ opacity:0 } 10%{ opacity:.85 } 16%{ opacity:0 }
  30%{ opacity:1 } 36%{ opacity:.12 } 50%{ opacity:1 }
  56%{ opacity:.45 } 76%{ opacity:1 }
}
@keyframes ll-glow-pulse { 0%,100%{ opacity:.9 } 50%{ opacity:.55 } }
@keyframes ll-cone-pulse { 0%,100%{ opacity:1 }  50%{ opacity:.72 } }
@keyframes ll-swing {
  0%{ transform:rotate(0deg) } 18%{ transform:rotate(11deg) }
  36%{ transform:rotate(-7deg) } 54%{ transform:rotate(4deg) }
  72%{ transform:rotate(-2deg) } 88%{ transform:rotate(1deg) }
  100%{ transform:rotate(0deg) }
}
`

// ── Lamp-source pixel positions (within outer container at 440px min-height) ──
// Used to position the radial light gradient precisely at the bulb/shade.
// lampColW=220, padding=20. SVG centered in 400px inner height.
// Formula: padTop(20) + shadeViewboxY * (svgRenderH / viewboxH)
const LIGHT_SRC: Record<LampType, { x: number; y: number }> = {
  modern:  { x: 128, y: 104 },  // disc shade bottom @ vb y=88  (380/400 scale)
  floor:   { x: 128, y: 140 },  // cone opening     @ vb y=132 (380/420 scale)
  pendant: { x: 128, y: 184 },  // bulb center      @ vb y=163 (380/380 scale)
  lantern: { x: 128, y: 172 },  // lantern center   @ vb y=160 (380/400 scale)
}

// ── SVG props ─────────────────────────────────────────────────────────────────
interface SVGProps {
  phase: Phase
  col: (typeof LAMP_COLORS)[LampColor]
  pulling: boolean
  swinging: boolean
  onPull: () => void
}

// ── Lamp colours (brighter for dark-scene visibility) ─────────────────────────
const LC = {
  shade:   '#303040',
  shadeSt: '#505060',
  body:    '#262634',
  bodySt:  '#404050',
  pole:    '#1e1e2a',
  poleSt:  '#343444',
  base:    '#2a2a38',
  baseSt:  '#424254',
  hi:      'rgba(160,160,200,0.18)', // highlight arc on curved surfaces
}

// ── Modern lamp (wide disc shade) ─────────────────────────────────────────────
function ModernLamp({ phase, col, pulling, onPull }: SVGProps) {
  const lit = phase !== 'off'
  const flicker = phase === 'flicker'
  const dy = pulling ? 24 : 0
  return (
    <svg viewBox="0 0 200 400" width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }}>
      {/* shade top ellipse */}
      <ellipse cx="100" cy="70" rx="82" ry="12" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5" />
      {/* metallic highlight arc */}
      <ellipse cx="100" cy="65" rx="72" ry="5" fill="none" stroke={LC.hi} strokeWidth="1.5" />
      {/* shade body */}
      <path d="M20 66 L180 66 L168 87 L32 87 Z" fill={LC.body} stroke={LC.bodySt} strokeWidth="1" />
      {/* inner rim */}
      <ellipse cx="100" cy="87" rx="68" ry="7" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1" />

      {/* ── glow + cone rendered inside SVG at exact shade position ── */}
      {/* ambient spot */}
      <ellipse cx="100" cy="87" rx="90" ry="50"
        fill={col.spot}
        opacity={lit ? (flicker ? undefined : 1) : 0}
        style={flicker ? { animation: 'll-flicker 0.65s ease-out forwards', filter: 'blur(14px)' } : { transition: 'opacity 0.5s', filter: 'blur(14px)' }}
      />
      {/* light cone */}
      <polygon points="32,87 168,87 460,700 -260,700"
        fill={col.cone}
        opacity={lit ? (flicker ? undefined : 1) : 0}
        style={flicker ? { animation: 'll-flicker 0.65s ease-out forwards' } : { transition: 'opacity 0.6s' }}
      />
      {/* shade underside active glow */}
      <ellipse cx="100" cy="87" rx="60" ry="6"
        fill={col.beam}
        opacity={lit ? (flicker ? undefined : 0.7) : 0}
        style={flicker ? { animation: 'll-flicker 0.65s ease-out forwards' } : { transition: 'opacity 0.4s' }}
      />

      {/* pole */}
      <rect x="97.5" y="87" width="5" height="242" rx="2.5" fill={LC.pole} stroke={LC.poleSt} strokeWidth="1" />
      {/* pole highlight */}
      <rect x="98" y="87" width="2" height="242" rx="1" fill="rgba(180,180,220,0.06)" />

      {/* base */}
      <rect x="38" y="329" width="124" height="13" rx="6" fill={LC.base} stroke={LC.baseSt} strokeWidth="1.5" />
      <ellipse cx="100" cy="329" rx="62" ry="9" fill={LC.base} stroke={LC.baseSt} strokeWidth="1" />
      <ellipse cx="100" cy="342" rx="62" ry="8" fill={LC.pole} stroke={LC.poleSt} strokeWidth="1" />
      <ellipse cx="100" cy="337" rx="52" ry="3" fill="none" stroke={LC.hi} strokeWidth="1" />

      {/* string + bead */}
      <g style={{ transform: `translateY(${dy}px)`, transition: pulling ? 'transform .17s ease-in' : 'transform .38s cubic-bezier(.34,1.56,.64,1)', cursor: 'pointer', transformOrigin: '100px 87px' }} onClick={onPull}>
        <rect x="86" y="87" width="28" height="94" fill="transparent" />
        <line x1="100" y1="87" x2="100" y2="154" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="100" y1="87" x2="100" y2="154" stroke="rgba(255,255,255,0.08)" strokeWidth="5" strokeLinecap="round" />
        <circle cx="100" cy="167" r="11" fill="#c8a84b" stroke="#e8c86a" strokeWidth="2" />
        <circle cx="100" cy="167" r="5" fill="#f0d870" opacity="0.65" />
        <circle cx="96" cy="163" r="2.5" fill="rgba(255,255,200,0.5)" />
      </g>
    </svg>
  )
}

// ── Floor lamp (conical shade) ────────────────────────────────────────────────
function FloorLamp({ phase, col, pulling, onPull }: SVGProps) {
  const lit = phase !== 'off'
  const flicker = phase === 'flicker'
  const dy = pulling ? 24 : 0
  return (
    <svg viewBox="0 0 200 420" width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }}>
      {/* cone top cap */}
      <ellipse cx="100" cy="56" rx="20" ry="7" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5" />
      <ellipse cx="100" cy="54" rx="14" ry="3" fill="none" stroke={LC.hi} strokeWidth="1" />
      {/* cone body */}
      <path d="M80 56 L120 56 L178 132 L22 132 Z" fill={LC.body} stroke={LC.bodySt} strokeWidth="1" />
      {/* cone body left highlight */}
      <path d="M80 56 L100 56 L80 132 L36 132 Z" fill="rgba(255,255,255,0.02)" />
      {/* cone rim */}
      <ellipse cx="100" cy="132" rx="78" ry="12" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5" />

      {/* ── glow + cone at shade opening ── */}
      <ellipse cx="100" cy="132" rx="85" ry="44"
        fill={col.spot}
        opacity={lit ? (flicker ? undefined : 1) : 0}
        style={flicker ? { animation: 'll-flicker 0.65s ease-out forwards', filter: 'blur(16px)' } : { transition: 'opacity 0.5s', filter: 'blur(16px)' }}
      />
      <polygon points="22,132 178,132 480,700 -280,700"
        fill={col.cone}
        opacity={lit ? (flicker ? undefined : 1) : 0}
        style={flicker ? { animation: 'll-flicker 0.65s ease-out forwards' } : { transition: 'opacity 0.6s' }}
      />
      <ellipse cx="100" cy="132" rx="68" ry="7"
        fill={col.beam}
        opacity={lit ? (flicker ? undefined : 0.65) : 0}
        style={flicker ? { animation: 'll-flicker 0.65s ease-out forwards' } : { transition: 'opacity 0.4s' }}
      />

      {/* pole */}
      <rect x="97.5" y="132" width="5" height="218" rx="2.5" fill={LC.pole} stroke={LC.poleSt} strokeWidth="1" />
      <rect x="98" y="132" width="2" height="218" rx="1" fill="rgba(180,180,220,0.06)" />
      {/* base */}
      <rect x="38" y="350" width="124" height="13" rx="6" fill={LC.base} stroke={LC.baseSt} strokeWidth="1.5" />
      <ellipse cx="100" cy="350" rx="62" ry="9" fill={LC.base} stroke={LC.baseSt} strokeWidth="1" />
      <ellipse cx="100" cy="363" rx="62" ry="8" fill={LC.pole} stroke={LC.poleSt} strokeWidth="1" />

      {/* string + bead */}
      <g style={{ transform: `translateY(${dy}px)`, transition: pulling ? 'transform .17s ease-in' : 'transform .38s cubic-bezier(.34,1.56,.64,1)', cursor: 'pointer', transformOrigin: '100px 132px' }} onClick={onPull}>
        <rect x="86" y="132" width="28" height="94" fill="transparent" />
        <line x1="100" y1="132" x2="100" y2="198" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="100" y1="132" x2="100" y2="198" stroke="rgba(255,255,255,0.08)" strokeWidth="5" strokeLinecap="round" />
        <circle cx="100" cy="211" r="11" fill="#c8a84b" stroke="#e8c86a" strokeWidth="2" />
        <circle cx="100" cy="211" r="5" fill="#f0d870" opacity="0.65" />
        <circle cx="96" cy="207" r="2.5" fill="rgba(255,255,200,0.5)" />
      </g>
    </svg>
  )
}

// ── Pendant lamp (Edison bulb) ────────────────────────────────────────────────
function PendantLamp({ phase, col, pulling, swinging, onPull }: SVGProps) {
  const lit = phase !== 'off'
  const flicker = phase === 'flicker'
  const dy = pulling ? 24 : 0
  return (
    <svg viewBox="0 0 200 380" width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }}>
      {/* ceiling plate */}
      <ellipse cx="100" cy="14" rx="32" ry="8" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5" />
      <rect x="68" y="6" width="64" height="14" rx="5" fill={LC.body} stroke={LC.bodySt} strokeWidth="1" />
      <ellipse cx="100" cy="11" rx="26" ry="3" fill="none" stroke={LC.hi} strokeWidth="1" />

      {/* swinging group */}
      <g style={{ transformOrigin: '100px 14px', animation: swinging ? 'll-swing 1.1s ease-out forwards' : 'none' }}>
        {/* power cord */}
        <line x1="100" y1="14" x2="100" y2="120" stroke="#2a2a36" strokeWidth="5" strokeLinecap="round" />
        <line x1="100" y1="14" x2="100" y2="120" stroke="#454556" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="100" y1="14" x2="100" y2="120" stroke="rgba(200,200,255,0.06)" strokeWidth="1" strokeLinecap="round" />

        {/* socket */}
        <rect x="88" y="116" width="24" height="18" rx="4" fill={LC.body} stroke={LC.bodySt} strokeWidth="1.5" />
        <rect x="91" y="118" width="4" height="14" rx="2" fill={LC.pole} />
        <rect x="105" y="118" width="4" height="14" rx="2" fill={LC.pole} />

        {/* ── bulb glow + cone exactly at bulb position ── */}
        <ellipse cx="100" cy="163" rx="80" ry="70"
          fill={col.spot}
          opacity={lit ? (flicker ? undefined : 0.9) : 0}
          style={flicker ? { animation: 'll-flicker 0.65s ease-out forwards', filter: 'blur(18px)' } : { transition: 'opacity 0.5s', filter: 'blur(18px)' }}
        />
        <polygon points="76,134 124,134 400,700 -200,700"
          fill={col.cone}
          opacity={lit ? (flicker ? undefined : 1) : 0}
          style={flicker ? { animation: 'll-flicker 0.65s ease-out forwards' } : { transition: 'opacity 0.6s' }}
        />

        {/* bulb glass */}
        <path d="M76 134 Q76 185 100 196 Q124 185 124 134 Z"
          fill={lit ? col.beam : LC.body}
          opacity={lit ? (flicker ? undefined : 0.5) : 0.9}
          style={flicker ? { animation: 'll-flicker 0.65s ease-out forwards' } : { transition: 'opacity 0.6s, fill 0.6s' }}
        />
        {/* glass outline */}
        <path d="M76 134 Q76 185 100 196 Q124 185 124 134 Z" fill="none" stroke={LC.bodySt} strokeWidth="1.5" />
        {/* glass highlight */}
        <path d="M82 138 Q80 165 84 185" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeLinecap="round" />

        {/* filament */}
        <g opacity={lit ? 0.95 : 0.2} style={{ transition: 'opacity 0.5s' }}>
          <path d="M93 152 Q100 146 107 152 Q112 158 107 164 Q100 168 93 164 Q88 158 93 152"
            fill="none" stroke={col.beam} strokeWidth="1.8" strokeLinecap="round" />
          <line x1="100" y1="152" x2="100" y2="138" stroke={col.beam} strokeWidth="1.8" strokeLinecap="round" />
          <line x1="100" y1="164" x2="100" y2="176" stroke={col.beam} strokeWidth="1.8" strokeLinecap="round" />
          {lit && <circle cx="100" cy="158" r="3" fill={col.beam} opacity="0.8" />}
        </g>

        {/* bulb base / screw */}
        <ellipse cx="100" cy="196" rx="24" ry="7" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5" />
        <rect x="88" y="196" width="24" height="10" rx="3" fill={LC.body} />
        <line x1="88" y1="199" x2="112" y2="199" stroke={LC.shadeSt} strokeWidth="1" />
        <line x1="88" y1="203" x2="112" y2="203" stroke={LC.shadeSt} strokeWidth="1" />
        <ellipse cx="100" cy="206" rx="18" ry="5" fill={LC.pole} stroke={LC.poleSt} strokeWidth="1" />

        {/* pull cord */}
        <g style={{ transform: `translateY(${dy}px)`, transition: pulling ? 'transform .17s ease-in' : 'transform .38s cubic-bezier(.34,1.56,.64,1)', cursor: 'pointer', transformOrigin: '100px 206px' }} onClick={onPull}>
          <rect x="86" y="206" width="28" height="94" fill="transparent" />
          <line x1="100" y1="206" x2="100" y2="266" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="100" y1="206" x2="100" y2="266" stroke="rgba(255,255,255,0.08)" strokeWidth="5" strokeLinecap="round" />
          <circle cx="100" cy="279" r="11" fill="#c8a84b" stroke="#e8c86a" strokeWidth="2" />
          <circle cx="100" cy="279" r="5" fill="#f0d870" opacity="0.65" />
          <circle cx="96" cy="275" r="2.5" fill="rgba(255,255,200,0.5)" />
        </g>
      </g>
    </svg>
  )
}

// ── Lantern lamp ──────────────────────────────────────────────────────────────
function LanternLamp({ phase, col, pulling, swinging, onPull }: SVGProps) {
  const lit = phase !== 'off'
  const flicker = phase === 'flicker'
  const dy = pulling ? 24 : 0
  const links = [0, 14, 28, 42, 56]
  return (
    <svg viewBox="0 0 200 400" width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }}>
      {/* ceiling hook */}
      <rect x="84" y="4" width="32" height="12" rx="5" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5" />
      <ellipse cx="100" cy="9" rx="12" ry="3" fill="none" stroke={LC.hi} strokeWidth="1" />

      <g style={{ transformOrigin: '100px 10px', animation: swinging ? 'll-swing 1.1s ease-out forwards' : 'none' }}>
        {/* chain links */}
        {links.map(y => (
          <ellipse key={y} cx="100" cy={16 + y} rx="5" ry="8" fill="none" stroke={LC.shadeSt} strokeWidth="2" />
        ))}

        {/* lantern cap */}
        <path d="M70 86 L130 86 L122 100 L78 100 Z" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5" />
        <ellipse cx="100" cy="86" rx="30" ry="7" fill={LC.body} stroke={LC.bodySt} strokeWidth="1.5" />
        <ellipse cx="100" cy="84" rx="24" ry="3" fill="none" stroke={LC.hi} strokeWidth="1" />

        {/* corner frame posts */}
        <line x1="72" y1="100" x2="68" y2="218" stroke={LC.shade} strokeWidth="3.5" strokeLinecap="round" />
        <line x1="128" y1="100" x2="132" y2="218" stroke={LC.shade} strokeWidth="3.5" strokeLinecap="round" />
        {/* highlight on posts */}
        <line x1="72.5" y1="100" x2="69" y2="218" stroke={LC.hi} strokeWidth="1" strokeLinecap="round" />

        {/* glass panels */}
        <rect x="68" y="100" width="64" height="118" rx="2"
          fill={lit ? col.beam : '#0d0d18'}
          opacity={lit ? (flicker ? undefined : 0.22) : 0.7}
          style={flicker ? { animation: 'll-flicker 0.65s ease-out forwards' } : { transition: 'fill .6s, opacity .6s' }}
        />
        {/* panel dividers */}
        <line x1="68" y1="139" x2="132" y2="139" stroke={LC.bodySt} strokeWidth="2" />
        <line x1="68" y1="179" x2="132" y2="179" stroke={LC.bodySt} strokeWidth="2" />
        <rect x="67" y="100" width="5" height="118" rx="2" fill={LC.body} />
        <rect x="128" y="100" width="5" height="118" rx="2" fill={LC.body} />
        {/* glass reflection */}
        <rect x="71" y="104" width="2" height="110" rx="1" fill="rgba(255,255,255,0.06)" />

        {/* ── glow + cone at lantern center ── */}
        <ellipse cx="100" cy="159" rx="80" ry="75"
          fill={col.spot}
          opacity={lit ? (flicker ? undefined : 0.9) : 0}
          style={flicker ? { animation: 'll-flicker 0.65s ease-out forwards', filter: 'blur(20px)' } : { transition: 'opacity 0.5s', filter: 'blur(20px)' }}
        />
        <polygon points="68,218 132,218 480,700 -280,700"
          fill={col.cone}
          opacity={lit ? (flicker ? undefined : 1) : 0}
          style={flicker ? { animation: 'll-flicker 0.65s ease-out forwards' } : { transition: 'opacity 0.6s' }}
        />

        {/* inner flame */}
        {lit && (
          <ellipse cx="100" cy="160" rx="18" ry="28"
            fill={col.beam}
            opacity={flicker ? undefined : 0.4}
            style={flicker ? { animation: 'll-flicker 0.65s ease-out forwards', filter: 'blur(5px)' } : { filter: 'blur(5px)', transition: 'opacity 0.5s' }}
          />
        )}

        {/* lantern bottom cap */}
        <path d="M68 218 L132 218 L122 234 L78 234 Z" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5" />
        <ellipse cx="100" cy="218" rx="32" ry="7" fill={LC.body} stroke={LC.bodySt} strokeWidth="1.5" />
        <path d="M94 234 L100 258 L106 234 Z" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5" />

        {/* pull ring + string */}
        <g style={{ transform: `translateY(${dy}px)`, transition: pulling ? 'transform .17s ease-in' : 'transform .38s cubic-bezier(.34,1.56,.64,1)', cursor: 'pointer', transformOrigin: '100px 258px' }} onClick={onPull}>
          <rect x="86" y="258" width="28" height="88" fill="transparent" />
          <line x1="100" y1="258" x2="100" y2="318" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="100" y1="258" x2="100" y2="318" stroke="rgba(255,255,255,0.08)" strokeWidth="5" strokeLinecap="round" />
          <circle cx="100" cy="331" r="11" fill="#c8a84b" stroke="#e8c86a" strokeWidth="2" />
          <circle cx="100" cy="331" r="5" fill="#f0d870" opacity="0.65" />
          <circle cx="96" cy="327" r="2.5" fill="rgba(255,255,200,0.5)" />
        </g>
      </g>
    </svg>
  )
}

// ── Public props ──────────────────────────────────────────────────────────────
export type LampLoginProps = {
  lampType?: LampType
  lampColor?: LampColor
  title?: string
  buttonLabel?: string
  showGoogle?: boolean
  compact?: boolean
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LampLogin({
  lampType = 'modern',
  lampColor = 'amber',
  title = 'Welcome Back',
  buttonLabel = 'Sign In',
  showGoogle = true,
  compact = false,
}: LampLoginProps) {
  const [phase, setPhase] = useState<Phase>('off')
  const [pulling, setPulling] = useState(false)
  const [swinging, setSwinging] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const col = LAMP_COLORS[lampColor]
  const isOn = phase === 'on'
  const isFlicker = phase === 'flicker'
  const lit = phase !== 'off'
  const src = LIGHT_SRC[lampType]

  function pull() {
    if (pulling) return
    setPulling(true)
    if (lampType === 'pendant' || lampType === 'lantern') {
      setSwinging(true)
      setTimeout(() => setSwinging(false), 1200)
    }
    setTimeout(() => {
      setPulling(false)
      if (phase === 'on') {
        setPhase('off')
      } else {
        setPhase('flicker')
        setTimeout(() => setPhase('on'), 680)
      }
    }, 220)
  }

  const lampColW = compact ? 150 : 215

  const LampSVG = lampType === 'floor' ? FloorLamp
    : lampType === 'pendant' ? PendantLamp
    : lampType === 'lantern' ? LanternLamp
    : ModernLamp

  // ── Form card styles that react to lamp direction ─────────────────────────
  // Lamp is LEFT of form → light hits the LEFT face of the form card
  const formBoxShadow = isOn
    ? `-14px 0 50px ${col.glow}45, 0 8px 32px rgba(0,0,0,0.6)`
    : '0 4px 24px rgba(0,0,0,0.5)'
  const formBg = isOn
    ? `linear-gradient(108deg, ${col.mid} 0%, rgba(13,13,20,0.94) 55%)`
    : 'rgba(13,13,20,0.92)'
  const formBorderL = isOn ? `2px solid ${col.beam}55` : '1px solid rgba(255,255,255,0.06)'
  const formBorderRest = isOn ? `1px solid ${col.beam}22` : '1px solid rgba(255,255,255,0.06)'

  return (
    <>
      <style>{KF}</style>
      <div style={{
        position: 'relative',
        background: 'linear-gradient(155deg, #0f0e14 0%, #08080b 55%, #060609 100%)',
        borderRadius: 16,
        overflow: 'hidden',
        width: '100%',
        minHeight: compact ? 200 : 440,
        display: 'flex',
        alignItems: 'center',
        padding: compact ? '12px 10px' : '20px 16px',
        boxSizing: 'border-box',
        fontFamily: 'system-ui,-apple-system,sans-serif',
        gap: compact ? 14 : 36,
      }}>

        {/* ── Scene-wide radial light from lamp source (behind everything) ── */}
        {/* This overlay sits at z=0 covering the whole scene */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: [
            // Bright spot at bulb/shade
            `radial-gradient(ellipse 12% 9% at ${src.x}px ${src.y}px, ${col.spot} 0%, transparent 100%)`,
            // Wide ambient cone
            `radial-gradient(ellipse 72% 88% at ${src.x}px ${src.y}px, ${col.cone} 0%, transparent 100%)`,
            // Floor pool of light
            `radial-gradient(ellipse 65% 12% at ${src.x}px 96%, ${col.mid} 0%, transparent 100%)`,
          ].join(', '),
          opacity: lit ? (isFlicker ? undefined : 1) : 0,
          animation: isOn ? 'll-cone-pulse 3.2s ease-in-out infinite' : (isFlicker ? 'll-flicker 0.65s ease-out forwards' : 'none'),
          transition: isFlicker ? 'none' : 'opacity 0.6s ease',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* ── Lamp column ── */}
        <div style={{
          position: 'relative',
          width: lampColW,
          flexShrink: 0,
          alignSelf: 'stretch',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ width: '100%', height: compact ? 190 : 378 }}>
            <LampSVG phase={phase} col={col} pulling={pulling} swinging={swinging} onPull={pull} />
          </div>
          {!compact && (
            <p style={{
              fontSize: 9, color: '#3a3a48', textTransform: 'uppercase',
              letterSpacing: '0.13em', textAlign: 'center', marginTop: 5, userSelect: 'none',
            }}>
              {isOn ? 'Pull to switch off' : 'Pull string to light'}
            </p>
          )}
        </div>

        {/* ── Login form ── */}
        <div style={{
          flex: '0 0 auto',
          width: compact ? 160 : 188,
          opacity: isOn ? 1 : (isFlicker ? undefined : 0.05),
          filter: isOn ? 'none' : (isFlicker ? undefined : 'blur(5px)'),
          animation: isFlicker ? 'll-flicker 0.65s ease-out forwards' : 'none',
          transition: isFlicker ? 'none' : 'opacity 0.75s ease, filter 0.75s ease',
          zIndex: 1,
          position: 'relative',
        }}>
          <div style={{
            position: 'relative',
            background: formBg,
            borderTop: formBorderRest,
            borderRight: formBorderRest,
            borderBottom: formBorderRest,
            borderLeft: formBorderL,
            borderRadius: 11,
            padding: compact ? '11px 11px' : '18px 15px',
            backdropFilter: 'blur(18px)',
            boxShadow: formBoxShadow,
            transition: 'box-shadow 0.7s ease, border-color 0.7s ease, background 0.7s ease',
          }}>
            {/* left-face light streak */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, bottom: 0, width: '55%',
              background: `linear-gradient(to right, ${col.mid}, transparent)`,
              borderRadius: '10px 0 0 10px',
              opacity: isOn ? 1 : 0,
              transition: 'opacity 0.7s',
              pointerEvents: 'none',
            }} />

            <h2 style={{
              position: 'relative',
              textAlign: 'center',
              margin: `0 0 ${compact ? 10 : 14}px`,
              fontSize: compact ? 12 : 15,
              fontWeight: 700,
              color: isOn ? '#fff' : '#d8d8e8',
              letterSpacing: '-0.015em',
              textShadow: isOn ? `0 0 24px ${col.beam}70` : 'none',
              transition: 'color 0.6s, text-shadow 0.6s',
            }}>
              {title}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 6 : 8, position: 'relative' }}>
              <input readOnly placeholder="Email" type="email" style={fld(compact, col, isOn)} />

              <div style={{ position: 'relative' }}>
                <input readOnly placeholder="Password" type={showPass ? 'text' : 'password'}
                  style={{ ...fld(compact, col, isOn), paddingRight: 32 }} />
                <button onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 10, lineHeight: 1, padding: 2 }}>
                  {showPass ? '◉' : '◎'}
                </button>
              </div>

              {!compact && (
                <p style={{ textAlign: 'right', margin: '0', fontSize: 10, color: '#7b6ef6', cursor: 'pointer' }}>
                  Forgot?
                </p>
              )}

              <button style={{
                width: '100%', padding: compact ? '7px' : '9px',
                borderRadius: 7, border: 'none',
                background: isOn ? col.btnGrad : 'rgba(80,60,120,0.4)',
                color: isOn ? '#fff' : '#7a7a8a',
                fontSize: compact ? 9 : 11, fontWeight: 700,
                cursor: isOn ? 'pointer' : 'default',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                transition: 'background 0.6s, color 0.6s',
              }}>
                {buttonLabel}
              </button>

              {showGoogle && !compact && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ flex: 1, height: 1, background: '#1a1a28' }} />
                    <span style={{ fontSize: 8, color: '#353546' }}>or</span>
                    <div style={{ flex: 1, height: 1, background: '#1a1a28' }} />
                  </div>
                  <button style={{
                    width: '100%', padding: '7px', borderRadius: 7,
                    border: isOn ? `1px solid ${col.beam}18` : '1px solid #1c1c2c',
                    background: isOn ? `rgba(10,10,20,0.9)` : '#0a0a12',
                    color: isOn ? '#b0b0c0' : '#606070',
                    fontSize: 10, cursor: isOn ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    transition: 'border-color 0.6s, color 0.6s',
                  }}>
                    <GoogleIcon />
                    Google
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fld(compact: boolean, col: (typeof LAMP_COLORS)[LampColor], isOn: boolean): React.CSSProperties {
  return {
    width: '100%', padding: compact ? '6px 8px' : '8px 10px',
    borderRadius: 6,
    border: isOn ? `1px solid ${col.beam}25` : '1px solid #1c1c2c',
    background: isOn ? 'rgba(8,8,14,0.95)' : '#08080e',
    color: '#ccccd8', fontSize: compact ? 9 : 11,
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.6s',
  }
}

function GoogleIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
