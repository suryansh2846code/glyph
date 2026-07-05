import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
export type LampType = 'modern' | 'floor' | 'pendant' | 'lantern'
type LampColor = 'amber' | 'cool' | 'rose'
type Phase = 'off' | 'flicker' | 'on'

// ── Color palettes ────────────────────────────────────────────────────────────
const LAMP_COLORS: Record<LampColor, { beam: string; cone: string; mid: string; glow: string; btnGrad: string }> = {
  amber: { beam: '#f59e0b', cone: 'rgba(245,158,11,0.28)', mid: 'rgba(245,158,11,0.08)', glow: 'rgba(245,158,11,0.65)', btnGrad: 'linear-gradient(135deg,#7c3aed,#6d28d9)' },
  cool:  { beam: '#93c5fd', cone: 'rgba(147,197,253,0.26)', mid: 'rgba(147,197,253,0.07)', glow: 'rgba(147,197,253,0.58)', btnGrad: 'linear-gradient(135deg,#0ea5e9,#2563eb)' },
  rose:  { beam: '#f9a8d4', cone: 'rgba(249,168,212,0.28)', mid: 'rgba(249,168,212,0.07)', glow: 'rgba(249,168,212,0.62)', btnGrad: 'linear-gradient(135deg,#ec4899,#be185d)' },
}

// ── CSS keyframes (injected once) ─────────────────────────────────────────────
const KF = `
@keyframes ll-flicker {
  0%,100%{ opacity:0 } 10%{ opacity:.9 } 15%{ opacity:0 } 30%{ opacity:1 }
  35%{ opacity:.15 } 50%{ opacity:1 } 55%{ opacity:.5 } 75%{ opacity:1 }
}
@keyframes ll-glow-pulse {
  0%,100%{ opacity:.85 } 50%{ opacity:.5 }
}
@keyframes ll-cone-pulse {
  0%,100%{ opacity:1 } 50%{ opacity:.75 }
}
@keyframes ll-swing {
  0%{ transform:rotate(0deg) }
  18%{ transform:rotate(11deg) }
  36%{ transform:rotate(-7deg) }
  54%{ transform:rotate(4deg) }
  72%{ transform:rotate(-2deg) }
  88%{ transform:rotate(1deg) }
  100%{ transform:rotate(0deg) }
}
@keyframes ll-sway {
  0%,100%{ transform:translateX(0) }
  25%{ transform:translateX(4px) }
  75%{ transform:translateX(-3px) }
}
`

// ── SVG Lamp: Modern (disc shade floor lamp) ──────────────────────────────────
function ModernLamp({ phase, col, pulling, onPull }: SVGProps) {
  const lit = phase !== 'off'
  const pullDy = pulling ? 24 : 0
  return (
    <svg viewBox="0 0 200 400" width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }}>
      {/* shade disc top */}
      <ellipse cx="100" cy="72" rx="82" ry="13" fill="#222228" stroke="#3a3a42" strokeWidth="1.5" />
      {/* shade body */}
      <path d="M20 67 L180 67 L170 88 L30 88 Z" fill="#19191e" stroke="#2d2d34" strokeWidth="1" />
      {/* shade underside glow */}
      <ellipse cx="100" cy="88" rx="66" ry="7"
        fill={col.beam}
        opacity={lit ? (phase === 'flicker' ? undefined : 0.75) : 0}
        style={phase === 'flicker' ? { animation: 'll-flicker 0.65s ease-out forwards' } : { transition: 'opacity 0.5s' }}
      />
      {/* pole */}
      <rect x="97" y="88" width="6" height="240" rx="3" fill="#111116" stroke="#252530" strokeWidth="1" />
      {/* base body */}
      <rect x="40" y="328" width="120" height="14" rx="6" fill="#19191e" stroke="#2d2d34" strokeWidth="1.5" />
      <ellipse cx="100" cy="328" rx="60" ry="9" fill="#19191e" stroke="#2f2f38" strokeWidth="1" />
      <ellipse cx="100" cy="342" rx="60" ry="8" fill="#131316" stroke="#25252e" strokeWidth="1" />

      {/* String + bead */}
      <g
        style={{
          transform: `translateY(${pullDy}px)`,
          transition: pulling
            ? 'transform 0.17s ease-in'
            : 'transform 0.38s cubic-bezier(0.34,1.56,0.64,1)',
          cursor: 'pointer',
          transformOrigin: '100px 88px',
        }}
        onClick={onPull}
      >
        <rect x="86" y="88" width="28" height="90" fill="transparent" />
        <line x1="100" y1="88" x2="100" y2="152" stroke="#999" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="100" cy="165" r="10" fill="#c8a84b" stroke="#e8c86a" strokeWidth="2" />
        <circle cx="100" cy="165" r="4" fill="#f0d870" opacity="0.6" />
      </g>
    </svg>
  )
}

