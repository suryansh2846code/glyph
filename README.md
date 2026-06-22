# Glyph — Halftone Effect Studio

Upload an image, GIF, or video and convert it into a tunable **halftone glyph**
render — the dotted / sparkle effect — then export the result. Everything runs
client-side in the browser; nothing is uploaded to a server.

## Stack

- **React + Vite + TypeScript**
- **Tailwind CSS** + **shadcn**-style components (Radix primitives)
- HTML Canvas 2D for the effect engine
- **Three.js** for the 3D generator
- `MediaRecorder` + `canvas.captureStream()` for video export

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Inputs

Drag-and-drop **anywhere** on the page, click to browse, paste from the
clipboard (⌘V), or load from an image/video URL. Supports PNG/JPG/WebP, GIF
(animated), and MP4/WebM video.

## 2D glyph effect

Tunable grid size, detail levels, dot scale, contrast/brightness/gamma, jitter,
threshold, tone inversion, glyph style (Mixed / Dots / Square / Diamond / Cross /
Sparkle / ASCII), and a solid/gradient/transparent background. Six presets ship
out of the box — start from **Peach Sparkle**.

- **Export PNG** for any input.
- **Export WebM** auto-converts the full length of a video; GIFs use a manual
  start/stop **Record WebM**.

## 3D objects

Switch to the **3D Object** tab to turn the asset into a real 3D model (depth
from brightness): **Relief** (displaced height-map) or **Voxels** (extruded glyph
cubes). Orbit with the mouse and export **`.glb`**, **`.obj`**, or a **`.png`**
render.

## Key files

- `src/lib/effect.ts` — the halftone effect engine.
- `src/lib/presets.ts` — effect presets.
- `src/lib/sample.ts` / `src/lib/mesh.ts` — 3D sampling + mesh building.
- `src/components/ThreeStudio.tsx` — Three.js scene, controls, exporters.
- `src/App.tsx` — dashboard, media loading, 2D/3D, exports.
