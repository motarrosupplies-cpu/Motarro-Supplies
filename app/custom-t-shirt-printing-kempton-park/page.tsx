import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react"
import {
  availabilityToSchemaUrl,
  conditionToSchemaUrl,
} from "@/lib/utils"
import { verifiedGoogleReviews } from "@/lib/portfolio-data"

const DEFAULT_AVAILABILITY = availabilityToSchemaUrl("in_stock")
const DEFAULT_CONDITION = conditionToSchemaUrl("new")

const faqs = [
  {
    question: "Do you offer same day t-shirt printing near me in Kempton Park?",
    answer:
      "Yes. Place and approve your artwork before 10:00 and collect your order from our Kempton Park studio the very same day. We keep core colours and popular sizes in stock so urgent orders for events, school activations, or last-minute promotional teams are never a problem. If you need evening or weekend collection, chat to us and we will line up a priority press slot for you.",
  },
  {
    question: "What files do I need for custom t-shirt printing Kempton Park orders?",
    answer:
      "Vector files such as AI, PDF, SVG, or high-resolution PNGs (300 DPI on a transparent background) deliver the crispest results. Our in-house design support team can refine or redraw your logo, adjust colours for the garment fabric, and provide digital proofs before we start printing. Upload artwork through the design studio or email artwork@www.motarro.co.za for personalised support.",
  },
  {
    question: "Can you produce branded clothing Kempton Park businesses use for corporate uniforms?",
    answer:
      "Absolutely. We manage corporate uniforms Johannesburg-wide and support Kempton Park HQs with polo shirts, oxford shirts, chef wear, hi-vis safety gear, and hospitality apparel. Embroidery, screen printing, and hybrid branding ensure your staff look smart, stay comfortable, and meet compliance requirements across offices, storefronts, and field teams.",
  },
  {
    question: "What printing methods work best for promotional clothing Gauteng campaigns?",
    answer:
      "For quick-turn promo tees and giveaways we recommend screen printing or DTF transfers because they stay vibrant through repeated washes. When you need photo-realistic artwork or niche sizing, direct-to-garment (DTG) is best. Embroidery elevates caps, jackets, and corporate gifting. Our specialists advise the ideal technique based on fabric, quantity, budget, and how long you need the garments to last.",
  },
  {
    question: "How do I get an instant quote for t-shirt printing Kempton Park?",
    answer:
      "Use the Design Online Now button to configure colours, sizes, and branding positions, then generate pricing immediately. Prefer WhatsApp? Tap the Get Instant Quote button and share quantities, deadlines, and delivery location for a lightning-fast response. For complex briefs, complete the contact form so we can prepare mock-ups and pricing tiers tailored to your project.",
  },
  {
    question: "What is the minimum order quantity for custom apparel?",
    answer:
      "We print from just one unit for gifts, samples, or pilot campaigns. Bulk discounts unlock from 25 units and scale aggressively for corporate programmes, school leavers, and nationwide promotions. Talk to our team about split sizing, multiple design versions, or bundling tees with hoodies, caps, and tote bags to maximise savings.",
  },
]

export const metadata: Metadata = {
  title: "Custom T-Shirt Printing Kempton Park | MOTARRO Supplies",
  description:
    "Get high-quality custom t-shirt printing in Kempton Park with same-day collection or fast nationwide delivery. Corporate branding, school wear, events & promo gifts. Design online & get an instant quote!",
  openGraph: {
    title: "Custom T-Shirt Printing Kempton Park | MOTARRO Supplies",
    description:
      "Local Kempton Park experts in custom t-shirt printing, branded clothing, and corporate uniforms. Same-day collection available with nationwide delivery.",
    url: "https://www.motarro.co.za/custom-t-shirt-printing-kempton-park",
    type: "website",
    siteName: "MOTARRO Supplies",
    images: [
      {
        url: "https://www.motarro.co.za/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Custom t-shirt printing press in Kempton Park",
      },
    ],
    locale: "en_ZA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom T-Shirt Printing Kempton Park | Same-Day Collection",
    description:
      "Kempton Park’s favourite custom printer for tees, hoodies, and promotional clothing. Instant quotes, local pickup, and nationwide shipping.",
    images: ["https://www.motarro.co.za/og-image.jpg"],
    creator: "@motarrosupplies",
  },
  alternates: {
    canonical: "https://www.motarro.co.za/custom-t-shirt-printing-kempton-park",
  },
}