// ── SVG Lamp: Floor (cone shade) ──────────────────────────────────────────────
function FloorLamp({ phase, col, pulling, onPull }: SVGProps) {
  const lit = phase !== 'off'
  const pullDy = pulling ? 24 : 0
  return (
    <svg viewBox="0 0 200 420" width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }}>
      {/* cone top cap */}
      <ellipse cx="100" cy="58" rx="20" ry="7" fill="#222228" stroke="#3a3a42" strokeWidth="1.5" />
      {/* cone body */}
      <path d="M80 58 L120 58 L178 132 L22 132 Z" fill="#19191e" stroke="#2d2d34" strokeWidth="1" />
      {/* cone rim */}
      <ellipse cx="100" cy="132" rx="78" ry="12" fill="#222228" stroke="#3a3a42" strokeWidth="1.5" />
      {/* cone opening glow */}
      <ellipse cx="100" cy="132" rx="68" ry="8"
        fill={col.beam}
        opacity={lit ? (phase === 'flicker' ? undefined : 0.7) : 0}
        style={phase === 'flicker' ? { animation: 'll-flicker 0.65s ease-out forwards' } : { transition: 'opacity 0.5s' }}
      />
      {/* pole */}
      <rect x="97" y="132" width="6" height="218" rx="3" fill="#111116" stroke="#252530" strokeWidth="1" />
      {/* base */}
      <rect x="40" y="350" width="120" height="14" rx="6" fill="#19191e" stroke="#2d2d34" strokeWidth="1.5" />
      <ellipse cx="100" cy="350" rx="60" ry="9" fill="#19191e" stroke="#2f2f38" strokeWidth="1" />
      <ellipse cx="100" cy="364" rx="60" ry="8" fill="#131316" stroke="#25252e" strokeWidth="1" />

      {/* String + bead */}
      <g
        style={{
          transform: `translateY(${pullDy}px)`,
          transition: pulling ? 'transform 0.17s ease-in' : 'transform 0.38s cubic-bezier(0.34,1.56,0.64,1)',
          cursor: 'pointer',
          transformOrigin: '100px 132px',
        }}
        onClick={onPull}
      >
        <rect x="86" y="132" width="28" height="90" fill="transparent" />
        <line x1="100" y1="132" x2="100" y2="196" stroke="#999" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="100" cy="209" r="10" fill="#c8a84b" stroke="#e8c86a" strokeWidth="2" />
        <circle cx="100" cy="209" r="4" fill="#f0d870" opacity="0.6" />
      </g>
    </svg>
  )
}

