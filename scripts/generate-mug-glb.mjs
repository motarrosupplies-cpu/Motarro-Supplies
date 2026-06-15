/**
 * Procedural 11oz ceramic mug GLB (no Draco) for the mockup editor.
 * Usage: node scripts/generate-mug-glb.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { Document, NodeIO } from "@gltf-transform/core"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, "../public/models/mug_11oz_source.glb")

/** ~11oz ceramic mug proportions in metres */
const BODY_RADIUS_TOP = 0.040
const BODY_RADIUS_BOTTOM = 0.036
const BODY_HEIGHT = 0.095
const WALL = 0.0035
const HANDLE_MAJOR = 0.021
const HANDLE_MINOR = 0.0055
const SEGMENTS = 48

function pushMesh(document, buffer, material, name, positions, normals, uvs, indices) {
  const posAcc = document
    .createAccessor()
    .setType("VEC3")
    .setArray(new Float32Array(positions))
    .setBuffer(buffer)
  const normAcc = document
    .createAccessor()
    .setType("VEC3")
    .setArray(new Float32Array(normals))
    .setBuffer(buffer)
  const uvAcc = document
    .createAccessor()
    .setType("VEC2")
    .setArray(new Float32Array(uvs))
    .setBuffer(buffer)
  const idxAcc = document
    .createAccessor()
    .setType("SCALAR")
    .setArray(indices)
    .setBuffer(buffer)

  const prim = document
    .createPrimitive()
    .setAttribute("POSITION", posAcc)
    .setAttribute("NORMAL", normAcc)
    .setAttribute("TEXCOORD_0", uvAcc)
    .setIndices(idxAcc)
    .setMaterial(material)

  return document.createMesh(name).addPrimitive(prim)
}

/** Open cylinder along +Y, base at y=0, open top. */
function buildOpenCylinder(radiusTop, radiusBottom, height, segments) {
  const rowVerts = segments + 1
  const positions = []
  const normals = []
  const uvs = []
  const indices = []

  for (let row = 0; row <= 1; row++) {
    const v = row
    const radius = row === 0 ? radiusBottom : radiusTop
    const py = row * height
    for (let x = 0; x <= segments; x++) {
      const u = x / segments
      const theta = u * Math.PI * 2
      const sin = Math.sin(theta)
      const cos = Math.cos(theta)
      positions.push(radius * sin, py, radius * cos)
      normals.push(sin, 0, cos)
      uvs.push(u, 1 - v)
    }
  }

  for (let row = 0; row < 1; row++) {
    for (let x = 0; x < segments; x++) {
      const a = row * rowVerts + x
      const b = a + rowVerts
      const c = b + 1
      const d = a + 1
      indices.push(a, b, d, b, c, d)
    }
  }

  return { positions, normals, uvs, indices: new Uint16Array(indices) }
}

function buildDisc(radius, segments, facingUp = true) {
  const positions = []
  const normals = []
  const uvs = []
  const indices = []
  const ny = facingUp ? 1 : -1

  positions.push(0, 0, 0)
  normals.push(0, ny, 0)
  uvs.push(0.5, 0.5)

  for (let i = 0; i <= segments; i++) {
    const u = i / segments
    const theta = u * Math.PI * 2
    const sin = Math.sin(theta)
    const cos = Math.cos(theta)
    positions.push(radius * sin, 0, radius * cos)
    normals.push(0, ny, 0)
    uvs.push(0.5 + sin * 0.5, 0.5 + cos * 0.5)
  }

  for (let i = 1; i <= segments; i++) {
    indices.push(0, facingUp ? i : i + 1, facingUp ? i + 1 : i)
  }

  return { positions, normals, uvs, indices: new Uint16Array(indices) }
}

/** Thin rim lip at the top opening (annulus in XZ plane). */
function buildRimLip(outerR, innerR, segments) {
  const positions = []
  const normals = []
  const uvs = []
  const indices = []

  for (let ring = 0; ring <= 1; ring++) {
    const radius = ring === 0 ? innerR : outerR
    for (let i = 0; i <= segments; i++) {
      const u = i / segments
      const theta = u * Math.PI * 2
      const sin = Math.sin(theta)
      const cos = Math.cos(theta)
      positions.push(radius * sin, 0, radius * cos)
      normals.push(0, 1, 0)
      uvs.push(u, ring)
    }
  }

  const row = segments + 1
  for (let i = 0; i < segments; i++) {
    const a = i
    const b = a + row
    const c = b + 1
    const d = a + 1
    indices.push(a, b, d, b, c, d)
  }

  return { positions, normals, uvs, indices: new Uint16Array(indices) }
}

/**
 * C-shaped handle in the YZ plane, opening toward +X (right side of mug).
 * Arc runs from lower attachment to upper attachment.
 */
