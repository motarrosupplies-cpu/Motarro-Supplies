/** Curated Google Fonts for the mockup editor (loaded on demand). */
export const MOCKUP_GOOGLE_FONTS = [
  { family: "Roboto", weights: [400, 700] },
  { family: "Open Sans", weights: [400, 700] },
  { family: "Montserrat", weights: [400, 700] },
  { family: "Oswald", weights: [400, 700] },
  { family: "Bebas Neue", weights: [400] },
  { family: "Anton", weights: [400] },
  { family: "Pacifico", weights: [400] },
  { family: "Lobster", weights: [400] },
  { family: "Playfair Display", weights: [400, 700] },
  { family: "Merriweather", weights: [400, 700] },
  { family: "Poppins", weights: [400, 700] },
  { family: "Raleway", weights: [400, 700] },
  { family: "Ubuntu", weights: [400, 700] },
  { family: "Nunito", weights: [400, 700] },
  { family: "Rubik", weights: [400, 700] },
  { family: "Archivo Black", weights: [400] },
  { family: "Permanent Marker", weights: [400] },
  { family: "Dancing Script", weights: [400, 700] },
  { family: "Caveat", weights: [400, 700] },
  { family: "Inter", weights: [400, 700] },
] as const

const loadedFamilies = new Set<string>()

function buildGoogleFontsHref(family: string, weights: number[]) {
  const familyParam = family.trim().replace(/\s+/g, "+")
  const weightParam = [...new Set(weights)].sort((a, b) => a - b).join(";")
  return `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weightParam}&display=swap`
}

/** Inject stylesheet and wait for FontFace (canvas + DOM preview). */
export async function loadMockupGoogleFont(
  family: string,
  weights: number[] = [400, 700],
) {
  if (typeof document === "undefined") return

  const cacheKey = `${family}:${weights.join(",")}`
  if (loadedFamilies.has(cacheKey)) {
    await document.fonts.ready
    return
  }

  const href = buildGoogleFontsHref(family, weights)
  let link = document.querySelector<HTMLLinkElement>(
    `link[data-mockup-google-font="${cacheKey}"]`,
  )
  if (!link) {
    link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = href
    link.setAttribute("data-mockup-google-font", cacheKey)
    document.head.appendChild(link)
  }

  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => resolve(), 8000)
    link!.addEventListener("load", () => {
      window.clearTimeout(timeout)
      resolve()
    })
    link!.addEventListener("error", () => {
      window.clearTimeout(timeout)
      reject(new Error(`Failed to load font: ${family}`))
    })
    if ((link as HTMLLinkElement & { sheet?: CSSStyleSheet }).sheet) {
      window.clearTimeout(timeout)
      resolve()
    }
  }).catch(() => undefined)

  await Promise.all(
    weights.map((w) => document.fonts.load(`${w} 48px "${family}"`).catch(() => undefined)),
  )
  loadedFamilies.add(cacheKey)
}

export function getMockupFontWeights(family: string): number[] {
  const entry = MOCKUP_GOOGLE_FONTS.find((f) => f.family === family)
  return entry ? [...entry.weights] : [400, 700]
}
