import { Metadata } from "next"
import { supabase } from "@/lib/supabaseClient"

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const eventId = params.id

  try {
    const { data: event } = await supabase
      .from("school_events")
      .select("id, name, description, \"startDate\", \"endDate\", \"isActive\"")
      .eq("id", eventId)
      .single()

    if (!event || !event.isActive) {
      return {
        title: "School Event Not Available | MOTARRO Supplies",
        description:
          "The school event you are looking for is not available or is no longer active.",
        robots: {
          index: false,
          follow: true,
        },
      }
    }

    const title = `${event.name} | School Events by MOTARRO Supplies`
    const description =
      event.description ||
      `${event.name} school event apparel and merchandise from MOTARRO Supplies.`
    const canonical = `https://www.motarro.co.za/school-events/${event.id}`

    return {
      title,
      description: description.substring(0, 160),
      openGraph: {
        title,
        description: description.substring(0, 160),
        url: canonical,
        siteName: "MOTARRO Supplies",
        type: "website",
        locale: "en_ZA",
      },
      twitter: {
        card: "summary",
        title,
        description: description.substring(0, 160),
      },
      alternates: {
        canonical,
      },
    }
  } catch (error) {
    console.error("Error generating school event metadata:", error)
    return {
      title: "School Events | MOTARRO Supplies",
      description:
        "Discover school event merchandise and apparel from MOTARRO Supplies.",
    }
  }
}

export default function SchoolEventLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


