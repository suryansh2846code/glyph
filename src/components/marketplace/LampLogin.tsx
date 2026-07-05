import { useState, useRef, useEffect, useId } from 'react'

export type LampType = 'modern' | 'floor' | 'pendant' | 'lantern'
type LampColor  = 'amber' | 'cool' | 'rose'
type Phase      = 'off'   | 'flicker' | 'on'
type Vec2       = { x: number; y: number }

// ── Color palettes ────────────────────────────────────────────────────────────
const LAMP_COLORS: Record<LampColor, {
  beam: string; cone: string; mid: string; glow: string; spot: string; btnGrad: string
}> = {
  amber: { beam:'#f59e0b', cone:'rgba(245,158,11,0.24)', mid:'rgba(245,158,11,0.08)', glow:'rgba(245,158,11,0.72)', spot:'rgba(245,158,11,0.55)', btnGrad:'linear-gradient(135deg,#7c3aed,#6d28d9)' },
  cool:  { beam:'#93c5fd', cone:'rgba(147,197,253,0.20)', mid:'rgba(147,197,253,0.07)', glow:'rgba(147,197,253,0.65)', spot:'rgba(147,197,253,0.50)', btnGrad:'linear-gradient(135deg,#0ea5e9,#2563eb)' },
  rose:  { beam:'#f9a8d4', cone:'rgba(249,168,212,0.22)', mid:'rgba(249,168,212,0.08)', glow:'rgba(249,168,212,0.68)', spot:'rgba(249,168,212,0.52)', btnGrad:'linear-gradient(135deg,#ec4899,#be185d)' },
}

// ── Bead rest + rope attachment positions (SVG user units per lamp type) ──────
const ATTACH: Record<LampType, Vec2> = {
  modern:  { x:100, y:88  },
  floor:   { x:100, y:133 },
  pendant: { x:100, y:207 },
  lantern: { x:100, y:259 },
}
const REST: Record<LampType, Vec2> = {
  modern:  { x:100, y:167 },
  floor:   { x:100, y:210 },
  pendant: { x:100, y:279 },
  lantern: { x:100, y:331 },
}
const BEAD_R = 13

// ── Rope path: quadratic bezier that sags naturally when pulled sideways ──────
function ropePath(attach: Vec2, bx: number, by: number): string {
  const ex = bx, ey = by - BEAD_R          // rope endpoint = top of bead
  const dx = ex - attach.x
  const dy = ey - attach.y
  // sag proportional to horizontal pull (gravity effect)
  const sag = Math.max(0, Math.abs(dx) * 0.28 + Math.max(0, -dy) * 0.12)
  const cpX = (attach.x + ex) / 2
  const cpY = (attach.y + ey) / 2 + sag
  return `M ${attach.x} ${attach.y} Q ${cpX} ${cpY} ${ex} ${ey}`
}

// ── Keyframes ─────────────────────────────────────────────────────────────────
const KF = `
@keyframes ll-flicker {
  0%,100%{opacity:0} 10%{opacity:.85} 16%{opacity:0}
  30%{opacity:1} 36%{opacity:.12} 50%{opacity:1}
  56%{opacity:.45} 76%{opacity:1}
}
@keyframes ll-cone-pulse { 0%,100%{opacity:1} 50%{opacity:.74} }
@keyframes ll-swing {
  0%{transform:rotate(0deg)} 18%{transform:rotate(11deg)}
  36%{transform:rotate(-7deg)} 54%{transform:rotate(4deg)}
  72%{transform:rotate(-2deg)} 88%{transform:rotate(1deg)}
  100%{transform:rotate(0deg)}
}
`

// ── Lamp colours ──────────────────────────────────────────────────────────────
const LC = {
  shade:'#333344', shadeSt:'#525266',
  body:'#28283a',  bodySt:'#424256',
  pole:'#20202e',  poleSt:'#363648',
  base:'#2c2c3e',  baseSt:'#464658',
  hi:'rgba(180,180,220,0.20)',
}
function bodyStyle(phase: Phase): React.CSSProperties {
  const lit = phase !== 'off', fl = phase === 'flicker'
  return {
    opacity:    fl ? undefined : (lit ? 1 : 0.50),
    transition: fl ? 'none' : 'opacity 0.9s ease',
    animation:  fl ? 'll-flicker 0.65s ease-out forwards' : 'none',
  }
}