// ── SVG Lamp: Pendant (Edison bulb) ───────────────────────────────────────────
function PendantLamp({ phase, col, pulling, swinging, onPull }: SVGProps) {
  const lit = phase !== 'off'
  const pullDy = pulling ? 24 : 0
  return (
    <svg viewBox="0 0 200 380" width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }}>
      {/* ceiling plate */}
      <ellipse cx="100" cy="14" rx="32" ry="8" fill="#222228" stroke="#3a3a42" strokeWidth="1.5" />
      <rect x="68" y="6" width="64" height="14" rx="5" fill="#19191e" stroke="#2d2d34" strokeWidth="1" />

      {/* whole pendant group swings around ceiling plate center */}
      <g
        style={{
          transformOrigin: '100px 14px',
          animation: swinging ? 'll-swing 1.1s ease-out forwards' : 'none',
        }}
      >
        {/* thick power cord */}
        <line x1="100" y1="14" x2="100" y2="120" stroke="#333" strokeWidth="4" strokeLinecap="round" />
        <line x1="100" y1="14" x2="100" y2="120" stroke="#555" strokeWidth="2" strokeLinecap="round" />

        {/* bulb socket */}
        <rect x="88" y="116" width="24" height="18" rx="4" fill="#1c1c22" stroke="#30303a" strokeWidth="1.5" />

        {/* bulb glass shape */}
        <path d="M76 134 Q76 182 100 192 Q124 182 124 134 Z" fill={lit ? col.beam : '#151518'} opacity={lit ? (phase === 'flicker' ? undefined : 0.55) : 1}
          style={phase === 'flicker' ? { animation: 'll-flicker 0.65s ease-out forwards' } : { transition: 'opacity 0.6s, fill 0.6s' }}
        />
        <path d="M76 134 Q76 182 100 192 Q124 182 124 134 Z" fill="none" stroke="#2a2a32" strokeWidth="1.5" />

        {/* filament lines inside bulb */}
        <g opacity={lit ? 0.9 : 0.15} style={{ transition: 'opacity 0.5s' }}>
          <path d="M95 148 Q100 144 105 148 Q110 152 105 157 Q100 161 95 157 Q90 152 95 148" fill="none" stroke={col.beam} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="100" y1="148" x2="100" y2="136" stroke={col.beam} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="100" y1="161" x2="100" y2="172" stroke={col.beam} strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* bulb base */}
        <ellipse cx="100" cy="192" rx="24" ry="7" fill="#19191e" stroke="#2d2d34" strokeWidth="1.5" />
        <rect x="88" y="192" width="24" height="10" rx="3" fill="#151519" />
        <ellipse cx="100" cy="202" rx="18" ry="5" fill="#111115" stroke="#222228" strokeWidth="1" />

        {/* pull cord below bulb */}
        <g
          style={{
            transform: `translateY(${pullDy}px)`,
            transition: pulling ? 'transform 0.17s ease-in' : 'transform 0.38s cubic-bezier(0.34,1.56,0.64,1)',
            cursor: 'pointer',
            transformOrigin: '100px 202px',
          }}
          onClick={onPull}
        >
          <rect x="86" y="202" width="28" height="90" fill="transparent" />
          <line x1="100" y1="202" x2="100" y2="262" stroke="#888" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="100" cy="275" r="10" fill="#c8a84b" stroke="#e8c86a" strokeWidth="2" />
          <circle cx="100" cy="275" r="4" fill="#f0d870" opacity="0.6" />
        </g>
      </g>
    </svg>
  )
}

