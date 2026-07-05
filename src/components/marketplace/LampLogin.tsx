import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
export type LampType = 'modern' | 'floor' | 'pendant' | 'lantern'
type LampColor = 'amber' | 'cool' | 'rose'
type Phase = 'off' | 'flicker' | 'on'

// ── Color palettes ────────────────────────────────────────────────────────────
const LAMP_COLORS: Record<LampColor, {
  beam: string; cone: string; mid: string; glow: string; spot: string; btnGrad: string
}> = {
  amber: { beam: '#f59e0b', cone: 'rgba(245,158,11,0.20)', mid: 'rgba(245,158,11,0.07)', glow: 'rgba(245,158,11,0.70)', spot: 'rgba(245,158,11,0.50)', btnGrad: 'linear-gradient(135deg,#7c3aed,#6d28d9)' },
  cool:  { beam: '#93c5fd', cone: 'rgba(147,197,253,0.18)', mid: 'rgba(147,197,253,0.06)', glow: 'rgba(147,197,253,0.65)', spot: 'rgba(147,197,253,0.45)', btnGrad: 'linear-gradient(135deg,#0ea5e9,#2563eb)' },
  rose:  { beam: '#f9a8d4', cone: 'rgba(249,168,212,0.20)', mid: 'rgba(249,168,212,0.07)', glow: 'rgba(249,168,212,0.65)', spot: 'rgba(249,168,212,0.48)', btnGrad: 'linear-gradient(135deg,#ec4899,#be185d)' },
}

// ── Keyframes ─────────────────────────────────────────────────────────────────
const KF = `
@keyframes ll-flicker {
  0%,100%{ opacity:0 } 10%{ opacity:.85 } 16%{ opacity:0 }
  30%{ opacity:1 } 36%{ opacity:.12 } 50%{ opacity:1 }
  56%{ opacity:.45 } 76%{ opacity:1 }
}
@keyframes ll-cone-pulse { 0%,100%{ opacity:1 } 50%{ opacity:.72 } }
@keyframes ll-swing {
  0%{ transform:rotate(0deg) } 18%{ transform:rotate(11deg) }
  36%{ transform:rotate(-7deg) } 54%{ transform:rotate(4deg) }
  72%{ transform:rotate(-2deg) } 88%{ transform:rotate(1deg) }
  100%{ transform:rotate(0deg) }
}
@keyframes ll-bead-hint {
  0%,100%{ transform:translateY(0) } 50%{ transform:translateY(6px) }
}
`

// ── Light-source % positions for full-mode radial gradient ────────────────────
// Lamp is at left:50% (centered). y% = shadeViewboxY / lampSvgHeight, scaled to container minHeight=560.
const LIGHT_PCT: Record<LampType, { x: string; y: string }> = {
  modern:  { x: '50%', y: '18%' },  // shade bottom vb y=88,  SVG 460px, container 560
  floor:   { x: '50%', y: '25%' },  // cone opening vb y=132, SVG 460px, container 560
  pendant: { x: '50%', y: '36%' },  // bulb center  vb y=163, SVG 460px, container 560
  lantern: { x: '50%', y: '33%' },  // lantern mid  vb y=160, SVG 460px, container 560
}

// ── Pixel positions for compact-mode (flex layout, old coords) ────────────────
const LIGHT_SRC: Record<LampType, { x: number; y: number }> = {
  modern:  { x: 93, y: 64 },
  floor:   { x: 93, y: 86 },
  pendant: { x: 93, y: 112 },
  lantern: { x: 93, y: 105 },
}

// ── SVG props ─────────────────────────────────────────────────────────────────
interface SVGProps {
  phase: Phase
  col: (typeof LAMP_COLORS)[LampColor]
  pulling: boolean
  swinging: boolean
  onPull: () => void
}

// ── Lamp colours ──────────────────────────────────────────────────────────────
const LC = {
  shade:   '#303040',
  shadeSt: '#505060',
  body:    '#262634',
  bodySt:  '#404050',
  pole:    '#1e1e2a',
  poleSt:  '#343444',
  base:    '#2a2a38',
  baseSt:  '#424254',
  hi:      'rgba(160,160,200,0.18)',
}