// ── Rope SVG (path-based so it curves naturally) ──────────────────────────────
function Rope({ d, lit }: { d: string; lit: boolean }) {
  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* shadow */}
      <path d={d} fill="none" stroke="rgba(5,2,0,0.6)"          strokeWidth="8" strokeLinecap="round"/>
      {/* base */}
      <path d={d} fill="none" stroke={lit?'#7c5c30':'#4a3a20'}  strokeWidth="7" strokeLinecap="round" style={{transition:'stroke 0.7s'}}/>
      {/* twist strand A — light */}
      <path d={d} fill="none" stroke="rgba(195,150,88,0.82)"    strokeWidth="3.8" strokeDasharray="9,9" strokeDashoffset="0"  strokeLinecap="butt"/>
      {/* twist strand B — dark (fills gaps of A) */}
      <path d={d} fill="none" stroke="rgba(28,12,2,0.72)"       strokeWidth="3.8" strokeDasharray="9,9" strokeDashoffset="9"  strokeLinecap="butt"/>
      {/* highlight */}
      <path d={d} fill="none" stroke="rgba(255,220,150,0.22)"   strokeWidth="1.5" strokeLinecap="round"/>
    </g>
  )
}

// ── Bead SVG (absolute SVG coords, no CSS transform) ─────────────────────────
function Bead({ cx, cy, lit, isDragging, hintId, onPointerDown }: {
  cx:number; cy:number; lit:boolean; isDragging:boolean
  hintId:string; onPointerDown:(e:React.PointerEvent)=>void
}) {
  return (
    <g onPointerDown={onPointerDown} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
      {/* hit area */}
      <circle cx={cx} cy={cy} r={BEAD_R + 14} fill="transparent"/>
      {/* soft hint pulse when lamp is off */}
      {!lit && !isDragging && (
        <circle cx={cx} cy={cy} r={BEAD_R + 9} fill="#c8a84b" opacity="0.10"
          style={{ animation:`${hintId} 2.4s ease-in-out infinite` }}/>
      )}
      {/* outer shell */}
      <circle cx={cx} cy={cy} r={BEAD_R}         fill="#c8a84b" stroke="#deba58" strokeWidth="2.2"/>
      {/* inner highlight disk */}
      <circle cx={cx} cy={cy} r={BEAD_R * 0.46}  fill="#f5e070" opacity="0.72"/>
      {/* specular */}
      <circle cx={cx - BEAD_R*0.38} cy={cy - BEAD_R*0.34} r={BEAD_R*0.22} fill="rgba(255,252,200,0.65)"/>
    </g>
  )
}

// ── SVG props ─────────────────────────────────────────────────────────────────
interface SVGProps {
  phase: Phase
  col: (typeof LAMP_COLORS)[LampColor]
  beadPos: Vec2
  isDragging: boolean
  swinging: boolean
  hintId: string
  svgRef: React.RefObject<SVGSVGElement | null>
  onBeadPointerDown: (e: React.PointerEvent) => void
}

// ── Modern lamp ───────────────────────────────────────────────────────────────
function ModernLamp({ phase, col, beadPos, isDragging, hintId, svgRef, onBeadPointerDown }: SVGProps) {
  const lit = phase !== 'off', fl = phase === 'flicker'
  const att = ATTACH.modern
  const rd = ropePath(att, beadPos.x, beadPos.y)

  return (
    <svg ref={svgRef} viewBox="0 0 200 400" width="100%" height="100%" style={{overflow:'visible',display:'block'}}>
      <g style={bodyStyle(phase)}>
        <ellipse cx="100" cy="70" rx="82" ry="12" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5"/>
        <ellipse cx="100" cy="65" rx="72" ry="5"  fill="none"     stroke={LC.hi}      strokeWidth="1.5"/>
        <path d="M20 66 L180 66 L168 87 L32 87 Z" fill={LC.body}  stroke={LC.bodySt}  strokeWidth="1"/>
        <ellipse cx="100" cy="87" rx="68" ry="7"  fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1"/>
        {/* glow + cone */}
        <ellipse cx="100" cy="87" rx="110" ry="60" fill={col.spot}
          opacity={fl?undefined:(lit?1:0)}
          style={{filter:'blur(18px)',transition:'opacity 0.5s',animation:fl?'ll-flicker 0.65s ease-out forwards':'none'}}/>
        <polygon points="32,87 168,87 520,800 -320,800" fill={col.cone}
          opacity={fl?undefined:(lit?1:0)}
          style={{transition:'opacity 0.6s',animation:fl?'ll-flicker 0.65s ease-out forwards':'none'}}/>
        <ellipse cx="100" cy="87" rx="62" ry="6" fill={col.beam}
          opacity={fl?undefined:(lit?0.7:0)}
          style={{transition:'opacity 0.4s',animation:fl?'ll-flicker 0.65s ease-out forwards':'none'}}/>
        {/* pole + base */}
        <rect x="97.5" y="87" width="5" height="242" rx="2.5" fill={LC.pole} stroke={LC.poleSt} strokeWidth="1"/>
        <rect x="98"   y="87" width="2" height="242" rx="1"   fill="rgba(180,180,220,0.05)"/>
        <rect x="38" y="329" width="124" height="13" rx="6" fill={LC.base} stroke={LC.baseSt} strokeWidth="1.5"/>
        <ellipse cx="100" cy="329" rx="62" ry="9" fill={LC.base} stroke={LC.baseSt} strokeWidth="1"/>
        <ellipse cx="100" cy="342" rx="62" ry="8" fill={LC.pole} stroke={LC.poleSt} strokeWidth="1"/>
        <ellipse cx="100" cy="337" rx="52" ry="3" fill="none"   stroke={LC.hi}      strokeWidth="1"/>
      </g>
      <Rope d={rd} lit={lit}/>
      <Bead cx={beadPos.x} cy={beadPos.y} lit={lit} isDragging={isDragging} hintId={hintId} onPointerDown={onBeadPointerDown}/>
    </svg>
  )
}

