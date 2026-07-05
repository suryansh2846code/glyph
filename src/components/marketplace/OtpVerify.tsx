import React, { useEffect, useRef, useState } from 'react'

type Phase = 'input' | 'verifying' | 'success' | 'error'

export type OtpVerifyProps = {
  length?: 4 | 6
  accentColor?: string
  title?: string
  subtitle?: string
  verifyMode?: 'auto' | 'button'
  correctOtp?: string
  compact?: boolean
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export default function OtpVerify({
  length = 4,
  accentColor = '#22c55e',
  title = "We've sent a 4-digit code to your phone.",
  subtitle = "It'll auto-verify once entered.",
  verifyMode = 'auto',
  correctOtp = '',
  compact = false,
}: OtpVerifyProps) {
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(''))
  const [phase, setPhase] = useState<Phase>('input')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const allFilled = digits.every(d => d !== '')

  useEffect(() => {
    setDigits(Array(length).fill(''))
    setPhase('input')
    inputRefs.current = []
  }, [length])

  useEffect(() => {
    if (verifyMode !== 'auto' || !allFilled || phase !== 'input') return
    const t = setTimeout(triggerVerify, 240)
    return () => clearTimeout(t)
  }, [allFilled, phase, verifyMode])

  function triggerVerify() {
    setPhase('verifying')
    // Wait for all cards to finish piling (stagger + transition + settle buffer)
    const pileDuration = (length - 1) * 70 + 460
    setTimeout(() => {
      const entered = digits.join('')
      if (correctOtp && entered !== correctOtp) {
        setPhase('error')
        setTimeout(() => {
          setDigits(Array(length).fill(''))
          setPhase('input')
          inputRefs.current[0]?.focus()
        }, 1000)
      } else {
        setPhase('success')
      }
    }, pileDuration)
  }

  function handleChange(i: number, raw: string) {
    if (phase !== 'input') return
    const ch = raw.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = ch
    setDigits(next)
    if (ch && i < length - 1) inputRefs.current[i + 1]?.focus()
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        const next = [...digits]; next[i] = ''; setDigits(next)
      } else if (i > 0) {
        inputRefs.current[i - 1]?.focus()
        const next = [...digits]; next[i - 1] = ''; setDigits(next)
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      inputRefs.current[i - 1]?.focus()
    } else if (e.key === 'ArrowRight' && i < length - 1) {
      inputRefs.current[i + 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    const next = Array(length).fill('').map((_, i) => pasted[i] ?? '')
    setDigits(next)
    const lastFilled = Math.min(pasted.length, length) - 1
    inputRefs.current[lastFilled]?.focus()
  }

  function reset() {
    setDigits(Array(length).fill(''))
    setPhase('input')
    setTimeout(() => inputRefs.current[0]?.focus(), 50)
  }

  const boxSize = compact ? 44 : 64
  const br = compact ? 13 : 20
  const gap = compact ? 8 : 14
  const totalWidth = length * boxSize + (length - 1) * gap
  const centerX = totalWidth / 2

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: compact ? 14 : 28,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {!compact && (
        <div style={{ textAlign: 'center', maxWidth: 300 }}>
          <p style={{ color: '#e4e4e7', fontSize: 14, fontWeight: 500, margin: '0 0 6px', lineHeight: 1.5 }}>
            {title}
          </p>
          <p style={{ color: '#71717a', fontSize: 12, margin: 0 }}>{subtitle}</p>
        </div>
      )}

      {/* Box row */}
      <div style={{ position: 'relative', width: totalWidth, height: boxSize }}>
        {phase === 'success' ? (
          /* Single collapsed success box — solid accent fill */
          <div
            style={{
              position: 'absolute',
              left: '50%',
              width: boxSize,
              height: boxSize,
              borderRadius: br,
              border: `2px solid ${accentColor}`,
              backgroundColor: hexToRgba(accentColor, 0.9),
              boxShadow: `0 0 0 1px ${hexToRgba(accentColor, 0.3)}, 0 0 28px ${hexToRgba(accentColor, 0.65)}, 0 0 60px ${hexToRgba(accentColor, 0.25)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'otpPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
            }}
          >
            <svg
              width={boxSize * 0.42}
              height={boxSize * 0.42}
              viewBox="0 0 24 24"
              fill="none"
              overflow="visible"
            >
              <path
                d="M5 13l4 4L19 7"
                stroke="#fff"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 30,
                  strokeDashoffset: 30,
                  animation: 'otpCheck 0.38s ease-out 0.32s forwards',
                }}
              />
            </svg>
          </div>
        ) : (
          digits.map((digit, i) => {
            const boxLeft = i * (boxSize + gap)
            const boxCenterX = boxLeft + boxSize / 2
            const dx = centerX - boxCenterX

            const isFilled = !!digit
            const isNext = !digit && digits.slice(0, i).every(d => d !== '')
            const isErr = phase === 'error'
            const isVerifying = phase === 'verifying'

            // --- Background: accent-colored throughout, opacity varies by state ---
            const bgAlpha = isVerifying
              ? 0.88
              : isFilled
              ? 0.82
              : isNext
              ? 0.14
              : 0.07

            const borderCol = isErr
              ? '#ef4444'
              : accentColor

            // Each card during pile: stacked slightly upward
            const yPile = -(i * 2.5)
            const transform = isVerifying
              ? `translateX(${dx}px) translateY(${yPile}px)`
              : 'translateX(0) translateY(0)'

            // Cards land one by one — stagger delay per index
            const transDelay = isVerifying ? `${i * 70}ms` : '0ms'

            // Higher index = on top of the pile
            const zIdx = isVerifying ? i + 1 : 1

            // Shadow: during pile, simulate card depth
            const shadow = isVerifying
              ? `0 ${(i + 1) * 3}px 12px rgba(0,0,0,0.45), 0 0 0 1px ${hexToRgba(accentColor, 0.4)}`
              : isFilled || isNext
              ? `0 0 0 1px ${hexToRgba(isErr ? '#ef4444' : accentColor, 0.25)}, 0 0 18px ${hexToRgba(isErr ? '#ef4444' : accentColor, 0.28)}`
              : 'none'

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: boxLeft,
                  width: boxSize,
                  height: boxSize,
                  borderRadius: br,
                  border: `2px solid ${borderCol}`,
                  backgroundColor: hexToRgba(isErr ? '#ef4444' : accentColor, bgAlpha),
                  boxShadow: shadow,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform,
                  zIndex: zIdx,
                  transition: isVerifying
                    ? `transform 380ms cubic-bezier(0.4,0,0.2,1) ${transDelay}, background-color 200ms ease, border-color 150ms ease, box-shadow 200ms ease`
                    : 'transform 380ms cubic-bezier(0.34,1.56,0.64,1), background-color 200ms ease, border-color 150ms ease, box-shadow 200ms ease',
                }}
              >
                <input
                  ref={el => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  disabled={phase !== 'input'}
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    textAlign: 'center',
                    fontSize: compact ? 18 : 26,
                    fontWeight: 700,
                    color: isFilled ? '#fff' : hexToRgba('#ffffff', 0.55),
                    caretColor: 'transparent',
                    cursor: 'text',
                    userSelect: 'none',
                    borderRadius: br,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                />
              </div>
            )
          })
        )}
      </div>

      {/* Verify button (button mode) */}
      {verifyMode === 'button' && phase === 'input' && (
        <button
          onClick={() => allFilled && triggerVerify()}
          disabled={!allFilled}
          style={{
            padding: '10px 36px',
            borderRadius: 12,
            border: 'none',
            fontSize: 13,
            fontWeight: 700,
            cursor: allFilled ? 'pointer' : 'not-allowed',
            backgroundColor: allFilled ? accentColor : '#27272a',
            color: '#fff',
            boxShadow: allFilled ? `0 0 22px ${hexToRgba(accentColor, 0.45)}` : 'none',
            transition: 'all 200ms ease',
            fontFamily: 'inherit',
          }}
        >
          Verify Code
        </button>
      )}

      {/* Status row */}
      {!compact && (
        <div style={{ textAlign: 'center', minHeight: 18 }}>
          {phase === 'success' ? (
            <p style={{ color: accentColor, fontSize: 12, fontWeight: 600, margin: 0 }}>
              Verified successfully
            </p>
          ) : phase === 'error' ? (
            <p style={{ color: '#ef4444', fontSize: 12, fontWeight: 600, margin: 0 }}>
              Incorrect code — please try again
            </p>
          ) : (
            <p style={{ color: '#52525b', fontSize: 12, margin: 0 }}>
              Didn't receive the code?{' '}
              <button
                onClick={reset}
                style={{
                  color: '#a1a1aa',
                  fontWeight: 700,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 12,
                  fontFamily: 'inherit',
                }}
              >
                Resend
              </button>
            </p>
          )}
        </div>
      )}

      <style>{`
        @keyframes otpPop {
          from { transform: translateX(-50%) scale(0.6) translateY(6px); opacity: 0; }
          to   { transform: translateX(-50%) scale(1)   translateY(0px); opacity: 1; }
        }
        @keyframes otpCheck {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  )
}
