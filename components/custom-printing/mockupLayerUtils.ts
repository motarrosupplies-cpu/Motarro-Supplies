import type { MockupGarmentId } from "@/components/custom-printing/mockupModelConfig"
import type { MockupImageLayer, MockupLayer, MockupTextLayer } from "./types"

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

/** Default placement for a new image layer (matches garment UV layout). */
export function defaultImageLayerPlacement(garmentId: MockupGarmentId, index: number) {
  if (garmentId === "cap") {
    return {
      x: 0.5,
      y: 0.45,
      scale: 1,
      rotation: 0,
      baseSize: 0.42,
    }
  }
  if (garmentId === "mug") {
    return {
      x: 0.5,
      y: 0.5,
      scale: 1,
      rotation: 0,
      baseSize: 0.55,
    }
  }
  return {
    x: 0.5,
    y: clamp01(0.35 + index * 0.08),
    scale: 1,
    rotation: 0,
    baseSize: 0.45,
  }
}

export function createLayerId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function isTextLayer(layer: MockupLayer): layer is MockupTextLayer {
  return layer.kind === "text"
}

export function isImageLayer(layer: MockupLayer): layer is MockupImageLayer {
  return layer.kind !== "text" && !!layer.url
}

export function getLayerId(layer: MockupLayer, index: number) {
  return layer.id ?? (isTextLayer(layer) ? `text-${index}` : `img-${layer.url}-${index}`)
}

export function layerTabLabel(layer: MockupLayer, index: number) {
  if (isTextLayer(layer)) {
    const t = layer.text.trim()
    return t.length > 18 ? `${t.slice(0, 18)}…` : t || `Text ${index + 1}`
  }
  return layer.filename || `Layer ${index + 1}`
}

export function normalizeMockupLayers(layers: MockupLayer[]): MockupLayer[] {
  return layers.map((layer, index) => {
    if (layer.kind === "text") {
      return {
        ...layer,
        id: layer.id ?? createLayerId("text"),
      }
    }
    return {
      ...layer,
      kind: "image" as const,
      id: layer.id ?? createLayerId("img"),
    }
  })
}

export function textFontSizePx(
  layer: MockupTextLayer,
  canvasSize: number,
) {
  return layer.baseSize * layer.scale * canvasSize * 0.55
}

const TEXT_LAYER_BOX_PAD_PX = 6

/** Pixel bounds for layout selection ring; matches canvas text metrics. */
export function measureTextLayerBounds(
  layer: MockupTextLayer,
  canvasSize: number,
): { width: number; height: number } {
  const refSize = Math.max(1, canvasSize)
  const fontSize = Math.max(8, textFontSizePx(layer, refSize))
  const lineHeight = fontSize * 1.15
  const lines = layer.text.split("\n")

  if (typeof document === "undefined") {
    const approxWidth = Math.max(
      ...lines.map((line) => line.length * fontSize * 0.55),
      fontSize,
    )
    return {
      width: approxWidth + TEXT_LAYER_BOX_PAD_PX,
      height: lines.length * lineHeight + TEXT_LAYER_BOX_PAD_PX,
    }
  }

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    return { width: fontSize * 4, height: lineHeight + TEXT_LAYER_BOX_PAD_PX }
  }

  ctx.font = `${layer.fontWeight} ${fontSize}px "${layer.fontFamily}", sans-serif`
  let maxLineWidth = 0
  for (const line of lines) {
    maxLineWidth = Math.max(maxLineWidth, ctx.measureText(line || " ").width)
  }

  return {
    width: maxLineWidth + TEXT_LAYER_BOX_PAD_PX,
    height: lines.length * lineHeight + TEXT_LAYER_BOX_PAD_PX,
  }
}
