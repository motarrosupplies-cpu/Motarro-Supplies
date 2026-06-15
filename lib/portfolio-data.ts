/**
 * Shared portfolio data for /portfolio flipbook and /case-studies.
 * Live Google rating, review count, and review text come from Places API (see /api/google-place).
 * GMB “Updates” below are copied from your Google Business dashboard (curated; add imageUrl when you host the same asset).
 */

export interface CaseStudyTestimonial {
  quote: string
  author: string
  role: string
  company: string
  rating: number
}

export interface CaseStudy {
  id: string
  title: string
  client: string
  location: string
  industry: string
  challenge: string
  solution: string
  results: string[]
  testimonial: CaseStudyTestimonial
  metrics: Record<string, string | number>
  image: string
}

export interface GMBReview {
  id: string
  quote: string
  author: string
  role?: string
  company?: string
  rating: number
  /** Profile image URL; omit to show initials */
  image?: string
}

/** Google Business Profile “Updates” / posts */
export interface GmbPost {
  id: string
  title: string
  excerpt: string
  publishedAt?: string
  imageUrl?: string
  url?: string
}

export interface AtAGlanceStats {
  highlights: { value: string; label: string }[]
}

/** Placeholders for Google rows update when /api/google-place returns data */
export const atAGlanceStats: AtAGlanceStats = {
  highlights: [
    { value: "5000+", label: "Happy customers" },
    { value: "—", label: "Google rating" },
    { value: "—", label: "Google reviews" },
    { value: "48hrs", label: "Fast turnaround" },
    { value: "Nationwide", label: "Delivery" },
  ],
}

export const atAGlanceTagline =
  "Because apparently you have to wear clothes... Premium custom apparel and printing across South Africa."

export const atAGlanceDescription =
  "From corporate uniforms and school sports kits to event merchandise and branded apparel—real feedback from Google reviews and stories from our blog."

/** No fabricated case studies; add entries only with verifiable project details and permission. */
export const caseStudies: CaseStudy[] = []

/**
 * Fallback when Places API is not configured. Same quotes as /custom-t-shirt-printing-kempton-park.
 */
export const verifiedGoogleReviews: GMBReview[] = [
  {
    id: "gmb-maricar-granada",
    quote:
      "I had an amazing experience with MOTARRO Supplies! Their sublimation printing quality is top-notch—the colours came out vibrant and the garments looked incredible.",
    author: "Maricar Granada",
    role: "Google Review · 5 stars",
    rating: 5,
  },
  {
    id: "gmb-matthew-courtney",
    quote:
      "Incredible service and products from start to finish. The team at MOTARRO Supplies were diligent, communicative, and made sure every detail of the order was perfect.",
    author: "Matthew Courtney",
    role: "Local Guide · 5 stars",
    rating: 5,
  },
  {
    id: "gmb-simon-muluvhu",
    quote:
      "Quality material, good business ethic, and modern printing. MOTARRO Supplies delivered exactly what I needed with professional service throughout.",
    author: "Simon Muluvhu",
    role: "Local Guide · 5 stars",
    rating: 5,
  },
  {
    id: "gmb-lasaafrica",
    quote:
      "This company offers custom printed t-shirts for events. I saw the garments a colleague ordered and the print work and finish were wonderful—highly recommended.",
    author: "LASAAFRICA",
    role: "Google Review · 5 stars",
    rating: 5,
  },
]

export const gmbReviews = verifiedGoogleReviews

/** Google Business updates (from your GMB “Posts” list). Add imageUrl when the image is hosted on your site or CDN. */
export const gmbPosts: GmbPost[] = [
  {
    id: "gmb-easter-gifting",
    title: "Easter gifting — personal & special",
    excerpt:
      "Easter gifting made personal and special. This Easter, surprise your loved ones with custom pieces that feel one of a kind.",
    publishedAt: "2026-03-31",
  },
  {
    id: "gmb-100-custom-brand",
    title: "100 custom branded pieces delivered",
    excerpt:
      "We just delivered another fantastic project — we produced and supplied 100 custom branded items for our client.",
    publishedAt: "2026-03-31",
  },
  {
    id: "gmb-impala-netball",
    title: "Impala Park School Netball — custom branding",
    excerpt:
      "Impala Park School Netball Team — custom branding project including socks and team kit elements.",
    publishedAt: "2026-03-29",
  },
  {
    id: "gmb-grade1-welcome",
    title: "Sweet welcome gifts for new Grade 1s",
    excerpt:
      "Sweet welcome gifts for new Grade 1s — MOTARRO Supplies is hard at work finishing thoughtful branded pieces for the new school year.",
    publishedAt: "2026-01-08",
  },
  {
    id: "gmb-80-tshirts",
    title: "80 custom T-shirts — rush project",
    excerpt:
      "We pulled off the impossible: 80 custom T-shirts (and matching pieces) produced and delivered on a tight timeline.",
    publishedAt: "2025-12-15",
  },
  {
    id: "gmb-trippy-sponsor",
    title: "Sponsored fighter Trippy — congratulations",
    excerpt:
      "Massive congratulations to our sponsored fighter Trippy on an epic victory — we’re proud to back local talent.",
    publishedAt: "2025-11-20",
  },
  {
    id: "gmb-christmas-mugs",
    title: "Personalized Christmas magic mugs",
    excerpt:
      "Make every sip feel like Christmas morning — premium festive ceramic mugs, personalized for gifting season.",
    publishedAt: "2025-12-01",
  },
  {
    id: "gmb-aim-global",
    title: "Project with AIM Global South Africa",
    excerpt:
      "Excited to share our latest project with AIM Global South Africa — custom apparel and branding for the team.",
    publishedAt: "2025-10-15",
  },
  {
    id: "gmb-laerskool-edleen",
    title: "Laerskool Edleen Soap Box Derby 2025",
    excerpt:
      "Thrilled to have powered Laerskool Edleen’s Soap Box Derby 2025 with custom printed shirts for participants.",
    publishedAt: "2025-10-01",
  },
]
