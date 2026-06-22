import { useRef } from 'react'
import { UploadCloud, Image as ImageIcon, Film, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DropzoneProps {
  onFile: (file: File) => void
  compact?: boolean
  active?: boolean
}

const ACCEPT = 'image/*,video/*,.gif'

export function Dropzone({ onFile, compact, active }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-colors',
        active
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/60 hover:bg-accent/40',
        compact ? 'gap-2 p-4' : 'gap-4 p-12'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ''
        }}
      />
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-105',
          compact ? 'h-10 w-10' : 'h-16 w-16'
        )}
      >
        <UploadCloud className={compact ? 'h-5 w-5' : 'h-8 w-8'} />
      </div>
      {!compact && (
        <>
          <div>
            <p className="text-lg font-semibold">Drop an asset to glyph-ify it</p>
            <p className="text-sm text-muted-foreground">
              or click to browse — images, GIFs &amp; video
            </p>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ImageIcon className="h-3.5 w-3.5" /> PNG / JPG
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> GIF
            </span>
            <span className="flex items-center gap-1">
              <Film className="h-3.5 w-3.5" /> MP4 / WebM
            </span>
          </div>
        </>
      )}
      {compact && <p className="text-sm font-medium">Replace asset</p>}
    </div>
  )
}
