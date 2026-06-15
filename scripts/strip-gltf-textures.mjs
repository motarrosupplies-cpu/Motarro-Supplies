/**
 * One-off utility: remove embedded textures from a GLB so GLTFLoader
 * does not need blob: fetches (custom-printing uses canvas texture only).
 *
 * Usage: node scripts/strip-gltf-textures.mjs <input.glb> [output.glb]
 */
import { NodeIO } from "@gltf-transform/core"

const input = process.argv[2]
const output = process.argv[3] ?? input
if (!input) {
  console.error("Usage: node scripts/strip-gltf-textures.mjs <input.glb> [output.glb]")
  process.exit(1)
}

const io = new NodeIO()
const document = await io.read(input)

for (const material of document.getRoot().listMaterials()) {
  material.setBaseColorTexture(null)
  material.setNormalTexture(null)
  material.setMetallicRoughnessTexture(null)
  material.setEmissiveTexture(null)
  material.setOcclusionTexture(null)
}

await io.write(output, document)
console.info(`Stripped textures: ${input} → ${output}`)
