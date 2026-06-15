import * as THREE from "three"

export type MockupLightingPresetId = "studio" | "soft" | "bright" | "outdoor"

export type MockupLightingPreset = {
  id: MockupLightingPresetId
  label: string
  description: string
  ambient: { color: number; intensity: number }
  hemisphere?: { sky: number; ground: number; intensity: number }
  key: { color: number; intensity: number; position: [number, number, number] }
  fill: { color: number; intensity: number; position: [number, number, number] }
  rim: { color: number; intensity: number; position: [number, number, number] }
  exposure: number
  envMapIntensity: number
  roughness: number
  useRoomEnvironment: boolean
}

export const MOCKUP_LIGHTING_PRESETS: MockupLightingPreset[] = [
  {
    id: "outdoor",
    label: "Natural",
    description: "Classic single-light look — closest to the original preview",
    ambient: { color: 0xffffff, intensity: 0.68 },
    hemisphere: { sky: 0xe8f4ff, ground: 0xf5f0e8, intensity: 0.32 },
    key: { color: 0xffffff, intensity: 1.05, position: [4, 6, 3] },
    fill: { color: 0xffffff, intensity: 0.42, position: [-4, 2, 3] },
    rim: { color: 0xffffff, intensity: 0.14, position: [0, 3, -5] },
    exposure: 1.02,
    envMapIntensity: 0.14,
    roughness: 0.9,
    useRoomEnvironment: true,
  },
  {
    id: "studio",
    label: "Studio",
    description: "Balanced product lighting with subtle environment reflections",
    ambient: { color: 0xffffff, intensity: 0.58 },
    key: { color: 0xfff8f0, intensity: 0.62, position: [3.5, 5, 4] },
    fill: { color: 0xf0f4ff, intensity: 0.32, position: [-4, 2, 3] },
    rim: { color: 0xffffff, intensity: 0.1, position: [0, 3, -5] },
    exposure: 1.02,
    envMapIntensity: 0.22,
    roughness: 0.9,
    useRoomEnvironment: true,
  },
  {
    id: "soft",
    label: "Soft",
    description: "Gentle, lower-contrast light — softer shadows, not washed out",
    ambient: { color: 0xffffff, intensity: 0.48 },
    key: { color: 0xffffff, intensity: 0.4, position: [2.5, 4.5, 4.5] },
    fill: { color: 0xffffff, intensity: 0.48, position: [-3.5, 1.5, 3.5] },
    rim: { color: 0xffffff, intensity: 0.06, position: [1, 2.5, -4] },
    exposure: 0.94,
    envMapIntensity: 0.28,
    roughness: 0.96,
    useRoomEnvironment: true,
  },
  {
    id: "bright",
    label: "Bright",
    description: "High-key lighting — lifts dark garment colours for a truer read",
    ambient: { color: 0xffffff, intensity: 0.76 },
    key: { color: 0xfff8f0, intensity: 0.88, position: [3.5, 5.5, 4] },
    fill: { color: 0xf0f4ff, intensity: 0.58, position: [-4, 2, 3] },
    rim: { color: 0xffffff, intensity: 0.28, position: [0, 3, -5] },
    exposure: 1.14,
    envMapIntensity: 0.4,
    roughness: 0.98,
    useRoomEnvironment: true,
  },
]

export function getMockupLightingPreset(id: MockupLightingPresetId) {
  return MOCKUP_LIGHTING_PRESETS.find((p) => p.id === id) ?? MOCKUP_LIGHTING_PRESETS[0]
}

export type MockupLightingRig = {
  ambient: THREE.AmbientLight
  hemisphere: THREE.HemisphereLight | null
  key: THREE.DirectionalLight
  fill: THREE.DirectionalLight
  rim: THREE.DirectionalLight
  pmremGenerator: THREE.PMREMGenerator | null
  envTexture: THREE.Texture | null
}

export function createMockupLightingRig(scene: THREE.Scene): MockupLightingRig {
  const ambient = new THREE.AmbientLight(0xffffff, 0.7)
  const hemisphere = new THREE.HemisphereLight(0x87ceeb, 0x8b7355, 0)
  hemisphere.visible = false
  const key = new THREE.DirectionalLight(0xffffff, 0.8)
  const fill = new THREE.DirectionalLight(0xffffff, 0.5)
  const rim = new THREE.DirectionalLight(0xffffff, 0.3)
  for (const light of [key, fill, rim]) {
    light.target.position.set(0, 0, 0)
    scene.add(light.target)
  }
  scene.add(ambient, hemisphere, key, fill, rim)
  return {
    ambient,
    hemisphere,
    key,
    fill,
    rim,
    pmremGenerator: null,
    envTexture: null,
  }
}

export async function applyMockupLightingPreset(
  rig: MockupLightingRig,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  material: THREE.MeshStandardMaterial,
  presetId: MockupLightingPresetId,
) {
  const preset = getMockupLightingPreset(presetId)

  rig.ambient.color.setHex(preset.ambient.color)
  rig.ambient.intensity = preset.ambient.intensity

  if (preset.hemisphere && rig.hemisphere) {
    rig.hemisphere.color.setHex(preset.hemisphere.sky)
    rig.hemisphere.groundColor.setHex(preset.hemisphere.ground)
    rig.hemisphere.intensity = preset.hemisphere.intensity
    rig.hemisphere.visible = true
  } else if (rig.hemisphere) {
    rig.hemisphere.intensity = 0
    rig.hemisphere.visible = false
  }

  rig.key.color.setHex(preset.key.color)
  rig.key.intensity = preset.key.intensity
  rig.key.position.set(...preset.key.position)

  rig.fill.color.setHex(preset.fill.color)
  rig.fill.intensity = preset.fill.intensity
  rig.fill.position.set(...preset.fill.position)

  rig.rim.color.setHex(preset.rim.color)
  rig.rim.intensity = preset.rim.intensity
  rig.rim.position.set(...preset.rim.position)

  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = preset.exposure

  material.roughness = preset.roughness
  material.metalness = 0
  material.envMapIntensity = preset.envMapIntensity

  // Custom garment shaders need scene.environment for stable PBR lighting.
  // Never clear it (outdoor used to set null and made the mesh appear invisible).
  if (preset.useRoomEnvironment && !rig.pmremGenerator) {
    const { RoomEnvironment } = await import(
      "three/examples/jsm/environments/RoomEnvironment.js"
    )
    rig.pmremGenerator = new THREE.PMREMGenerator(renderer)
    rig.pmremGenerator.compileEquirectangularShader()
    const roomEnv = new RoomEnvironment()
    rig.envTexture = rig.pmremGenerator.fromScene(roomEnv).texture
    roomEnv.dispose?.()
  }
  if (rig.envTexture) {
    scene.environment = rig.envTexture
  }
  material.needsUpdate = true
}

export function disposeMockupLightingRig(rig: MockupLightingRig, scene: THREE.Scene) {
  rig.ambient.dispose()
  rig.key.dispose()
  rig.fill.dispose()
  rig.rim.dispose()
  rig.hemisphere?.dispose()
  rig.envTexture?.dispose()
  rig.pmremGenerator?.dispose()
  scene.environment = null
}
