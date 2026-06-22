// Glyph halftone effect engine.
// Converts any raster source (image / video frame / gif frame) into a grid of
// glyphs whose size & shape encode the underlying luminance.

export type GlyphStyle =
  | 'square'
  | 'circle'
  | 'diamond'
  | 'cross'
  | 'sparkle'
  | 'mixed'
  | 'ascii'

export interface EffectSettings {
  cellSize: number
  glyphStyle: GlyphStyle
  fg: string
  bgMode: 'solid' | 'gradient' | 'transparent'
  bg1: string
  bg2: string
  bgAngle: number
  brightness: number
  contrast: number
  gamma: number
  invert: boolean
  levels: number
  dotScale: number
  jitter: number
  threshold: number
}

export const DEFAULT_SETTINGS: EffectSettings = {
  cellSize: 8,
  glyphStyle: 'mixed',
  fg: '#0a0a0a',
  bgMode: 'gradient',
  bg1: '#ffe7d3',
  bg2: '#ffb48a',
  bgAngle: 145,
  brightness: 0,
  contrast: 18,
  gamma: 1,
  invert: false,
  levels: 6,
  dotScale: 1.05,
  jitter: 0.25,
  threshold: 0.06,
}

const ASCII_RAMP = ' .:-=+*#%@'

function hash(x: number, y: number) {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return s - Math.floor(s)
}

function paintBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: EffectSettings
) {
  if (s.bgMode === 'transparent') {
    ctx.clearRect(0, 0, w, h)
    return
  }
  if (s.bgMode === 'solid') {
    ctx.fillStyle = s.bg1
    ctx.fillRect(0, 0, w, h)
    return
  }
  const a = (s.bgAngle * Math.PI) / 180
  const cx = w / 2
  const cy = h / 2
  const len = (Math.abs(Math.cos(a)) * w + Math.abs(Math.sin(a)) * h) / 2
  const grad = ctx.createLinearGradient(
    cx - Math.cos(a) * len,
    cy - Math.sin(a) * len,
    cx + Math.cos(a) * len,
    cy + Math.sin(a) * len
  )
  grad.addColorStop(0, s.bg1)
  grad.addColorStop(1, s.bg2)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
}

function drawGlyph(
  ctx: CanvasRenderingContext2D,
  style: GlyphStyle,
  cx: number,
  cy: number,
  size: number,
  darkness: number,
  rnd: number
) {
  const r = size / 2
  switch (style) {
    case 'square':
      ctx.fillRect(cx - r, cy - r, size, size)
      break
    case 'circle':
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()
      break
    case 'diamond':
      ctx.beginPath()
      ctx.moveTo(cx, cy - r)
      ctx.lineTo(cx + r, cy)
      ctx.lineTo(cx, cy + r)
      ctx.lineTo(cx - r, cy)
      ctx.closePath()
      ctx.fill()
      break
    case 'cross':
      drawCross(ctx, cx, cy, r, Math.max(1, size * 0.34))
      break
    case 'sparkle':
      drawSparkle(ctx, cx, cy, r)
      break
    case 'ascii': {
      const ch =
        ASCII_RAMP[Math.min(ASCII_RAMP.length - 1, Math.floor(darkness * (ASCII_RAMP.length - 1)))]
      ctx.font = `${size * 1.6}px ui-monospace, monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(ch, cx, cy)
      break
    }
    case 'mixed':
    default: {
      if (darkness > 0.72) {
        ctx.fillRect(cx - r, cy - r, size, size)
      } else if (darkness > 0.4) {
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fill()
      } else if (rnd > 0.55) {
        drawSparkle(ctx, cx, cy, r)
      } else {
        drawCross(ctx, cx, cy, r, Math.max(1, size * 0.32))
      }
    }
  }
}

function drawCross(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, thick: number) {
  const t = thick / 2
  ctx.fillRect(cx - r, cy - t, r * 2, thick)
  ctx.fillRect(cx - t, cy - r, thick, r * 2)
}

function drawSparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const inner = r * 0.28
  ctx.beginPath()
  ctx.moveTo(cx, cy - r)
  ctx.lineTo(cx + inner, cy - inner)
  ctx.lineTo(cx + r, cy)
  ctx.lineTo(cx + inner, cy + inner)
  ctx.lineTo(cx, cy + r)
  ctx.lineTo(cx - inner, cy + inner)
  ctx.lineTo(cx - r, cy)
  ctx.lineTo(cx - inner, cy - inner)
  ctx.closePath()
  ctx.fill()
}

let sampleCanvas: HTMLCanvasElement | null = null

export interface SourceLike {
  width: number
  height: number
}

export function renderEffect(
  target: HTMLCanvasElement,
  source: CanvasImageSource & SourceLike,
  settings: EffectSettings,
  maxDim = 1100
) {
  // Video elements expose intrinsic size via videoWidth/videoHeight.
  const vid = source as Partial<HTMLVideoElement>
  const sw = vid.videoWidth || source.width
  const sh = vid.videoHeight || source.height
  if (!sw || !sh) return

  const scale = Math.min(1, maxDim / Math.max(sw, sh))
  const cell = Math.max(2, settings.cellSize)
  const cols = Math.max(1, Math.round((sw * scale) / cell))
  const rows = Math.max(1, Math.round((sh * scale) / cell))
  const outW = cols * cell
  const outH = rows * cell

  if (target.width !== outW) target.width = outW
  if (target.height !== outH) target.height = outH

  if (!sampleCanvas) sampleCanvas = document.createElement('canvas')
  sampleCanvas.width = cols
  sampleCanvas.height = rows
  const sctx = sampleCanvas.getContext('2d', { willReadFrequently: true })!
  sctx.clearRect(0, 0, cols, rows)
  sctx.drawImage(source, 0, 0, cols, rows)
  const data = sctx.getImageData(0, 0, cols, rows).data

  const ctx = target.getContext('2d')!
  paintBackground(ctx, outW, outH, settings)
  ctx.fillStyle = settings.fg
  ctx.strokeStyle = settings.fg

  const bright = settings.brightness / 100
  const c = settings.contrast / 100
  const contrastF = (1 + c) / (1 - c + 1e-6)
  const invGamma = 1 / settings.gamma
  const levels = Math.max(2, Math.round(settings.levels))

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const i = (gy * cols + gx) * 4
      const alpha = data[i + 3] / 255
      if (alpha < 0.04) continue
      let lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255
      lum += bright
      lum = (lum - 0.5) * contrastF + 0.5
      lum = Math.min(1, Math.max(0, lum))
      lum = Math.pow(lum, invGamma)

      let darkness = settings.invert ? lum : 1 - lum
      darkness *= alpha
      if (darkness <= settings.threshold) continue

      const q = Math.ceil(darkness * levels) / levels
      const rnd = hash(gx, gy)
      const jit = settings.jitter
      const cx = gx * cell + cell / 2 + (jit ? (rnd - 0.5) * jit * cell : 0)
      const cy = gy * cell + cell / 2 + (jit ? (hash(gy, gx) - 0.5) * jit * cell : 0)

      const size = q * cell * settings.dotScale
      if (size < 0.5) continue

      drawGlyph(ctx, settings.glyphStyle, cx, cy, size, darkness, rnd)
    }
  }
}
