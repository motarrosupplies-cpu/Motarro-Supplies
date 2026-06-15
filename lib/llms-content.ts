import { MOTARRO_BRAND_NAME, MOTARRO_DESCRIPTION, MOTARRO_SITE_URL } from "@/lib/brand"
import { MOTARRO_CATEGORIES } from "@/lib/motarro/categories"

const categoryLinks = MOTARRO_CATEGORIES.map(
  (cat) =>
    `- [${cat.name}](${MOTARRO_SITE_URL}/shop/${cat.slug}): ${cat.description}`
).join("\n")

export const LLMS_TXT_CONTENT = `# ${MOTARRO_BRAND_NAME}

> ${MOTARRO_DESCRIPTION} Based in South Africa, we deliver nationwide with prices in ZAR.

We stock plastic, paper, wooden, metal, acrylic, art supplies, foam craft materials, and tiles — aligned with the trusted MOTARRO Australia catalogue.

## Main

- [Home](${MOTARRO_SITE_URL}/): Stationery and craft supplies for South Africa
- [All Products](${MOTARRO_SITE_URL}/products): Full catalogue — stationery and craft supplies
- [New Arrivals](${MOTARRO_SITE_URL}/products/new): Latest products added to the store
- [Sale](${MOTARRO_SITE_URL}/sale): Discounted stationery and craft supplies

## Shop by category

${categoryLinks}

## Company and support

- [About Us](${MOTARRO_SITE_URL}/about): About ${MOTARRO_BRAND_NAME}
- [Contact](${MOTARRO_SITE_URL}/contact): Enquiries and customer support
- [FAQ](${MOTARRO_SITE_URL}/faq): Frequently asked questions
- [Shipping & Returns](${MOTARRO_SITE_URL}/shipping): Delivery and returns policy
- [Help Center](${MOTARRO_SITE_URL}/help): Customer support

## Legal and policies

- [Terms of Service](${MOTARRO_SITE_URL}/terms): Terms of service
- [Privacy Policy](${MOTARRO_SITE_URL}/privacy): Privacy policy
- [Cookie Policy](${MOTARRO_SITE_URL}/cookies): Cookie policy

## Optional

- [Blog](${MOTARRO_SITE_URL}/blog): Stationery, craft, and education insights
- [Login](${MOTARRO_SITE_URL}/login): Customer login
- [Register](${MOTARRO_SITE_URL}/register): Create an account

## Crawling and indexing

- Sitemap: ${MOTARRO_SITE_URL}/sitemap.xml
- Robots: ${MOTARRO_SITE_URL}/robots.txt
- Primary domain: ${MOTARRO_SITE_URL}
- Language: English (South Africa). Currency: ZAR.
`