// ── Floor lamp ────────────────────────────────────────────────────────────────
function FloorLamp({ phase, col, beadPos, isDragging, hintId, svgRef, onBeadPointerDown }: SVGProps) {
  const lit = phase !== 'off', fl = phase === 'flicker'
  const att = ATTACH.floor
  const rd = ropePath(att, beadPos.x, beadPos.y)

  return (
    <svg ref={svgRef} viewBox="0 0 200 420" width="100%" height="100%" style={{overflow:'visible',display:'block'}}>
      <g style={bodyStyle(phase)}>
        <ellipse cx="100" cy="56" rx="20" ry="7" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5"/>
        <ellipse cx="100" cy="54" rx="14" ry="3" fill="none"     stroke={LC.hi}      strokeWidth="1"/>
        <path d="M80 56 L120 56 L178 132 L22 132 Z" fill={LC.body} stroke={LC.bodySt} strokeWidth="1"/>
        <ellipse cx="100" cy="132" rx="78" ry="12" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5"/>
        <ellipse cx="100" cy="132" rx="100" ry="52" fill={col.spot}
          opacity={fl?undefined:(lit?1:0)}
          style={{filter:'blur(20px)',transition:'opacity 0.5s',animation:fl?'ll-flicker 0.65s ease-out forwards':'none'}}/>
        <polygon points="22,132 178,132 520,800 -320,800" fill={col.cone}
          opacity={fl?undefined:(lit?1:0)}
          style={{transition:'opacity 0.6s',animation:fl?'ll-flicker 0.65s ease-out forwards':'none'}}/>
        <ellipse cx="100" cy="132" rx="70" ry="7" fill={col.beam}
          opacity={fl?undefined:(lit?0.65:0)}
          style={{transition:'opacity 0.4s',animation:fl?'ll-flicker 0.65s ease-out forwards':'none'}}/>
        <rect x="97.5" y="132" width="5" height="218" rx="2.5" fill={LC.pole} stroke={LC.poleSt} strokeWidth="1"/>
        <rect x="38" y="350" width="124" height="13" rx="6"    fill={LC.base} stroke={LC.baseSt} strokeWidth="1.5"/>
        <ellipse cx="100" cy="350" rx="62" ry="9" fill={LC.base} stroke={LC.baseSt} strokeWidth="1"/>
        <ellipse cx="100" cy="363" rx="62" ry="8" fill={LC.pole} stroke={LC.poleSt} strokeWidth="1"/>
      </g>
      <Rope d={rd} lit={lit}/>
      <Bead cx={beadPos.x} cy={beadPos.y} lit={lit} isDragging={isDragging} hintId={hintId} onPointerDown={onBeadPointerDown}/>
    </svg>
  )
}

