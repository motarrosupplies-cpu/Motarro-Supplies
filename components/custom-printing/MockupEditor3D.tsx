"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import { Maximize2, Minimize2, Pause, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadMultipleFiles } from "@/lib/upload-service"
import {
  MOCKUP_GARMENTS,
  type MockupGarmentId,
} from "@/components/custom-printing/mockupModelConfig"
import {
  createMockupFabricMaterial,
  createMockupGarmentMaterial,
  isMugPrintMesh,
  setMockupExteriorClip,
  setMockupFabricColor,
  setMockupGarmentCenterFromRoot,
  setMockupTextureWrap,
} from "@/components/custom-printing/mockupGarmentMaterial"
import { getMockupTextureDimensions } from "@/components/custom-printing/mockupTexture"
import {
  MOCKUP_LIGHTING_PRESETS,
  applyMockupLightingPreset,
  createMockupLightingRig,
  disposeMockupLightingRig,
  type MockupLightingPresetId,
} from "@/components/custom-printing/mockupLighting"
import {
  MOCKUP_GOOGLE_FONTS,
  getMockupFontWeights,
  loadMockupGoogleFont,
} from "@/components/custom-printing/mockupGoogleFonts"
import {
  createLayerId,
  defaultImageLayerPlacement,
  getLayerId,
  isImageLayer,
  isTextLayer,
  layerTabLabel,
  normalizeMockupLayers,
  measureTextLayerBounds,
  textFontSizePx,
} from "@/components/custom-printing/mockupLayerUtils"
import type {
  MockupDesign,
  MockupLayer,
  MockupTextLayer,
} from "@/components/custom-printing/types"

const DEFAULT_BASE_COLOR = "#ffffff"
const GARMENT_BASE_COLOR_PRESETS: { label: string; hex: string }[] = [
  { label: "White", hex: "#ffffff" },
  { label: "Black", hex: "#171717" },
  { label: "Navy", hex: "#1a2b4a" },
  { label: "Charcoal", hex: "#3d3d3d" },
  { label: "Red", hex: "#c62828" },
  { label: "Forest", hex: "#1b5e20" },
  { label: "Sand", hex: "#d7c4a3" },
]

type Props = {
  initialImageUrls: Array<{ url: string; filename?: string }>
  /** Restore layers when re-opening a saved mockup */
  initialDesign?: MockupDesign | null
  initialGarmentId?: MockupGarmentId
  initialBaseColorHex?: string
  /** Taller panels when shown inside the fullscreen mockup dialog */
  layout?: "default" | "fullscreen"
  onConfirm: (result: { design: MockupDesign; previewPngBlob: Blob }) => void
  onCancel?: () => void
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

function normalizePointer(
  ev: React.PointerEvent,
  el: HTMLElement,
  opts?: { flipX?: boolean },
): { x: number; y: number } {
  const r = el.getBoundingClientRect()
  let x = (ev.clientX - r.left) / r.width
  const y = (ev.clientY - r.top) / r.height
  if (opts?.flipX) x = 1 - x
  return { x: clamp01(x), y: clamp01(y) }
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(max-width: 767px)").matches
  })
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const update = () => setIsMobile(mq.matches)
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  return isMobile
}


/** Center the loaded garment and position the camera to fit the viewport. */
function frameGarmentInView(
  root: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3; update: () => void },
  padding = 1.4,
  cameraZSign: -1 | 1 = 1,
) {
  const box = new THREE.Box3().setFromObject(root)
  const center = box.getCenter(new THREE.Vector3())
  root.position.sub(center)

  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z, 0.001)
  const fovRad = (camera.fov * Math.PI) / 180
  const dist = (maxDim / (2 * Math.tan(fovRad / 2))) * padding

  if (cameraZSign < 0) {
    const yLift = maxDim * 0.14
    camera.position.set(0, yLift, -dist)
    controls.target.set(0, 0, 0)
    camera.near = Math.max(0.01, dist / 100)
    camera.far = dist * 100
    camera.updateProjectionMatrix()
    controls.update()
    if (typeof controls.setAzimuthalAngle === "function") {
      controls.setAzimuthalAngle(0)
    }
    if (typeof controls.setPolarAngle === "function") {
      controls.setPolarAngle(Math.PI / 2 - 0.22)
    }
    controls.update()
  } else {
    camera.position.set(0, maxDim * 0.08, dist * cameraZSign)
    camera.near = Math.max(0.01, dist / 100)
    camera.far = dist * 100
    camera.updateProjectionMatrix()
    controls.target.set(0, 0, 0)
    controls.update()
  }
}

/** Rotation baked to the texture (canvas flip inverts the angle). */
function layerRotationForTexture(
  rotation: number,
  opts: { flipX?: boolean; flipY?: boolean },
) {
  let r = rotation
  if (opts.flipX) r = -r
  if (opts.flipY) r = -r
  return r
}

/** Rotation on the 2D layout stage — must match drawMockupCanvas / 3D output. */
function layerRotationForStage(
  rotation: number,
  garmentFlipX: boolean | undefined,
  mappedLayout: boolean,
) {
  if (garmentFlipX && !mappedLayout) return -rotation
  return rotation
}

async function loadHtmlImage(url: string) {
  const img = new Image()
  img.crossOrigin = "anonymous"
  img.src = url
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
  })
  return img
}

type MockupPrintRegion = { u0: number; v0: number; u1: number; v1: number }

function layerToCanvasPoint(
  layer: { x: number; y: number },
  canvas: HTMLCanvasElement,
  opts: { mirrorPositionX?: boolean; printRegion?: MockupPrintRegion },
) {
  const xNorm = opts.mirrorPositionX ? 1 - layer.x : layer.x
  const region = opts.printRegion
  if (!region) {
    return { cx: xNorm * canvas.width, cy: layer.y * canvas.height }
  }
  const u = region.u0 + xNorm * (region.u1 - region.u0)
  const textureV = region.v0 + (1 - layer.y) * (region.v1 - region.v0)
  return {
    cx: u * canvas.width,
    cy: (1 - textureV) * canvas.height,
  }
}

function printRegionScale(region?: MockupPrintRegion) {
  if (!region) return 1
  return Math.min(region.u1 - region.u0, region.v1 - region.v0)
}

