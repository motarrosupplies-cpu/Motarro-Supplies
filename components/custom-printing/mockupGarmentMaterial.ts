import * as THREE from "three"
import { configureMockupCanvasTexture } from "@/components/custom-printing/mockupTexture"

/** Min dot(normal, position - center) to apply the design map (exterior only). */
const EXTERIOR_FACING_THRESHOLD = 0.12

export type MockupGarmentMaterialUniforms = {
  uGarmentCenter: { value: THREE.Vector3 }
  uFabricColor: { value: THREE.Color }
  uExteriorClip: { value: number }
}

export type MockupGarmentMaterial = THREE.MeshStandardMaterial & {
  userData: {
    mockupUniforms?: MockupGarmentMaterialUniforms
  }
}

export type MockupGarmentMaterialOptions = {
  fabricColorHex?: string
  /** When false, design map is used on all faces (caps). Default true. */
  exteriorClip?: boolean
  textureClamp?: boolean
  /** Double-sided mesh (cap interior visible as fabric, not print). */
  doubleSided?: boolean
}

/**
 * Garment material: optional exterior-only map so hoodie prints do not bleed inside.
 */
export function createMockupGarmentMaterial(
  map: THREE.CanvasTexture,
  renderer: THREE.WebGLRenderer,
  options: MockupGarmentMaterialOptions = {},
): MockupGarmentMaterial {
  const {
    fabricColorHex = "#ffffff",
    exteriorClip = true,
    textureClamp = false,
    doubleSided = false,
  } = options

  configureMockupCanvasTexture(map, renderer, { clamp: textureClamp })

  const mat = new THREE.MeshStandardMaterial({
    map,
    color: new THREE.Color("#ffffff"),
    roughness: 0.92,
    metalness: 0,
    side: doubleSided ? THREE.DoubleSide : THREE.FrontSide,
    flatShading: false,
  }) as MockupGarmentMaterial

  const mockupUniforms: MockupGarmentMaterialUniforms = {
    uGarmentCenter: { value: new THREE.Vector3() },
    uFabricColor: { value: new THREE.Color(fabricColorHex) },
    uExteriorClip: { value: exteriorClip ? 1 : 0 },
  }
  mat.userData.mockupUniforms = mockupUniforms

  mat.customProgramCacheKey = () =>
    `mockup-garment-v2-${exteriorClip ? "clip" : "full"}-${textureClamp ? "clamp" : "repeat"}-${doubleSided ? "ds" : "ss"}`

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uGarmentCenter = mockupUniforms.uGarmentCenter
    shader.uniforms.uFabricColor = mockupUniforms.uFabricColor
    shader.uniforms.uExteriorClip = mockupUniforms.uExteriorClip

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vMockupWorldPos;
varying vec3 vMockupWorldNormal;`,
      )
      .replace(
        "#include <defaultnormal_vertex>",
        `#include <defaultnormal_vertex>
vMockupWorldNormal = normalize( mat3( modelMatrix ) * objectNormal );`,
      )
      .replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>
vMockupWorldPos = worldPosition.xyz;`,
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vMockupWorldPos;
varying vec3 vMockupWorldNormal;
uniform vec3 uGarmentCenter;
uniform vec3 uFabricColor;
uniform float uExteriorClip;`,
      )
      .replace(
        "#include <map_fragment>",
        `#ifdef USE_MAP
  float mockupExterior = dot(
    normalize( vMockupWorldNormal ),
    normalize( vMockupWorldPos - uGarmentCenter )
  );
  if ( uExteriorClip < 0.5 || mockupExterior >= ${EXTERIOR_FACING_THRESHOLD.toFixed(2)} ) {
    vec4 texelColor = texture2D( map, vMapUv );
    diffuseColor *= texelColor;
  } else {
    diffuseColor.rgb = uFabricColor;
  }
#endif`,
      )
  }

  return mat
}

export function setMockupGarmentCenterFromRoot(
  mat: THREE.MeshStandardMaterial,
  root: THREE.Object3D,
) {
  const uniforms = (mat as MockupGarmentMaterial).userData.mockupUniforms
  if (!uniforms) return
  const box = new THREE.Box3().setFromObject(root)
  box.getCenter(uniforms.uGarmentCenter.value)
}

export function setMockupFabricColor(
  mat: THREE.MeshStandardMaterial,
  fabricColorHex: string,
) {
  const uniforms = (mat as MockupGarmentMaterial).userData.mockupUniforms
  if (!uniforms) return
  uniforms.uFabricColor.value.set(fabricColorHex)
}

export function setMockupExteriorClip(
  mat: THREE.MeshStandardMaterial,
  enabled: boolean,
) {
  const uniforms = (mat as MockupGarmentMaterial).userData.mockupUniforms
  if (!uniforms) return
  uniforms.uExteriorClip.value = enabled ? 1 : 0
}

export function setMockupTextureWrap(
  tex: THREE.CanvasTexture,
  clamp: boolean,
) {
  const wrap = clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping
  tex.wrapS = wrap
  tex.wrapT = wrap
  tex.needsUpdate = true
}

/** Sublimation mug print mesh from coffee_mug_for_sublimation.glb (Material Imagem Principal). */
export function isMugPrintMesh(mesh: THREE.Mesh) {
  const n = String(mesh.name || "").toLowerCase()
  const raw = mesh.material
  const mats = Array.isArray(raw) ? raw : raw ? [raw] : []
  for (const m of mats) {
    const matName = String(m.name || "").toLowerCase()
    if (matName.includes("imagem_principal") || matName.includes("imagem principal")) {
      return true
    }
  }
  return n.includes("imagem principal")
}

export function createMockupFabricMaterial(
  fabricColorHex: string,
  doubleSided = true,
) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(fabricColorHex),
    roughness: 0.88,
    metalness: 0,
    side: doubleSided ? THREE.DoubleSide : THREE.FrontSide,
  })
}
