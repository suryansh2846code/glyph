import { useState, useRef, useEffect, useId } from 'react'

export type LampType = 'modern' | 'floor' | 'pendant' | 'lantern'
type LampColor  = 'amber' | 'cool' | 'rose'
type Phase      = 'off'   | 'flicker' | 'on'
type Vec2       = { x: number; y: number }

// ── Color presets + dynamic palette from hex ──────────────────────────────────
const PRESET_HUES: Record<LampColor, number> = { amber:38, cool:210, rose:330 }

// Extract hue + saturation from hex; clamp S to lamp-usable range
function hexToLampHS(hex: string): { h: number; s: number } {
  if (!hex.startsWith('#') || hex.length < 7) return { h:38, s:90 }
  const r = parseInt(hex.slice(1,3),16)/255
  const g = parseInt(hex.slice(3,5),16)/255
  const b = parseInt(hex.slice(5,7),16)/255
  const max = Math.max(r,g,b), min = Math.min(r,g,b)
  if (max === min) return { h:38, s:22 }   // achromatic → warm-white
  const d = max - min, l = (max+min)/2
  const sRaw = l > 0.5 ? d/(2-max-min) : d/(max+min)
  let hFrac = 0
  if      (max === r) hFrac = ((g-b)/d + (g<b?6:0)) / 6
  else if (max === g) hFrac = ((b-r)/d + 2) / 6
  else                hFrac = ((r-g)/d + 4) / 6
  const h = Math.round(hFrac * 360)
  // Boost low-saturation picks so lamp light is always visible (min 65%),
  // cap at 92% to avoid garish neon. This keeps the hue faithful.
  const s = Math.min(Math.max(Math.round(sRaw*100), 65), 92)
  return { h, s }
}

function makeCol(h: number, s = 90) {
  const l = 63
  return {
    beam:    `hsl(${h},${s}%,${l}%)`,
    cone:    `hsla(${h},${s}%,${l}%,0.22)`,
    mid:     `hsla(${h},${s}%,${l}%,0.08)`,
    glow:    `hsla(${h},${Math.min(s+5,95)}%,${l-3}%,0.75)`,
    spot:    `hsla(${h},${s}%,${l}%,0.55)`,
    btnGrad: `linear-gradient(135deg,hsl(${(h+200)%360},55%,38%),hsl(${(h+230)%360},50%,32%))`,
    beam0:   `hsla(${h},${s}%,${l}%,0)`,
    beam55:  `hsla(${h},${s}%,${l}%,0.55)`,
    mid10:   `hsla(${h},${s}%,${l}%,0.10)`,
  }
}

// ── Rope attachment + rest positions ──────────────────────────────────────────
const ATTACH: Record<LampType, Vec2> = {
  modern:  { x:100, y:88  },
  floor:   { x:100, y:133 },
  pendant: { x:100, y:207 },
  lantern: { x:100, y:259 },
}
const SWING_PIVOT: Partial<Record<LampType, Vec2>> = {
  pendant: { x:100, y:14 },
  lantern: { x:100, y:10 },
}
const REST: Record<LampType, Vec2> = {
  modern:  { x:100, y:167 },
  floor:   { x:100, y:210 },
  pendant: { x:100, y:279 },
  lantern: { x:100, y:331 },
}
const BEAD_R = 13

function rotateAround(pt: Vec2, pivot: Vec2, angle: number): Vec2 {
  const dx = pt.x - pivot.x, dy = pt.y - pivot.y
  return {
    x: pivot.x + dx * Math.cos(angle) - dy * Math.sin(angle),
    y: pivot.y + dx * Math.sin(angle) + dy * Math.cos(angle),
  }
}
function computeAttach(type: LampType, angle: number): Vec2 {
  const pivot = SWING_PIVOT[type]
  if (!pivot || angle === 0) return ATTACH[type]
  return rotateAround(ATTACH[type], pivot, angle)
}

// ── Rope bezier path ──────────────────────────────────────────────────────────
function ropePath(attach: Vec2, bx: number, by: number): string {
  const ex = bx, ey = by - BEAD_R
  const dx = ex - attach.x, dy = ey - attach.y
  const sag = Math.max(0, Math.abs(dx) * 0.28 + Math.max(0, -dy) * 0.12)
  return `M ${attach.x} ${attach.y} Q ${(attach.x+ex)/2} ${(attach.y+ey)/2+sag} ${ex} ${ey}`
}

// ── Keyframes ─────────────────────────────────────────────────────────────────
const KF = `
@keyframes ll-flicker {
  0%,100%{opacity:0} 10%{opacity:.85} 16%{opacity:0}
  30%{opacity:1} 36%{opacity:.12} 50%{opacity:1}
  56%{opacity:.45} 76%{opacity:1}
}
@keyframes ll-cone-pulse { 0%,100%{opacity:1} 50%{opacity:.74} }
`

// ── Material colours for lamp bodies ─────────────────────────────────────────
const M = {
  /* shade gradient stops */
  shHi:  '#828298', shMid: '#484860', shLo:  '#1c1c28',
  /* pole */
  poHi:  '#56567a', poMid: '#303048', poLo:  '#080810',
  /* base */
  baHi:  '#484864', baMid: '#242436', baLo:  '#0e0e1a',
  /* rim / stroke */
  rim:   '#484862',
}

function bodyStyle(phase: Phase): React.CSSProperties {
  const lit = phase !== 'off', fl = phase === 'flicker'
  return {
    opacity:    fl ? undefined : (lit ? 1 : 0.55),
    transition: fl ? 'none' : 'opacity 0.9s ease',
    animation:  fl ? 'll-flicker 0.65s ease-out forwards' : 'none',
  }
}