export default function CustomTShirtPrintingKemptonParkPage() {
  return (
    <div className="bg-white">
      <section className="relative isolate overflow-hidden bg-slate-900 text-white">
        <Image
          src="/hero-tshirt.jpg"
          alt="Freshly printed custom t-shirts ready for collection in Kempton Park"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-slate-900/70" />
        <div className="container relative z-10 mx-auto flex flex-col gap-8 px-4 pb-20 pt-24 md:flex-row md:items-center">
          <div className="max-w-3xl space-y-6">
            <Badge className="w-fit bg-amber-400 text-slate-900 hover:bg-amber-300">
              5.0 ★★★★★ (Google reviews) · Kempton Park’s Favourite Custom Printer
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Custom T-Shirt Printing &amp; Branded Apparel in Kempton Park
            </h1>
            <p className="text-lg text-slate-100 sm:text-xl">
              Need a rush order for an activation, school event, or corporate launch? MOTARRO Supplies delivers
              premium custom t-shirt printing Kempton Park residents trust, with same-day collection, late
              cut-off slots, and national courier partners. From single tees to large-scale promotional
              clothing Gauteng campaigns, our studio pairs sharp graphics with durable garments that feel as
              good as they look.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full px-8 py-6 text-base font-semibold">
                <Link href="https://www.motarro.co.za/custom-printing" prefetch={false}>
                  Design Online Now
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white bg-white/10 px-8 py-6 text-base font-semibold text-white hover:bg-white hover:text-slate-900"
              >
                <Link
                  href="https://wa.me/27696228848?text=Hi%20MOTARRO Supplies%20team%2C%20I%27d%20like%20a%20custom%20t-shirt%20quote%20for%20Kempton%20Park."
                  target="_blank"
                  rel="noopener noreferrer"
                  prefetch={false}
                >
                  Get Instant Quote
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                <span>Secure checkout · PayFast | EFT | Card</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-300" />
                <span>Same-day collection &amp; overnight couriers</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-300" />
                <span>Free artwork proof on every order</span>
              </div>
            </div>
          </div>
          <div className="grid w-full max-w-md grid-cols-2 gap-4 rounded-2xl bg-white/10 p-5 backdrop-blur md:max-w-sm">
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-wide text-slate-200">Orders processed</p>
              <p className="text-3xl font-bold text-white">1 200+</p>
              <p className="text-xs text-slate-200">Kempton Park, East Rand &amp; nationwide</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-wide text-slate-200">Average turnaround</p>
              <p className="text-3xl font-bold text-white">24 hrs</p>
              <p className="text-xs text-slate-200">Priority press slots available</p>
            </div>
            <div className="col-span-2 rounded-xl bg-slate-900/80 p-4">
              <p className="text-sm font-semibold text-white">Trusted by local schools &amp; corporates</p>
              <p className="mt-1 text-xs text-slate-300">
                Brands in Johannesburg, Kempton Park, and Midrand rely on MOTARRO Supplies for headline-worthy
                apparel, from golf day polos to launch-night hoodies.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold text-slate-900">
            Why Choose MOTARRO Supplies for T-Shirt Printing in Kempton Park?
          </h2>
          <p className="text-base leading-relaxed text-slate-700">
            We are the local team that blends boutique craftsmanship with enterprise-grade fulfilment. Every
            garment is calibrated, printed, cured, and quality-checked in our Kempton Park facility so you
            never gamble with outsourcing delays. Dedicated account managers oversee corporate uniforms
            Johannesburg companies depend on, while our designers fine-tune colour profiles for vibrant
            prints that hold up to the South African sun. Whether you&apos;re refreshing branded clothing
            Kempton Park store teams wear on the floor or kitting out a nationwide brand activation, you get
            precise timeframes, honest advice, and the flexibility to scale quickly.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Local production",
                description:
                  "In-house presses, embroidery machines, and drying tunnels deliver consistent colour, perfect Pantone matching, and rapid reprints when you need extras.",
              },
              {
                title: "Same-day specialists",
                description:
                  "Same day t-shirt printing near me isn’t a marketing line. It’s our specialty. Approve your proof, swing by our studio, or send a courier—we’ll have the order ready.",
              },
              {
                title: "End-to-end support",
                description:
                  "From artwork clean-up to fabric selection and fulfilment, our team guides you through every milestone so your launch, golf day, or expo runs smoothly.",
              },
              {
                title: "Sustainably minded",
                description:
                  "Water-based inks, premium blanks, and eco-forward packaging keep your impact low while still delivering premium finishes your audience will notice.",
              },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-3 rounded-xl border border-slate-200 p-4">
                <CheckCircle2 className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-500" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-slate-900 p-6 text-white">
            <h3 className="text-xl font-semibold">Need a rush job today?</h3>
            <p className="mt-2 text-sm text-slate-200">
              Call us on <a href="tel:+27696228848" className="underline">+27&nbsp;69&nbsp;622&nbsp;8848</a>{" "}
              before 10:00 for priority press time. We’ll confirm artwork and schedule your collection slot.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild className="bg-white text-slate-900 hover:bg-slate-100">
                <Link href="tel:+27696228848" prefetch={false}>
                  <PhoneCall className="h-4 w-4" />
                  Call Now
                </Link>
              </Button>
              <Button asChild variant="secondary" className="bg-emerald-500 text-white hover:bg-emerald-400">
                <Link
                  href="https://wa.me/27696228848?text=Hi%20MOTARRO Supplies%2C%20I%20need%20same-day%20printing%20in%20Kempton%20Park."
                  target="_blank"
                  rel="noopener noreferrer"
                  prefetch={false}
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Studio
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <aside className="space-y-5 self-start rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-lg font-semibold text-slate-900">Quick Facts</h3>
          <ul className="space-y-4 text-sm text-slate-700">
            <li className="flex items-start gap-3">
              <Clock className="mt-1 h-5 w-5 text-emerald-500" />
              <span>
                Standard orders ready in 48 hours. Priority same-day service for urgent corporate events,
                sports tournaments, and pop-up retail.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Truck className="mt-1 h-5 w-5 text-emerald-500" />
              <span>
                Nationwide delivery to Johannesburg, Pretoria, Cape Town, Durban, Bloemfontein, and coastal
                holiday towns via trusted courier partners.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 text-emerald-500" />
              <span>Secure payment options: PayFast, card-on-collection, EFT, SnapScan, and purchase orders.</span>
            </li>
            <li className="flex items-start gap-3">
              <Sparkles className="mt-1 h-5 w-5 text-emerald-500" />
              <span>Eco-friendly packaging and recycled boxes on request for brand campaigns.</span>
            </li>
          </ul>
        </aside>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-10 lg:grid-cols-[1.4fr,1fr]">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-slate-900">Our Location &amp; Same-Day Collection</h2>
            <p className="text-base leading-relaxed text-slate-700">
              Visit the MOTARRO Supplies studio at <strong>Kempton Park, Johannesburg, Gauteng, 1619</strong> for fast
                same-day collection. We are five minutes from OR Tambo International Airport, with quick
                connections to R21 and R24 highways, making pickups easy for East Rand, Midrand, and Sandton teams.
                Parking is secure and we have a dedicated collection counter, so fleets can grab boxes without
                losing time.
              </p>
              <p className="text-base leading-relaxed text-slate-700">
                Prefer delivery? We dispatch every afternoon with overnight couriers, so your branded clothing
                Kempton Park order reaches Johannesburg CBD, Centurion, or national branches the next business day.
                Use the click-to-call buttons or tap the WhatsApp channel to confirm stock, artwork, or lead times
                before you head over.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="bg-slate-900 text-white hover:bg-slate-800">
                  <Link href="tel:+27696228848" prefetch={false}>
                    <PhoneCall className="h-4 w-4" />
                    069&nbsp;622&nbsp;8848
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-slate-300 text-slate-900 hover:bg-slate-200"
                >
                  <Link
                    href="https://wa.me/27696228848?text=Hi%20MOTARRO Supplies%20Team%2C%20please%20share%20directions%20to%20your%20Kempton%20Park%20studio."
                    target="_blank"
                    rel="noopener noreferrer"
                    prefetch={false}
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp Directions
                  </Link>
                </Button>
                <Button asChild variant="link" className="text-slate-900">
                  <Link href="/contact">Contact Page</Link>
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl shadow-lg">
                <iframe
                  title="MOTARRO Supplies Kempton Park on Google Maps"
                  src="https://maps.google.com/maps?q=Kempton%20Park%20Gauteng&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  className="h-72 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-slate-900">Studio Hours</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li>Monday – Friday: 08:00 – 18:00</li>
                  <li>Saturday: 09:00 – 14:00</li>
                  <li>After-hours collections by appointment for urgent runs</li>
                </ul>
                <p className="mt-4 text-sm text-slate-600">
                  Book your collection slot when you approve proofs—our team prepares garments, QC reports, and
                  packing slips ahead of your arrival.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl space-y-8 px-4 py-16">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Printing Methods We Offer</h2>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-700">
              Partner with MOTARRO Supplies for industry-leading print technology. Our specialists recommend the best
              process for your garment, deadline, and budget—ensuring t-shirt printing Kempton Park businesses
              rely on looks incredible and lasts.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-full bg-slate-900 px-8 py-6 text-white hover:bg-slate-800">
            <Link href="https://www.motarro.co.za/custom-printing" prefetch={false}>
              View All Custom Printing Services
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Direct-to-Garment (DTG)",
              description:
                "Full-colour artwork, gradients, and photo prints with a buttery-soft feel. Ideal for small runs, personalised gifts, and campaign samples that still need retail quality.",
              image: "/1744405875368-custom-t-shirt.jpeg",
            },
            {
              title: "Screen Printing",
              description:
                "High-volume printing with unbeatable vibrancy and durability. Perfect for merch drops, school events, and promotional clothing Gauteng marketers distribute in bulk.",
              image: "/polo-tshirts.jpg",
            },
            {
              title: "Vinyl & DTF Transfers",
              description:
                "Crisp logos, names, and numbering on sportswear, hoodies, and jackets. Great for multi-colour designs on technical fabrics or limited-edition ranges.",
              image: "/hero-tshirt.jpg",
            },
            {
              title: "Embroidery",
              description:
                "Premium finish for corporate uniforms Johannesburg teams wear daily, plus caps, beanies, and jackets that need a raised, long-lasting mark of quality.",
              image: "/1744405899430-custom-hoodie.jpg",
            },
          ].map((method) => (
            <article key={method.title} className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="relative h-40 w-full">
                <Image
                  src={method.image}
                  alt={method.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="flex flex-1 flex-col space-y-3 p-5">
                <h3 className="text-lg font-semibold text-slate-900">{method.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{method.description}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white">
          <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr] lg:items-center">
            <div>
              <h3 className="text-2xl font-semibold">Ready to start your design?</h3>
              <p className="mt-3 max-w-2xl text-sm text-slate-200">
                Upload artwork, choose garment colours, and generate live pricing—all inside our online design
                studio. Or connect with the MOTARRO Supplies team for guided workshops, colour-matching sessions, and
                fabric swatches before we begin.
              </p>
            </div>
            <div className="flex flex-wrap justify-start gap-3">
              <Button asChild className="bg-white text-slate-900 hover:bg-slate-200">
                <Link href="https://www.motarro.co.za/custom-printing" prefetch={false}>
                  Design Online Now
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Link href="/products">Browse Apparel Catalogue</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="container mx-auto max-w-6xl space-y-8 px-4">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-semibold text-slate-900">Gallery: Real Prints, Real People</h2>
            <p className="mx-auto max-w-3xl text-base leading-relaxed text-slate-700">
              Take a behind-the-scenes look at our Kempton Park production floor—printers in action, final QC
              checks, and customers collecting their freshly branded apparel. These are the same visuals featured
              on our Google Business Profile and social feeds.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { src: "/images/hero-optimized.webp", alt: "DTG printer creating a vibrant Kempton Park event shirt" },
              { src: "/uploads/1747252512742-494748097-10235135797874225-7522223276585180651-n.jpg", alt: "Happy customer collecting branded clothing in Kempton Park" },
              { src: "/uploads/1743025912146-hero-01.jpg", alt: "Embroidery machine stitching corporate uniforms" },
              { src: "/uploads/1743025454882-t-shirt-7968889-1920.jpg", alt: "Folded custom tees ready for same-day collection" },
            ].map((image) => (
              <figure key={image.src} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="relative h-52 w-full">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <figcaption className="px-4 py-3 text-xs text-slate-600">{image.alt}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl space-y-10 px-4 py-16">
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold text-slate-900">
            Popular Products for Kempton Park Customers
          </h2>
          <p className="text-base leading-relaxed text-slate-700">
            MOTARRO Supplies supplies corporate HQs, schools, sports clubs, and marketing agencies across the East Rand.
            Mix and match garments from our <Link href="/men" className="font-semibold text-slate-900 underline">men&apos;s</Link> and{" "}
            <Link href="/women" className="font-semibold text-slate-900 underline">women&apos;s</Link> ranges, or explore{" "}
            <Link href="/accessories" className="font-semibold text-slate-900 underline">accessories</Link> for bundled giveaways.
            Whatever the brief, your kits arrive pressed, packed, and ready to impress.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Corporate Wear & Executive Gifts",
              description:
                "Polos, button-downs, jackets, and corporate uniforms Johannesburg leadership teams rely on for on-brand client engagements. Add embroidered logos, engraved name badges, or premium packaging for board-level gifting.",
            },
            {
              title: "School Leavers & Sports Teams",
              description:
                "All-over print hoodies, matric jerseys, house shirts, and supporter merch that stands up to weekly wear. We manage colour-coding, learner names, and sponsor logos with zero hassle for the school office.",
            },
            {
              title: "Events, Promotions & Golf Days",
              description:
                "Vibrant tees, breathable golf shirts, caps, aprons, and tote bags tailored for activations and pop-ups. Bundle promotional clothing Gauteng agencies deploy for brand ambassadors, sampling teams, and roadshows.",
            },
          ].map((product) => (
            <article key={product.title} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6 text-amber-500" />
                <h3 className="text-xl font-semibold text-slate-900">{product.title}</h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">{product.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 py-16 text-white">
        <div className="container mx-auto max-w-6xl space-y-8 px-4">
          <div className="grid gap-10 lg:grid-cols-[1.5fr,1fr] lg:items-center">
            <div className="space-y-5">
              <h2 className="text-3xl font-semibold">
                Fast Turnaround Times &amp; Nationwide Delivery
              </h2>
              <p className="text-base leading-relaxed text-slate-200">
                Tight deadline? Our press schedule runs from 06:00 with split shifts to maintain speed and
                quality. Same-day express covers Kempton Park collections and urgent Johannesburg metro drops.
                Standard lead times are 2–4 working days, including CMT (cut, make, trim) for complex garments.
                Once packed, orders travel via overnight courier to Gauteng, Western Cape, KwaZulu-Natal, North
                West, Limpopo, Mpumalanga, and the Free State.
              </p>
              <p className="text-base leading-relaxed text-slate-200">
                International delivery? Speak to our team about export-ready packing, customs documentation,
                and pre-shipment photos. Every parcel includes a tamper seal, QR-linked care instructions, and
                tracking so your brand assets arrive safely. That’s why agencies, franchise networks, and
                nonprofit organisations trust MOTARRO Supplies for mission-critical apparel.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="bg-emerald-500 text-white hover:bg-emerald-400">
                  Guaranteed deadline scheduling
                </Badge>
                <Badge variant="secondary" className="bg-emerald-500 text-white hover:bg-emerald-400">
                  Branded packaging available
                </Badge>
                <Badge variant="secondary" className="bg-emerald-500 text-white hover:bg-emerald-400">
                  Nationwide courier network
                </Badge>
              </div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6">
              <h3 className="text-lg font-semibold text-white">Accepted Payments &amp; Security</h3>
              <p className="mt-2 text-sm text-slate-200">
                Pay in the way that suits your team, with encrypted gateways and verified suppliers.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-100">
                {["Visa", "Mastercard", "PayFast", "EFT", "SnapScan", "Purchase Orders"].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-300">
                PCI DSS compliant processing • POPIA-aligned data handling • Secure double-check QC before
                dispatch.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl space-y-8 px-4 py-16">
        <div className="space-y-4 text-center">
          <h2 className="text-3xl font-semibold text-slate-900">What Our Customers Say</h2>
          <p className="mx-auto max-w-3xl text-base leading-relaxed text-slate-700">
            We love meeting clients at the collection counter. Until your next visit, here&apos;s what local
            entrepreneurs, school committees, and marketing teams share on Google.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {verifiedGoogleReviews.map((testimonial) => (
            <article key={testimonial.id} className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                <Star className="h-5 w-5 text-amber-500" />
                <Star className="h-5 w-5 text-amber-500" />
                <Star className="h-5 w-5 text-amber-500" />
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-sm leading-relaxed text-slate-600">“{testimonial.quote}”</p>
              <div className="mt-auto text-sm font-semibold text-slate-900">{testimonial.author}</div>
              <div className="text-xs text-slate-500">{testimonial.role}</div>
            </article>
          ))}
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="text-sm text-emerald-900">
            Verified Google reviews embed launching soon. Want to feature? Leave your feedback on our{" "}
            <Link
              href="https://www.google.com/search?q=www.motarro.co.za"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline"
              prefetch={false}
            >
              Google Business Profile
            </Link>.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="container mx-auto max-w-5xl space-y-8 px-4">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-slate-900">Frequently Asked Questions</h2>
            <p className="mt-2 text-base text-slate-700">
              Everything you need to know about ordering custom apparel with MOTARRO Supplies. Still unsure?{" "}
              <Link href="/contact" className="font-semibold text-slate-900 underline">
                Reach out to our specialists
              </Link>{" "}
              and we’ll walk you through the process.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition-colors open:border-slate-300 open:bg-white"
              >
                <summary className="flex cursor-pointer items-center justify-between text-lg font-semibold text-slate-900">
                  {faq.question}
                  <span className="ml-4 text-slate-500 transition-transform duration-300 group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 py-16">
        <div className="container mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center text-white">
          <h2 className="text-3xl font-semibold">
            Ready to Create Branded Apparel People Love to Wear?
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-emerald-100">
            MOTARRO Supplies is your partner for custom t-shirt printing Kempton Park businesses, schools, and creators
            rave about. Launch your design now or chat to our team for expert guidance on fabrics, fits, and
            finishing touches. Your brand deserves a wardrobe upgrade.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-full bg-white px-8 py-6 text-emerald-600 hover:bg-emerald-100">
              <Link href="https://www.motarro.co.za/custom-printing" prefetch={false}>
                Design Online Now
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white px-8 py-6 text-white hover:bg-white/10"
            >
              <Link href="/contact">
                Book a Consultation
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white px-8 py-6 text-white hover:bg-white/10"
            >
              <Link
                href="https://wa.me/27696228848?text=Hi%20MOTARRO Supplies%20Team%2C%20let%27s%20plan%20branded%20apparel%20for%20Kempton%20Park."
                target="_blank"
                rel="noopener noreferrer"
                prefetch={false}
              >
                WhatsApp Now
              </Link>
            </Button>
          </div>
          <p className="text-xs text-emerald-100">
            P.S. We keep a curated range of blank tees and hoodies in stock so urgent briefs never miss a beat.
          </p>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://www.motarro.co.za/custom-t-shirt-printing-kempton-park#localbusiness",
            name: "MOTARRO Supplies Kempton Park Custom T-Shirt Printing",
            image: [
              "https://www.motarro.co.za/images/hero-optimized.webp",
              "https://www.motarro.co.za/og-image.jpg",
              "https://www.motarro.co.za/uploads/1743025912146-hero-01.jpg",
            ],
            url: "https://www.motarro.co.za/custom-t-shirt-printing-kempton-park",
            telephone: "+27-69-622-8848",
            priceRange: "$$",
            description:
              "Custom t-shirt printing, branded clothing, corporate uniforms, and promotional apparel produced in Kempton Park with same-day collection and nationwide delivery.",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Kempton Park, Johannesburg",
              addressLocality: "Kempton Park",
              addressRegion: "Gauteng",
              postalCode: "1619",
              addressCountry: "ZA",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: -26.1087,
              longitude: 28.2333,
            },
            hasMap: "https://maps.google.com/?q=Kempton+Park,+Gauteng",
            openingHoursSpecification: [
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                ],
                opens: "08:00",
                closes: "18:00",
              },
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: "Saturday",
                opens: "09:00",
                closes: "14:00",
              },
            ],
            sameAs: [
              "https://www.motarro.co.za/go/facebook",
              "https://www.motarro.co.za/go/instagram",
              "https://www.motarro.co.za/go/x",
              "https://www.motarro.co.za/go/etsy",
            ],
            areaServed: [
              { "@type": "City", name: "Kempton Park" },
              { "@type": "City", name: "Johannesburg" },
              { "@type": "State", name: "Gauteng" },
              { "@type": "Country", name: "South Africa" },
            ],
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "5.0",
              reviewCount: "9",
            },
            makesOffer: [
              {
                "@type": "Offer",
                name: "Custom T-Shirt Printing",
                priceCurrency: "ZAR",
                availability: DEFAULT_AVAILABILITY,
                itemCondition: DEFAULT_CONDITION,
              },
              {
                "@type": "Offer",
                name: "Corporate Uniform Embroidery",
                priceCurrency: "ZAR",
                availability: DEFAULT_AVAILABILITY,
                itemCondition: DEFAULT_CONDITION,
              },
              {
                "@type": "Offer",
                name: "Promotional Clothing",
                priceCurrency: "ZAR",
                availability: DEFAULT_AVAILABILITY,
                itemCondition: DEFAULT_CONDITION,
              },
            ],
          }),
        }}
      />
    </div>
  )
}