// ── Pendant lamp ──────────────────────────────────────────────────────────────
function PendantLamp({ phase, col, beadPos, isDragging, swinging, hintId, svgRef, onBeadPointerDown }: SVGProps) {
  const lit = phase !== 'off', fl = phase === 'flicker'
  const att = ATTACH.pendant
  const rd = ropePath(att, beadPos.x, beadPos.y)

  return (
    <svg ref={svgRef} viewBox="0 0 200 380" width="100%" height="100%" style={{overflow:'visible',display:'block'}}>
      <g style={bodyStyle(phase)}>
        <ellipse cx="100" cy="14" rx="32" ry="8"  fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5"/>
        <rect    x="68"  y="6"   width="64" height="14" rx="5" fill={LC.body} stroke={LC.bodySt} strokeWidth="1"/>
        <ellipse cx="100" cy="11" rx="26" ry="3"  fill="none"    stroke={LC.hi}      strokeWidth="1"/>
        <g style={{transformOrigin:'100px 14px', animation:swinging?'ll-swing 1.1s ease-out forwards':'none'}}>
          <line x1="100" y1="14" x2="100" y2="120" stroke="#2a2a38" strokeWidth="5" strokeLinecap="round"/>
          <line x1="100" y1="14" x2="100" y2="120" stroke="#484858" strokeWidth="2.5" strokeLinecap="round"/>
          <rect x="88" y="116" width="24" height="18" rx="4" fill={LC.body} stroke={LC.bodySt} strokeWidth="1.5"/>
          <rect x="91" y="118" width="4"  height="14" rx="2" fill={LC.pole}/>
          <rect x="105" y="118" width="4" height="14" rx="2" fill={LC.pole}/>
          <ellipse cx="100" cy="163" rx="90" ry="78" fill={col.spot}
            opacity={fl?undefined:(lit?0.9:0)}
            style={{filter:'blur(22px)',transition:'opacity 0.5s',animation:fl?'ll-flicker 0.65s ease-out forwards':'none'}}/>
          <polygon points="76,134 124,134 440,700 -240,700" fill={col.cone}
            opacity={fl?undefined:(lit?1:0)}
            style={{transition:'opacity 0.6s',animation:fl?'ll-flicker 0.65s ease-out forwards':'none'}}/>
          <path d="M76 134 Q76 185 100 196 Q124 185 124 134 Z"
            fill={lit?col.beam:LC.body} opacity={lit?(fl?undefined:0.5):0.9}
            style={{transition:'fill 0.6s,opacity 0.6s',animation:fl?'ll-flicker 0.65s ease-out forwards':'none'}}/>
          <path d="M76 134 Q76 185 100 196 Q124 185 124 134 Z" fill="none" stroke={LC.bodySt} strokeWidth="1.5"/>
          <path d="M82 138 Q80 165 84 185" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="2" strokeLinecap="round"/>
          <g opacity={lit?0.95:0.2} style={{transition:'opacity 0.5s'}}>
            <path d="M93 152 Q100 146 107 152 Q112 158 107 164 Q100 168 93 164 Q88 158 93 152"
              fill="none" stroke={col.beam} strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="100" y1="152" x2="100" y2="138" stroke={col.beam} strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="100" y1="164" x2="100" y2="176" stroke={col.beam} strokeWidth="1.8" strokeLinecap="round"/>
          </g>
          <ellipse cx="100" cy="196" rx="24" ry="7" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5"/>
          <rect x="88" y="196" width="24" height="10" rx="3" fill={LC.body}/>
          <line x1="88" y1="199" x2="112" y2="199" stroke={LC.shadeSt} strokeWidth="1"/>
          <line x1="88" y1="203" x2="112" y2="203" stroke={LC.shadeSt} strokeWidth="1"/>
          <ellipse cx="100" cy="206" rx="18" ry="5" fill={LC.pole} stroke={LC.poleSt} strokeWidth="1"/>
        </g>
      </g>
      <Rope d={rd} lit={lit}/>
      <Bead cx={beadPos.x} cy={beadPos.y} lit={lit} isDragging={isDragging} hintId={hintId} onPointerDown={onBeadPointerDown}/>
    </svg>
  )
}

