import {
  buildMetaCatalogFeed,
  type MetaCatalogSource,
} from "@/lib/meta-catalog/build-feed";
import { isMetaCatalogFeedAuthorized } from "@/lib/meta-catalog/format";
import { metaCatalogResponse } from "@/lib/meta-catalog/respond";

export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const revalidate = 0;

const SOURCES = new Set<MetaCatalogSource>([
  "all",
  "kevro",
  "titan-jet",
  "motarro",
]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ source: string }> }
) {
  if (!isMetaCatalogFeedAuthorized(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { source: rawSource } = await params;
  const source = rawSource as MetaCatalogSource;

  if (!SOURCES.has(source)) {
    return new Response("Unknown catalog source", { status: 404 });
  }

  try {
    const { csv, counts } = await buildMetaCatalogFeed(source);
    return metaCatalogResponse(csv, counts, source);
  } catch (error) {
    console.error(`[meta-catalog/${source}] feed generation failed`, error);
    return new Response("Error generating Meta catalog feed", { status: 500 });
  }
}
