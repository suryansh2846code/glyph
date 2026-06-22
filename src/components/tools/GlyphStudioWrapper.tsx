import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Download,
  RotateCcw,
  Circle,
  Square,
  Loader2,
  Aperture,
  Camera,
  Link2,
  ClipboardPaste,
  Boxes,
  Image as ImageIcon,
  Box,
  FileDown,
  UploadCloud,
  ArrowLeft,
} from 'lucide-react'
import { DEFAULT_SETTINGS, renderEffect, type EffectSettings } from '@/lib/effect'
import { DEFAULT_3D, type ThreeSettings } from '@/lib/mesh'
import { PRESETS } from '@/lib/presets'
import { Dropzone } from '@/components/Dropzone'
import { ControlsPanel } from '@/components/ControlsPanel'
import { Controls3D } from '@/components/Controls3D'
import { ThreeStudio, type ThreeStudioHandle } from '@/components/ThreeStudio'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

type MediaType = 'image' | 'video'
type Mode = '2d' | '3d'

interface GlyphStudioWrapperProps {
  onBack: () => void
}

export function GlyphStudioWrapper({ onBack }: GlyphStudioWrapperProps) {
  const [settings, setSettings] = useState<EffectSettings>(DEFAULT_SETTINGS)
  const [mediaType, setMediaType] = useState<MediaType | null>(null)
  const [isAnimated, setIsAnimated] = useState(false)
  const [fileName, setFileName] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [recording, setRecording] = useState(false)
  const [exportPct, setExportPct] = useState<number | null>(null)
  const [activePreset, setActivePreset] = useState<string>('peach-sparkle')
  const [urlValue, setUrlValue] = useState('')
  const [loadingUrl, setLoadingUrl] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const dragDepth = useRef(0)
  const [mode, setMode] = useState<Mode>('2d')
  const [settings3d, setSettings3d] = useState<ThreeSettings>(DEFAULT_3D)
  const [sourceEl, setSourceEl] = useState<CanvasImageSource | null>(null)
  const studioRef = useRef<ThreeStudioHandle>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sourceRef = useRef<(CanvasImageSource & { width: number; height: number }) | null>(null)
  const rafRef = useRef<number>(0)
  const urlRef = useRef<string>('')
  const settingsRef = useRef(settings)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  settingsRef.current = settings

  const patch = useCallback((p: Partial<EffectSettings>) => {
    setSettings((s) => ({ ...s, ...p }))
  }, [])
  const patch3d = useCallback((p: Partial<ThreeSettings>) => {
    setSettings3d((s) => ({ ...s, ...p }))
  }, [])

  const renderOnce = useCallback(() => {
    const c = canvasRef.current
    const src = sourceRef.current
    if (c && src) renderEffect(c, src, settingsRef.current)
  }, [])

  useEffect(() => {
    if (!isAnimated) return
    let running = true
    const loop = () => {
      if (!running) return
      const c = canvasRef.current
      const src = sourceRef.current
      if (c && src) renderEffect(c, src, settingsRef.current)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      running = false
      cancelAnimationFrame(rafRef.current)
    }
  }, [isAnimated])

  useEffect(() => {
    if (!isAnimated && mediaType) renderOnce()
  }, [settings, isAnimated, mediaType, renderOnce])

  const handleFile = useCallback(
    (file: File) => {
      setError('')
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
      const url = URL.createObjectURL(file)
      urlRef.current = url
      setFileName(file.name)

      const isVideo = file.type.startsWith('video/')
      const isGif = file.type === 'image/gif'

      if (isVideo) {
        const video = document.createElement('video')
        video.src = url
        video.muted = true
        video.loop = true
        video.playsInline = true
        video.crossOrigin = 'anonymous'
        video.onloadeddata = () => {
          sourceRef.current = video
          setSourceEl(video)
          setMediaType('video')
          setIsAnimated(true)
          video.play().catch(() => {})
        }
        video.onerror = () => setError('Could not decode that video file.')
      } else if (file.type.startsWith('image/')) {
        const img = new Image()
        img.src = url
        img.onload = () => {
          sourceRef.current = img
          setSourceEl(img)
          setMediaType('image')
          setIsAnimated(isGif)
          if (!isGif) requestAnimationFrame(() => renderOnce())
        }
        img.onerror = () => setError('Could not load that image.')
      } else {
        setError('Unsupported file type.')
      }
    },
    [renderOnce]
  )

  const loadFromUrl = useCallback(
    async (raw: string) => {
      const link = raw.trim()
      if (!link) return
      setError('')
      setLoadingUrl(true)
      try {
        const res = await fetch(link, { mode: 'cors' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const blob = await res.blob()
        if (!/^(image|video)\//.test(blob.type)) throw new Error('URL is not an image or video')
        const name = link.split('/').pop()?.split('?')[0] || 'remote-asset'
        handleFile(new File([blob], name, { type: blob.type }))
        setUrlValue('')
      } catch {
        setError(
          'Could not fetch that URL (the host may block cross-origin requests). Try downloading it and dropping the file in.'
        )
      } finally {
        setLoadingUrl(false)
      }
    },
    [handleFile]
  )

  // paste — only active on the entry screen
  useEffect(() => {
    if (mediaType !== null) return
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      const items = e.clipboardData?.items
      if (!items) return
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.kind === 'file' && /^(image|video)\//.test(item.type)) {
          const file = item.getAsFile()
          if (file) {
            e.preventDefault()
            handleFile(file)
            return
          }
        }
      }
      const text = e.clipboardData?.getData('text')?.trim()
      if (text && /^https?:\/\/\S+/.test(text)) {
        e.preventDefault()
        loadFromUrl(text)
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [handleFile, loadFromUrl, mediaType])

  // window-level drag & drop
  useEffect(() => {
    const hasFiles = (e: DragEvent) =>
      !!e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')
    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      dragDepth.current += 1
      setDragActive(true)
    }
    const onOver = (e: DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
    }
    const onLeave = (e: DragEvent) => {
      e.preventDefault()
      dragDepth.current = Math.max(0, dragDepth.current - 1)
      if (dragDepth.current === 0) setDragActive(false)
    }
    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      dragDepth.current = 0
      setDragActive(false)
      const file = e.dataTransfer?.files?.[0]
      if (file) handleFile(file)
    }
    window.addEventListener('dragenter', onEnter)
    window.addEventListener('dragover', onOver)
    window.addEventListener('dragleave', onLeave)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragenter', onEnter)
      window.removeEventListener('dragover', onOver)
      window.removeEventListener('dragleave', onLeave)
      window.removeEventListener('drop', onDrop)
    }
  }, [handleFile])

  const applyPreset = useCallback((id: string) => {
    const p = PRESETS.find((x) => x.id === id)
    if (!p) return
    setActivePreset(id)
    setSettings(p.settings)
  }, [])

  const downloadPNG = useCallback(() => {
    const c = canvasRef.current
    if (!c) return
    c.toBlob((blob) => {
      if (!blob) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${fileName.replace(/\.[^.]+$/, '') || 'glyph'}-glyph.png`
      a.click()
      URL.revokeObjectURL(a.href)
    }, 'image/png')
  }, [fileName])

  const toggleRecording = useCallback(() => {
    const c = canvasRef.current
    if (!c) return
    if (recording) {
      recorderRef.current?.stop()
      return
    }
    const stream = c.captureStream(30)
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm'
    const rec = new MediaRecorder(stream, { mimeType: mime })
    chunksRef.current = []
    rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data)
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${fileName.replace(/\.[^.]+$/, '') || 'glyph'}-glyph.webm`
      a.click()
      URL.revokeObjectURL(a.href)
      setRecording(false)
    }
    recorderRef.current = rec
    rec.start()
    setRecording(true)
  }, [recording, fileName])

  const exportVideo = useCallback(() => {
    const c = canvasRef.current
    const v = sourceRef.current as HTMLVideoElement | null
    if (!c || !v) return
    if (recording) {
      recorderRef.current?.stop()
      return
    }
    const stream = c.captureStream(30)
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm'
    const rec = new MediaRecorder(stream, { mimeType: mime })
    chunksRef.current = []
    rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data)

    const finish = () => {
      v.removeEventListener('ended', onEnded)
      v.removeEventListener('timeupdate', onProgress)
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${fileName.replace(/\.[^.]+$/, '') || 'glyph'}-glyph.webm`
      a.click()
      URL.revokeObjectURL(a.href)
      setRecording(false)
      setExportPct(null)
      v.loop = true
      v.play().catch(() => {})
    }
    const onEnded = () => rec.state !== 'inactive' && rec.stop()
    const onProgress = () => {
      if (v.duration) setExportPct(Math.min(99, Math.round((v.currentTime / v.duration) * 100)))
    }

    rec.onstop = finish
    recorderRef.current = rec

    v.loop = false
    v.pause()
    v.currentTime = 0
    v.addEventListener('ended', onEnded)
    v.addEventListener('timeupdate', onProgress)
    const begin = () => {
      rec.start()
      setRecording(true)
      setExportPct(0)
      v.play().catch(() => {})
    }
    if (v.readyState >= 2 && v.currentTime === 0) requestAnimationFrame(begin)
    else v.addEventListener('seeked', begin, { once: true })
  }, [recording, fileName])

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    }
  }, [])

  const hasMedia = mediaType !== null

  return (
    <div className="flex min-h-[600px] flex-col rounded-2xl border border-zinc-800 bg-zinc-950/20 overflow-hidden">
      {dragActive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm animate-fade-in">
          <div className="m-6 flex w-full max-w-xl flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-primary bg-primary/5 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
              <UploadCloud className="h-8 w-8" />
            </div>
            <p className="text-lg font-semibold">Drop to load your asset</p>
            <p className="text-sm text-muted-foreground">
              Image, GIF or video — released anywhere on the page
            </p>
          </div>
        </div>
      )}

      {/* Embedded Sub-Navbar */}
      <header className="sticky top-0 z-20 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1500px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white text-zinc-400 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight">Glyph Halftone Studio</p>
              <p className="text-[11px] text-muted-foreground">convert asset to halftone render</p>
            </div>
          </div>
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <Aperture className="h-4 w-4" /> client-side · nothing uploaded
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-6">
        {!hasMedia ? (
          <div className="mx-auto flex max-w-2xl flex-col gap-6 py-10">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
                Turn any asset into a halftone glyph effect
              </h1>
              <p className="text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
                Upload an image, GIF or video and convert it into a tunable halftone glyph render —
                then export as PNG, WebM or a 3D model.
              </p>
            </div>
            <Dropzone onFile={handleFile} active={dragActive} />

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-900" />
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">or link</span>
              <div className="h-px flex-1 bg-zinc-900" />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                loadFromUrl(urlValue)
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="Paste an image / video URL…"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  className="pl-9 bg-zinc-950/50 border-zinc-800 text-zinc-200 focus-visible:ring-primary/45 rounded-lg h-10"
                />
              </div>
              <Button type="submit" disabled={loadingUrl || !urlValue.trim()} className="h-10 rounded-lg">
                {loadingUrl ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load Asset'}
              </Button>
            </form>

            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ClipboardPaste className="h-3.5 w-3.5" />
              Tip: copy any image and press{' '}
              <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px]">⌘V</kbd> to
              paste it here
            </p>

            {error && <p className="text-center text-sm text-destructive">{error}</p>}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {mediaType === 'video' ? (
                    <Circle className="h-3 w-3 fill-primary text-primary" />
                  ) : (
                    <Square className="h-3 w-3" />
                  )}
                  <span className="max-w-[200px] truncate font-medium text-zinc-200">
                    {fileName}
                  </span>
                  {isAnimated && mode === '2d' && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
                      live
                    </span>
                  )}
                </div>

                <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
                  <TabsList className="bg-zinc-900/60 border border-zinc-850 p-0.5 h-8">
                    <TabsTrigger value="2d" className="text-xs h-7 px-3">
                      <ImageIcon className="mr-1 h-3.5 w-3.5" /> 2D Glyph
                    </TabsTrigger>
                    <TabsTrigger value="3d" className="text-xs h-7 px-3">
                      <Boxes className="mr-1 h-3.5 w-3.5" /> 3D Object
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex items-center gap-2">
                  {mode === '2d' ? (
                    <>
                      <Button variant="outline" size="sm" onClick={downloadPNG} className="h-8 border-zinc-850 bg-zinc-900 text-xs">
                        <Camera className="h-3.5 w-3.5 mr-1" /> PNG
                      </Button>
                      {mediaType === 'video' && (
                        <Button
                          variant={recording ? 'destructive' : 'default'}
                          size="sm"
                          onClick={exportVideo}
                          className="h-8 text-xs"
                        >
                          {recording ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                              {exportPct !== null ? `Exporting ${exportPct}%` : 'Stop'}
                            </>
                          ) : (
                            <>
                              <Download className="h-3.5 w-3.5 mr-1" /> Export WebM
                            </>
                          )}
                        </Button>
                      )}
                      {mediaType === 'image' && isAnimated && (
                        <Button
                          variant={recording ? 'destructive' : 'default'}
                          size="sm"
                          onClick={toggleRecording}
                          className="h-8 text-xs"
                        >
                          {recording ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Stop &amp; save
                            </>
                          ) : (
                            <>
                              <Download className="h-3.5 w-3.5 mr-1" /> Record WebM
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => studioRef.current?.exportPNG()} className="h-8 border-zinc-850 bg-zinc-900 text-xs">
                        <Camera className="h-3.5 w-3.5 mr-1" /> PNG
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => studioRef.current?.exportOBJ()} className="h-8 border-zinc-850 bg-zinc-900 text-xs">
                        <FileDown className="h-3.5 w-3.5 mr-1" /> OBJ
                      </Button>
                      <Button size="sm" onClick={() => studioRef.current?.exportGLB()} className="h-8 text-xs">
                        <Box className="h-3.5 w-3.5 mr-1" /> Export GLB
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="relative flex h-[60vh] min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-zinc-850 bg-zinc-950 p-4 shadow-inner">
                <div className={cn('contents', mode !== '2d' && 'hidden')}>
                  <canvas ref={canvasRef} className="max-h-full max-w-full rounded-lg shadow-lg" />
                </div>
                <div className={cn('absolute inset-0', mode !== '3d' && 'hidden')}>
                  <ThreeStudio ref={studioRef} source={sourceEl} settings={settings3d} fileName={fileName} />
                </div>
              </div>

              <Dropzone onFile={handleFile} compact active={dragActive} />

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <aside className="space-y-5">
              {mode === '2d' ? (
                <>
                  <div>
                    <div className="mb-2.5 flex items-center justify-between">
                      <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">Presets</h2>
                      <button
                        onClick={() => applyPreset('peach-sparkle')}
                        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" /> Reset
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESETS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => applyPreset(p.id)}
                          className={cn(
                            'rounded-lg border px-3 py-2 text-left transition-colors',
                            activePreset === p.id
                              ? 'border-primary bg-primary/5'
                              : 'border-zinc-850 hover:bg-zinc-900/60'
                          )}
                        >
                          <p className="text-xs font-semibold text-zinc-200">{p.name}</p>
                          <p className="mt-0.5 line-clamp-1 text-[10px] text-zinc-500 font-light">
                            {p.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-850 bg-zinc-950/60 p-4">
                    <h2 className="mb-4 text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">Effect controls</h2>
                    <ControlsPanel settings={settings} onChange={patch} />
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-zinc-850 bg-zinc-950/60 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <Boxes className="h-4 w-4 text-primary" />
                    <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">3D object controls</h2>
                  </div>
                  <Controls3D settings={settings3d} onChange={patch3d} />
                </div>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
export default GlyphStudioWrapper
