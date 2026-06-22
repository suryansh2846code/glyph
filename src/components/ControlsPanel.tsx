import type { EffectSettings, GlyphStyle } from '@/lib/effect'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface Props {
  settings: EffectSettings
  onChange: (patch: Partial<EffectSettings>) => void
}

const GLYPHS: { value: GlyphStyle; label: string }[] = [
  { value: 'mixed', label: 'Mixed' },
  { value: 'circle', label: 'Dots' },
  { value: 'square', label: 'Square' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'cross', label: 'Cross' },
  { value: 'sparkle', label: 'Sparkle' },
  { value: 'ascii', label: 'ASCII' },
]

function Row({
  label,
  value,
  children,
}: {
  label: string
  value?: string | number
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
        {value !== undefined && (
          <span className="font-mono text-xs text-foreground/70">{value}</span>
        )}
      </div>
      {children}
    </div>
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-10 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-full rounded-md border border-input bg-transparent px-2 font-mono text-xs uppercase outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  )
}

export function ControlsPanel({ settings, onChange }: Props) {
  return (
    <div className="space-y-5">
      <Row label="Glyph style">
        <Select
          value={settings.glyphStyle}
          onValueChange={(v) => onChange({ glyphStyle: v as GlyphStyle })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GLYPHS.map((g) => (
              <SelectItem key={g.value} value={g.value}>
                {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Row>

      <Row label="Grid size" value={`${settings.cellSize}px`}>
        <Slider min={3} max={24} step={1} value={[settings.cellSize]} onValueChange={([v]) => onChange({ cellSize: v })} />
      </Row>

      <Row label="Detail levels" value={settings.levels}>
        <Slider min={2} max={16} step={1} value={[settings.levels]} onValueChange={([v]) => onChange({ levels: v })} />
      </Row>

      <Row label="Dot scale" value={settings.dotScale.toFixed(2)}>
        <Slider min={0.3} max={1.6} step={0.05} value={[settings.dotScale]} onValueChange={([v]) => onChange({ dotScale: v })} />
      </Row>

      <Row label="Contrast" value={settings.contrast}>
        <Slider min={-100} max={100} step={1} value={[settings.contrast]} onValueChange={([v]) => onChange({ contrast: v })} />
      </Row>

      <Row label="Brightness" value={settings.brightness}>
        <Slider min={-100} max={100} step={1} value={[settings.brightness]} onValueChange={([v]) => onChange({ brightness: v })} />
      </Row>

      <Row label="Gamma" value={settings.gamma.toFixed(2)}>
        <Slider min={0.2} max={3} step={0.05} value={[settings.gamma]} onValueChange={([v]) => onChange({ gamma: v })} />
      </Row>

      <Row label="Jitter" value={settings.jitter.toFixed(2)}>
        <Slider min={0} max={1} step={0.05} value={[settings.jitter]} onValueChange={([v]) => onChange({ jitter: v })} />
      </Row>

      <Row label="Threshold" value={settings.threshold.toFixed(2)}>
        <Slider min={0} max={0.6} step={0.01} value={[settings.threshold]} onValueChange={([v]) => onChange({ threshold: v })} />
      </Row>

      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Invert tones</Label>
        <Switch checked={settings.invert} onCheckedChange={(v) => onChange({ invert: v })} />
      </div>

      <div className="h-px bg-border" />

      <Row label="Background">
        <ToggleGroup
          type="single"
          value={settings.bgMode}
          onValueChange={(v) => v && onChange({ bgMode: v as EffectSettings['bgMode'] })}
        >
          <ToggleGroupItem value="gradient">Gradient</ToggleGroupItem>
          <ToggleGroupItem value="solid">Solid</ToggleGroupItem>
          <ToggleGroupItem value="transparent">None</ToggleGroupItem>
        </ToggleGroup>
      </Row>

      <Row label="Glyph color">
        <ColorInput value={settings.fg} onChange={(v) => onChange({ fg: v })} />
      </Row>

      {settings.bgMode !== 'transparent' && (
        <Row label={settings.bgMode === 'gradient' ? 'Gradient start' : 'Background'}>
          <ColorInput value={settings.bg1} onChange={(v) => onChange({ bg1: v })} />
        </Row>
      )}

      {settings.bgMode === 'gradient' && (
        <>
          <Row label="Gradient end">
            <ColorInput value={settings.bg2} onChange={(v) => onChange({ bg2: v })} />
          </Row>
          <Row label="Gradient angle" value={`${settings.bgAngle}°`}>
            <Slider min={0} max={360} step={5} value={[settings.bgAngle]} onValueChange={([v]) => onChange({ bgAngle: v })} />
          </Row>
        </>
      )}
    </div>
  )
}
