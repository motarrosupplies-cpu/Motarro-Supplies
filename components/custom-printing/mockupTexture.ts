import * as THREE from "three"

/** Offscreen design canvas resolution (square). Higher = sharper print on garment UVs. */
export const MOCKUP_TEXTURE_SIZE = {
  mobile: 1024,
  desktop: 2048,
} as const

export function getMockupTextureSize(isMobile: boolean) {
  return isMobile ? MOCKUP_TEXTURE_SIZE.mobile : MOCKUP_TEXTURE_SIZE.desktop
}

/** Design canvas pixels (width ≥ height). `layoutAspect` = width ÷ height. */
export function getMockupTextureDimensions(
  isMobile: boolean,
  layoutAspect = 1,
) {
  const shortSide = getMockupTextureSize(isMobile)
  const aspect = Math.max(layoutAspect, 1)
  return {
    width: Math.round(shortSide * aspect),
    height: shortSide,
  }
}

/** Sharper sampling when the 3D mesh is viewed at an angle or zoomed in. */
export function configureMockupCanvasTexture(
  texture: THREE.CanvasTexture,
  renderer: THREE.WebGLRenderer,
  opts?: { clamp?: boolean },
) {
  const wrap = opts?.clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.flipY = false
  texture.wrapS = wrap
  texture.wrapT = wrap
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
}