// ── Lantern lamp ──────────────────────────────────────────────────────────────
function LanternLamp({ phase, col, beadPos, isDragging, swinging, hintId, svgRef, onBeadPointerDown }: SVGProps) {
  const lit = phase !== 'off', fl = phase === 'flicker'
  const att = ATTACH.lantern
  const rd = ropePath(att, beadPos.x, beadPos.y)
  const links = [0,14,28,42,56]

  return (
    <svg ref={svgRef} viewBox="0 0 200 400" width="100%" height="100%" style={{overflow:'visible',display:'block'}}>
      <g style={bodyStyle(phase)}>
        <rect x="84" y="4" width="32" height="12" rx="5" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5"/>
        <g style={{transformOrigin:'100px 10px', animation:swinging?'ll-swing 1.1s ease-out forwards':'none'}}>
          {links.map(y=>(
            <ellipse key={y} cx="100" cy={16+y} rx="5" ry="8" fill="none" stroke={LC.shadeSt} strokeWidth="2"/>
          ))}
          <path d="M70 86 L130 86 L122 100 L78 100 Z" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5"/>
          <ellipse cx="100" cy="86" rx="30" ry="7" fill={LC.body}  stroke={LC.bodySt} strokeWidth="1.5"/>
          <line x1="72"  y1="100" x2="68"  y2="218" stroke={LC.shade} strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="128" y1="100" x2="132" y2="218" stroke={LC.shade} strokeWidth="3.5" strokeLinecap="round"/>
          <rect x="68" y="100" width="64" height="118" rx="2"
            fill={lit?col.beam:'#0d0d18'} opacity={lit?(fl?undefined:0.22):0.7}
            style={{transition:'fill .6s,opacity .6s',animation:fl?'ll-flicker 0.65s ease-out forwards':'none'}}/>
          <line x1="68" y1="139" x2="132" y2="139" stroke={LC.bodySt} strokeWidth="2"/>
          <line x1="68" y1="179" x2="132" y2="179" stroke={LC.bodySt} strokeWidth="2"/>
          <rect x="67"  y="100" width="5" height="118" rx="2" fill={LC.body}/>
          <rect x="128" y="100" width="5" height="118" rx="2" fill={LC.body}/>
          <ellipse cx="100" cy="159" rx="90" ry="82" fill={col.spot}
            opacity={fl?undefined:(lit?0.9:0)}
            style={{filter:'blur(22px)',transition:'opacity 0.5s',animation:fl?'ll-flicker 0.65s ease-out forwards':'none'}}/>
          <polygon points="68,218 132,218 520,800 -320,800" fill={col.cone}
            opacity={fl?undefined:(lit?1:0)}
            style={{transition:'opacity 0.6s',animation:fl?'ll-flicker 0.65s ease-out forwards':'none'}}/>
          {lit&&<ellipse cx="100" cy="160" rx="18" ry="28" fill={col.beam} opacity="0.4"
            style={{filter:'blur(5px)'}}/>}
          <path d="M68 218 L132 218 L122 234 L78 234 Z" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5"/>
          <ellipse cx="100" cy="218" rx="32" ry="7" fill={LC.body} stroke={LC.bodySt} strokeWidth="1.5"/>
          <path d="M94 234 L100 258 L106 234 Z" fill={LC.shade} stroke={LC.shadeSt} strokeWidth="1.5"/>
        </g>
      </g>
      <Rope d={rd} lit={lit}/>
      <Bead cx={beadPos.x} cy={beadPos.y} lit={lit} isDragging={isDragging} hintId={hintId} onPointerDown={onBeadPointerDown}/>
    </svg>
  )
}

// ── Light source % positions ──────────────────────────────────────────────────
const LIGHT_PCT: Record<LampType, { x: string; y: string }> = {
  modern:  { x:'27%', y:'22%' },
  floor:   { x:'27%', y:'31%' },
  pendant: { x:'27%', y:'41%' },
  lantern: { x:'27%', y:'38%' },
}
const LIGHT_SRC: Record<LampType, Vec2> = {
  modern:  { x:55, y:46 },
  floor:   { x:55, y:65 },
  pendant: { x:55, y:88 },
  lantern: { x:55, y:80 },
}