// helper: body group style (fades in when lamp is lit, flickers on transition)
function bodyStyle(phase: Phase): React.CSSProperties {
  const lit = phase !== 'off'
  const flicker = phase === 'flicker'
  return {
    opacity: flicker ? undefined : (lit ? 1 : 0),
    transition: flicker ? 'none' : 'opacity 0.85s ease',
    animation: flicker ? 'll-flicker 0.65s ease-out forwards' : 'none',
  }
}

// ── Modern lamp ───────────────────────────────────────────────────────────────
function ModernLamp({ phase, col, pulling, onPull }: SVGProps) {
  const lit = phase !== 'off'
  const flicker = phase === 'flicker'
  const dy = pulling ? 24 : 0
  return (
    <svg viewBox="0 0 200 400" width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }}>
      {/* BODY — hidden when off */}
      <g style={bodyStyle(phase)}>
        <ellipse cx="100" cy="70" rx="82" ry="12" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5" />
        <ellipse cx="100" cy="65" rx="72" ry="5" fill="none" stroke={LC.hi} strokeWidth="1.5" />
        <path d="M20 66 L180 66 L168 87 L32 87 Z" fill={LC.body} stroke={LC.bodySt} strokeWidth="1" />
        <ellipse cx="100" cy="87" rx="68" ry="7" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1" />
        {/* glow + cone at shade opening */}
        <ellipse cx="100" cy="87" rx="100" ry="55" fill={col.spot}
          opacity={flicker ? undefined : 1}
          style={{ filter: 'blur(16px)', animation: flicker ? 'll-flicker 0.65s ease-out forwards' : 'none' }} />
        <polygon points="32,87 168,87 460,700 -260,700" fill={col.cone}
          opacity={flicker ? undefined : 1}
          style={{ animation: flicker ? 'll-flicker 0.65s ease-out forwards' : 'none' }} />
        <ellipse cx="100" cy="87" rx="60" ry="6" fill={col.beam}
          opacity={flicker ? undefined : 0.7}
          style={{ animation: flicker ? 'll-flicker 0.65s ease-out forwards' : 'none' }} />
        {/* pole */}
        <rect x="97.5" y="87" width="5" height="242" rx="2.5" fill={LC.pole} stroke={LC.poleSt} strokeWidth="1" />
        <rect x="98" y="87" width="2" height="242" rx="1" fill="rgba(180,180,220,0.06)" />
        {/* base */}
        <rect x="38" y="329" width="124" height="13" rx="6" fill={LC.base} stroke={LC.baseSt} strokeWidth="1.5" />
        <ellipse cx="100" cy="329" rx="62" ry="9" fill={LC.base} stroke={LC.baseSt} strokeWidth="1" />
        <ellipse cx="100" cy="342" rx="62" ry="8" fill={LC.pole} stroke={LC.poleSt} strokeWidth="1" />
        <ellipse cx="100" cy="337" rx="52" ry="3" fill="none" stroke={LC.hi} strokeWidth="1" />
      </g>
      {/* STRING + BEAD — always visible */}
      <g style={{ transform: `translateY(${dy}px)`, transition: pulling ? 'transform .17s ease-in' : 'transform .38s cubic-bezier(.34,1.56,.64,1)', cursor: 'pointer', transformOrigin: '100px 87px' }} onClick={onPull}>
        <rect x="82" y="80" width="36" height="105" fill="transparent" />
        <line x1="100" y1="87" x2="100" y2="154" stroke={lit ? '#aaa' : '#555'} strokeWidth="2.5" strokeLinecap="round" style={{ transition: 'stroke 0.6s' }} />
        <circle cx="100" cy="167" r="12" fill="#c8a84b" stroke="#e8c86a" strokeWidth="2"
          style={{ animation: lit ? 'none' : 'll-bead-hint 2.4s ease-in-out infinite' }} />
        <circle cx="100" cy="167" r="5.5" fill="#f0d870" opacity="0.65" />
        <circle cx="96" cy="163" r="2.5" fill="rgba(255,255,200,0.55)" />
      </g>
    </svg>
  )
}

