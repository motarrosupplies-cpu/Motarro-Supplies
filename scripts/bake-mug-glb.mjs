/**
 * Bake sublimation mug GLB for the mockup editor.
 * Usage: node scripts/bake-mug-glb.mjs [input.glb] [output.glb]
 *
 * From coffee_mug_for_sublimation.glb (Sketchfab): keeps the artist print
 * island on "Material Imagem Principal" mapped to the full 0–1 layout atlas.
 * Handle, base, and ceramic body are pinned to fabric UV so only the print band
 * shows artwork (no template overlay texture).
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { NodeIO } from "@gltf-transform/core"
import { ALL_EXTENSIONS } from "@gltf-transform/extensions"
import { dedup, prune } from "@gltf-transform/functions"

const fileArgs = process.argv.slice(2).filter((a) => !a.startsWith("--"))
const input =
  fileArgs[0] ??
  path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../public/models/mug_sublimation_source.glb",
  )
const output =
  fileArgs[1] ??
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../public/models/mug_baked.glb")

const FABRIC_UV = 0.5
const UV_INSET = 0.01

function isPrintMesh(mesh, material) {
  const meshName = (mesh.getName() || "").toLowerCase()
  const matName = (material?.getName() || "").toLowerCase()
  return (
    meshName.includes("imagem principal") ||
    matName.includes("imagem principal") ||
    matName.includes("imagem_principal")
  )
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

/** Remap artist print island UVs to the full 0–1 layout atlas. */
function remapPrintIslandToLayout(document, prim) {
  const uv = prim.getAttribute("TEXCOORD_0")
  const pos = prim.getAttribute("POSITION")
  if (!uv || !pos) return

  const src = uv.getArray()
  const count = pos.getCount()
  let minU = 1
  let maxU = 0
  let minV = 1
  let maxV = 0
  for (let i = 0; i < count; i++) {
    minU = Math.min(minU, src[i * 2])
    maxU = Math.max(maxU, src[i * 2])
    minV = Math.min(minV, src[i * 2 + 1])
    maxV = Math.max(maxV, src[i * 2 + 1])
  }

  const uSpan = Math.max(maxU - minU, 1e-6)
  const vSpan = Math.max(maxV - minV, 1e-6)
  const out = new Float32Array(count * 2)

  for (let i = 0; i < count; i++) {
    const u = (src[i * 2] - minU) / uSpan
    const v = (src[i * 2 + 1] - minV) / vSpan
    out[i * 2] = UV_INSET + u * (1 - 2 * UV_INSET)
    out[i * 2 + 1] = UV_INSET + v * (1 - 2 * UV_INSET)
  }

  setPrimitiveUvs(document, prim, out)
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
const document = await io.read(input)

for (const material of document.getRoot().listMaterials()) {
  material.setExtension("KHR_materials_pbrSpecularGlossiness", null)
  material.setBaseColorTexture(null)
  material.setNormalTexture(null)
  material.setMetallicRoughnessTexture(null)
  material.setEmissiveTexture(null)
  material.setOcclusionTexture(null)
  material.setBaseColorFactor([1, 1, 1, 1])
  material.setMetallicFactor(0)
  material.setRoughnessFactor(0.88)
}

for (const mesh of document.getRoot().listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    if (isPrintMesh(mesh, prim.getMaterial())) {
      remapPrintIslandToLayout(document, prim)
    } else {
      pinPrimitiveToFabric(document, prim)
    }
  }
}

await document.transform(dedup(), prune())
fs.mkdirSync(path.dirname(output), { recursive: true })
await io.write(output, document)
console.log(`Baked mug: ${input} → ${output}`)