// ── Public props ──────────────────────────────────────────────────────────────
export type LampLoginProps = {
  lampType?:    LampType
  lampColor?:   LampColor
  title?:       string
  buttonLabel?: string
  showGoogle?:  boolean
  compact?:     boolean
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LampLogin({
  lampType    = 'modern',
  lampColor   = 'amber',
  title       = 'Welcome Back',
  buttonLabel = 'Sign In',
  showGoogle  = true,
  compact     = false,
}: LampLoginProps) {
  const [phase,     setPhase]     = useState<Phase>('off')
  const [toggling,  setToggling]  = useState(false)
  const [swinging,  setSwinging]  = useState(false)
  const [showPass,  setShowPass]  = useState(false)
  const [beadPos,   setBeadPos]   = useState<Vec2>(() => REST[lampType])
  const [isDragging,setIsDragging]= useState(false)

  const beadRef   = useRef<Vec2>(REST[lampType])   // always-current pos for closures
  const velRef    = useRef<Vec2>({ x:0, y:0 })
  const rafRef    = useRef<number | null>(null)
  const svgRef    = useRef<SVGSVGElement | null>(null)

  // unique animation name so multiple instances don't clash
  const rawUid = useId()
  const uid    = rawUid.replace(/:/g,'')
  const hintId = `ll-hint-${uid}`

  const col    = LAMP_COLORS[lampColor]
  const isOn   = phase === 'on'
  const isFl   = phase === 'flicker'
  const lit    = phase !== 'off'

  // reset bead when lamp type changes
  useEffect(() => {
    cancelRaf()
    const r = REST[lampType]
    beadRef.current = r
    setBeadPos(r)
  }, [lampType])

  useEffect(() => () => { cancelRaf() }, [])

  function cancelRaf() {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
  }

  function moveBead(v: Vec2) { beadRef.current = v; setBeadPos(v) }

  // Convert DOM clientX/Y → SVG user units using the SVG's own transform matrix
  function toSVG(cx: number, cy: number): Vec2 | null {
    const svg = svgRef.current
    if (!svg) return null
    const pt  = svg.createSVGPoint()
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    pt.x = cx; pt.y = cy
    const r = pt.matrixTransform(ctm.inverse())
    return { x: r.x, y: r.y }
  }

  function triggerToggle() {
    if (toggling) return
    setToggling(true)
    if (lampType === 'pendant' || lampType === 'lantern') {
      setSwinging(true); setTimeout(() => setSwinging(false), 1200)
    }
    setTimeout(() => {
      setToggling(false)
      if (phase === 'on') setPhase('off')
      else { setPhase('flicker'); setTimeout(() => setPhase('on'), 680) }
    }, 220)
  }

  // Spring physics back to rest position
  function springBack(shouldToggle: boolean) {
    if (shouldToggle) triggerToggle()
    cancelRaf()
    const rest = REST[lampType]
    const pos  = { ...beadRef.current }
    const vel  = velRef.current
    vel.x = 0; vel.y = 0
    let last = performance.now()

    function tick(now: number) {
      const dt = Math.min((now - last) / 1000, 0.033)
      last = now
      const dx = pos.x - rest.x, dy = pos.y - rest.y
      vel.x += (-320 * dx - 24 * vel.x) * dt
      vel.y += (-320 * dy - 24 * vel.y) * dt
      pos.x += vel.x * dt
      pos.y += vel.y * dt
      moveBead({ x: pos.x, y: pos.y })
      if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3 || Math.abs(vel.x) > 0.3 || Math.abs(vel.y) > 0.3)
        rafRef.current = requestAnimationFrame(tick)
      else moveBead(rest)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  function handleBeadPointerDown(e: React.PointerEvent) {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    cancelRaf()

    const startSvg = toSVG(e.clientX, e.clientY)
    if (!startSvg) return
    const startBead = { ...beadRef.current }
    const att = ATTACH[lampType]
    const MAX_DIST = 155

    setIsDragging(true)

    const onMove = (me: PointerEvent) => {
      const cur = toSVG(me.clientX, me.clientY)
      if (!cur) return
      let nx = startBead.x + (cur.x - startSvg.x)
      let ny = startBead.y + (cur.y - startSvg.y)
      // clamp to max rope length from attachment
      const dx = nx - att.x, dy = ny - att.y
      const dist = Math.hypot(dx, dy)
      if (dist > MAX_DIST) { nx = att.x + dx/dist*MAX_DIST; ny = att.y + dy/dist*MAX_DIST }
      moveBead({ x: nx, y: ny })
    }

    const onUp = () => {
      setIsDragging(false)
      const rest = REST[lampType]
      const cur  = beadRef.current
      const dist = Math.hypot(cur.x - rest.x, cur.y - rest.y)
      // toggle: pulled far enough OR barely moved (pure click)
      springBack(dist > 22 || dist < 4)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup',   onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup',   onUp)
  }

  const LampSVG = lampType==='floor' ? FloorLamp
    : lampType==='pendant' ? PendantLamp
    : lampType==='lantern' ? LanternLamp
    : ModernLamp

  const svgProps: SVGProps = {
    phase, col, beadPos, isDragging, swinging,
    hintId, svgRef, onBeadPointerDown: handleBeadPointerDown,
  }

  // ── Compact (grid thumbnail) ─────────────────────────────────────────────
  if (compact) {
    const src = LIGHT_SRC[lampType]
    return (
      <>
        <style>{KF}{`@keyframes ${hintId}{0%,100%{opacity:.10}50%{opacity:.32}}`}</style>
        <div style={{
          position:'relative', background:'#08080b', borderRadius:12,
          overflow:'hidden', width:'100%', minHeight:155,
          display:'flex', alignItems:'center', padding:'8px',
          boxSizing:'border-box', fontFamily:'system-ui,-apple-system,sans-serif', gap:8,
        }}>
          <div style={{
            position:'absolute', inset:0,
            background:`radial-gradient(ellipse 70% 75% at ${src.x}px ${src.y}px, ${col.cone} 0%, transparent 100%)`,
            opacity:lit?1:0, transition:'opacity 0.6s', pointerEvents:'none', zIndex:0,
          }}/>
          <div style={{position:'relative', width:110, flexShrink:0, height:140, zIndex:1}}>
            <LampSVG {...svgProps}/>
          </div>
          <div style={{flex:1, opacity:isOn?1:0.06, filter:isOn?'none':'blur(4px)', transition:'opacity 0.7s,filter 0.7s', zIndex:1}}>
            <div style={{
              background:'rgba(10,10,16,0.96)', borderRadius:8, padding:'8px 10px',
              border:`1px solid ${isOn?col.beam+'28':'rgba(255,255,255,0.04)'}`, transition:'all 0.6s',
            }}>
              <p style={{fontSize:10, fontWeight:700, color:'#fff', margin:'0 0 7px', textAlign:'center'}}>{title}</p>
              <div style={{display:'flex', flexDirection:'column', gap:4}}>
                <div style={{height:18, borderRadius:4, background:'#0c0c16', border:'1px solid #181826'}}/>
                <div style={{height:18, borderRadius:4, background:'#0c0c16', border:'1px solid #181826'}}/>
                <div style={{height:20, borderRadius:4, background:isOn?col.btnGrad:'#281840', transition:'background 0.6s'}}/>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ── Full mode ─────────────────────────────────────────────────────────────
  const lsrc = LIGHT_PCT[lampType]
  const fmShadow = isOn ? `-12px 0 50px ${col.glow}40, 0 8px 32px rgba(0,0,0,0.65)` : '0 4px 30px rgba(0,0,0,0.6)'
  const fmBg     = isOn ? `linear-gradient(115deg, ${col.mid} 0%, rgba(12,10,16,0.96) 50%)` : 'rgba(12,10,16,0.94)'
  const fmBorL   = isOn ? `1px solid ${col.beam}45` : '1px solid rgba(255,255,255,0.07)'
  const fmBorD   = isOn ? `1px solid ${col.beam}18` : '1px solid rgba(255,255,255,0.04)'

  return (
    <>
      <style>{KF}{`@keyframes ${hintId}{0%,100%{opacity:.10}50%{opacity:.32}}`}</style>
      <div style={{
        position:'relative', width:'100%', minHeight:520,
        background:'linear-gradient(155deg, #1c1208 0%, #100d08 40%, #080808 100%)',
        borderRadius:16, overflow:'hidden',
        display:'flex', boxSizing:'border-box',
        fontFamily:'system-ui,-apple-system,sans-serif',
      }}>

        {/* hint */}
        <p style={{
          position:'absolute', top:22, left:30, margin:0,
          fontSize:8.5, color:'#3a2e1a', letterSpacing:'0.22em',
          textTransform:'uppercase', userSelect:'none', zIndex:3,
        }}>Pull the string to toggle login</p>

        {/* scene light overlay */}
        <div style={{
          position:'absolute', inset:0,
          background:[
            `radial-gradient(ellipse 14% 9% at ${lsrc.x} ${lsrc.y}, ${col.spot} 0%, transparent 100%)`,
            `radial-gradient(ellipse 90% 88% at ${lsrc.x} ${lsrc.y}, ${col.cone} 0%, transparent 100%)`,
            `radial-gradient(ellipse 80% 14% at ${lsrc.x} 97%, ${col.mid} 0%, transparent 100%)`,
          ].join(', '),
          opacity: lit?(isFl?undefined:1):0,
          animation: isOn?'ll-cone-pulse 3.4s ease-in-out infinite':(isFl?'ll-flicker 0.65s ease-out forwards':'none'),
          transition: isFl?'none':'opacity 0.7s ease',
          pointerEvents:'none', zIndex:0,
        }}/>

        {/* Left: lamp */}
        <div style={{
          flex:'0 0 55%', position:'relative', zIndex:1,
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:'20px 0 20px 20px',
        }}>
          <div style={{width:'100%', maxWidth:340, aspectRatio:'340 / 480'}}>
            <LampSVG {...svgProps}/>
          </div>
        </div>

        {/* Right: form */}
        <div style={{
          flex:'1 1 auto', display:'flex', alignItems:'center', justifyContent:'center',
          padding:'24px 32px 24px 12px', zIndex:1,
        }}>
          <div style={{
            width:'100%', maxWidth:300,
            opacity: isOn?1:(isFl?undefined:0.04),
            filter:  isOn?'none':(isFl?undefined:'blur(6px)'),
            animation: isFl?'ll-flicker 0.65s ease-out forwards':'none',
            transition: isFl?'none':'opacity 0.85s ease,filter 0.85s ease',
          }}>
            <div style={{
              position:'relative',
              background:fmBg,
              borderTop:fmBorL, borderLeft:fmBorL, borderRight:fmBorD, borderBottom:fmBorD,
              borderRadius:16, padding:'26px 24px',
              backdropFilter:'blur(20px)',
              boxShadow:fmShadow,
              transition:'box-shadow 0.7s ease,background 0.7s ease,border-color 0.7s ease',
            }}>
              <div style={{
                position:'absolute', top:0, left:0, bottom:0, width:'50%',
                background:`linear-gradient(to right,${col.mid},transparent)`,
                borderRadius:'15px 0 0 15px',
                opacity:isOn?1:0, transition:'opacity 0.7s', pointerEvents:'none',
              }}/>
              <h2 style={{
                position:'relative', textAlign:'center', margin:'0 0 20px',
                fontSize:20, fontWeight:700, color:'#ffffff', letterSpacing:'-0.02em',
                textShadow:isOn?`0 0 30px ${col.beam}60`:'none', transition:'text-shadow 0.6s',
              }}>{title}</h2>
              <div style={{display:'flex', flexDirection:'column', gap:11, position:'relative'}}>
                <input readOnly placeholder="Email address" type="email" style={fld(col,isOn)}/>
                <div style={{position:'relative'}}>
                  <input readOnly placeholder="Password" type={showPass?'text':'password'}
                    style={{...fld(col,isOn), paddingRight:36}}/>
                  <button onClick={()=>setShowPass(v=>!v)} style={{
                    position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', color:'#505068', cursor:'pointer', fontSize:13, padding:2,
                  }}>{showPass?'◉':'◎'}</button>
                </div>
                <div style={{textAlign:'right'}}>
                  <span style={{fontSize:11, color:'#8b7cf8', cursor:'pointer'}}>Forgot Password?</span>
                </div>
                <button style={{
                  width:'100%', padding:'12px', borderRadius:9, border:'none',
                  background:isOn?col.btnGrad:'rgba(60,40,100,0.4)',
                  color:isOn?'#fff':'#706880',
                  fontSize:13, fontWeight:700, cursor:isOn?'pointer':'default',
                  letterSpacing:'0.08em', textTransform:'uppercase',
                  transition:'background 0.6s,color 0.6s',
                  boxShadow:isOn?`0 4px 22px ${col.glow}40`:'none',
                }}>{buttonLabel}</button>
                {showGoogle&&(
                  <>
                    <div style={{display:'flex', alignItems:'center', gap:7}}>
                      <div style={{flex:1, height:1, background:'#181826'}}/>
                      <span style={{fontSize:10, color:'#2c2c3e'}}>or</span>
                      <div style={{flex:1, height:1, background:'#181826'}}/>
                    </div>
                    <button style={{
                      width:'100%', padding:'10px', borderRadius:9,
                      border:isOn?`1px solid ${col.beam}22`:'1px solid #181826',
                      background:isOn?'rgba(8,6,14,0.96)':'#080610',
                      color:isOn?'#b0b0c8':'#484858',
                      fontSize:12, cursor:isOn?'pointer':'default',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                      transition:'border-color 0.6s,color 0.6s',
                    }}>
                      <GoogleIcon/>Continue with Google
                    </button>
                  </>
                )}
              </div>
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
    width:'100%', padding:'11px 13px', borderRadius:8,
    border: isOn?`1px solid ${col.beam}30`:'1px solid #1c1c2e',
    background: isOn?'rgba(5,4,10,0.98)':'#05040a',
    color:'#c8c8d8', fontSize:13, outline:'none',
    boxSizing:'border-box', transition:'border-color 0.6s',
  }
}

function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" style={{flexShrink:0}}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