// ── SVG Lamp: Lantern (hanging) ───────────────────────────────────────────────
function LanternLamp({ phase, col, pulling, swinging, onPull }: SVGProps) {
  const lit = phase !== 'off'
  const pullDy = pulling ? 24 : 0
  const chainLinks = [0, 14, 28, 42, 56]
  return (
    <svg viewBox="0 0 200 400" width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }}>
      {/* ceiling hook */}
      <rect x="84" y="4" width="32" height="12" rx="5" fill="#222228" stroke="#3a3a42" strokeWidth="1.5" />

      {/* entire lantern swings */}
      <g style={{ transformOrigin: '100px 10px', animation: swinging ? 'll-swing 1.1s ease-out forwards' : 'none' }}>
        {/* chain links */}
        {chainLinks.map((y) => (
          <ellipse key={y} cx="100" cy={16 + y} rx="5" ry="8" fill="none" stroke="#3a3a42" strokeWidth="2" />
        ))}

        {/* lantern cap top */}
        <path d="M70 86 L130 86 L122 100 L78 100 Z" fill="#222228" stroke="#3a3a42" strokeWidth="1.5" />
        <ellipse cx="100" cy="86" rx="30" ry="7" fill="#1c1c22" stroke="#303040" strokeWidth="1.5" />

        {/* lantern frame - 4 corner posts */}
        <line x1="72" y1="100" x2="68" y2="218" stroke="#333340" strokeWidth="3" strokeLinecap="round" />
        <line x1="128" y1="100" x2="132" y2="218" stroke="#333340" strokeWidth="3" strokeLinecap="round" />

        {/* glass panels */}
        <rect x="68" y="100" width="64" height="118" rx="2" fill={lit ? col.beam : '#0e0e12'}
          opacity={lit ? (phase === 'flicker' ? undefined : 0.2) : 0.6}
          style={phase === 'flicker' ? { animation: 'll-flicker 0.65s ease-out forwards' } : { transition: 'fill 0.6s, opacity 0.6s' }}
        />
        {/* panel dividers */}
        <line x1="68" y1="139" x2="132" y2="139" stroke="#333340" strokeWidth="2" />
        <line x1="68" y1="179" x2="132" y2="179" stroke="#333340" strokeWidth="2" />
        {/* vertical frame borders */}
        <rect x="67" y="100" width="4" height="118" rx="2" fill="#282830" />
        <rect x="129" y="100" width="4" height="118" rx="2" fill="#282830" />

        {/* flame/glow inside */}
        {lit && (
          <ellipse cx="100" cy="160" rx="20" ry="30"
            fill={col.beam}
            opacity={phase === 'flicker' ? undefined : 0.35}
            style={phase === 'flicker' ? { animation: 'll-flicker 0.65s ease-out forwards' } : { filter: 'blur(4px)', transition: 'opacity 0.5s' }}
          />
        )}

        {/* lantern bottom cap */}
        <path d="M68 218 L132 218 L122 234 L78 234 Z" fill="#222228" stroke="#3a3a42" strokeWidth="1.5" />
        <ellipse cx="100" cy="218" rx="32" ry="7" fill="#1c1c22" stroke="#303040" strokeWidth="1.5" />
        {/* finial */}
        <path d="M94 234 L100 258 L106 234 Z" fill="#222228" stroke="#3a3a42" strokeWidth="1.5" />

        {/* pull ring + string */}
        <g
          style={{
            transform: `translateY(${pullDy}px)`,
            transition: pulling ? 'transform 0.17s ease-in' : 'transform 0.38s cubic-bezier(0.34,1.56,0.64,1)',
            cursor: 'pointer',
            transformOrigin: '100px 258px',
          }}
          onClick={onPull}
        >
          <rect x="86" y="258" width="28" height="84" fill="transparent" />
          <line x1="100" y1="258" x2="100" y2="312" stroke="#888" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="100" cy="325" r="10" fill="#c8a84b" stroke="#e8c86a" strokeWidth="2" />
          <circle cx="100" cy="325" r="4" fill="#f0d870" opacity="0.6" />
        </g>
      </g>
    </svg>
  )
}

// ── SVG props ─────────────────────────────────────────────────────────────────
interface SVGProps {
  phase: Phase
  col: (typeof LAMP_COLORS)[LampColor]
  pulling: boolean
  swinging: boolean
  onPull: () => void
}