function buildSideHandle(major, minor, majorSeg, minorSeg) {
  const positions = []
  const normals = []
  const uvs = []
  const indices = []
  const arcStart = -Math.PI * 0.48
  const arcEnd = Math.PI * 0.48

  for (let j = 0; j <= minorSeg; j++) {
    const v = j / minorSeg
    const phi = v * Math.PI * 2
    const cosPhi = Math.cos(phi)
    const sinPhi = Math.sin(phi)

    for (let i = 0; i <= majorSeg; i++) {
      const t = i / majorSeg
      const theta = arcStart + t * (arcEnd - arcStart)
      const sinTheta = Math.sin(theta)
      const cosTheta = Math.cos(theta)

      const ringY = major * sinTheta
      const ringZ = major * cosTheta
      const x = minor * cosPhi
      const y = ringY + minor * sinPhi * cosTheta
      const z = ringZ + minor * sinPhi * sinTheta

      const nx = cosPhi
      const ny = sinPhi * cosTheta
      const nz = sinPhi * sinTheta
      const len = Math.hypot(nx, ny, nz) || 1

      positions.push(x, y, z)
      normals.push(nx / len, ny / len, nz / len)
      uvs.push(t, v)
    }
  }

  const row = majorSeg + 1
  for (let j = 0; j < minorSeg; j++) {
    for (let i = 0; i < majorSeg; i++) {
      const a = j * row + i
      const b = a + row
      const c = b + 1
      const d = a + 1
      indices.push(a, b, d, b, c, d)
    }
  }

  return { positions, normals, uvs, indices: new Uint16Array(indices) }
}

function transformMesh(mesh, tx, ty, tz, rotX = 0, rotY = 0, rotZ = 0) {
  const cx = Math.cos(rotX)
  const sx = Math.sin(rotX)
  const cy = Math.cos(rotY)
  const sy = Math.sin(rotY)
  const cz = Math.cos(rotZ)
  const sz = Math.sin(rotZ)

  const rotate = (x, y, z, translate) => {
    let y1 = y * cx - z * sx
    let z1 = y * sx + z * cx
    y = y1
    z = z1

    let x1 = x * cy + z * sy
    z1 = -x * sy + z * cy
    x = x1
    z = z1

    x1 = x * cz - y * sz
    y1 = x * sz + y * cz
    if (translate) return [x1 + tx, y1 + ty, z1 + tz]
    return [x1, y1, z1]
  }

  for (let i = 0; i < mesh.positions.length; i += 3) {
    const [x, y, z] = rotate(mesh.positions[i], mesh.positions[i + 1], mesh.positions[i + 2], true)
    mesh.positions[i] = x
    mesh.positions[i + 1] = y
    mesh.positions[i + 2] = z
  }

  for (let i = 0; i < mesh.normals.length; i += 3) {
    const [x, y, z] = rotate(mesh.normals[i], mesh.normals[i + 1], mesh.normals[i + 2], false)
    const len = Math.hypot(x, y, z) || 1
    mesh.normals[i] = x / len
    mesh.normals[i + 1] = y / len
    mesh.normals[i + 2] = z / len
  }
}

const document = new Document()
const buffer = document.createBuffer()
const material = document
  .createMaterial("MugMaterial")
  .setBaseColorFactor([1, 1, 1, 1])
  .setMetallicFactor(0)
  .setRoughnessFactor(0.9)

const body = buildOpenCylinder(BODY_RADIUS_TOP, BODY_RADIUS_BOTTOM, BODY_HEIGHT, SEGMENTS)
pushMesh(document, buffer, material, "MugBody", ...Object.values(body))

const bottom = buildDisc(BODY_RADIUS_BOTTOM - WALL, SEGMENTS, true)
transformMesh(bottom, 0, WALL, 0)
pushMesh(document, buffer, material, "MugBottom", ...Object.values(bottom))

const rim = buildRimLip(BODY_RADIUS_TOP, BODY_RADIUS_TOP - WALL, SEGMENTS)
transformMesh(rim, 0, BODY_HEIGHT, 0)
pushMesh(document, buffer, material, "MugRim", ...Object.values(rim))

const handle = buildSideHandle(HANDLE_MAJOR, HANDLE_MINOR, 32, 12)
const handleY = BODY_HEIGHT * 0.52
transformMesh(handle, BODY_RADIUS_TOP + HANDLE_MINOR * 0.85, handleY, 0)
pushMesh(document, buffer, material, "MugHandle", ...Object.values(handle))

const scene = document.createScene("MugScene")
for (const mesh of document.getRoot().listMeshes()) {
  scene.addChild(document.createNode(mesh.getName()).setMesh(mesh))
}

const io = new NodeIO()
fs.mkdirSync(path.dirname(outPath), { recursive: true })
await io.write(outPath, document)
console.log(`Wrote ${outPath}`)