// ── Floor lamp ────────────────────────────────────────────────────────────────
function FloorLamp({ phase, col, pulling, onPull }: SVGProps) {
  const lit = phase !== 'off'
  const flicker = phase === 'flicker'
  const dy = pulling ? 24 : 0
  return (
    <svg viewBox="0 0 200 420" width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }}>
      <g style={bodyStyle(phase)}>
        <ellipse cx="100" cy="56" rx="20" ry="7" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5" />
        <ellipse cx="100" cy="54" rx="14" ry="3" fill="none" stroke={LC.hi} strokeWidth="1" />
        <path d="M80 56 L120 56 L178 132 L22 132 Z" fill={LC.body} stroke={LC.bodySt} strokeWidth="1" />
        <ellipse cx="100" cy="132" rx="78" ry="12" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5" />
        {/* glow + cone */}
        <ellipse cx="100" cy="132" rx="95" ry="48" fill={col.spot}
          opacity={flicker ? undefined : 1}
          style={{ filter: 'blur(18px)', animation: flicker ? 'll-flicker 0.65s ease-out forwards' : 'none' }} />
        <polygon points="22,132 178,132 480,700 -280,700" fill={col.cone}
          opacity={flicker ? undefined : 1}
          style={{ animation: flicker ? 'll-flicker 0.65s ease-out forwards' : 'none' }} />
        <ellipse cx="100" cy="132" rx="68" ry="7" fill={col.beam}
          opacity={flicker ? undefined : 0.65}
          style={{ animation: flicker ? 'll-flicker 0.65s ease-out forwards' : 'none' }} />
        {/* pole + base */}
        <rect x="97.5" y="132" width="5" height="218" rx="2.5" fill={LC.pole} stroke={LC.poleSt} strokeWidth="1" />
        <rect x="38" y="350" width="124" height="13" rx="6" fill={LC.base} stroke={LC.baseSt} strokeWidth="1.5" />
        <ellipse cx="100" cy="350" rx="62" ry="9" fill={LC.base} stroke={LC.baseSt} strokeWidth="1" />
        <ellipse cx="100" cy="363" rx="62" ry="8" fill={LC.pole} stroke={LC.poleSt} strokeWidth="1" />
      </g>
      {/* STRING + BEAD */}
      <g style={{ transform: `translateY(${dy}px)`, transition: pulling ? 'transform .17s ease-in' : 'transform .38s cubic-bezier(.34,1.56,.64,1)', cursor: 'pointer', transformOrigin: '100px 132px' }} onClick={onPull}>
        <rect x="82" y="124" width="36" height="105" fill="transparent" />
        <line x1="100" y1="132" x2="100" y2="198" stroke={lit ? '#aaa' : '#555'} strokeWidth="2.5" strokeLinecap="round" style={{ transition: 'stroke 0.6s' }} />
        <circle cx="100" cy="211" r="12" fill="#c8a84b" stroke="#e8c86a" strokeWidth="2"
          style={{ animation: lit ? 'none' : 'll-bead-hint 2.4s ease-in-out infinite' }} />
        <circle cx="100" cy="211" r="5.5" fill="#f0d870" opacity="0.65" />
        <circle cx="96" cy="207" r="2.5" fill="rgba(255,255,200,0.55)" />
      </g>
    </svg>
  )
}

