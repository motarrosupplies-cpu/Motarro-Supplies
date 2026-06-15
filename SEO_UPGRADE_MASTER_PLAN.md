# SEO Upgrade Master Plan - MOTARRO Supplies.co.za
## Target: 85-95/100 SEO Score | Timeline: 60-90 days

## Current State Analysis
- **Overall SEO Score:** 28/100
- **Technical SEO:** 55/100 (poor indexing, UUID URLs, missing schema)
- **On-Page SEO:** 35/100 (thin content, duplicate H1s, missing meta)
- **Content Quality:** 20/100 (placeholder text, no unique content)
- **Local SEO:** 25/100 (no Google Business signals, no location pages)
- **UX/Speed:** 50/100 (unoptimized images, no lazy loading)

---

## 🎯 Implementation Priority (Biggest Wins First)

### Phase 1: Critical Technical SEO (Week 1) - Target: 55→85
**Impact:** Highest - Fixes indexing, URL structure, schema
1. URL slug system (UUID → keyword-rich slugs)
2. Dynamic sitemap with all products/pages
3. JSON-LD schema on all pages
4. Canonical tags everywhere
5. Robots.txt optimization

### Phase 2: Content & On-Page SEO (Week 2) - Target: 35→70
**Impact:** High - Fixes thin content, duplicate H1s
1. Unique product descriptions (300-600 words)
2. Proper heading hierarchy
3. Meta tags on all pages
4. Image alt text optimization

### Phase 3: Local SEO (Week 3) - Target: 25→75
**Impact:** High - Johannesburg rankings
1. Location landing pages (5-7 pages)
2. LocalBusiness schema
3. Google Maps integration
4. NAP consistency

### Phase 4: Performance & UX (Week 4) - Target: 50→85
**Impact:** Medium-High - Core Web Vitals
1. Image optimization
2. Font optimization
3. Lazy loading
4. Code splitting

### Phase 5: Content Expansion (Ongoing) - Target: 20→60
**Impact:** Medium - Authority building
1. Blog with 5+ posts
2. About/Contact/FAQ pages
3. Internal linking strategy

---

## 📋 Detailed Implementation Steps

### PHASE 1: URL Structure & Technical SEO

#### Step 1.1: Supabase Schema Updates
**File:** `supabase-schema-updates.sql`
- Add `slug` column to all product tables
- Add `seo_title`, `seo_description`, `seo_keywords` if missing
- Add indexes on slug columns
- Create slug generation function

#### Step 1.2: Slug Generation Utility
**File:** `lib/slug-utils.ts`
- Function to generate SEO-friendly slugs
- Handle duplicates
- Sanitize special characters
- Support Afrikaans/English

#### Step 1.3: Product URL Migration
**File:** `app/products/[slug]/page.tsx` (new structure)
- Change from `[id]` to `[slug]` route
- Update product queries to use slug
- Maintain backward compatibility (redirect UUID → slug)
- generateStaticParams for ISR

#### Step 1.4: Dynamic Sitemap
**File:** `app/sitemap.ts` (Next.js 14+ metadata route)
- Generate sitemap from all products
- Include all static pages
- Include blog posts
- Include location pages
- Priority and changefreq based on page type

#### Step 1.5: JSON-LD Schema Components
**Files:** 
- `components/seo/organization-schema.tsx`
- `components/seo/local-business-schema.tsx`
- `components/seo/product-schema.tsx`
- `components/seo/breadcrumb-schema.tsx`
- `components/seo/faq-schema.tsx`

#### Step 1.6: Robots.txt
**File:** `app/robots.ts` (Next.js 14+ metadata route)
- Allow all public pages
- Block admin, API routes
- Include sitemap URL

---

### PHASE 2: Content & On-Page SEO

#### Step 2.1: Product Description Templates
**File:** `lib/product-description-templates.ts`
- 5-10 unique description templates
- 300-600 words each
- Include keywords naturally
- Include location mentions
- Include features/benefits

#### Step 2.2: Heading Hierarchy Component
**File:** `components/seo/heading-hierarchy.tsx`
- Ensure one H1 per page
- Proper H2/H3 structure
- Keyword-rich headings

#### Step 2.3: Meta Tag Generator
**File:** `lib/meta-generator.ts`
- Generate unique titles (60 chars)
- Generate unique descriptions (155 chars)
- Include location keywords
- Include primary keyword