// ── Cone configs per lamp type (% offsets relative to lamp column width) ───────
const CONE_CFG: Record<LampType, { topPct: number; widthPct: number; heightPct: number }> = {
  modern:  { topPct: 0.22, widthPct: 1.4, heightPct: 0.9 },
  floor:   { topPct: 0.30, widthPct: 1.5, heightPct: 0.85 },
  pendant: { topPct: 0.42, widthPct: 1.2, heightPct: 0.75 },
  lantern: { topPct: 0.30, widthPct: 1.3, heightPct: 0.80 },
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

  const cone = CONE_CFG[lampType]
  const lampColW = compact ? 160 : 220

  const LampSVG = lampType === 'floor' ? FloorLamp
    : lampType === 'pendant' ? PendantLamp
    : lampType === 'lantern' ? LanternLamp
    : ModernLamp

  return (
    <>
      {/* inject keyframes once */}
      <style>{KF}</style>

      <div style={{
        position: 'relative',
        background: '#080809',
        borderRadius: 16,
        overflow: 'hidden',
        width: '100%',
        minHeight: compact ? 200 : 440,
        display: 'flex',
        alignItems: 'center',
        padding: compact ? '12px 10px' : '20px 18px',
        boxSizing: 'border-box',
        fontFamily: 'system-ui,-apple-system,sans-serif',
        gap: compact ? 10 : 16,
      }}>

        {/* ── Ambient glow (behind lamp) ── */}
        <div style={{
          position: 'absolute',
          top: compact ? 8 : 12,
          left: compact ? 20 : 30,
          width: lampColW * 0.85,
          height: compact ? 60 : 90,
          borderRadius: '50%',
          background: col.glow,
          filter: 'blur(30px)',
          opacity: lit ? (isFlicker ? undefined : 1) : 0,
          transition: 'opacity 0.5s',
          animation: isOn ? 'll-glow-pulse 2.8s ease-in-out infinite' : (isFlicker ? 'll-flicker 0.65s ease-out forwards' : 'none'),
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* ── Light cone ── */}
        <div style={{
          position: 'absolute',
          top: `${cone.topPct * 100}%`,
          left: compact ? lampColW * 0.05 : lampColW * 0.08,
          width: lampColW * cone.widthPct,
          height: `${cone.heightPct * 100}%`,
          background: `linear-gradient(180deg, ${col.cone} 0%, ${col.mid} 60%, rgba(0,0,0,0) 100%)`,
          clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
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
          <div style={{ width: '100%', height: compact ? 200 : 380 }}>
            <LampSVG phase={phase} col={col} pulling={pulling} swinging={swinging} onPull={pull} />
          </div>
          {!compact && (
            <p style={{
              fontSize: 9, color: '#363640', textTransform: 'uppercase',
              letterSpacing: '0.12em', textAlign: 'center', marginTop: 4, userSelect: 'none',
            }}>
              {isOn ? 'Pull to switch off' : 'Pull string to light'}
            </p>
          )}
        </div>

        {/* ── Login form ── */}
        <div style={{
          flex: 1,
          minWidth: 0,
          opacity: isOn ? 1 : (isFlicker ? undefined : 0.06),
          filter: isOn ? 'none' : (isFlicker ? undefined : 'blur(4px)'),
          animation: isFlicker ? 'll-flicker 0.65s ease-out forwards' : 'none',
          transition: isFlicker ? 'none' : 'opacity 0.7s ease, filter 0.7s ease',
          zIndex: 1,
        }}>
          <div style={{
            background: 'rgba(16,16,22,0.90)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            padding: compact ? '12px 12px' : '20px 18px',
            backdropFilter: 'blur(16px)',
          }}>
            <h2 style={{
              textAlign: 'center',
              margin: `0 0 ${compact ? 10 : 16}px`,
              fontSize: compact ? 13 : 16,
              fontWeight: 700,
              color: '#eeeef6',
              letterSpacing: '-0.015em',
            }}>
              {title}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 7 : 9 }}>
              <input readOnly placeholder="Email" type="email" style={fld(compact)} />

              <div style={{ position: 'relative' }}>
                <input readOnly placeholder="Password" type={showPass ? 'text' : 'password'}
                  style={{ ...fld(compact), paddingRight: 34 }} />
                <button onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 11, lineHeight: 1, padding: 2 }}>
                  {showPass ? '◉' : '◎'}
                </button>
              </div>

              {!compact && (
                <p style={{ textAlign: 'right', margin: '0', fontSize: 10, color: '#7b6ef6', cursor: 'pointer' }}>
                  Forgot Password?
                </p>
              )}

              <button style={{
                width: '100%', padding: compact ? '8px' : '10px',
                borderRadius: 8, border: 'none', background: col.btnGrad,
                color: '#fff', fontSize: compact ? 10 : 12, fontWeight: 700,
                cursor: isOn ? 'pointer' : 'default',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                {buttonLabel}
              </button>

              {showGoogle && !compact && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 1, background: '#1e1e26' }} />
                    <span style={{ fontSize: 9, color: '#3a3a46' }}>or</span>
                    <div style={{ flex: 1, height: 1, background: '#1e1e26' }} />
                  </div>
                  <button style={{
                    width: '100%', padding: '8px', borderRadius: 8,
                    border: '1px solid #222230', background: '#0d0d14',
                    color: '#909098', fontSize: 11, cursor: isOn ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
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
function fld(compact: boolean): React.CSSProperties {
  return {
    width: '100%', padding: compact ? '7px 9px' : '9px 11px',
    borderRadius: 7, border: '1px solid #20202c',
    background: '#0b0b12', color: '#ccccd8', fontSize: compact ? 10 : 12,
    outline: 'none', boxSizing: 'border-box',
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
