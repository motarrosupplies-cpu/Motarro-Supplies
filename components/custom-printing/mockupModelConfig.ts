export type MockupGarmentId = "tshirt" | "hoodie" | "cap" | "mug"

export type MockupGarmentDef = {
  id: MockupGarmentId
  label: string
  modelUrl: string
  /** A scale that makes the model fill the camera nicely */
  meshScale: number
  /** Optional Euler rotation (radians) applied to the loaded model root */
  meshRotation?: [number, number, number]
  /** Flip the baked texture vertically so it matches this mesh's UVs */
  flipY: boolean
  /** Whether the design should be mirrored horizontally on the mesh */
  flipX?: boolean
  /**
   * When false, always apply the design map (needed for caps — bbox exterior test
   * hides the print on low-poly hats).
   */
  useExteriorClip?: boolean
  /** Clamp texture at UV edges instead of repeating (better for 0–1 cap UVs). */
  textureClamp?: boolean
  /** Render both sides; exterior clip keeps print off the interior. */
  doubleSided?: boolean
  /**
   * Maps layout (0–1) onto an artist UV island (baseball_hat_028 front crown).
   * Layout left/top ↔ u0/v1; right/bottom ↔ u1/v0.
   */
  printRegion?: { u0: number; v0: number; u1: number; v1: number }
  /** Cap front faces +Z; camera on -Z so the default preview shows the print. */
  previewCameraZSign?: -1 | 1
  /** Mirror layer pixels on the texture (cap front reads flipped otherwise). */
  flipTexturePixels?: boolean
  /** Layout / texture width÷height (mug sublimation wrap ≈ 2:1). Default 1 = square. */
  layoutAspect?: number
  /** Ceramic/handle meshes use solid fabric colour; only the print mesh gets the design map. */
  splitFabricMesh?: boolean
}

/**
 * NOTE:
 * Models are served from `/public/models/*` (same-origin) to avoid CSP/CORS fetch blocks.
 * Replace these GLBs with your own brand-accurate garment models when ready.
 */
export const MOCKUP_GARMENTS: MockupGarmentDef[] = [
  {
    id: "tshirt",
    label: "T‑shirt",
    // Source model originally from Starklord17/threejs-t-shirt (MIT).
    modelUrl: "/models/shirt_baked.glb",
    meshScale: 1.8,
    flipY: false,
    // This mesh UVs are mirrored relative to the 2D design stage; flip to match.
    flipX: true,
  },
  {
    id: "hoodie",
    label: "Hoodie",
    // Decompressed/simplified from hoodie.glb (no Draco/WASM) for strict CSP
    modelUrl: "/models/hoodie_baked.glb",
    meshScale: 4,
    flipY: true,
  },
  {
    id: "cap",
    label: "6-panel cap",
    // jmcgregor "Baseball Hat 028" (CC-BY) — see public/models/ATTRIBUTION.md
    modelUrl: "/models/cap_baked.glb",
    meshScale: 1.35,
    meshRotation: [-0.08, 0, 0],
    flipY: false,
    /** Flip artwork horizontally on the texture (readable on cap front). */
    flipTexturePixels: true,
    // Front crown belt UVs in bake-cap-glb.mjs (baseball_hat_028).
    previewCameraZSign: -1,
    useExteriorClip: true,
    textureClamp: true,
    doubleSided: true,
  },
  {
    id: "mug",
    label: "11oz mug",
    // Sketchfab sublimation mug — see public/models/ATTRIBUTION.md
    modelUrl: "/models/mug_baked.glb",
    meshScale: 1.35,
    flipY: false,
    useExteriorClip: false,
    textureClamp: true,
    doubleSided: true,
    previewCameraZSign: 1,
    layoutAspect: 2,
    splitFabricMesh: true,
  },
]

export function getMockupGarmentById(id: MockupGarmentId) {
  return MOCKUP_GARMENTS.find((g) => g.id === id)
}

