import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js'
import { sampleGrid } from '@/lib/sample'
import { buildMesh, type ThreeSettings } from '@/lib/mesh'

export interface ThreeStudioHandle {
  exportGLB: () => void
  exportOBJ: () => void
  exportPNG: () => void
}

interface Props {
  source: CanvasImageSource | null
  settings: ThreeSettings
  fileName: string
  onStatus?: (s: string) => void
}

function download(blob: Blob, name: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

export const ThreeStudio = forwardRef<ThreeStudioHandle, Props>(
  ({ source, settings, fileName, onStatus }, ref) => {
    const mountRef = useRef<HTMLDivElement>(null)
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
    const controlsRef = useRef<OrbitControls | null>(null)
    const meshRef = useRef<THREE.Mesh | null>(null)
    const [building, setBuilding] = useState(false)

    const baseName = fileName.replace(/\.[^.]+$/, '') || 'glyph'

    useEffect(() => {
      const mount = mountRef.current
      if (!mount) return

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100)
      camera.position.set(0, -0.1, 3)

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      })
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
      mount.appendChild(renderer.domElement)
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      renderer.domElement.style.display = 'block'
      renderer.domElement.style.touchAction = 'none'

      scene.add(new THREE.AmbientLight(0xffffff, 0.55))
      scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.6))
      const key = new THREE.DirectionalLight(0xffffff, 1.1)
      key.position.set(2, 3, 4)
      scene.add(key)
      const fill = new THREE.DirectionalLight(0xffe6d0, 0.5)
      fill.position.set(-3, -1, 2)
      scene.add(fill)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.08

      rendererRef.current = renderer
      sceneRef.current = scene
      cameraRef.current = camera
      controlsRef.current = controls

      let raf = 0
      const loop = () => {
        controls.update()
        renderer.render(scene, camera)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)

      const resize = () => {
        const w = mount.clientWidth
        const h = mount.clientHeight
        if (!w || !h) return
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(mount)

      return () => {
        cancelAnimationFrame(raf)
        ro.disconnect()
        controls.dispose()
        renderer.dispose()
        mount.removeChild(renderer.domElement)
      }
    }, [])

    useEffect(() => {
      const scene = sceneRef.current
      if (!scene || !source) return
      setBuilding(true)
      onStatus?.('Sampling…')

      const cap = settings.style === 'voxels' ? 130 : 320
      const res = Math.min(settings.resolution, cap)

      const id = requestAnimationFrame(() => {
        const grid = sampleGrid(source, res)
        if (!grid) {
          setBuilding(false)
          return
        }
        const mesh = buildMesh(grid, settings)

        if (meshRef.current) {
          scene.remove(meshRef.current)
          meshRef.current.geometry.dispose()
          ;(meshRef.current.material as THREE.Material).dispose()
        }
        scene.add(mesh)
        meshRef.current = mesh

        const box = new THREE.Box3().setFromObject(mesh)
        const center = box.getCenter(new THREE.Vector3())
        controlsRef.current!.target.copy(center)
        setBuilding(false)
        onStatus?.('')
      })
      return () => cancelAnimationFrame(id)
    }, [source, settings, onStatus])

    useImperativeHandle(ref, () => ({
      exportGLB: () => {
        const mesh = meshRef.current
        if (!mesh) return
        new GLTFExporter().parse(
          mesh,
          (result) => {
            const blob = new Blob([result as ArrayBuffer], { type: 'model/gltf-binary' })
            download(blob, `${baseName}-3d.glb`)
          },
          (err) => console.error(err),
          { binary: true }
        )
      },
      exportOBJ: () => {
        const mesh = meshRef.current
        if (!mesh) return
        const text = new OBJExporter().parse(mesh)
        download(new Blob([text], { type: 'text/plain' }), `${baseName}-3d.obj`)
      },
      exportPNG: () => {
        const renderer = rendererRef.current
        const scene = sceneRef.current
        const camera = cameraRef.current
        if (!renderer || !scene || !camera) return
        renderer.render(scene, camera)
        renderer.domElement.toBlob((blob) => {
          if (blob) download(blob, `${baseName}-3d.png`)
        }, 'image/png')
      },
    }))

    return (
      <div className="relative h-full w-full">
        <div ref={mountRef} className="h-full w-full" />
        {building && (
          <div className="pointer-events-none absolute right-3 top-3 rounded-md bg-background/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur">
            building mesh…
          </div>
        )}
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-background/70 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur">
          drag to orbit · scroll to zoom
        </div>
      </div>
    )
  }
)
ThreeStudio.displayName = 'ThreeStudio'