function drawMockupCanvas(
  canvas: HTMLCanvasElement,
  opts: {
    layers: MockupLayer[]
    imagesByUrl: Map<string, HTMLImageElement>
    baseColorHex: string
    /** Flip the whole texture canvas horizontally (mirrors artwork pixels) */
    flipX?: boolean
    /** Map layer.x → (1-x) on the texture only (position mirror, readable artwork) */
    mirrorPositionX?: boolean
    /** Mirror the rendered texture vertically for this garment's UVs */
    flipY?: boolean
    /** Map layout 0–1 onto an artist UV island (cap front crown). */
    printRegion?: MockupPrintRegion
    /** Mirror image pixels at each layer (cap front readability). */
    flipTexturePixels?: boolean
  },
) {
  const ctx = canvas.getContext("2d", { alpha: true })
  if (!ctx) return

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  // Paint the fabric colour into the texture so garment colour changes
  // don't tint/obscure the artwork via material color multiplication.
  ctx.fillStyle = opts.baseColorHex || "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Garment-specific UV fixes on the texture canvas (2D layout stays upright).
  if (opts.flipY) {
    ctx.save()
    ctx.translate(0, canvas.height)
    ctx.scale(1, -1)
  }
  if (opts.flipX) {
    ctx.save()
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
  }

  const canvasMin = Math.min(canvas.width, canvas.height)
  const regionScale = printRegionScale(opts.printRegion)

  for (const layer of opts.layers) {
    const { cx, cy } = layerToCanvasPoint(layer, canvas, {
      mirrorPositionX: opts.mirrorPositionX,
      printRegion: opts.printRegion,
    })
    const size = layer.baseSize * canvasMin * layer.scale * regionScale

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(
      layerRotationForTexture(layer.rotation, {
        flipX: opts.flipX,
        flipY: opts.flipY,
      }),
    )

    if (isTextLayer(layer)) {
      const fontSize = Math.max(8, textFontSizePx(layer, canvasMin))
      ctx.font = `${layer.fontWeight} ${fontSize}px "${layer.fontFamily}", sans-serif`
      ctx.fillStyle = layer.color || "#000000"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      if (opts.flipTexturePixels) {
        ctx.scale(-1, 1)
      }
      const lines = layer.text.split("\n")
      const lineHeight = fontSize * 1.15
      const startY = -((lines.length - 1) * lineHeight) / 2
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i]!, 0, startY + i * lineHeight)
      }
    } else if (isImageLayer(layer)) {
      const img = opts.imagesByUrl.get(layer.url)
      if (!img) {
        ctx.restore()
        continue
      }
      const w = size
      const h = (img.height / img.width) * size
      if (opts.flipTexturePixels) {
        ctx.scale(-1, 1)
      }
      ctx.drawImage(img, -w / 2, -h / 2, w, h)
    }

    ctx.restore()
  }

  if (opts.flipX) {
    ctx.restore()
  }
  if (opts.flipY) {
    ctx.restore()
  }
}