// ── Rope (path-based, lit by lamp color) ──────────────────────────────────────
function Rope({ d, lit, col }: { d:string; lit:boolean; col:ReturnType<typeof makeCol> }) {
  return (
    <g style={{ pointerEvents:'none' }}>
      <path d={d} fill="none" stroke={col.cone}          strokeWidth="16" strokeLinecap="round" opacity={lit?0.85:0} style={{filter:'blur(6px)',transition:'opacity 0.7s'}}/>
      <path d={d} fill="none" stroke="rgba(3,1,0,0.75)"  strokeWidth="9.5" strokeLinecap="round"/>
      <path d={d} fill="none" stroke={lit?'#9c7040':'#3a2a14'} strokeWidth="7.5" strokeLinecap="round" style={{transition:'stroke 0.7s'}}/>
      <path d={d} fill="none" stroke={lit?col.glow:'rgba(148,112,54,0.60)'} strokeWidth="4" strokeDasharray="9,9" strokeDashoffset="0"  strokeLinecap="butt" style={{transition:'stroke 0.7s'}}/>
      <path d={d} fill="none" stroke="rgba(14,5,0,0.82)"  strokeWidth="4" strokeDasharray="9,9" strokeDashoffset="9"  strokeLinecap="butt"/>
      <path d={d} fill="none" stroke={lit?col.glow:'rgba(190,145,70,0.14)'} strokeWidth="1.4" strokeLinecap="round" opacity={lit?0.55:1} style={{transition:'stroke 0.7s,opacity 0.7s'}}/>
    </g>
  )
}

// ── Bead ──────────────────────────────────────────────────────────────────────
function Bead({ cx, cy, lit, isDragging, hintId, onPointerDown }: {
  cx:number; cy:number; lit:boolean; isDragging:boolean
  hintId:string; onPointerDown:(e:React.PointerEvent)=>void
}) {
  return (
    <g onPointerDown={onPointerDown} style={{ cursor:isDragging?'grabbing':'grab' }}>
      <circle cx={cx} cy={cy} r={BEAD_R+14} fill="transparent"/>
      {!lit && !isDragging && (
        <circle cx={cx} cy={cy} r={BEAD_R+9} fill="#c8a84b" opacity="0.10"
          style={{ animation:`${hintId} 2.4s ease-in-out infinite` }}/>
      )}
      <circle cx={cx} cy={cy} r={BEAD_R}         fill="url(#bead-sh)" stroke="#deba58" strokeWidth="2.2"/>
      <circle cx={cx} cy={cy} r={BEAD_R*0.46}    fill="#f5e070" opacity="0.72"/>
      <circle cx={cx-BEAD_R*0.38} cy={cy-BEAD_R*0.34} r={BEAD_R*0.22} fill="rgba(255,252,200,0.65)"/>
    </g>
  )
}

// ── Shared SVG defs (bead gradient — no instance ID needed, identical) ────────
const SHARED_DEFS = (
  <defs>
    <radialGradient id="bead-sh" cx="38%" cy="32%" r="68%">
      <stop offset="0%"   stopColor="#f0c84a"/>
      <stop offset="55%"  stopColor="#c8a030"/>
      <stop offset="100%" stopColor="#7a5818"/>
    </radialGradient>
  </defs>
)

// ── SVG props ─────────────────────────────────────────────────────────────────
interface SVGProps {
  phase: Phase
  col: ReturnType<typeof makeCol>
  beadPos: Vec2
  attachPos: Vec2
  swingAngle: number
  isDragging: boolean
  hintId: string
  uid: string
  svgRef: React.RefObject<SVGSVGElement | null>
  onBeadPointerDown: (e: React.PointerEvent) => void
}

// ── Flicker helpers ───────────────────────────────────────────────────────────
function fk(fl:boolean) { return fl ? 'll-flicker 0.65s ease-out forwards' : 'none' }
function fadeProp(fl:boolean, lit:boolean, val:number) { return { opacity: fl?undefined:(lit?val:0), style:{transition:'opacity 0.5s', animation:fk(fl)} } }