// ── Pendant lamp ──────────────────────────────────────────────────────────────
function PendantLamp({ phase, col, pulling, swinging, onPull }: SVGProps) {
  const lit = phase !== 'off'
  const flicker = phase === 'flicker'
  const dy = pulling ? 24 : 0
  return (
    <svg viewBox="0 0 200 380" width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }}>
      <g style={bodyStyle(phase)}>
        {/* ceiling plate */}
        <ellipse cx="100" cy="14" rx="32" ry="8" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5" />
        <rect x="68" y="6" width="64" height="14" rx="5" fill={LC.body} stroke={LC.bodySt} strokeWidth="1" />
        <ellipse cx="100" cy="11" rx="26" ry="3" fill="none" stroke={LC.hi} strokeWidth="1" />
        {/* swinging group */}
        <g style={{ transformOrigin: '100px 14px', animation: swinging ? 'll-swing 1.1s ease-out forwards' : 'none' }}>
          <line x1="100" y1="14" x2="100" y2="120" stroke="#2a2a36" strokeWidth="5" strokeLinecap="round" />
          <line x1="100" y1="14" x2="100" y2="120" stroke="#454556" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="88" y="116" width="24" height="18" rx="4" fill={LC.body} stroke={LC.bodySt} strokeWidth="1.5" />
          <rect x="91" y="118" width="4" height="14" rx="2" fill={LC.pole} />
          <rect x="105" y="118" width="4" height="14" rx="2" fill={LC.pole} />
          {/* glow + cone at bulb */}
          <ellipse cx="100" cy="163" rx="90" ry="75" fill={col.spot}
            opacity={flicker ? undefined : 0.9}
            style={{ filter: 'blur(20px)', animation: flicker ? 'll-flicker 0.65s ease-out forwards' : 'none' }} />
          <polygon points="76,134 124,134 400,700 -200,700" fill={col.cone}
            opacity={flicker ? undefined : 1}
            style={{ animation: flicker ? 'll-flicker 0.65s ease-out forwards' : 'none' }} />
          {/* bulb */}
          <path d="M76 134 Q76 185 100 196 Q124 185 124 134 Z"
            fill={lit ? col.beam : LC.body} opacity={lit ? (flicker ? undefined : 0.5) : 0.9}
            style={{ transition: 'fill 0.6s, opacity 0.6s', animation: flicker ? 'll-flicker 0.65s ease-out forwards' : 'none' }} />
          <path d="M76 134 Q76 185 100 196 Q124 185 124 134 Z" fill="none" stroke={LC.bodySt} strokeWidth="1.5" />
          <path d="M82 138 Q80 165 84 185" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeLinecap="round" />
          <g opacity={lit ? 0.95 : 0.2} style={{ transition: 'opacity 0.5s' }}>
            <path d="M93 152 Q100 146 107 152 Q112 158 107 164 Q100 168 93 164 Q88 158 93 152"
              fill="none" stroke={col.beam} strokeWidth="1.8" strokeLinecap="round" />
            <line x1="100" y1="152" x2="100" y2="138" stroke={col.beam} strokeWidth="1.8" strokeLinecap="round" />
            <line x1="100" y1="164" x2="100" y2="176" stroke={col.beam} strokeWidth="1.8" strokeLinecap="round" />
          </g>
          <ellipse cx="100" cy="196" rx="24" ry="7" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5" />
          <rect x="88" y="196" width="24" height="10" rx="3" fill={LC.body} />
          <line x1="88" y1="199" x2="112" y2="199" stroke={LC.shadeSt} strokeWidth="1" />
          <line x1="88" y1="203" x2="112" y2="203" stroke={LC.shadeSt} strokeWidth="1" />
          <ellipse cx="100" cy="206" rx="18" ry="5" fill={LC.pole} stroke={LC.poleSt} strokeWidth="1" />
        </g>
      </g>
      {/* STRING + BEAD — outside body group, always visible */}
      <g style={{ transform: `translateY(${dy}px)`, transition: pulling ? 'transform .17s ease-in' : 'transform .38s cubic-bezier(.34,1.56,.64,1)', cursor: 'pointer', transformOrigin: '100px 206px' }} onClick={onPull}>
        <rect x="82" y="198" width="36" height="100" fill="transparent" />
        <line x1="100" y1="206" x2="100" y2="266" stroke={lit ? '#aaa' : '#555'} strokeWidth="2.5" strokeLinecap="round" style={{ transition: 'stroke 0.6s' }} />
        <circle cx="100" cy="279" r="12" fill="#c8a84b" stroke="#e8c86a" strokeWidth="2"
          style={{ animation: lit ? 'none' : 'll-bead-hint 2.4s ease-in-out infinite' }} />
        <circle cx="100" cy="279" r="5.5" fill="#f0d870" opacity="0.65" />
        <circle cx="96" cy="275" r="2.5" fill="rgba(255,255,200,0.55)" />
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
      <g style={bodyStyle(phase)}>
        <rect x="84" y="4" width="32" height="12" rx="5" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5" />
        <g style={{ transformOrigin: '100px 10px', animation: swinging ? 'll-swing 1.1s ease-out forwards' : 'none' }}>
          {links.map(y => (
            <ellipse key={y} cx="100" cy={16 + y} rx="5" ry="8" fill="none" stroke={LC.shadeSt} strokeWidth="2" />
          ))}
          <path d="M70 86 L130 86 L122 100 L78 100 Z" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5" />
          <ellipse cx="100" cy="86" rx="30" ry="7" fill={LC.body} stroke={LC.bodySt} strokeWidth="1.5" />
          <ellipse cx="100" cy="84" rx="24" ry="3" fill="none" stroke={LC.hi} strokeWidth="1" />
          <line x1="72" y1="100" x2="68" y2="218" stroke={LC.shade} strokeWidth="3.5" strokeLinecap="round" />
          <line x1="128" y1="100" x2="132" y2="218" stroke={LC.shade} strokeWidth="3.5" strokeLinecap="round" />
          <rect x="68" y="100" width="64" height="118" rx="2"
            fill={lit ? col.beam : '#0d0d18'} opacity={lit ? (flicker ? undefined : 0.22) : 0.7}
            style={{ transition: 'fill .6s, opacity .6s', animation: flicker ? 'll-flicker 0.65s ease-out forwards' : 'none' }} />
          <line x1="68" y1="139" x2="132" y2="139" stroke={LC.bodySt} strokeWidth="2" />
          <line x1="68" y1="179" x2="132" y2="179" stroke={LC.bodySt} strokeWidth="2" />
          <rect x="67" y="100" width="5" height="118" rx="2" fill={LC.body} />
          <rect x="128" y="100" width="5" height="118" rx="2" fill={LC.body} />
          {/* glow + cone */}
          <ellipse cx="100" cy="159" rx="90" ry="80" fill={col.spot}
            opacity={flicker ? undefined : 0.9}
            style={{ filter: 'blur(22px)', animation: flicker ? 'll-flicker 0.65s ease-out forwards' : 'none' }} />
          <polygon points="68,218 132,218 480,700 -280,700" fill={col.cone}
            opacity={flicker ? undefined : 1}
            style={{ animation: flicker ? 'll-flicker 0.65s ease-out forwards' : 'none' }} />
          {lit && (
            <ellipse cx="100" cy="160" rx="18" ry="28" fill={col.beam}
              opacity={flicker ? undefined : 0.4}
              style={{ filter: 'blur(5px)', animation: flicker ? 'll-flicker 0.65s ease-out forwards' : 'none' }} />
          )}
          <path d="M68 218 L132 218 L122 234 L78 234 Z" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5" />
          <ellipse cx="100" cy="218" rx="32" ry="7" fill={LC.body} stroke={LC.bodySt} strokeWidth="1.5" />
          <path d="M94 234 L100 258 L106 234 Z" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5" />
        </g>
      </g>
      {/* STRING + BEAD */}
      <g style={{ transform: `translateY(${dy}px)`, transition: pulling ? 'transform .17s ease-in' : 'transform .38s cubic-bezier(.34,1.56,.64,1)', cursor: 'pointer', transformOrigin: '100px 258px' }} onClick={onPull}>
        <rect x="82" y="250" width="36" height="100" fill="transparent" />
        <line x1="100" y1="258" x2="100" y2="318" stroke={lit ? '#aaa' : '#555'} strokeWidth="2.5" strokeLinecap="round" style={{ transition: 'stroke 0.6s' }} />
        <circle cx="100" cy="331" r="12" fill="#c8a84b" stroke="#e8c86a" strokeWidth="2"
          style={{ animation: lit ? 'none' : 'll-bead-hint 2.4s ease-in-out infinite' }} />
        <circle cx="100" cy="331" r="5.5" fill="#f0d870" opacity="0.65" />
        <circle cx="96" cy="327" r="2.5" fill="rgba(255,255,200,0.55)" />
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

  const LampSVG = lampType === 'floor' ? FloorLamp
    : lampType === 'pendant' ? PendantLamp
    : lampType === 'lantern' ? LanternLamp
    : ModernLamp

  // ── Compact mode (grid card thumbnail) — flex row layout ──────────────────
  if (compact) {
    const src = LIGHT_SRC[lampType]
    return (
      <>
        <style>{KF}</style>
        <div style={{
          position: 'relative', background: '#07070a',
          borderRadius: 12, overflow: 'hidden', width: '100%', minHeight: 160,
          display: 'flex', alignItems: 'center', padding: '10px 8px',
          boxSizing: 'border-box', fontFamily: 'system-ui,-apple-system,sans-serif', gap: 10,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: [
              `radial-gradient(ellipse 14% 10% at ${src.x}px ${src.y}px, ${col.spot} 0%, transparent 100%)`,
              `radial-gradient(ellipse 70% 80% at ${src.x}px ${src.y}px, ${col.cone} 0%, transparent 100%)`,
            ].join(', '),
            opacity: lit ? 1 : 0, transition: 'opacity 0.6s', pointerEvents: 'none', zIndex: 0,
          }} />
          <div style={{ position: 'relative', width: 110, flexShrink: 0, height: 150, zIndex: 1 }}>
            <LampSVG phase={phase} col={col} pulling={pulling} swinging={swinging} onPull={pull} />
          </div>
          <div style={{
            flex: 1, opacity: isOn ? 1 : 0.05, filter: isOn ? 'none' : 'blur(4px)',
            transition: 'opacity 0.7s, filter 0.7s', zIndex: 1,
          }}>
            <div style={{
              background: 'rgba(12,12,18,0.95)', borderRadius: 8, padding: '9px 10px',
              border: `1px solid ${isOn ? col.beam + '30' : 'rgba(255,255,255,0.05)'}`,
              boxShadow: isOn ? `-8px 0 30px ${col.glow}35` : 'none',
              transition: 'border-color 0.6s, box-shadow 0.6s',
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#fff', margin: '0 0 7px', textAlign: 'center' }}>{title}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ height: 20, borderRadius: 4, background: '#0d0d14', border: '1px solid #1a1a24' }} />
                <div style={{ height: 20, borderRadius: 4, background: '#0d0d14', border: '1px solid #1a1a24' }} />
                <div style={{ height: 22, borderRadius: 4, background: isOn ? col.btnGrad : '#2a1a4a', transition: 'background 0.6s' }} />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ── Full mode — absolute layout, lamp centered, form bottom-right ──────────
  const src = LIGHT_PCT[lampType]

  // Form shadow/border: lamp is above-center → light hits top-left of form
  const formShadow = isOn
    ? `-10px -10px 50px ${col.glow}38, 0 12px 40px rgba(0,0,0,0.7)`
    : '0 4px 28px rgba(0,0,0,0.6)'
  const formBg = isOn
    ? `linear-gradient(132deg, ${col.mid} 0%, rgba(12,12,18,0.95) 52%)`
    : 'rgba(12,12,18,0.93)'
  const formBorderHighlight = isOn ? `1px solid ${col.beam}40` : '1px solid rgba(255,255,255,0.06)'
  const formBorderDim = isOn ? `1px solid ${col.beam}18` : '1px solid rgba(255,255,255,0.04)'

  return (
    <>
      <style>{KF}</style>
      <div style={{
        position: 'relative',
        background: 'linear-gradient(155deg, #0d0c12 0%, #07070a 55%, #050508 100%)',
        borderRadius: 16,
        overflow: 'hidden',
        width: '100%',
        minHeight: 560,
        boxSizing: 'border-box',
        fontFamily: 'system-ui,-apple-system,sans-serif',
      }}>

        {/* ── Scene light overlay (% based, lamp at center) ── */}
        <div style={{
          position: 'absolute', inset: 0,
          background: [
            `radial-gradient(ellipse 13% 8% at ${src.x} ${src.y}, ${col.spot} 0%, transparent 100%)`,
            `radial-gradient(ellipse 85% 82% at ${src.x} ${src.y}, ${col.cone} 0%, transparent 100%)`,
            `radial-gradient(ellipse 80% 14% at ${src.x} 96%, ${col.mid} 0%, transparent 100%)`,
          ].join(', '),
          opacity: lit ? (isFlicker ? undefined : 1) : 0,
          animation: isOn ? 'll-cone-pulse 3.2s ease-in-out infinite' : (isFlicker ? 'll-flicker 0.65s ease-out forwards' : 'none'),
          transition: isFlicker ? 'none' : 'opacity 0.65s ease',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* ── Lamp — centered horizontally, top-aligned ── */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          transform: 'translateX(-50%)',
          width: 300,
          height: 460,
          zIndex: 1,
        }}>
          <LampSVG phase={phase} col={col} pulling={pulling} swinging={swinging} onPull={pull} />
        </div>

        {/* pull hint (faint, below bead when off) */}
        <div style={{
          position: 'absolute',
          top: 290,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 9,
          color: lit ? 'transparent' : '#2e2e3a',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          transition: 'color 0.5s',
          zIndex: 2,
        }}>
          pull to reveal
        </div>

        {/* ── Login form — bottom-right corner ── */}
        <div style={{
          position: 'absolute',
          bottom: 36,
          right: 36,
          width: 258,
          opacity: isOn ? 1 : (isFlicker ? undefined : 0.04),
          filter: isOn ? 'none' : (isFlicker ? undefined : 'blur(6px)'),
          animation: isFlicker ? 'll-flicker 0.65s ease-out forwards' : 'none',
          transition: isFlicker ? 'none' : 'opacity 0.8s ease, filter 0.8s ease',
          zIndex: 2,
        }}>
          <div style={{
            position: 'relative',
            background: formBg,
            borderTop: formBorderHighlight,
            borderLeft: formBorderHighlight,
            borderRight: formBorderDim,
            borderBottom: formBorderDim,
            borderRadius: 14,
            padding: '22px 20px',
            backdropFilter: 'blur(20px)',
            boxShadow: formShadow,
            transition: 'box-shadow 0.7s ease, background 0.7s ease, border-color 0.7s ease',
          }}>
            {/* top-left light streak (lamp is upper-center, hits top-left of card) */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
              background: `linear-gradient(to bottom, ${col.mid}, transparent)`,
              borderRadius: '13px 13px 0 0',
              opacity: isOn ? 1 : 0, transition: 'opacity 0.7s', pointerEvents: 'none',
            }} />

            <h2 style={{
              position: 'relative', textAlign: 'center',
              margin: '0 0 18px', fontSize: 17, fontWeight: 700,
              color: isOn ? '#fff' : '#d0d0e0', letterSpacing: '-0.02em',
              textShadow: isOn ? `0 0 28px ${col.beam}65` : 'none',
              transition: 'text-shadow 0.6s, color 0.6s',
            }}>
              {title}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
              <input readOnly placeholder="Email" type="email" style={fld(col, isOn)} />

              <div style={{ position: 'relative' }}>
                <input readOnly placeholder="Password" type={showPass ? 'text' : 'password'}
                  style={{ ...fld(col, isOn), paddingRight: 34 }} />
                <button onClick={() => setShowPass(v => !v)} style={{
                  position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 11, padding: 2,
                }}>
                  {showPass ? '◉' : '◎'}
                </button>
              </div>

              <p style={{ textAlign: 'right', margin: '0', fontSize: 11, color: '#7b6ef6', cursor: 'pointer' }}>
                Forgot password?
              </p>

              <button style={{
                width: '100%', padding: '11px',
                borderRadius: 8, border: 'none',
                background: isOn ? col.btnGrad : 'rgba(80,60,120,0.35)',
                color: isOn ? '#fff' : '#7a7a8a',
                fontSize: 12, fontWeight: 700, cursor: isOn ? 'pointer' : 'default',
                letterSpacing: '0.07em', textTransform: 'uppercase',
                transition: 'background 0.6s, color 0.6s',
                boxShadow: isOn ? `0 4px 20px ${col.glow}40` : 'none',
              }}>
                {buttonLabel}
              </button>

              {showGoogle && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 1, background: '#181824' }} />
                    <span style={{ fontSize: 9, color: '#303040' }}>or</span>
                    <div style={{ flex: 1, height: 1, background: '#181824' }} />
                  </div>
                  <button style={{
                    width: '100%', padding: '9px', borderRadius: 8,
                    border: isOn ? `1px solid ${col.beam}20` : '1px solid #181824',
                    background: isOn ? 'rgba(8,8,16,0.95)' : '#08080f',
                    color: isOn ? '#b0b0c0' : '#505060',
                    fontSize: 11, cursor: isOn ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'border-color 0.6s, color 0.6s',
                  }}>
                    <GoogleIcon />
                    Continue with Google
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
function fld(col: (typeof LAMP_COLORS)[LampColor], isOn: boolean): React.CSSProperties {
  return {
    width: '100%', padding: '10px 12px', borderRadius: 7,
    border: isOn ? `1px solid ${col.beam}28` : '1px solid #181824',
    background: isOn ? 'rgba(6,6,12,0.98)' : '#06060c',
    color: '#ccccd8', fontSize: 12, outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.6s',
  }
}

function GoogleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
