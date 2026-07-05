import { useState } from 'react'

const LAMP_COLORS = {
  amber: {
    beam: '#f59e0b',
    cone: 'rgba(245,158,11,0.22)',
    coneEdge: 'rgba(245,158,11,0)',
    glow: 'rgba(245,158,11,0.55)',
    btnGrad: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
  },
  cool: {
    beam: '#93c5fd',
    cone: 'rgba(147,197,253,0.20)',
    coneEdge: 'rgba(147,197,253,0)',
    glow: 'rgba(147,197,253,0.50)',
    btnGrad: 'linear-gradient(135deg,#0ea5e9,#2563eb)',
  },
  rose: {
    beam: '#f9a8d4',
    cone: 'rgba(249,168,212,0.22)',
    coneEdge: 'rgba(249,168,212,0)',
    glow: 'rgba(249,168,212,0.50)',
    btnGrad: 'linear-gradient(135deg,#ec4899,#be185d)',
  },
}

export type LampLoginProps = {
  lampColor?: keyof typeof LAMP_COLORS
  title?: string
  buttonLabel?: string
  showGoogle?: boolean
  compact?: boolean
}

export default function LampLogin({
  lampColor = 'amber',
  title = 'Welcome Back',
  buttonLabel = 'Sign In',
  showGoogle = true,
  compact = false,
}: LampLoginProps) {
  const [isOn, setIsOn] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [pulling, setPulling] = useState(false)

  const col = LAMP_COLORS[lampColor]

  function pull() {
    if (pulling) return
    setPulling(true)
    setTimeout(() => {
      setPulling(false)
      setIsOn(o => !o)
    }, 220)
  }

  const lampH = compact ? 200 : 300
  const lampW = compact ? 90 : 120

  return (
    <div style={{
      position: 'relative',
      background: '#08080b',
      borderRadius: 16,
      overflow: 'hidden',
      width: '100%',
      minHeight: compact ? 180 : 400,
      display: 'flex',
      alignItems: 'center',
      padding: compact ? '14px 12px' : '24px 20px',
      boxSizing: 'border-box',
      fontFamily: 'system-ui,-apple-system,sans-serif',
    }}>

      {/* ── Lamp head ambient glow ── */}
      <div style={{
        position: 'absolute',
        top: compact ? 10 : 16,
        left: compact ? lampW * 0.18 : lampW * 0.2,
        width: lampW * 0.9,
        height: compact ? 44 : 60,
        borderRadius: '50%',
        background: col.glow,
        filter: 'blur(22px)',
        opacity: isOn ? 1 : 0,
        transition: 'opacity 0.65s ease',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* ── Light cone ── */}
      <div style={{
        position: 'absolute',
        top: compact ? 36 : 52,
        left: compact ? lampW * 0.1 : lampW * 0.08,
        width: compact ? 200 : 300,
        height: compact ? 200 : 360,
        background: `linear-gradient(180deg, ${col.cone} 0%, ${col.coneEdge} 100%)`,
        clipPath: 'polygon(38% 0%, 62% 0%, 100% 100%, 0% 100%)',
        opacity: isOn ? 1 : 0,
        transition: 'opacity 0.7s ease',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* ── Lamp SVG ── */}
      <div style={{ position: 'relative', width: lampW, flexShrink: 0, zIndex: 1, alignSelf: 'stretch', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
        <svg
          viewBox="0 0 100 320"
          width={compact ? 72 : 100}
          height={lampH}
          style={{ display: 'block', overflow: 'visible' }}
        >
          {/* Shade top ellipse */}
          <ellipse cx="50" cy="46" rx="44" ry="8" fill="#222226" stroke="#3a3a40" strokeWidth="1.5" />
          {/* Shade underside */}
          <path d="M12 44 L88 44 L80 60 L20 60 Z" fill="#1a1a1e" stroke="#2e2e34" strokeWidth="1" />
          {/* Inner glow rim when on */}
          <ellipse cx="50" cy="60" rx="30" ry="4" fill={isOn ? col.beam : 'transparent'} opacity={isOn ? 0.7 : 0} style={{ transition: 'opacity 0.5s' }} />

          {/* Pole */}
          <rect x="48" y="60" width="4" height="218" rx="2" fill="#141418" stroke="#26262c" strokeWidth="1" />

          {/* Base */}
          <rect x="12" y="278" width="76" height="10" rx="5" fill="#1a1a1e" stroke="#2e2e34" strokeWidth="1.5" />
          <ellipse cx="50" cy="278" rx="38" ry="7" fill="#1a1a1e" stroke="#303036" strokeWidth="1" />

          {/* String + bead — translate on pull */}
          <g
            style={{
              transform: pulling ? 'translateY(13px)' : 'translateY(0px)',
              transition: pulling
                ? 'transform 0.18s ease-in'
                : 'transform 0.32s cubic-bezier(0.34,1.56,0.64,1)',
              cursor: 'pointer',
            }}
            onClick={pull}
          >
            {/* Invisible wider hit-area */}
            <rect x="42" y="60" width="16" height="60" fill="transparent" />
            {/* Visible string */}
            <line x1="50" y1="60" x2="50" y2="96" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
            {/* Bead */}
            <circle cx="50" cy="102" r="5.5" fill="#c8a84b" stroke="#e8c866" strokeWidth="1.5" />
          </g>
        </svg>

        {!compact && (
          <p style={{
            fontSize: 9,
            color: '#3d3d44',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            textAlign: 'center',
            marginTop: -4,
            userSelect: 'none',
          }}>
            Pull to {isOn ? 'off' : 'on'}
          </p>
        )}
      </div>

      {/* ── Login form ── */}
      <div style={{
        flex: 1,
        minWidth: 0,
        marginLeft: compact ? 8 : 16,
        opacity: isOn ? 1 : 0.07,
        filter: isOn ? 'none' : 'blur(3px)',
        transition: 'opacity 0.7s ease, filter 0.7s ease',
        zIndex: 1,
        position: 'relative',
      }}>
        <div style={{
          background: 'rgba(18,18,24,0.88)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12,
          padding: compact ? '14px 14px' : '22px 20px',
          backdropFilter: 'blur(14px)',
        }}>
          <h2 style={{
            textAlign: 'center',
            margin: `0 0 ${compact ? 12 : 18}px`,
            fontSize: compact ? 14 : 17,
            fontWeight: 700,
            color: '#ececf4',
            letterSpacing: '-0.01em',
          }}>
            {title}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 7 : 10 }}>
            {/* Email */}
            <input
              readOnly
              placeholder="Email address"
              type="email"
              style={inputStyle(compact)}
            />

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <input
                readOnly
                placeholder="Password"
                type={showPass ? 'text' : 'password'}
                style={{ ...inputStyle(compact), paddingRight: 36 }}
              />
              <button
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: 10, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: '#555', cursor: 'pointer', fontSize: 12, padding: 2,
                  lineHeight: 1,
                }}
              >
                {showPass ? '◉' : '◎'}
              </button>
            </div>

            {!compact && (
              <p style={{ textAlign: 'right', margin: '0 0 2px', fontSize: 11, color: '#7b6ef6', cursor: 'pointer' }}>
                Forgot Password?
              </p>
            )}

            {/* CTA button */}
            <button style={{
              width: '100%',
              padding: compact ? '8px' : '11px',
              borderRadius: 9,
              border: 'none',
              background: col.btnGrad,
              color: '#fff',
              fontSize: compact ? 11 : 13,
              fontWeight: 700,
              cursor: isOn ? 'pointer' : 'default',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              {buttonLabel}
            </button>

            {showGoogle && !compact && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 1, background: '#222228' }} />
                  <span style={{ fontSize: 10, color: '#44444e' }}>or</span>
                  <div style={{ flex: 1, height: 1, background: '#222228' }} />
                </div>

                <button style={{
                  width: '100%',
                  padding: '9px',
                  borderRadius: 9,
                  border: '1px solid #242430',
                  background: '#111118',
                  color: '#a0a0b0',
                  fontSize: 12,
                  cursor: isOn ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
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
  )
}

function inputStyle(compact: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: compact ? '7px 10px' : '10px 12px',
    borderRadius: 8,
    border: '1px solid #242430',
    background: '#0e0e14',
    color: '#d8d8e8',
    fontSize: compact ? 11 : 13,
    outline: 'none',
    boxSizing: 'border-box',
  }
}

function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
