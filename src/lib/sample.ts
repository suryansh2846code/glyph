// Downsamples any raster source into a grid of luminance + colour values,
// used by the 3D generator.

export interface GridSample {
  cols: number
  rows: number
  lum: Float32Array
  rgba: Uint8ClampedArray
}

let buf: HTMLCanvasElement | null = null

export function sampleGrid(source: CanvasImageSource, cols: number): GridSample | null {
  const vid = source as Partial<HTMLVideoElement> & { width?: number; height?: number }
  const sw = vid.videoWidth || (source as HTMLImageElement).naturalWidth || vid.width || 0
  const sh = vid.videoHeight || (source as HTMLImageElement).naturalHeight || vid.height || 0
  if (!sw || !sh) return null

  cols = Math.max(2, Math.round(cols))
  const rows = Math.max(2, Math.round((cols * sh) / sw))

  if (!buf) buf = document.createElement('canvas')
  buf.width = cols
  buf.height = rows
  const ctx = buf.getContext('2d', { willReadFrequently: true })!
  ctx.clearRect(0, 0, cols, rows)
  ctx.drawImage(source, 0, 0, cols, rows)
  const rgba = ctx.getImageData(0, 0, cols, rows).data

  const lum = new Float32Array(cols * rows)
  for (let i = 0; i < cols * rows; i++) {
    const o = i * 4
    lum[i] = (0.299 * rgba[o] + 0.587 * rgba[o + 1] + 0.114 * rgba[o + 2]) / 255
  }
  return { cols, rows, lum, rgba: rgba.slice() }
}
