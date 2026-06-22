import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { GridSample } from './sample'

export type ThreeStyle = 'relief' | 'voxels'

export interface ThreeSettings {
  style: ThreeStyle
  resolution: number
  depth: number
  invert: boolean
  threshold: number
  smooth: boolean
}

export const DEFAULT_3D: ThreeSettings = {
  style: 'relief',
  resolution: 140,
  depth: 0.6,
  invert: false,
  threshold: 0.05,
  smooth: true,
}

const WORLD_W = 2

function heightAt(lum: number, invert: boolean) {
  return invert ? lum : 1 - lum
}

function buildRelief(g: GridSample, s: ThreeSettings): THREE.Mesh {
  const { cols, rows, lum, rgba } = g
  const worldH = (WORLD_W * rows) / cols
  const geo = new THREE.PlaneGeometry(WORLD_W, worldH, cols - 1, rows - 1)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const colors = new Float32Array(pos.count * 3)

  for (let i = 0; i < pos.count; i++) {
    const z = heightAt(lum[i], s.invert) * s.depth
    pos.setZ(i, z)
    const o = i * 4
    colors[i * 3] = (rgba[o] / 255) ** 2.2
    colors[i * 3 + 1] = (rgba[o + 1] / 255) ** 2.2
    colors[i * 3 + 2] = (rgba[o + 2] / 255) ** 2.2
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.computeVertexNormals()

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.7,
    metalness: 0.05,
    flatShading: !s.smooth,
    side: THREE.DoubleSide,
  })
  return new THREE.Mesh(geo, mat)
}

function buildVoxels(g: GridSample, s: ThreeSettings): THREE.Mesh {
  const { cols, rows, lum, rgba } = g
  const cell = WORLD_W / cols
  const worldH = cell * rows
  const geos: THREE.BufferGeometry[] = []

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      const v = heightAt(lum[i], s.invert)
      if (v <= s.threshold) continue
      const h = Math.max(cell * 0.5, v * s.depth)
      const box = new THREE.BoxGeometry(cell * 0.92, cell * 0.92, h)
      const px = -WORLD_W / 2 + (x + 0.5) * cell
      const py = worldH / 2 - (y + 0.5) * cell
      box.translate(px, py, h / 2)

      const o = i * 4
      const r = (rgba[o] / 255) ** 2.2
      const gg = (rgba[o + 1] / 255) ** 2.2
      const b = (rgba[o + 2] / 255) ** 2.2
      const c = new Float32Array(box.attributes.position.count * 3)
      for (let k = 0; k < box.attributes.position.count; k++) {
        c[k * 3] = r
        c[k * 3 + 1] = gg
        c[k * 3 + 2] = b
      }
      box.setAttribute('color', new THREE.BufferAttribute(c, 3))
      geos.push(box)
    }
  }

  const merged = geos.length ? mergeGeometries(geos, false) : new THREE.BoxGeometry()
  geos.forEach((b) => b.dispose())
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.55,
    metalness: 0.1,
  })
  return new THREE.Mesh(merged, mat)
}

export function buildMesh(g: GridSample, s: ThreeSettings): THREE.Mesh {
  return s.style === 'voxels' ? buildVoxels(g, s) : buildRelief(g, s)
}