// ─────────────────────────────────────────────────────────────────────────────
// ── Modern lamp ───────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function ModernLamp({ phase, col, beadPos, attachPos, isDragging, hintId, uid, svgRef, onBeadPointerDown }: SVGProps) {
  const lit = phase !== 'off', fl = phase === 'flicker'
  const rd = ropePath(attachPos, beadPos.x, beadPos.y)
  const s = `sh${uid}`, p = `po${uid}`, b = `ba${uid}`, c = `co${uid}`, gi = `gi${uid}`

  return (
    <svg ref={svgRef} viewBox="0 0 200 400" width="100%" height="100%" style={{overflow:'visible',display:'block'}}>
      {SHARED_DEFS}
      <defs>
        <linearGradient id={s} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={M.shHi}/>
          <stop offset="22%"  stopColor={M.shMid}/>
          <stop offset="70%"  stopColor={M.shLo}/>
          <stop offset="100%" stopColor="#0e0e18"/>
        </linearGradient>
        <linearGradient id={p} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={M.poLo}/>
          <stop offset="28%"  stopColor={M.poMid}/>
          <stop offset="46%"  stopColor={M.poHi}/>
          <stop offset="58%"  stopColor={M.poMid}/>
          <stop offset="100%" stopColor={M.poLo}/>
        </linearGradient>
        <radialGradient id={b} cx="38%" cy="30%" r="72%">
          <stop offset="0%"   stopColor={M.baHi}/>
          <stop offset="55%"  stopColor={M.baMid}/>
          <stop offset="100%" stopColor={M.baLo}/>
        </radialGradient>
        {/* cone: bright at source, fades down */}
        <linearGradient id={c} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={col.beam} stopOpacity="0.60"/>
          <stop offset="100%" stopColor={col.beam} stopOpacity="0"/>
        </linearGradient>
        {/* inner shade glow */}
        <radialGradient id={gi} cx="50%" cy="100%" r="90%">
          <stop offset="0%"   stopColor={col.beam} stopOpacity="0.70"/>
          <stop offset="100%" stopColor={col.beam} stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Room atmosphere when lit */}
      {lit && <ellipse cx="100" cy="180" rx="195" ry="230" fill={col.mid} opacity={fl?undefined:0.55} style={{filter:'blur(55px)',transition:'opacity 0.7s',animation:fk(fl)}}/>}
      {/* Floor pool */}
      <ellipse cx="100" cy="356" rx="110" ry="16" fill={lit?col.cone:'rgba(0,0,0,0)'} style={{filter:'blur(20px)',transition:'fill 0.7s'}}/>
      {/* Floor shadow (always) */}
      <ellipse cx="100" cy="350" rx="75" ry="8" fill="rgba(0,0,0,0.72)" style={{filter:'blur(10px)'}}/>

      <g style={bodyStyle(phase)}>
        {/* Light cone */}
        <polygon points="32,87 168,87 560,900 -360,900" fill={`url(#${c})`}
          {...fadeProp(fl,lit,1)} style={{transition:'opacity 0.6s',animation:fk(fl)}}/>
        {/* Glow bloom */}
        <ellipse cx="100" cy="87" rx="110" ry="60" fill={col.spot}
          {...fadeProp(fl,lit,1)} style={{filter:'blur(18px)',transition:'opacity 0.5s',animation:fk(fl)}}/>

        {/* Top cap */}
        <ellipse cx="100" cy="70" rx="82" ry="12" fill={`url(#${s})`} stroke={M.rim} strokeWidth="1.2"/>
        <ellipse cx="100" cy="65" rx="72" ry="5"  fill="none" stroke="rgba(200,200,255,0.14)" strokeWidth="1.5"/>

        {/* Shade body */}
        <path d="M20 66 L180 66 L168 87 L32 87 Z" fill={`url(#${s})`} stroke={M.rim} strokeWidth="1"/>
        {/* Shade inner warm fill when lit */}
        <path d="M20 66 L180 66 L168 87 L32 87 Z" fill={`url(#${gi})`}
          opacity={fl?undefined:(lit?1:0)} style={{transition:'opacity 0.6s',animation:fk(fl)}}/>
        {/* Shade edge highlight */}
        <line x1="22" y1="67" x2="30" y2="87"  stroke="rgba(180,180,220,0.18)" strokeWidth="1.5" strokeLinecap="round"/>

        {/* Bottom rim */}
        <ellipse cx="100" cy="87" rx="68" ry="7"  fill={`url(#${s})`} stroke={M.rim} strokeWidth="1"/>
        <ellipse cx="100" cy="87" rx="62" ry="6"  fill={col.beam} {...fadeProp(fl,lit,0.7)} style={{filter:'blur(2px)',transition:'opacity 0.4s',animation:fk(fl)}}/>

        {/* Pole */}
        <rect x="97" y="87" width="6" height="242" rx="3" fill={`url(#${p})`}/>
        <rect x="99.5" y="90" width="1.5" height="236" rx="0.75" fill="rgba(160,160,220,0.12)"/>

        {/* Base shadow ring */}
        <ellipse cx="100" cy="334" rx="64" ry="6" fill="rgba(0,0,0,0.55)"/>
        {/* Base body */}
        <rect  x="38"  y="329" width="124" height="13" rx="6" fill={`url(#${b})`} stroke={M.rim} strokeWidth="1.2"/>
        <ellipse cx="100" cy="329" rx="62" ry="9" fill={`url(#${b})`} stroke={M.rim} strokeWidth="1"/>
        <ellipse cx="100" cy="342" rx="62" ry="8" fill={M.baLo}/>
        <ellipse cx="100" cy="337" rx="52" ry="3" fill="none" stroke="rgba(180,180,220,0.10)" strokeWidth="1"/>
      </g>

      <Rope d={rd} lit={lit} col={col}/>
      <Bead cx={beadPos.x} cy={beadPos.y} lit={lit} isDragging={isDragging} hintId={hintId} onPointerDown={onBeadPointerDown}/>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Floor lamp ────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function FloorLamp({ phase, col, beadPos, attachPos, isDragging, hintId, uid, svgRef, onBeadPointerDown }: SVGProps) {
  const lit = phase !== 'off', fl = phase === 'flicker'
  const rd = ropePath(attachPos, beadPos.x, beadPos.y)
  const s = `fsh${uid}`, p = `fpo${uid}`, b = `fba${uid}`, c = `fco${uid}`, gi = `fgi${uid}`

  return (
    <svg ref={svgRef} viewBox="0 0 200 420" width="100%" height="100%" style={{overflow:'visible',display:'block'}}>
      {SHARED_DEFS}
      <defs>
        <linearGradient id={s} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={M.shHi}/>
          <stop offset="22%"  stopColor={M.shMid}/>
          <stop offset="72%"  stopColor={M.shLo}/>
          <stop offset="100%" stopColor="#0e0e18"/>
        </linearGradient>
        <linearGradient id={p} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={M.poLo}/>
          <stop offset="30%"  stopColor={M.poMid}/>
          <stop offset="48%"  stopColor={M.poHi}/>
          <stop offset="60%"  stopColor={M.poMid}/>
          <stop offset="100%" stopColor={M.poLo}/>
        </linearGradient>
        <radialGradient id={b} cx="38%" cy="30%" r="72%">
          <stop offset="0%"   stopColor={M.baHi}/>
          <stop offset="55%"  stopColor={M.baMid}/>
          <stop offset="100%" stopColor={M.baLo}/>
        </radialGradient>
        <linearGradient id={c} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={col.beam} stopOpacity="0.58"/>
          <stop offset="100%" stopColor={col.beam} stopOpacity="0"/>
        </linearGradient>
        <radialGradient id={gi} cx="50%" cy="100%" r="90%">
          <stop offset="0%"   stopColor={col.beam} stopOpacity="0.68"/>
          <stop offset="100%" stopColor={col.beam} stopOpacity="0"/>
        </radialGradient>
      </defs>

      {lit && <ellipse cx="100" cy="180" rx="195" ry="235" fill={col.mid} opacity={fl?undefined:0.50} style={{filter:'blur(55px)',transition:'opacity 0.7s',animation:fk(fl)}}/>}
      <ellipse cx="100" cy="372" rx="110" ry="16" fill={lit?col.cone:'rgba(0,0,0,0)'} style={{filter:'blur(22px)',transition:'fill 0.7s'}}/>
      <ellipse cx="100" cy="366" rx="75"  ry="8"  fill="rgba(0,0,0,0.72)" style={{filter:'blur(10px)'}}/>

      <g style={bodyStyle(phase)}>
        {/* Small top cap */}
        <ellipse cx="100" cy="56" rx="20" ry="7" fill={`url(#${s})`} stroke={M.rim} strokeWidth="1.2"/>
        <ellipse cx="100" cy="53" rx="13" ry="3" fill="none" stroke="rgba(200,200,255,0.12)" strokeWidth="1"/>

        {/* Cone */}
        <polygon points="22,132 178,132 560,900 -360,900" fill={`url(#${c})`} {...fadeProp(fl,lit,1)} style={{transition:'opacity 0.6s',animation:fk(fl)}}/>
        <ellipse cx="100" cy="132" rx="100" ry="52" fill={col.spot} {...fadeProp(fl,lit,1)} style={{filter:'blur(20px)',transition:'opacity 0.5s',animation:fk(fl)}}/>

        {/* Shade */}
        <path d="M80 56 L120 56 L178 132 L22 132 Z" fill={`url(#${s})`} stroke={M.rim} strokeWidth="1"/>
        <path d="M80 56 L120 56 L178 132 L22 132 Z" fill={`url(#${gi})`} opacity={fl?undefined:(lit?1:0)} style={{transition:'opacity 0.6s',animation:fk(fl)}}/>
        <line x1="22" y1="133" x2="25" y2="120" stroke="rgba(180,180,220,0.16)" strokeWidth="1.5" strokeLinecap="round"/>

        {/* Bottom rim */}
        <ellipse cx="100" cy="132" rx="78" ry="12" fill={`url(#${s})`} stroke={M.rim} strokeWidth="1.2"/>
        <ellipse cx="100" cy="132" rx="70" ry="7" fill={col.beam} {...fadeProp(fl,lit,0.65)} style={{filter:'blur(2px)',transition:'opacity 0.4s',animation:fk(fl)}}/>

        {/* Pole */}
        <rect x="97" y="132" width="6" height="218" rx="3" fill={`url(#${p})`}/>
        <rect x="99.5" y="136" width="1.5" height="210" rx="0.75" fill="rgba(160,160,220,0.10)"/>

        {/* Base */}
        <ellipse cx="100" cy="356" rx="64" ry="6" fill="rgba(0,0,0,0.55)"/>
        <rect  x="38"  y="350" width="124" height="13" rx="6" fill={`url(#${b})`} stroke={M.rim} strokeWidth="1.2"/>
        <ellipse cx="100" cy="350" rx="62" ry="9" fill={`url(#${b})`} stroke={M.rim} strokeWidth="1"/>
        <ellipse cx="100" cy="363" rx="62" ry="8" fill={M.baLo}/>
        <ellipse cx="100" cy="358" rx="52" ry="3" fill="none" stroke="rgba(180,180,220,0.10)" strokeWidth="1"/>
      </g>

      <Rope d={rd} lit={lit} col={col}/>
      <Bead cx={beadPos.x} cy={beadPos.y} lit={lit} isDragging={isDragging} hintId={hintId} onPointerDown={onBeadPointerDown}/>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Pendant lamp ──────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function PendantLamp({ phase, col, beadPos, attachPos, swingAngle, isDragging, hintId, uid, svgRef, onBeadPointerDown }: SVGProps) {
  const lit = phase !== 'off', fl = phase === 'flicker'
  const rd = ropePath(attachPos, beadPos.x, beadPos.y)
  const swingDeg = swingAngle * (180/Math.PI)
  const cord = `pco${uid}`, bulb = `pbu${uid}`, shade = `psh${uid}`, cone = `pce${uid}`

  return (
    <svg ref={svgRef} viewBox="0 0 200 380" width="100%" height="100%" style={{overflow:'visible',display:'block'}}>
      {SHARED_DEFS}
      <defs>
        <linearGradient id={cord} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#0a0a14"/>
          <stop offset="40%"  stopColor="#38384e"/>
          <stop offset="52%"  stopColor="#505068"/>
          <stop offset="65%"  stopColor="#38384e"/>
          <stop offset="100%" stopColor="#0a0a14"/>
        </linearGradient>
        <radialGradient id={bulb} cx="50%" cy="40%" r="60%">
          <stop offset="0%"   stopColor={lit?col.beam:'#e8e8f0'}/>
          <stop offset="60%"  stopColor={lit?col.glow:'#a0a0b8'} stopOpacity="0.6"/>
          <stop offset="100%" stopColor={lit?col.beam:'#606078'} stopOpacity="0"/>
        </radialGradient>
        <linearGradient id={shade} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={M.shHi}/>
          <stop offset="25%"  stopColor={M.shMid}/>
          <stop offset="75%"  stopColor={M.shLo}/>
          <stop offset="100%" stopColor="#0e0e18"/>
        </linearGradient>
        <linearGradient id={cone} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={col.beam} stopOpacity="0.55"/>
          <stop offset="100%" stopColor={col.beam} stopOpacity="0"/>
        </linearGradient>
      </defs>

      <Rope d={rd} lit={lit} col={col}/>

      {lit && <ellipse cx="100" cy="200" rx="190" ry="210" fill={col.mid} opacity={fl?undefined:0.55} style={{filter:'blur(55px)',transition:'opacity 0.7s',animation:fk(fl)}}/>}
      <ellipse cx="100" cy="360" rx="100" ry="14" fill={lit?col.cone:'rgba(0,0,0,0)'} style={{filter:'blur(20px)',transition:'fill 0.7s'}}/>
      <ellipse cx="100" cy="355" rx="68"  ry="7"  fill="rgba(0,0,0,0.68)" style={{filter:'blur(9px)'}}/>

      <g style={bodyStyle(phase)}>
        {/* Ceiling plate */}
        <ellipse cx="100" cy="14" rx="32" ry="8"  fill={`url(#${shade})`} stroke={M.rim} strokeWidth="1.2"/>
        <rect    x="68"  y="6"  width="64" height="14" rx="5" fill={`url(#${shade})`} stroke={M.rim} strokeWidth="1"/>
        <ellipse cx="100" cy="11" rx="26" ry="3" fill="none" stroke="rgba(200,200,255,0.12)" strokeWidth="1"/>

        {/* Swinging body */}
        <g style={{ transformOrigin:'100px 14px', transform:`rotate(${swingDeg}deg)` }}>
          {/* Cord (metallic) */}
          <rect x="98" y="14" width="4" height="108" rx="2" fill={`url(#${cord})`}/>

          {/* Junction box */}
          <rect x="88" y="116" width="24" height="18" rx="4" fill={`url(#${shade})`} stroke={M.rim} strokeWidth="1.2"/>
          <rect x="98.5" y="118" width="3" height="14" rx="1.5" fill={`url(#${cord})`}/>
          <rect x="104.5" y="118" width="3" height="14" rx="1.5" fill={`url(#${cord})`}/>

          {/* Light cone */}
          <polygon points="76,134 124,134 440,700 -240,700" fill={`url(#${cone})`}
            {...fadeProp(fl,lit,1)} style={{transition:'opacity 0.6s',animation:fk(fl)}}/>
          <ellipse cx="100" cy="163" rx="90" ry="78" fill={col.spot}
            {...fadeProp(fl,lit,0.9)} style={{filter:'blur(22px)',transition:'opacity 0.5s',animation:fk(fl)}}/>

          {/* Shade dome */}
          <path d="M76 134 Q76 185 100 196 Q124 185 124 134 Z"
            fill={lit?col.beam:M.shLo} opacity={lit?(fl?undefined:0.22):0.9}
            style={{transition:'fill 0.6s,opacity 0.6s',animation:fk(fl)}}/>
          <path d="M76 134 Q76 185 100 196 Q124 185 124 134 Z" fill={`url(#${shade})`} opacity="0.85"/>
          <path d="M76 134 Q76 185 100 196 Q124 185 124 134 Z" fill="none" stroke={M.rim} strokeWidth="1.5"/>
          {/* Dome inner glow */}
          <path d="M80 136 Q80 183 100 194 Q120 183 120 136 Z" fill={col.beam}
            {...fadeProp(fl,lit,0.28)} style={{transition:'opacity 0.6s',animation:fk(fl)}}/>
          {/* Dome highlight */}
          <path d="M82 138 Q80 165 84 185" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="2" strokeLinecap="round"/>

          {/* Filament */}
          <g opacity={lit?0.95:0.18} style={{transition:'opacity 0.5s'}}>
            <path d="M93 152 Q100 146 107 152 Q112 158 107 164 Q100 168 93 164 Q88 158 93 152"
              fill="none" stroke={col.beam} strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="100" y1="152" x2="100" y2="138" stroke={col.beam} strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="100" y1="164" x2="100" y2="176" stroke={col.beam} strokeWidth="1.8" strokeLinecap="round"/>
            {lit && <ellipse cx="100" cy="158" rx="10" ry="14" fill={col.beam} opacity="0.5" style={{filter:'blur(4px)'}}/>}
          </g>

          {/* Bottom cap */}
          <ellipse cx="100" cy="196" rx="24" ry="7" fill={`url(#${shade})`} stroke={M.rim} strokeWidth="1.2"/>
          <rect x="88" y="196" width="24" height="10" rx="3" fill={M.baMid}/>
          <line x1="88" y1="199" x2="112" y2="199" stroke={M.rim} strokeWidth="1"/>
          <line x1="88" y1="203" x2="112" y2="203" stroke={M.rim} strokeWidth="1"/>
          <ellipse cx="100" cy="206" rx="18" ry="5" fill={M.baLo} stroke={M.rim} strokeWidth="1"/>
        </g>
      </g>

      <Bead cx={beadPos.x} cy={beadPos.y} lit={lit} isDragging={isDragging} hintId={hintId} onPointerDown={onBeadPointerDown}/>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Lantern lamp ──────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function LanternLamp({ phase, col, beadPos, attachPos, swingAngle, isDragging, hintId, uid, svgRef, onBeadPointerDown }: SVGProps) {
  const lit = phase !== 'off', fl = phase === 'flicker'
  const rd = ropePath(attachPos, beadPos.x, beadPos.y)
  const swingDeg = swingAngle * (180/Math.PI)
  const chainG = `lch${uid}`, frameG = `lfr${uid}`, glassG = `lgl${uid}`, coneG = `lco${uid}`
  const links = [0,14,28,42,56]

  return (
    <svg ref={svgRef} viewBox="0 0 200 400" width="100%" height="100%" style={{overflow:'visible',display:'block'}}>
      {SHARED_DEFS}
      <defs>
        <linearGradient id={chainG} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#0c0c1a"/>
          <stop offset="35%"  stopColor="#4a4a62"/>
          <stop offset="52%"  stopColor="#606078"/>
          <stop offset="65%"  stopColor="#4a4a62"/>
          <stop offset="100%" stopColor="#0c0c1a"/>
        </linearGradient>
        <linearGradient id={frameG} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#0a0a16"/>
          <stop offset="30%"  stopColor={M.poMid}/>
          <stop offset="52%"  stopColor={M.poHi}/>
          <stop offset="68%"  stopColor={M.poMid}/>
          <stop offset="100%" stopColor="#0a0a16"/>
        </linearGradient>
        <linearGradient id={glassG} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={lit?col.beam:'#10101e'} stopOpacity={lit?0.18:0.85}/>
          <stop offset="35%"  stopColor={lit?col.beam:'#1e1e30'} stopOpacity={lit?0.32:0.92}/>
          <stop offset="100%" stopColor={lit?col.beam:'#10101e'} stopOpacity={lit?0.15:0.80}/>
        </linearGradient>
        <linearGradient id={coneG} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={col.beam} stopOpacity="0.55"/>
          <stop offset="100%" stopColor={col.beam} stopOpacity="0"/>
        </linearGradient>
      </defs>

      <Rope d={rd} lit={lit} col={col}/>

      {lit && <ellipse cx="100" cy="200" rx="190" ry="215" fill={col.mid} opacity={fl?undefined:0.55} style={{filter:'blur(55px)',transition:'opacity 0.7s',animation:fk(fl)}}/>}
      <ellipse cx="100" cy="380" rx="100" ry="14" fill={lit?col.cone:'rgba(0,0,0,0)'} style={{filter:'blur(22px)',transition:'fill 0.7s'}}/>
      <ellipse cx="100" cy="374" rx="68"  ry="7"  fill="rgba(0,0,0,0.70)" style={{filter:'blur(9px)'}}/>

      <g style={bodyStyle(phase)}>
        {/* Ceiling bracket */}
        <rect x="84" y="4" width="32" height="12" rx="5" fill={`url(#${frameG})`} stroke={M.rim} strokeWidth="1.2"/>
        <line x1="86" y1="10" x2="114" y2="10" stroke="rgba(200,200,255,0.12)" strokeWidth="1"/>

        {/* Swinging chain + body */}
        <g style={{ transformOrigin:'100px 10px', transform:`rotate(${swingDeg}deg)` }}>
          {/* Chain links */}
          {links.map(y => (
            <g key={y}>
              <ellipse cx="100" cy={16+y} rx="5" ry="8" fill="none" stroke={`url(#${chainG})`} strokeWidth="2.5"/>
              <ellipse cx="100" cy={16+y} rx="5" ry="8" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8"/>
            </g>
          ))}

          {/* Top collar */}
          <path d="M70 86 L130 86 L122 100 L78 100 Z" fill={`url(#${frameG})`} stroke={M.rim} strokeWidth="1.2"/>
          <ellipse cx="100" cy="86" rx="30" ry="7" fill={`url(#${frameG})`} stroke={M.rim} strokeWidth="1.2"/>
          <line x1="74" y1="89" x2="126" y2="89" stroke="rgba(200,200,255,0.10)" strokeWidth="1"/>

          {/* Corner posts */}
          <line x1="72"  y1="100" x2="68"  y2="218" stroke={`url(#${frameG})`} strokeWidth="4.5" strokeLinecap="round"/>
          <line x1="128" y1="100" x2="132" y2="218" stroke={`url(#${frameG})`} strokeWidth="4.5" strokeLinecap="round"/>
          {/* Post highlight */}
          <line x1="72.5"  y1="102" x2="68.5"  y2="216" stroke="rgba(180,180,220,0.12)" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="128.5" y1="102" x2="132.5" y2="216" stroke="rgba(180,180,220,0.12)" strokeWidth="1.2" strokeLinecap="round"/>

          {/* Glass panels — left/right sides */}
          <rect x="68" y="100" width="64" height="118" rx="1" fill={`url(#${glassG})`} style={{transition:'fill 0.6s',animation:fk(fl)}}/>
          {/* Glass panel divisions */}
          <line x1="68" y1="139" x2="132" y2="139" stroke={M.rim} strokeWidth="1.8"/>
          <line x1="68" y1="179" x2="132" y2="179" stroke={M.rim} strokeWidth="1.8"/>
          {/* Glass edge frames */}
          <rect x="66"  y="99"  width="5" height="120" rx="2" fill={`url(#${frameG})`}/>
          <rect x="129" y="99"  width="5" height="120" rx="2" fill={`url(#${frameG})`}/>

          {/* Inner light / flame */}
          {lit && <ellipse cx="100" cy="160" rx="20" ry="30" fill={col.beam} opacity="0.45" style={{filter:'blur(6px)',animation:fk(fl)}}/>}
          {lit && <ellipse cx="100" cy="148" rx="8"  ry="14" fill={col.beam} opacity={fl?undefined:0.75} style={{filter:'blur(3px)',animation:fk(fl)}}/>}

          {/* Light cone out of bottom */}
          <polygon points="68,218 132,218 560,900 -360,900" fill={`url(#${coneG})`}
            {...fadeProp(fl,lit,1)} style={{transition:'opacity 0.6s',animation:fk(fl)}}/>
          <ellipse cx="100" cy="160" rx="90" ry="82" fill={col.spot}
            {...fadeProp(fl,lit,0.9)} style={{filter:'blur(22px)',transition:'opacity 0.5s',animation:fk(fl)}}/>

          {/* Bottom collar */}
          <path d="M68 218 L132 218 L122 234 L78 234 Z" fill={`url(#${frameG})`} stroke={M.rim} strokeWidth="1.2"/>
          <ellipse cx="100" cy="218" rx="32" ry="7" fill={`url(#${frameG})`} stroke={M.rim} strokeWidth="1.2"/>
          <line x1="74" y1="221" x2="126" y2="221" stroke="rgba(200,200,255,0.10)" strokeWidth="1"/>

          {/* Bottom spike */}
          <path d="M94 234 L100 258 L106 234 Z" fill={`url(#${frameG})`} stroke={M.rim} strokeWidth="1.2"/>
          {/* Spike shine */}
          <line x1="100" y1="236" x2="100" y2="254" stroke="rgba(180,180,220,0.15)" strokeWidth="0.8" strokeLinecap="round"/>
        </g>
      </g>

      <Bead cx={beadPos.x} cy={beadPos.y} lit={lit} isDragging={isDragging} hintId={hintId} onPointerDown={onBeadPointerDown}/>
    </svg>
  )
}

// ── Light source positions ────────────────────────────────────────────────────
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
  lightColor?:  string      // hex override from dev panel
  title?:       string
  buttonLabel?: string
  showGoogle?:  boolean
  compact?:     boolean
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LampLogin({
  lampType    = 'modern',
  lampColor   = 'amber',
  lightColor,
  title       = 'Welcome Back',
  buttonLabel = 'Sign In',
  showGoogle  = true,
  compact     = false,
}: LampLoginProps) {
  const [phase,      setPhase]      = useState<Phase>('off')
  const [toggling,   setToggling]   = useState(false)
  const [swingAngle, setSwingAngle] = useState(0)
  const [showPass,   setShowPass]   = useState(false)
  const [beadPos,    setBeadPos]    = useState<Vec2>(() => REST[lampType])
  const [isDragging, setIsDragging] = useState(false)

  const beadRef      = useRef<Vec2>(REST[lampType])
  const velRef       = useRef<Vec2>({ x:0, y:0 })
  const rafRef       = useRef<number | null>(null)
  const swingAngleRef = useRef(0)
  const swingVelRef  = useRef(0)
  const swingRafRef  = useRef<number | null>(null)
  const attachRef    = useRef<Vec2>(ATTACH[lampType])
  const svgRef       = useRef<SVGSVGElement | null>(null)

  const rawUid = useId()
  const uid    = rawUid.replace(/:/g,'')
  const hintId = `ll-hint-${uid}`

  // Derive h+s from hex pick; fallback to preset hue at full saturation
  const { h, s } = lightColor
    ? hexToLampHS(lightColor)
    : { h: PRESET_HUES[lampColor], s: 90 }
  const col = makeCol(h, s)

  const isOn = phase === 'on'
  const isFl = phase === 'flicker'
  const lit  = phase !== 'off'

  const attachPos = computeAttach(lampType, swingAngle)
  attachRef.current = attachPos

  useEffect(() => {
    cancelRaf(); cancelSwingRaf()
    swingAngleRef.current = 0; swingVelRef.current = 0; setSwingAngle(0)
    const r = REST[lampType]
    beadRef.current = r; setBeadPos(r)
  }, [lampType])

  useEffect(() => () => { cancelRaf(); cancelSwingRaf() }, [])

  function cancelRaf() {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
  }
  function cancelSwingRaf() {
    if (swingRafRef.current !== null) { cancelAnimationFrame(swingRafRef.current); swingRafRef.current = null }
  }
  function moveBead(v: Vec2) { beadRef.current = v; setBeadPos(v) }

  function toSVG(cx: number, cy: number): Vec2 | null {
    const svg = svgRef.current; if (!svg) return null
    const pt = svg.createSVGPoint(), ctm = svg.getScreenCTM()
    if (!ctm) return null
    pt.x = cx; pt.y = cy
    const r = pt.matrixTransform(ctm.inverse())
    return { x: r.x, y: r.y }
  }

  function startSwingAnimation() {
    cancelSwingRaf()
    swingAngleRef.current = 0.19; swingVelRef.current = 0
    let last = performance.now()
    function tick(now: number) {
      const dt = Math.min((now-last)/1000, 0.033); last = now
      const a = swingAngleRef.current, v = swingVelRef.current
      const nv = v + (-12*a - 4*v)*dt, na = a + nv*dt
      swingAngleRef.current = na; swingVelRef.current = nv
      setSwingAngle(na)
      if (Math.abs(na) > 0.001 || Math.abs(nv) > 0.005)
        swingRafRef.current = requestAnimationFrame(tick)
      else { swingAngleRef.current = 0; setSwingAngle(0) }
    }
    swingRafRef.current = requestAnimationFrame(tick)
  }

  function triggerToggle() {
    if (toggling) return
    setToggling(true)
    if (lampType === 'pendant' || lampType === 'lantern') startSwingAnimation()
    setTimeout(() => {
      setToggling(false)
      if (phase === 'on') setPhase('off')
      else { setPhase('flicker'); setTimeout(() => setPhase('on'), 680) }
    }, 220)
  }

  function springBack(shouldToggle: boolean) {
    if (shouldToggle) triggerToggle()
    cancelRaf()
    const rest = REST[lampType]
    const pos  = { ...beadRef.current }
    const vel  = velRef.current; vel.x = 0; vel.y = 0
    let last = performance.now()
    function tick(now: number) {
      const dt = Math.min((now-last)/1000, 0.033); last = now
      const dx = pos.x - rest.x, dy = pos.y - rest.y
      vel.x += (-320*dx - 24*vel.x)*dt; vel.y += (-320*dy - 24*vel.y)*dt
      pos.x += vel.x*dt; pos.y += vel.y*dt
      moveBead({ x:pos.x, y:pos.y })
      if (Math.abs(dx)>0.3||Math.abs(dy)>0.3||Math.abs(vel.x)>0.3||Math.abs(vel.y)>0.3)
        rafRef.current = requestAnimationFrame(tick)
      else moveBead(rest)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  function handleBeadPointerDown(e: React.PointerEvent) {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    cancelRaf()
    const startSvg = toSVG(e.clientX, e.clientY); if (!startSvg) return
    const startBead   = { ...beadRef.current }
    const startAttach = { ...attachRef.current }
    setIsDragging(true)

    const onMove = (me: PointerEvent) => {
      const cur = toSVG(me.clientX, me.clientY); if (!cur) return
      let nx = startBead.x + (cur.x - startSvg.x)
      let ny = startBead.y + (cur.y - startSvg.y)
      const dx = nx - startAttach.x, dy = ny - startAttach.y
      const dist = Math.hypot(dx, dy)
      if (dist > 155) { nx = startAttach.x + dx/dist*155; ny = startAttach.y + dy/dist*155 }
      moveBead({ x:nx, y:ny })
    }
    const onUp = () => {
      setIsDragging(false)
      const rest = REST[lampType], cur = beadRef.current
      const d = Math.hypot(cur.x-rest.x, cur.y-rest.y)
      springBack(d > 22 || d < 4)
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
    phase, col, beadPos, attachPos, swingAngle, isDragging,
    hintId, uid, svgRef, onBeadPointerDown: handleBeadPointerDown,
  }

  // ── Compact ───────────────────────────────────────────────────────────────
  if (compact) {
    const src = LIGHT_SRC[lampType]
    return (
      <>
        <style>{KF}{`@keyframes ${hintId}{0%,100%{opacity:.10}50%{opacity:.32}}`}</style>
        <div style={{
          position:'relative', background:'#04040a', borderRadius:12,
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
  const fmShadow = isOn ? `-12px 0 55px ${col.glow}40, 0 8px 36px rgba(0,0,0,0.7)` : '0 4px 32px rgba(0,0,0,0.7)'
  const fmBg     = isOn ? `linear-gradient(115deg, ${col.mid} 0%, rgba(8,6,12,0.97) 55%)` : 'rgba(8,6,12,0.96)'
  const fmBorL   = isOn ? `1px solid ${col.beam}45` : '1px solid rgba(255,255,255,0.06)'
  const fmBorD   = isOn ? `1px solid ${col.beam}18` : '1px solid rgba(255,255,255,0.03)'

  return (
    <>
      <style>{KF}{`@keyframes ${hintId}{0%,100%{opacity:.10}50%{opacity:.32}}`}</style>
      <div style={{
        position:'relative', width:'100%', minHeight:520,
        /* deep dark room — very subtle warm ground at bottom */
        background:'radial-gradient(ellipse 90% 40% at 27% 102%, #110e06 0%, #06060c 55%, #020208 100%)',
        borderRadius:16, overflow:'hidden',
        display:'flex', boxSizing:'border-box',
        fontFamily:'system-ui,-apple-system,sans-serif',
      }}>
        {/* Subtle floor line when lit */}
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:'1px',
          background:`linear-gradient(90deg,transparent,${col.mid},transparent)`,
          opacity:lit?0.5:0.05, transition:'opacity 0.7s',
          pointerEvents:'none', zIndex:2,
        }}/>

        <p style={{
          position:'absolute', top:22, left:30, margin:0,
          fontSize:8.5, color:'#2e2518', letterSpacing:'0.22em',
          textTransform:'uppercase', userSelect:'none', zIndex:3,
        }}>Pull the string to toggle login</p>

        {/* Scene light cone overlay */}
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
              backdropFilter:'blur(22px)',
              boxShadow:fmShadow,
              transition:'box-shadow 0.7s,background 0.7s,border-color 0.7s',
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
                      <div style={{flex:1, height:1, background:'#141420'}}/>
                      <span style={{fontSize:10, color:'#2a2a3a'}}>or</span>
                      <div style={{flex:1, height:1, background:'#141420'}}/>
                    </div>
                    <button style={{
                      width:'100%', padding:'10px', borderRadius:9,
                      border:isOn?`1px solid ${col.beam}22`:'1px solid #14141e',
                      background:isOn?'rgba(6,4,12,0.97)':'#06040c',
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
function fld(col: ReturnType<typeof makeCol>, isOn: boolean): React.CSSProperties {
  return {
    width:'100%', padding:'11px 13px', borderRadius:8,
    border: isOn?`1px solid ${col.beam}30`:'1px solid #181824',
    background: isOn?'rgba(4,3,8,0.98)':'#04030a',
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