export function MockupEditor3D({
  initialImageUrls,
  initialDesign = null,
  initialGarmentId: initialGarmentIdProp,
  initialBaseColorHex: initialBaseColorHexProp,
  layout = "default",
  onConfirm,
  onCancel,
}: Props) {
  const initialGarmentId =
    initialDesign?.garmentId ?? initialGarmentIdProp ?? "tshirt"
  const initialBaseColorHex =
    initialDesign?.baseGarmentColorHex ??
    initialBaseColorHexProp ??
    DEFAULT_BASE_COLOR
  const isFullscreenLayout = layout === "fullscreen"
  const stageRef = useRef<HTMLDivElement | null>(null)
  /** Offscreen canvas for the garment texture (must not use display:none). */
  const textureCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const previewShellRef = useRef<HTMLDivElement | null>(null)
  const previewMountRef = useRef<HTMLDivElement | null>(null)
  const [previewAutoRotate, setPreviewAutoRotate] = useState(false)
  const previewAutoRotateRef = useRef(false)
  const [previewFullscreen, setPreviewFullscreen] = useState(false)
  const [mobilePanel, setMobilePanel] = useState<"preview" | "layout">("preview")
  const addImagesInputRef = useRef<HTMLInputElement | null>(null)

  const [garmentId, setGarmentId] =
    useState<MockupGarmentId>(initialGarmentId)
  const [baseGarmentColorHex, setBaseGarmentColorHex] = useState(
    initialBaseColorHex,
  )
  const baseGarmentColorHexRef = useRef(baseGarmentColorHex)
  const garmentColorRafRef = useRef<number | null>(null)
  useEffect(() => {
    baseGarmentColorHexRef.current = baseGarmentColorHex
  }, [baseGarmentColorHex])
  const [layers, setLayers] = useState<MockupLayer[]>(() => {
    if (initialDesign?.layers?.length) {
      return normalizeMockupLayers(initialDesign.layers)
    }
    return initialImageUrls.map((f, idx) => ({
      id: createLayerId("img"),
      kind: "image" as const,
      url: f.url,
      filename: f.filename,
      ...defaultImageLayerPlacement(initialGarmentId, idx),
    }))
  })
  const [newTextValue, setNewTextValue] = useState("Your text")
  const [newTextFont, setNewTextFont] = useState<string>(
    MOCKUP_GOOGLE_FONTS[2]!.family,
  )
  const [newTextColor, setNewTextColor] = useState("#000000")
  const [fontsRevision, setFontsRevision] = useState(0)
  const [showAddTextForm, setShowAddTextForm] = useState(false)
  const [stageSizePx, setStageSizePx] = useState(400)
  const [activeLayerIdx, setActiveLayerIdx] = useState(0)
  const activeLayer = layers[activeLayerIdx] ?? null

  const [busy, setBusy] = useState(false)
  const [modelLoading, setModelLoading] = useState(false)
  const [lightingPreset, setLightingPreset] =
    useState<MockupLightingPresetId>("outdoor")
  const lightingPresetRef = useRef<MockupLightingPresetId>("outdoor")
  const [error, setError] = useState<string | null>(null)
  const isMobile = useIsMobile()
  const [imagesByUrl, setImagesByUrl] = useState<
    Map<string, HTMLImageElement>
  >(new Map())

  const garment = useMemo(
    () =>
      MOCKUP_GARMENTS.find((g) => g.id === garmentId) ?? MOCKUP_GARMENTS[0],
    [garmentId],
  )
  const textureDimensions = useMemo(
    () => getMockupTextureDimensions(isMobile, garment.layoutAspect ?? 1),
    [isMobile, garment.layoutAspect],
  )

  // If a garment uses mirrored UVs, allow the 2D layout to be viewed/edited "as mapped"
  // so it matches what the customer sees on the 3D model.
  const [showMappedLayout, setShowMappedLayout] = useState<boolean>(
    () => !!garment.flipX,
  )
  useEffect(() => {
    setShowMappedLayout(!!garment.flipX)
  }, [garmentId, garment.flipX])
  const stageFlipX = !!garment.flipX && showMappedLayout
  // Matched layout flips pointer X — keep dragSignX at 1 so the thumbnail follows the finger.
  // Natural 2D mode inverts both axes to match the mirrored texture bake.
  const dragSignX = garment.flipX && !showMappedLayout ? -1 : 1
  const dragSignY = garment.flipX && !showMappedLayout ? -1 : 1
  const showPreviewPanel = !isMobile || mobilePanel === "preview"
  const showLayoutPanel = !isMobile || mobilePanel === "layout"

  const textureDrawContextRef = useRef({
    layers,
    imagesByUrl,
    garment,
    showMappedLayout,
    textureDimensions,
  })
  useEffect(() => {
    textureDrawContextRef.current = {
      layers,
      imagesByUrl,
      garment,
      showMappedLayout,
      textureDimensions,
    }
  }, [layers, imagesByUrl, garment, showMappedLayout, textureDimensions])

  const flushGarmentColorTexture = useCallback((fabricHex: string) => {
    let c = textureCanvasRef.current
    if (!c) {
      c = document.createElement("canvas")
      textureCanvasRef.current = c
    }
    const ctx = textureDrawContextRef.current
    const { width, height } = ctx.textureDimensions
    if (c.width !== width || c.height !== height) {
      c.width = width
      c.height = height
    }
    const textureMirrorPositionX =
      !!ctx.garment.flipX && ctx.showMappedLayout
    const textureFlipX = !!ctx.garment.flipX && !ctx.showMappedLayout
    drawMockupCanvas(c, {
      layers: ctx.layers,
      imagesByUrl: ctx.imagesByUrl,
      flipX: textureFlipX,
      mirrorPositionX: textureMirrorPositionX,
      flipY: ctx.garment.flipY,
      printRegion: ctx.garment.printRegion,
      flipTexturePixels: ctx.garment.flipTexturePixels,
      baseColorHex: fabricHex,
    })
    const s = threeStateRef.current
    if (s) {
      s.tex.needsUpdate = true
      setMockupFabricColor(s.mat, fabricHex)
      s.matFabric?.color.set(fabricHex)
    }
  }, [])

  const scheduleGarmentColorPreview = useCallback(
    (fabricHex: string) => {
      baseGarmentColorHexRef.current = fabricHex
      if (garmentColorRafRef.current != null) return
      garmentColorRafRef.current = requestAnimationFrame(() => {
        garmentColorRafRef.current = null
        const hex = baseGarmentColorHexRef.current
        flushGarmentColorTexture(hex)
        setBaseGarmentColorHex(hex)
      })
    },
    [flushGarmentColorTexture],
  )

  const setGarmentColor = useCallback(
    (hex: string, immediate = false) => {
      baseGarmentColorHexRef.current = hex
      if (immediate) {
        if (garmentColorRafRef.current != null) {
          cancelAnimationFrame(garmentColorRafRef.current)
          garmentColorRafRef.current = null
        }
        setBaseGarmentColorHex(hex)
        flushGarmentColorTexture(hex)
        return
      }
      scheduleGarmentColorPreview(hex)
    },
    [flushGarmentColorTexture, scheduleGarmentColorPreview],
  )

  useEffect(() => {
    lightingPresetRef.current = lightingPreset
  }, [lightingPreset])

  // Keep material/texture in sync when switching garment (Three init runs once).
  useEffect(() => {
    const s = threeStateRef.current
    if (!s) return
    setMockupExteriorClip(s.mat, garment.useExteriorClip !== false)
    setMockupTextureWrap(s.tex, !!garment.textureClamp)
    s.mat.side = garment.doubleSided ? THREE.DoubleSide : THREE.FrontSide
    if (s.matFabric) {
      s.matFabric.side = garment.doubleSided ? THREE.DoubleSide : THREE.FrontSide
    }
    s.mat.needsUpdate = true
    s.tex.needsUpdate = true
    flushGarmentColorTexture(baseGarmentColorHexRef.current)
  }, [
    garment.useExteriorClip,
    garment.textureClamp,
    garment.doubleSided,
    flushGarmentColorTexture,
  ])

  useEffect(() => {
    const s = threeStateRef.current
    if (!s?.applyLighting) return
    void s.applyLighting(lightingPreset).then(() => {
      s.renderer.render(s.scene, s.camera)
    })
  }, [lightingPreset])

  // Match layout-stage text size to the texture canvas / 3D output.
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const measure = () => {
      const w = el.getBoundingClientRect().width
      if (w > 0) setStageSizePx(w)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [showLayoutPanel, isFullscreenLayout, mobilePanel])

  const imageLayerUrls = useMemo(
    () =>
      layers
        .filter(isImageLayer)
        .map((l) => l.url)
        .join("|"),
    [layers],
  )

  const textFontKey = useMemo(
    () =>
      layers
        .filter(isTextLayer)
        .map((l) => `${l.fontFamily}:${l.fontWeight}`)
        .join("|"),
    [layers],
  )

  // Load uploaded images (for 2D stage + export texture).
  useEffect(() => {
    let cancelled = false
    async function loadAll() {
      try {
        setError(null)
        const imageLayers = layers.filter(isImageLayer)
        const entries = await Promise.all(
          imageLayers.map(async (l) => [l.url, await loadHtmlImage(l.url)] as const),
        )
        if (cancelled) return
        setImagesByUrl(new Map(entries))
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load images")
      }
    }
    loadAll()
    return () => {
      cancelled = true
    }
  }, [imageLayerUrls])

  // Load Google Fonts used by text layers.
  useEffect(() => {
    let cancelled = false
    const textLayers = layers.filter(isTextLayer)
    if (textLayers.length === 0) return

    async function loadFonts() {
      try {
        const families = new Map<string, Set<number>>()
        for (const layer of textLayers) {
          const weights = families.get(layer.fontFamily) ?? new Set()
          weights.add(layer.fontWeight)
          families.set(layer.fontFamily, weights)
        }
        await Promise.all(
          [...families.entries()].map(([family, weights]) =>
            loadMockupGoogleFont(family, [...weights]),
          ),
        )
        if (!cancelled) setFontsRevision((n) => n + 1)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load fonts")
        }
      }
    }
    void loadFonts()
    return () => {
      cancelled = true
    }
  }, [textFontKey])

  /**
   * THREE preview (imperative, avoids react-three-fiber).
   * Uses a CanvasTexture sourced from the hidden design canvas.
   */
  const threeStateRef = useRef<{
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    controls: any
    tex: THREE.CanvasTexture
    mat: THREE.MeshStandardMaterial
    matFabric: THREE.MeshStandardMaterial
    root: THREE.Object3D | null
    raf: number
    resize: () => void
    dispose: () => void
    updateMaterial: (fabricHex?: string) => void
    previewCameraZSign: -1 | 1
    loadModel: (
      url: string,
      meshScale: number,
      meshRotation?: [number, number, number],
      cameraZSign?: -1 | 1,
    ) => Promise<void>
    frameGarment: () => void
    applyLighting: (presetId: MockupLightingPresetId) => Promise<void>
  } | null>(null)

  // When switching mobile tabs back to 3D, the canvas mount may have been hidden — resize/refit.
  useEffect(() => {
    if (!isMobile || mobilePanel !== "preview") return
    const s = threeStateRef.current
    if (!s) return
    const id = requestAnimationFrame(() => {
      s.resize()
      s.frameGarment?.()
    })
    return () => cancelAnimationFrame(id)
  }, [isMobile, mobilePanel])

  previewAutoRotateRef.current = previewAutoRotate

  useEffect(() => {
    const controls = threeStateRef.current?.controls
    if (!controls) return
    controls.autoRotate = previewAutoRotate
    controls.autoRotateSpeed = 1.75
  }, [previewAutoRotate])

  const syncPreviewFullscreen = useCallback(() => {
    const shell = previewShellRef.current
    const isFs =
      !!shell &&
      (document.fullscreenElement === shell ||
        (document as Document & { webkitFullscreenElement?: Element })
          .webkitFullscreenElement === shell)
    setPreviewFullscreen(isFs)
    requestAnimationFrame(() => {
      threeStateRef.current?.resize()
      if (isFs) threeStateRef.current?.frameGarment?.()
    })
  }, [])

  useEffect(() => {
    document.addEventListener("fullscreenchange", syncPreviewFullscreen)
    document.addEventListener("webkitfullscreenchange", syncPreviewFullscreen)
    return () => {
      document.removeEventListener("fullscreenchange", syncPreviewFullscreen)
      document.removeEventListener("webkitfullscreenchange", syncPreviewFullscreen)
    }
  }, [syncPreviewFullscreen])

  useEffect(() => {
    return () => {
      const shell = previewShellRef.current
      if (shell && document.fullscreenElement === shell) {
        void document.exitFullscreen().catch(() => undefined)
      }
    }
  }, [])

  const togglePreviewFullscreen = useCallback(async () => {
    const shell = previewShellRef.current
    if (!shell) return
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else if (shell.requestFullscreen) {
        await shell.requestFullscreen()
      } else {
        const webkitRequest = (
          shell as HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> }
        ).webkitRequestFullscreen
        if (webkitRequest) await webkitRequest.call(shell)
      }
    } catch {
      /* user cancelled or unsupported */
    }
  }, [])

  useEffect(() => {
    const mount = previewMountRef.current
    if (!mount) return

    // lazily import loaders/controls (client-only)
    let cancelled = false
    let local: typeof threeStateRef.current = null

    async function init() {
      if (!textureCanvasRef.current) {
        textureCanvasRef.current = document.createElement("canvas")
      }
      const designCanvas = textureCanvasRef.current
      if (!designCanvas) return
      const [{ GLTFLoader }, { OrbitControls }] = await Promise.all([
        import("three/examples/jsm/loaders/GLTFLoader.js"),
        import("three/examples/jsm/controls/OrbitControls.js"),
      ])
      if (cancelled) return

      const mobile =
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 767px)").matches

      const renderer = new THREE.WebGLRenderer({
        antialias: !mobile,
        alpha: true,
        // Required for reliable PNG export on iOS Safari.
        preserveDrawingBuffer: true,
        powerPreference: mobile ? "low-power" : "high-performance",
      })
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2),
      )
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      const canvasEl = renderer.domElement
      canvasEl.style.touchAction = "none"
      canvasEl.style.display = "block"
      canvasEl.style.width = "100%"
      canvasEl.style.height = "100%"

      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xf4f6f8)
      const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100)
      camera.position.set(0, 0.2, 3.6)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.enablePan = !mobile
      controls.rotateSpeed = mobile ? 0.7 : 1
      controls.zoomSpeed = mobile ? 0.8 : 1
      controls.autoRotateSpeed = 1.75
      controls.autoRotate = previewAutoRotateRef.current
      controls.target.set(0, 0, 0)

      // No Draco loader — garment GLBs are uncompressed to avoid CSP wasm-unsafe-eval.
      const gltfLoader = new GLTFLoader()

      const lightingRig = createMockupLightingRig(scene)

      // Texture sourced from the hidden design canvas.
      const tex = new THREE.CanvasTexture(designCanvas)
      tex.needsUpdate = true

      const mat = createMockupGarmentMaterial(tex, renderer, {
        fabricColorHex: baseGarmentColorHex,
        exteriorClip: garment.useExteriorClip !== false,
        textureClamp: !!garment.textureClamp,
        doubleSided: !!garment.doubleSided,
      })
      const matFabric = createMockupFabricMaterial(
        baseGarmentColorHex,
        !!garment.doubleSided,
      )

      async function applyLighting(presetId: MockupLightingPresetId) {
        await applyMockupLightingPreset(
          lightingRig,
          scene,
          renderer,
          mat,
          presetId,
        )
      }

      await applyLighting(lightingPresetRef.current)

      function applyMaterial(root: THREE.Object3D) {
        const g = textureDrawContextRef.current.garment
        root.traverse((obj) => {
          const mesh = obj as THREE.Mesh
          if (!mesh?.isMesh) return
          const n = String(mesh.name || "").toLowerCase()
          if (n.includes("ground") || n.includes("floor") || n.includes("shadow")) {
            mesh.visible = false
            return
          }
          mesh.castShadow = false
          mesh.receiveShadow = false
          if (g.splitFabricMesh) {
            mesh.material = isMugPrintMesh(mesh) ? mat : matFabric
          } else {
            mesh.material = mat
          }
        })
      }

      function disposeRoot(root: THREE.Object3D) {
        root.traverse((obj) => {
          const mesh = obj as THREE.Mesh
          if (!mesh?.isMesh) return
          mesh.geometry?.dispose?.()
        })
      }

      let previewCameraZSign: -1 | 1 = garment.previewCameraZSign ?? 1

      async function loadModel(
        url: string,
        meshScale: number,
        meshRotation?: [number, number, number],
        cameraZSign: -1 | 1 = previewCameraZSign,
      ) {
        if (!url) return
        if (local?.root) {
          scene.remove(local.root)
          disposeRoot(local.root)
          local.root = null
        }
        const gltf = await new Promise<any>((resolve, reject) => {
          gltfLoader.load(url, resolve, undefined, reject)
        })
        if (cancelled) return
        const root = gltf.scene as THREE.Object3D
        root.scale.setScalar(meshScale)
        if (meshRotation) {
          root.rotation.set(meshRotation[0], meshRotation[1], meshRotation[2])
        } else {
          root.rotation.set(0, 0, 0)
        }
        root.position.set(0, 0, 0)
        root.traverse((obj) => {
          const mesh = obj as THREE.Mesh
          if (!mesh?.isMesh || !mesh.geometry) return
          mesh.geometry.computeVertexNormals()
        })
        applyMaterial(root)
        setMockupGarmentCenterFromRoot(mat, root)
        scene.add(root)
        previewCameraZSign = cameraZSign
        frameGarmentInView(root, camera, controls, 1.4, cameraZSign)
        local!.root = root
      }

      function frameGarment() {
        if (!local?.root) return
        frameGarmentInView(local.root, camera, controls, 1.4, previewCameraZSign)
      }

      function resize() {
        const w = Math.max(1, mount.clientWidth)
        const h = Math.max(1, mount.clientHeight)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h, false)
      }

      function updateMaterial(fabricHex?: string) {
        mat.color.set("#ffffff")
        tex.flipY = false
        tex.needsUpdate = true
        if (fabricHex) setMockupFabricColor(mat, fabricHex)
        if (local?.root) setMockupGarmentCenterFromRoot(mat, local.root)
      }

      mount.innerHTML = ""
      mount.appendChild(renderer.domElement)
      resize()

      function frame() {
        if (cancelled) return
        controls.update()
        renderer.render(scene, camera)
        local!.raf = requestAnimationFrame(frame)
      }
      const raf = requestAnimationFrame(frame)

      function dispose() {
        cancelAnimationFrame(local!.raf)
        controls.dispose?.()
        if (local?.root) {
          scene.remove(local.root)
          disposeRoot(local.root)
        }
        mat.dispose()
        matFabric.dispose()
        tex.dispose()
        disposeMockupLightingRig(lightingRig, scene)
        renderer.dispose()
        mount.innerHTML = ""
      }

      local = {
        renderer,
        scene,
        camera,
        controls,
        tex,
        mat,
        matFabric,
        root: null,
        raf,
        resize,
        dispose,
        updateMaterial,
        previewCameraZSign,
        loadModel,
        frameGarment,
        applyLighting,
      }
      threeStateRef.current = local

      const resizeObserver = new ResizeObserver(() => {
        if (mount.clientWidth < 1 || mount.clientHeight < 1) return
        resize()
      })
      resizeObserver.observe(mount)

      try {
        await loadModel(
          garment.modelUrl,
          garment.meshScale,
          garment.meshRotation,
          garment.previewCameraZSign ?? 1,
        )
      } finally {
        if (!cancelled) {
          requestAnimationFrame(() => resize())
        }
      }

      return () => {
        resizeObserver.disconnect()
      }
    }

    let teardownResizeObserver: (() => void) | undefined
    init()
      .then((teardown) => {
        teardownResizeObserver = teardown
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to initialize 3D preview")
      })

    return () => {
      cancelled = true
      if (garmentColorRafRef.current != null) {
        cancelAnimationFrame(garmentColorRafRef.current)
        garmentColorRafRef.current = null
      }
      teardownResizeObserver?.()
      local?.dispose?.()
      threeStateRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Redraw texture when layers / layout change (colour uses rAF path above).
  useEffect(() => {
    flushGarmentColorTexture(baseGarmentColorHexRef.current)
  }, [
    layers,
    imagesByUrl,
    garment.flipX,
    garment.flipY,
    garment.printRegion,
    garment.flipTexturePixels,
    showMappedLayout,
    textureDimensions,
    fontsRevision,
    flushGarmentColorTexture,
  ])

  // Reload model when garment changes.
  useEffect(() => {
    const s = threeStateRef.current
    if (!s) return
    let cancelled = false
    setModelLoading(true)
    setError(null)
    s.previewCameraZSign = garment.previewCameraZSign ?? 1
    void s
      .loadModel(
        garment.modelUrl,
        garment.meshScale,
        garment.meshRotation,
        s.previewCameraZSign,
      )
      .then(() => {
        if (cancelled) return
        flushGarmentColorTexture(baseGarmentColorHexRef.current)
        s.frameGarment?.()
      })
      .catch((e) => {
        if (cancelled) return
        setError(
          e instanceof Error
            ? `Failed to load ${garment.label} model: ${e.message}`
            : `Failed to load ${garment.label} model`,
        )
      })
      .finally(() => {
        if (!cancelled) setModelLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [
    garment.modelUrl,
    garment.meshScale,
    garment.meshRotation,
    garment.label,
    flushGarmentColorTexture,
  ])

  // Pointer drag on 2D stage.
  const dragState = useRef<{
    idx: number
    startX: number
    startY: number
    baseX: number
    baseY: number
  } | null>(null)

  const beginLayerDrag = (
    ev: React.PointerEvent,
    layerIdx: number,
    captureTarget: HTMLElement,
  ) => {
    if (!stageRef.current) return
    if (layerIdx < 0 || layerIdx >= layers.length) return
    ev.preventDefault()
    ev.stopPropagation()
    setActiveLayerIdx(layerIdx)
    const p = normalizePointer(ev, stageRef.current, { flipX: stageFlipX })
    const layer = layers[layerIdx]
    dragState.current = {
      idx: layerIdx,
      startX: p.x,
      startY: p.y,
      baseX: layer.x,
      baseY: layer.y,
    }
    captureTarget.setPointerCapture(ev.pointerId)
  }

  const onStagePointerDown = (ev: React.PointerEvent) => {
    beginLayerDrag(ev, activeLayerIdx, stageRef.current!)
  }

  const onStagePointerMove = (ev: React.PointerEvent) => {
    if (!stageRef.current) return
    const s = dragState.current
    if (!s) return
    ev.preventDefault()
    const p = normalizePointer(ev, stageRef.current, { flipX: stageFlipX })
    const dx = (p.x - s.startX) * dragSignX
    const dy = (p.y - s.startY) * dragSignY
    setLayers((prev) =>
      prev.map((l, i) =>
        i === s.idx
          ? { ...l, x: clamp01(s.baseX + dx), y: clamp01(s.baseY + dy) }
          : l,
      ),
    )
  }

  const endLayerDrag = (ev: React.PointerEvent) => {
    dragState.current = null
    try {
      ev.currentTarget.releasePointerCapture(ev.pointerId)
    } catch {
      /* already released */
    }
  }

  const canConfirm = layers.length > 0 && !busy
  const activeTextLayer = activeLayer && isTextLayer(activeLayer) ? activeLayer : null

  function handleAddText() {
    const text = newTextValue.trim()
    if (!text) {
      setError("Enter some text to add")
      return
    }
    setError(null)
    const layer: MockupTextLayer = {
      id: createLayerId("text"),
      kind: "text",
      text,
      fontFamily: newTextFont,
      fontWeight: 400,
      color: newTextColor,
      x: 0.5,
      y: 0.45,
      scale: 1,
      rotation: 0,
      baseSize: 0.22,
    }
    setLayers((prev) => {
      const next = [...prev, layer]
      setActiveLayerIdx(next.length - 1)
      return next
    })
    setShowAddTextForm(false)
  }

  async function handleAddImages(files: File[]) {
    if (!files?.length) return
    setBusy(true)
    setError(null)
    try {
      const uploaded = await uploadMultipleFiles(files, undefined, "custom-printing")
      setLayers((prev) => {
        const startIdx = prev.length
        const newLayers: MockupLayer[] = uploaded.map((u, idx) => ({
          id: createLayerId("img"),
          kind: "image" as const,
          url: u.url,
          filename: u.filename,
          ...defaultImageLayerPlacement(garmentId, startIdx + idx),
        }))
        return [...prev, ...newLayers]
      })
      setActiveLayerIdx((prevIdx) => {
        // focus the first newly added layer
        const next = layers.length
        return Math.max(0, next)
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add images")
    } finally {
      setBusy(false)
      // allow selecting the same file again later
      if (addImagesInputRef.current) addImagesInputRef.current.value = ""
    }
  }

  async function handleConfirm() {
    const c = textureCanvasRef.current
    if (!c) return
    setBusy(true)
    setError(null)
    try {
      flushGarmentColorTexture(baseGarmentColorHexRef.current)
      const s = threeStateRef.current
      if (s) {
        s.renderer.render(s.scene, s.camera)
      }
      const blob: Blob | null = await new Promise((resolve) =>
        c.toBlob(resolve, "image/png"),
      )
      if (!blob) throw new Error("Failed to render preview PNG")

      const design: MockupDesign = {
        version: 1,
        garmentId,
        baseGarmentColorHex,
        canvas: { width: c.width, height: c.height },
        layers,
      }

      onConfirm({ design, previewPngBlob: blob })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to confirm mockup")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="w-full space-y-4 overscroll-contain">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {isMobile ? (
        <div className="grid grid-cols-2 gap-2 rounded-lg border bg-slate-50 p-1">
          <button
            type="button"
            className={`min-h-11 rounded-md px-3 text-sm font-medium ${
              mobilePanel === "preview"
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground"
            }`}
            onClick={() => setMobilePanel("preview")}
          >
            3D preview
          </button>
          <button
            type="button"
            className={`min-h-11 rounded-md px-3 text-sm font-medium ${
              mobilePanel === "layout"
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground"
            }`}
            onClick={() => setMobilePanel("layout")}
          >
            Layout
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:gap-6 xl:gap-8">
        <div
          className={`rounded-xl border bg-white p-3 ${showPreviewPanel ? "block" : "hidden lg:block"}`}
        >
          <div className="mb-2 flex flex-col gap-2">
            <div className="text-sm font-semibold">3D preview</div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <label className="shrink-0 text-xs text-muted-foreground">Garment</label>
                <select
                  className="h-10 min-w-0 flex-1 rounded-md border px-2 text-sm sm:flex-none sm:min-w-[8rem]"
                  value={garmentId}
                  onChange={(e) =>
                    setGarmentId(e.target.value as MockupGarmentId)
                  }
                >
                  {MOCKUP_GARMENTS.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <label className="shrink-0 text-xs text-muted-foreground">Lighting</label>
                <select
                  className="h-10 min-w-0 flex-1 rounded-md border px-2 text-sm sm:flex-none sm:min-w-[9rem]"
                  value={lightingPreset}
                  onChange={(e) =>
                    setLightingPreset(e.target.value as MockupLightingPresetId)
                  }
                  aria-label="3D preview lighting preset"
                >
                  {MOCKUP_LIGHTING_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {
                MOCKUP_LIGHTING_PRESETS.find((p) => p.id === lightingPreset)
                  ?.description
              }
            </p>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="text-xs text-muted-foreground">Colour</div>
            <div className="flex items-center gap-2">
              <input
                aria-label="Base garment colour"
                className="h-9 w-10 rounded-md border p-1"
                type="color"
                value={baseGarmentColorHex}
                onInput={(e) => scheduleGarmentColorPreview(e.currentTarget.value)}
                onChange={(e) => setGarmentColor(e.currentTarget.value, true)}
              />
              <span className="text-xs font-mono text-muted-foreground">
                {baseGarmentColorHex.toUpperCase()}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {GARMENT_BASE_COLOR_PRESETS.map((p) => (
                <button
                  key={p.hex}
                  type="button"
                  className="h-6 w-6 rounded-full border border-black/10"
                  style={{ backgroundColor: p.hex }}
                  title={p.label}
                  aria-label={p.label}
                  onClick={() => setGarmentColor(p.hex, true)}
                />
              ))}
            </div>
          </div>

          <div
            ref={previewShellRef}
            className={cn(
              "group/preview relative w-full touch-none overflow-hidden rounded-lg bg-slate-50",
              previewFullscreen
                ? "flex h-full min-h-0 w-full items-center justify-center rounded-none bg-[#f4f6f8]"
                : isFullscreenLayout
                  ? "h-[min(38dvh,420px)] sm:h-[min(42dvh,480px)] lg:h-[min(46dvh,540px)]"
                  : "h-[280px] sm:h-[360px] lg:h-[min(52vh,520px)] xl:h-[min(58vh,600px)]",
            )}
          >
            <div ref={previewMountRef} className="absolute inset-0" />
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 flex justify-end gap-2 p-3 transition-opacity duration-300",
                previewAutoRotate
                  ? "pointer-events-none opacity-0 group-hover/preview:pointer-events-auto group-hover/preview:opacity-100"
                  : "opacity-100",
              )}
            >
              <Button
                type="button"
                size="sm"
                variant={previewAutoRotate ? "default" : "secondary"}
                className="h-9 gap-1.5 shadow-md backdrop-blur-sm"
                onClick={() => setPreviewAutoRotate((on) => !on)}
                aria-pressed={previewAutoRotate}
                aria-label={
                  previewAutoRotate ? "Stop auto-rotate" : "Auto-rotate 3D preview"
                }
              >
                {previewAutoRotate ? (
                  <Pause className="h-4 w-4" aria-hidden />
                ) : (
                  <RotateCw className="h-4 w-4" aria-hidden />
                )}
                <span className="hidden sm:inline">
                  {previewAutoRotate ? "Stop spin" : "Auto-rotate"}
                </span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-9 gap-1.5 shadow-md backdrop-blur-sm"
                onClick={() => void togglePreviewFullscreen()}
                aria-label={
                  previewFullscreen ? "Exit fullscreen preview" : "Fullscreen 3D preview"
                }
              >
                {previewFullscreen ? (
                  <Minimize2 className="h-4 w-4" aria-hidden />
                ) : (
                  <Maximize2 className="h-4 w-4" aria-hidden />
                )}
                <span className="hidden sm:inline">
                  {previewFullscreen ? "Exit" : "Fullscreen"}
                </span>
              </Button>
            </div>
          </div>
          {modelLoading ? (
            <p className="mt-2 text-xs text-muted-foreground">Loading garment model…</p>
          ) : null}

          <p className="mt-2 text-xs text-muted-foreground">
            {previewAutoRotate
              ? "Auto-rotate on — move the mouse over the preview to show controls again."
              : isMobile
                ? "Pinch to zoom, drag to rotate. Use Fullscreen or Auto-rotate above the preview."
                : "Drag to rotate, scroll to zoom. Use Fullscreen or Auto-rotate on the preview."}
          </p>
        </div>

        <div
          className={`rounded-xl border bg-white p-3 ${showLayoutPanel ? "block" : "hidden lg:block"}`}
        >
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold">Layout (drag to position)</div>
              {garmentId === "cap" ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Full grid = front of cap in the 3D preview. Center here to center on the cap.
                </p>
              ) : null}
              {garmentId === "mug" ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Full grid = sublimation print area on the mug (same as the Sketchfab template zone).
                </p>
              ) : null}
            </div>
            {garment.flipX ? (
              <label className="flex min-h-10 items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={showMappedLayout}
                  onChange={(e) => setShowMappedLayout(e.target.checked)}
                />
                Match 3D mapping
              </label>
            ) : null}
          </div>

          <div
            ref={stageRef}
            className={cn(
              "relative w-full touch-none overflow-hidden rounded-lg border bg-white",
              isFullscreenLayout
                ? "max-h-[min(36dvh,480px)] lg:max-h-[min(40dvh,560px)]"
                : "max-h-[min(70vh,520px)] lg:max-h-[min(75vh,600px)] xl:max-h-[min(78vh,680px)]",
            )}
            onPointerDown={onStagePointerDown}
            onPointerMove={onStagePointerMove}
            onPointerUp={endLayerDrag}
            onPointerCancel={endLayerDrag}
            style={{
              aspectRatio: `${garment.layoutAspect ?? 1} / 1`,
              backgroundImage:
                "linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              backgroundPosition: "center",
            }}
          >
            {/* Center line */}
            <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-black/10" />

            {/* Simple visual stage: show placed layers */}
            {layers.map((l, idx) => {
              const stageMin = Math.max(1, stageSizePx)
              const leftPct = (stageFlipX ? 1 - l.x : l.x) * 100
              const topPct = l.y * 100
              const isActive = idx === activeLayerIdx
              const layerKey = getLayerId(l, idx)
              const transform = `translate(-50%, -50%) rotate(${layerRotationForStage(
                l.rotation,
                garment.flipX,
                showMappedLayout,
              )}rad)`
              const ringClass = isActive
                ? "ring-2 ring-primary"
                : "ring-1 ring-black/10"

              if (isTextLayer(l)) {
                const fontSize = Math.max(8, textFontSizePx(l, stageMin))
                const textBounds = measureTextLayerBounds(l, stageMin)
                return (
                  <div
                    key={`${layerKey}-${fontsRevision}`}
                    role="presentation"
                    onPointerDown={(e) => beginLayerDrag(e, idx, e.currentTarget)}
                    onPointerMove={onStagePointerMove}
                    onPointerUp={endLayerDrag}
                    onPointerCancel={endLayerDrag}
                    className={`absolute flex touch-none select-none items-center justify-center whitespace-pre-wrap text-center leading-tight ${ringClass}`}
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      width: textBounds.width,
                      height: textBounds.height,
                      transform,
                      fontFamily: `"${l.fontFamily}", sans-serif`,
                      fontWeight: l.fontWeight,
                      fontSize: `${fontSize}px`,
                      lineHeight: `${fontSize * 1.15}px`,
                      color: l.color,
                      pointerEvents: "auto",
                    }}
                  >
                    {l.text}
                  </div>
                )
              }

              const img = isImageLayer(l) ? imagesByUrl.get(l.url) : null
              if (!img) return null
              const imgW = l.baseSize * l.scale * stageMin
              const imgH = (img.height / img.width) * imgW
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={layerKey}
                  src={l.url}
                  alt={l.filename || `Layer ${idx + 1}`}
                  draggable={false}
                  onPointerDown={(e) => beginLayerDrag(e, idx, e.currentTarget)}
                  onPointerMove={onStagePointerMove}
                  onPointerUp={endLayerDrag}
                  onPointerCancel={endLayerDrag}
                  className={`absolute touch-none select-none ${ringClass} rounded-md`}
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    width: imgW,
                    height: imgH,
                    transform,
                    opacity: 0.98,
                    pointerEvents: "auto",
                  }}
                />
              )
            })}
          </div>

          <div className="mt-3 space-y-3">
            <div className="flex max-w-full flex-wrap items-center gap-2 overflow-x-auto pb-1">
              <div className="w-full shrink-0 text-xs text-muted-foreground sm:w-auto">Layers</div>
              {layers.map((l, idx) => (
                <button
                  key={`${getLayerId(l, idx)}-tab`}
                  type="button"
                  onClick={() => setActiveLayerIdx(idx)}
                  className={`shrink-0 rounded-full border px-3 py-2 text-xs ${
                    idx === activeLayerIdx ? "border-primary bg-primary/10" : "border-gray-200"
                  }`}
                  style={
                    isTextLayer(l)
                      ? { fontFamily: `"${l.fontFamily}", sans-serif` }
                      : undefined
                  }
                >
                  {layerTabLabel(l, idx)}
                </button>
              ))}
              <input
                ref={addImagesInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => void handleAddImages(Array.from(e.target.files || []))}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addImagesInputRef.current?.click()}
                disabled={busy}
              >
                Add images
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setLayers((prev) => prev.filter((_, i) => i !== activeLayerIdx))
                  setActiveLayerIdx((i) => Math.max(0, i - 1))
                }}
                disabled={!activeLayer}
              >
                Remove active
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!activeLayer || activeLayerIdx <= 0}
                onClick={() => {
                  setLayers((prev) => {
                    const idx = activeLayerIdx
                    if (idx <= 0 || idx >= prev.length) return prev
                    const next = [...prev]
                    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
                    return next
                  })
                  setActiveLayerIdx((i) => Math.max(0, i - 1))
                }}
              >
                Forward
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!activeLayer || activeLayerIdx >= layers.length - 1}
                onClick={() => {
                  setLayers((prev) => {
                    const idx = activeLayerIdx
                    if (idx < 0 || idx >= prev.length - 1) return prev
                    const next = [...prev]
                    ;[next[idx + 1], next[idx]] = [next[idx], next[idx + 1]]
                    return next
                  })
                  setActiveLayerIdx((i) => Math.min(layers.length - 1, i + 1))
                }}
              >
                Backward
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <div className="text-xs text-muted-foreground">Scale</div>
                <input
                  className="h-10 w-full touch-none"
                  type="range"
                  min="0.2"
                  max="3"
                  step="0.01"
                  value={activeLayer?.scale ?? 1}
                  disabled={!activeLayer}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    setLayers((prev) => prev.map((l, i) => (i === activeLayerIdx ? { ...l, scale: v } : l)))
                  }}
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Rotation</div>
                <input
                  className="h-10 w-full touch-none"
                  type="range"
                  min={(-Math.PI).toString()}
                  max={(Math.PI).toString()}
                  step="0.001"
                  value={activeLayer?.rotation ?? 0}
                  disabled={!activeLayer}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    setLayers((prev) => prev.map((l, i) => (i === activeLayerIdx ? { ...l, rotation: v } : l)))
                  }}
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Size preset</div>
                <select
                  className="h-9 w-full rounded-md border px-2 text-sm"
                  disabled={!activeLayer}
                  value={String(activeLayer?.baseSize ?? 0.45)}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    setLayers((prev) => prev.map((l, i) => (i === activeLayerIdx ? { ...l, baseSize: v } : l)))
                  }}
                >
                  <option value="0.25">Small</option>
                  <option value="0.35">Medium</option>
                  <option value="0.45">Large</option>
                  <option value="0.6">XL</option>
                </select>
              </div>
            </div>

            {activeTextLayer ? (
              <div className="grid gap-3 rounded-lg border border-dashed p-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <div className="text-xs text-muted-foreground">Edit text</div>
                  <input
                    type="text"
                    className="mt-1 h-10 w-full rounded-md border px-3 text-sm"
                    value={activeTextLayer.text}
                    onChange={(e) => {
                      const v = e.target.value
                      setLayers((prev) =>
                        prev.map((l, i) =>
                          i === activeLayerIdx && isTextLayer(l) ? { ...l, text: v } : l,
                        ),
                      )
                    }}
                  />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Font</div>
                  <select
                    className="mt-1 h-10 w-full rounded-md border bg-white px-2 text-sm"
                    value={activeTextLayer.fontFamily}
                    onChange={(e) => {
                      const fontFamily = e.target.value
                      const weights = getMockupFontWeights(fontFamily)
                      setLayers((prev) =>
                        prev.map((l, i) =>
                          i === activeLayerIdx && isTextLayer(l)
                            ? {
                                ...l,
                                fontFamily,
                                fontWeight: weights.includes(l.fontWeight)
                                  ? l.fontWeight
                                  : weights[0]!,
                              }
                            : l,
                        ),
                      )
                    }}
                  >
                    {MOCKUP_GOOGLE_FONTS.map((f) => (
                      <option key={f.family} value={f.family}>
                        {f.family}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Weight</div>
                  <select
                    className="mt-1 h-10 w-full rounded-md border bg-white px-2 text-sm"
                    value={String(activeTextLayer.fontWeight)}
                    onChange={(e) => {
                      const fontWeight = Number(e.target.value)
                      setLayers((prev) =>
                        prev.map((l, i) =>
                          i === activeLayerIdx && isTextLayer(l) ? { ...l, fontWeight } : l,
                        ),
                      )
                    }}
                  >
                    {getMockupFontWeights(activeTextLayer.fontFamily).map((w) => (
                      <option key={w} value={w}>
                        {w === 400 ? "Regular" : w === 700 ? "Bold" : w}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Text colour</div>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      className="h-10 w-12 shrink-0 rounded-md border p-1"
                      value={activeTextLayer.color}
                      onChange={(e) => {
                        const color = e.target.value
                        setLayers((prev) =>
                          prev.map((l, i) =>
                            i === activeLayerIdx && isTextLayer(l) ? { ...l, color } : l,
                          ),
                        )
                      }}
                      aria-label="Text colour"
                    />
                    <span className="font-mono text-xs text-muted-foreground">
                      {activeTextLayer.color.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 border-t pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-10"
                onClick={() => setShowAddTextForm((open) => !open)}
              >
                {showAddTextForm ? "Hide add text" : "Add text"}
              </Button>
            </div>

            {showAddTextForm ? (
              <div className="space-y-3 rounded-lg border bg-slate-50/80 p-3">
                <div className="text-xs font-medium text-muted-foreground">
                  New text layer
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-muted-foreground">Text</label>
                    <input
                      type="text"
                      className="mt-1 h-10 w-full rounded-md border bg-white px-3 text-sm"
                      value={newTextValue}
                      onChange={(e) => setNewTextValue(e.target.value)}
                      placeholder="Enter your text"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Google Font</label>
                    <select
                      className="mt-1 h-10 w-full rounded-md border bg-white px-2 text-sm"
                      value={newTextFont}
                      onChange={(e) => setNewTextFont(e.target.value)}
                    >
                      {MOCKUP_GOOGLE_FONTS.map((f) => (
                        <option key={f.family} value={f.family}>
                          {f.family}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Colour</label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        className="h-10 w-12 rounded-md border p-1"
                        value={newTextColor}
                        onChange={(e) => setNewTextColor(e.target.value)}
                        aria-label="Text colour"
                      />
                      <span className="font-mono text-xs text-muted-foreground">
                        {newTextColor.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="min-h-10"
                  disabled={busy || !newTextValue.trim()}
                  onClick={handleAddText}
                >
                  Place text on mockup
                </Button>
              </div>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-10 flex-1 sm:flex-none"
                  onClick={() => {
                    setLayers((prev) =>
                      prev.map((l) => ({ ...l, x: 0.5, y: 0.4, scale: 1, rotation: 0, baseSize: 0.45 })),
                    )
                    setBaseGarmentColorHex(DEFAULT_BASE_COLOR)
                    setGarmentId("tshirt")
                  }}
                >
                  Reset
                </Button>
                {onCancel ? (
                  <Button type="button" variant="ghost" className="min-h-10 flex-1 sm:flex-none" onClick={onCancel}>
                    Cancel
                  </Button>
                ) : null}
              </div>
              <Button
                type="button"
                className="min-h-11 w-full sm:ml-auto sm:w-auto"
                disabled={!canConfirm}
                onClick={handleConfirm}
              >
                {busy ? "Rendering…" : "Use this mockup"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

