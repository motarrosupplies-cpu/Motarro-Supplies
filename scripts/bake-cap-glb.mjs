/**
 * Prepare cap GLB for the mockup editor.
 * Usage: node scripts/bake-cap-glb.mjs <input.glb> [output.glb] [--force-uv]
 *
 * From baseball_hat_028.glb: keeps artist shape on the front crown mesh only,
 * remaps that island to the full 0–1 atlas for the layout editor. All other
 * panels are pinned to fabric UV so prints do not bleed onto the sides.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { NodeIO } from "@gltf-transform/core"
import { dedup } from "@gltf-transform/functions"

const fileArgs = process.argv.slice(2).filter((a) => !a.startsWith("--"))
const input = fileArgs[0]
const output =
  fileArgs[1] ??
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../public/models/cap_baked.glb")

if (!input) {
  console.error(
    "Usage: node scripts/bake-cap-glb.mjs <input.glb> [output.glb] [--force-uv]",
  )
  process.exit(1)
}

const FABRIC_UV = 0.5
const UV_INSET = 0.01
/** How far down from the crown tip the printable front panel extends (model units). */
const FRONT_PANEL_Z_DEPTH = 5.5
const EXTERIOR_DOT = 0.35
const forceUv = process.argv.includes("--force-uv") || process.argv.includes("--force-planar")

function primHasArtistUvs(prim) {
  const uv = prim.getAttribute("TEXCOORD_0")
  if (!uv) return false
  const a = uv.getArray()
  let minU = 1
  let maxU = 0
  let minV = 1
  let maxV = 0
  for (let i = 0; i < a.length; i += 2) {
    minU = Math.min(minU, a[i])
    maxU = Math.max(maxU, a[i])
    minV = Math.min(minV, a[i + 1])
    maxV = Math.max(maxV, a[i + 1])
  }
  return maxU - minU > 0.04 && maxV - minV > 0.04
}

function isExteriorVertex(arr, norm, i, cx, cy, cz) {
  const nx = norm ? norm[i * 3] : 0
  const ny = norm ? norm[i * 3 + 1] : 0
  const nz = norm ? norm[i * 3 + 2] : 1
  const ox = arr[i * 3] - cx
  const oy = arr[i * 3 + 1] - cy
  const oz = arr[i * 3 + 2] - cz
  const oLen = Math.hypot(ox, oy, oz) || 1
  return (nx * ox + ny * oy + nz * oz) / oLen >= EXTERIOR_DOT
}

/** Pick the front crown mesh (highest crown Z, main panel vert count). */
function findFrontCrownMeshIndex(document) {
  let bestIdx = -1
  let bestScore = -1
  const meshes = document.getRoot().listMeshes()
  for (let mi = 0; mi < meshes.length; mi++) {
    const mesh = meshes[mi]
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute("POSITION")
      if (!pos) continue
      const arr = pos.getArray()
      const n = pos.getCount()
      if (n < 800) continue
      let maxZ = -Infinity
      for (let i = 0; i < n; i++) {
        maxZ = Math.max(maxZ, arr[i * 3 + 2])
      }
      const score = maxZ * 1000 + n
      if (score > bestScore) {
        bestScore = score
        bestIdx = mi
      }
    }
  }
  return bestIdx
}

function setPrimitiveUvs(document, prim, out) {
  const pos = prim.getAttribute("POSITION")
  const buffer =
    pos.getBuffer() ?? document.getRoot().listBuffers()[0] ?? document.createBuffer()
  prim.setAttribute(
    "TEXCOORD_0",
    document.createAccessor().setType("VEC2").setArray(out).setBuffer(buffer),
  )
}

function pinPrimitiveToFabric(document, prim) {
  const pos = prim.getAttribute("POSITION")
  if (!pos) return
  const count = pos.getCount()
  const out = new Float32Array(count * 2)
  for (let i = 0; i < count; i++) {
    out[i * 2] = FABRIC_UV
    out[i * 2 + 1] = FABRIC_UV
  }
  setPrimitiveUvs(document, prim, out)
}

const FRONT_NORMAL_Z = 0.35

/**
 * Forward-facing front crown: layout X/Y ↔ model X/Y.
 * Uses verts facing the camera (nz) on the front bulge (z), not just the top button.
 */