#### Step 2.4: Image Alt Text System
**File:** `lib/image-alt-generator.ts`
- Generate descriptive alt text from product data
- Include keywords naturally
- Include product name, color, size if applicable

---

### PHASE 3: Local SEO

#### Step 3.1: Location Landing Pages
**Files:**
- `app/custom-t-shirt-printing-johannesburg/page.tsx`
- `app/branded-corporate-clothing-johannesburg/page.tsx`
- `app/sublimation-printing-johannesburg/page.tsx`
- `app/custom-apparel-kempton-park/page.tsx`
- `app/custom-printing-randburg/page.tsx`
- `app/corporate-uniforms-johannesburg/page.tsx`
- `app/event-merchandise-johannesburg/page.tsx`

Each page:
- 800-1500 words unique content
- Google Maps embed
- NAP (Name, Address, Phone) consistency
- LocalBusiness schema
- Internal links to products/services

#### Step 3.2: Google Maps Integration
**File:** `components/local/google-map.tsx`
- Embed Google Maps
- Show business location
- Include directions link

---

### PHASE 4: Performance

#### Step 4.1: Image Optimization
- Replace all `<img>` with Next.js `<Image>`
- Add priority to above-fold images
- Proper sizing and lazy loading
- WebP format where possible

#### Step 4.2: Font Optimization
**File:** `app/layout.tsx`
- Use `next/font` for all fonts
- Preload critical fonts
- Font display: swap

#### Step 4.3: Lazy Loading
- Lazy load below-fold components
- Use dynamic imports
- Code splitting for routes

---

### PHASE 5: Content Expansion

#### Step 5.1: Blog System
**Files:**
- `app/blog/page.tsx` (listing)
- `app/blog/[slug]/page.tsx` (post)
- `app/blog/[slug]/layout.tsx` (metadata)
- 5 initial blog posts

#### Step 5.2: About/Contact/FAQ
- Rich content (500+ words each)
- Schema markup
- Local keywords

---

## 🚀 Execution Order

### Week 1: Technical Foundation
1. Day 1-2: Supabase schema updates + slug system
2. Day 3-4: URL migration + sitemap
3. Day 5: Schema components + robots.txt

### Week 2: Content Quality
1. Day 1-2: Product description templates
2. Day 3: Meta tag system
3. Day 4-5: Heading hierarchy + alt text

### Week 3: Local SEO
1. Day 1-3: Create 5-7 location pages
2. Day 4: Google Maps integration
3. Day 5: Local schema + NAP consistency

### Week 4: Performance
1. Day 1-2: Image optimization
2. Day 3: Font optimization
3. Day 4-5: Lazy loading + code splitting

### Ongoing: Content
- Week 5+: Blog posts (1-2 per week)
- Week 6+: About/Contact/FAQ enhancement

---

## 📊 Success Metrics

### Technical SEO (Target: 90+)
- ✅ All products have keyword-rich URLs
- ✅ Sitemap includes all pages
- ✅ Schema on all pages
- ✅ Canonical tags everywhere
- ✅ Robots.txt optimized

### On-Page SEO (Target: 75+)
- ✅ Unique descriptions (300-600 words)
- ✅ One H1 per page
- ✅ Meta tags on all pages
- ✅ Alt text on all images

### Local SEO (Target: 80+)
- ✅ 5-7 location pages live
- ✅ Google Maps embedded
- ✅ LocalBusiness schema
- ✅ NAP consistency

### Performance (Target: 85+)
- ✅ LCP < 2s
- ✅ CLS < 0.1
- ✅ Images optimized
- ✅ Fonts optimized

### Content Quality (Target: 60+)
- ✅ 5+ blog posts
- ✅ Rich About/Contact/FAQ
- ✅ Internal linking strategy

---

## 🎯 Expected Results

### 30 Days:
- Technical SEO: 55 → 85
- On-Page SEO: 35 → 60
- Local SEO: 25 → 60
- Overall: 28 → 65

### 60 Days:
- Technical SEO: 85 → 90
- On-Page SEO: 60 → 75
- Local SEO: 60 → 80
- Content: 20 → 50
- Overall: 65 → 80

### 90 Days:
- Technical SEO: 90 → 95
- On-Page SEO: 75 → 85
- Local SEO: 80 → 90
- Content: 50 → 70
- Overall: 80 → 90

---

## 📝 Next: Start Implementation

I'll now begin implementing Phase 1 (Technical SEO) with actual code files.

