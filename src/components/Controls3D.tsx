import type { ThreeSettings, ThreeStyle } from '@/lib/mesh'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface Props {
  settings: ThreeSettings
  onChange: (patch: Partial<ThreeSettings>) => void
}

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

export function Controls3D({ settings, onChange }: Props) {
  return (
    <div className="space-y-5">
      <Row label="Object type">
        <ToggleGroup
          type="single"
          value={settings.style}
          onValueChange={(v) => v && onChange({ style: v as ThreeStyle })}
        >
          <ToggleGroupItem value="relief">Relief</ToggleGroupItem>
          <ToggleGroupItem value="voxels">Voxels</ToggleGroupItem>
        </ToggleGroup>
      </Row>

      <Row label="Resolution" value={settings.resolution}>
        <Slider
          min={24}
          max={settings.style === 'voxels' ? 130 : 300}
          step={2}
          value={[settings.resolution]}
          onValueChange={([v]) => onChange({ resolution: v })}
        />
      </Row>

      <Row label="Depth" value={settings.depth.toFixed(2)}>
        <Slider min={0.05} max={2} step={0.05} value={[settings.depth]} onValueChange={([v]) => onChange({ depth: v })} />
      </Row>

      {settings.style === 'voxels' && (
        <Row label="Cull threshold" value={settings.threshold.toFixed(2)}>
          <Slider min={0} max={0.8} step={0.01} value={[settings.threshold]} onValueChange={([v]) => onChange({ threshold: v })} />
        </Row>
      )}

      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Lift highlights</Label>
        <Switch checked={settings.invert} onCheckedChange={(v) => onChange({ invert: v })} />
      </div>

      {settings.style === 'relief' && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Smooth shading</Label>
          <Switch checked={settings.smooth} onCheckedChange={(v) => onChange({ smooth: v })} />
        </div>
      )}

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Depth is derived from image brightness. Export a{' '}
        <span className="font-medium text-foreground">.glb</span> or{' '}
        <span className="font-medium text-foreground">.obj</span> to drop the model straight into
        Blender, Three.js, Unity or Spline.
      </p>
    </div>
  )
}
