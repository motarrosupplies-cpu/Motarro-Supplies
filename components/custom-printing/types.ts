export type MockupLayerKind = "image" | "text"

export type MockupLayerBase = {
  id?: string
  kind?: MockupLayerKind
  /**
   * Normalized [0..1] coords in the design canvas.
   * (0,0) top-left, (1,1) bottom-right
   */
  x: number
  y: number
  /** Relative scale multiplier (1 = original draw size) */
  scale: number
  /** Rotation in radians */
  rotation: number
  /** Relative size when first placed (0..1) */
  baseSize: number
}

export type MockupImageLayer = MockupLayerBase & {
  kind?: "image"
  /** public URL to the uploaded design image */
  url: string
  filename?: string
}

export type MockupTextLayer = MockupLayerBase & {
  kind: "text"
  text: string
  fontFamily: string
  fontWeight: number
  color: string
}

export type MockupLayer = MockupImageLayer | MockupTextLayer

export type MockupDesign = {
  version: 1
  garmentId: "tshirt" | "hoodie" | "cap" | "mug"
  baseGarmentColorHex: string
  canvas: { width: number; height: number }
  layers: MockupLayer[]
}