function assignPlanarFrontPanelUvs(document, prim) {
  const pos = prim.getAttribute("POSITION")
  const norm = prim.getAttribute("NORMAL")?.getArray()
  if (!pos) return

  const arr = pos.getArray()
  const count = pos.getCount()

  let maxZ = -Infinity
  for (let i = 0; i < count; i++) {
    const nz = norm ? norm[i * 3 + 2] : 1
    if (nz >= FRONT_NORMAL_Z) {
      maxZ = Math.max(maxZ, arr[i * 3 + 2])
    }
  }

  const panel = []
  for (let i = 0; i < count; i++) {
    const nz = norm ? norm[i * 3 + 2] : 1
    const z = arr[i * 3 + 2]
    if (nz >= FRONT_NORMAL_Z && z >= maxZ - FRONT_PANEL_Z_DEPTH) {
      panel.push(i)
    }
  }

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const i of panel) {
    minX = Math.min(minX, arr[i * 3])
    maxX = Math.max(maxX, arr[i * 3])
    minY = Math.min(minY, arr[i * 3 + 1])
    maxY = Math.max(maxY, arr[i * 3 + 1])
  }

  const xSpan = Math.max(maxX - minX, 1e-6)
  const ySpan = Math.max(maxY - minY, 1e-6)
  const panelSet = new Set(panel)
  const out = new Float32Array(count * 2)

  for (let i = 0; i < count; i++) {
    if (panelSet.has(i)) {
      const x = arr[i * 3]
      const y = arr[i * 3 + 1]
      const u = (x - minX) / xSpan
      const v = 1 - (y - minY) / ySpan
      out[i * 2] = UV_INSET + u * (1 - 2 * UV_INSET)
      out[i * 2 + 1] = UV_INSET + v * (1 - 2 * UV_INSET)
    } else {
      out[i * 2] = FABRIC_UV
      out[i * 2 + 1] = FABRIC_UV
    }
  }

  setPrimitiveUvs(document, prim, out)
}

function remapCapForMockupEditor(document) {
  const frontIdx = findFrontCrownMeshIndex(document)
  if (frontIdx < 0) {
    assignCapLayoutAlignedUvs(document)
    return "planar fallback (no front mesh)"
  }

  const meshes = document.getRoot().listMeshes()
  for (let mi = 0; mi < meshes.length; mi++) {
    for (const prim of meshes[mi].listPrimitives()) {
      if (mi === frontIdx) {
        assignPlanarFrontPanelUvs(document, prim)
      } else {
        pinPrimitiveToFabric(document, prim)
      }
    }
  }
  return `front crown mesh #${frontIdx} → planar X/Y (layout-aligned)`
}

/** Fallback when the source has no usable UVs. */
function assignCapLayoutAlignedUvs(document) {
  for (const mesh of document.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute("POSITION")
      if (!pos) continue

      const arr = pos.getArray()
      const norm = prim.getAttribute("NORMAL")?.getArray()
      const count = pos.getCount()

      let cx = 0
      let cy = 0
      let cz = 0
      for (let i = 0; i < count; i++) {
        cx += arr[i * 3]
        cy += arr[i * 3 + 1]
        cz += arr[i * 3 + 2]
      }
      cx /= count
      cy /= count
      cz /= count

      const exterior = []
      for (let i = 0; i < count; i++) {
        if (isExteriorVertex(arr, norm, i, cx, cy, cz)) exterior.push(i)
      }

      let minX = Infinity
      let maxX = -Infinity
      let minY = Infinity
      let maxY = -Infinity
      for (const i of exterior) {
        minX = Math.min(minX, arr[i * 3])
        maxX = Math.max(maxX, arr[i * 3])
        minY = Math.min(minY, arr[i * 3 + 1])
        maxY = Math.max(maxY, arr[i * 3 + 1])
      }

      const xSpan = Math.max(maxX - minX, 1e-6)
      const ySpan = Math.max(maxY - minY, 1e-6)
      const uvs = new Float32Array(count * 2)
      const exteriorSet = new Set(exterior)

      for (let i = 0; i < count; i++) {
        if (exteriorSet.has(i)) {
          const x = arr[i * 3]
          const y = arr[i * 3 + 1]
          uvs[i * 2] = (x - minX) / xSpan
          uvs[i * 2 + 1] = 1 - (y - minY) / ySpan
        } else {
          uvs[i * 2] = FABRIC_UV
          uvs[i * 2 + 1] = FABRIC_UV
        }
      }

      setPrimitiveUvs(document, prim, uvs)
    }
  }
}

const io = new NodeIO()
const document = await io.read(input)

for (const material of document.getRoot().listMaterials()) {
  material.setBaseColorTexture(null)
  material.setNormalTexture(null)
  material.setMetallicRoughnessTexture(null)
  material.setEmissiveTexture(null)
  material.setOcclusionTexture(null)
  material.setBaseColorFactor([1, 1, 1, 1])
  material.setMetallicFactor(0)
  material.setRoughnessFactor(0.92)
}

let uvMode = "planar fallback"
let hasArtistUvs = !forceUv
if (hasArtistUvs) {
  for (const mesh of document.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      if (!primHasArtistUvs(prim)) {
        hasArtistUvs = false
        break
      }
    }
    if (!hasArtistUvs) break
  }
}

if (hasArtistUvs) {
  uvMode = remapCapForMockupEditor(document)
} else {
  assignCapLayoutAlignedUvs(document)
}

await document.transform(dedup())

fs.mkdirSync(path.dirname(output), { recursive: true })
await io.write(output, document)

console.info(`Baked cap: ${input} → ${output} (UVs: ${uvMode})`)
