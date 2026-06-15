import { createXaiChatCompletion, parseJsonFromModel } from "@/lib/xai/client";
import { searchCatalogForLead } from "@/lib/xai/search-catalog";
import {
  MOTARRO_SYSTEM_PROMPT,
  LEAD_QUALIFICATION_JSON_SCHEMA,
} from "@/lib/xai/prompts";
import type { CatalogProductSnippet, QualifiedLead } from "@/lib/xai/types";

function normalizeLead(parsed: QualifiedLead, catalog: CatalogProductSnippet[]): QualifiedLead {
  const allowedProducts = new Map(
    catalog.map((item) => [item.href.toLowerCase(), item])
  );

  const suggestedProducts = Array.isArray(parsed.suggestedProducts)
    ? parsed.suggestedProducts
        .map((item) => {
          const href = String(item.href || "").trim();
          const match = allowedProducts.get(href.toLowerCase());
          if (!match) return null;
          return {
            name: match.name,
            href: match.href,
            reason: String(item.reason || "Relevant to the enquiry").trim(),
          };
        })
        .filter((item): item is QualifiedLead["suggestedProducts"][number] => item !== null)
    : [];

  const fallbackProducts =
    suggestedProducts.length > 0
      ? suggestedProducts
      : catalog.slice(0, 3).map((item) => ({
          name: item.name,
          href: item.href,
          reason: "Matches keywords from the customer message",
        }));

  return {
    intent: String(parsed.intent || "general").trim(),
    products: Array.isArray(parsed.products)
      ? parsed.products.map((item) => String(item).trim()).filter(Boolean)
      : [],
    quantity:
      typeof parsed.quantity === "number" && parsed.quantity > 0
        ? Math.round(parsed.quantity)
        : null,
    deadline: parsed.deadline ? String(parsed.deadline).trim() : null,
    location: parsed.location ? String(parsed.location).trim() : null,
    branding: Boolean(parsed.branding),
    budgetHint: parsed.budgetHint ? String(parsed.budgetHint).trim() : null,
    urgency: ["low", "medium", "high"].includes(parsed.urgency)
      ? parsed.urgency
      : "medium",
    suggestedReply: String(parsed.suggestedReply || "").trim(),
    suggestedProducts: fallbackProducts,
  };
}

export async function qualifyLeadMessage(message: string): Promise<QualifiedLead> {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error("Message is required");
  }

  const catalog = await searchCatalogForLead(trimmed);
  const catalogSummary =
    catalog.length > 0
      ? catalog
          .map(
            (item) =>
              `- ${item.name} | ${item.category} | ${item.price ? `R${item.price}` : "Price on request"} | ${item.href}`
          )
          .join("\n")
      : "No close catalog matches found.";

  const userPrompt = `Analyse this customer enquiry for MOTARRO Supplies and prepare a WhatsApp-friendly response.

Customer message:
"""
${trimmed}
"""

Relevant catalog items (only recommend from this list):
${catalogSummary}

Return JSON only using this schema:
${LEAD_QUALIFICATION_JSON_SCHEMA}

Rules:
- suggestedReply should be warm, professional, and ask for any missing details
- only use suggestedProducts from the catalog list above
- prefer South African context and custom printing / branding language where relevant`;

  const raw = await createXaiChatCompletion(
    [
      { role: "system", content: MOTARRO_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.5, maxTokens: 1800 }
  );

  const parsed = parseJsonFromModel<QualifiedLead>(raw);
  return normalizeLead(parsed, catalog);
}

export function buildWhatsAppLeadUrl(reply: string): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || "27696228848";
  return `https://wa.me/${phone}?text=${encodeURIComponent(reply)}`;
}
