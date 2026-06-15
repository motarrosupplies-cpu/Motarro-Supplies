/**
 * Serves llms.txt for AI/LLM crawlers at /llms.txt (via rewrite in next.config).
 */

import { LLMS_TXT_CONTENT } from "@/lib/llms-content"

export async function GET() {
  return new Response(LLMS_TXT_CONTENT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
