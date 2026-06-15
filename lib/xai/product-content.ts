import { createXaiChatCompletion, parseJsonFromModel } from "@/lib/xai/client";
import {
  MOTARRO_SYSTEM_PROMPT,
  PRODUCT_CONTENT_JSON_SCHEMA,
} from "@/lib/xai/prompts";
import type { GeneratedProductContent, ProductContentInput } from "@/lib/xai/types";

export async function generateProductContent(
  input: ProductContentInput
): Promise<GeneratedProductContent> {
  const colors = input.colors?.filter(Boolean).join(", ") || "Not specified";
  const sizes = input.sizes?.filter(Boolean).join(", ") || "Not specified";
  const price =
    typeof input.price === "number" && input.price > 0
      ? `R${input.price.toFixed(2)}`
      : "Not specified";

  const userPrompt = `Generate product marketing copy for MOTARRO Supplies.

Product name: ${input.name}
Category: ${input.category || "General"}
Subcategory: ${input.subcategory || "None"}
SKU: ${input.sku || "None"}
Price: ${price}
Colours: ${colors}
Sizes: ${sizes}
Existing description (may improve or replace): ${input.existingDescription || "None"}

Return JSON only using this schema:
${PRODUCT_CONTENT_JSON_SCHEMA}

Rules:
- description must be unique, helpful, and mention custom printing options where relevant
- include Johannesburg, Kempton Park, or South Africa naturally once
- provide exactly 3 FAQs
- seoTitle <= 60 chars, seoDescription <= 160 chars`;

  const raw = await createXaiChatCompletion(
    [
      { role: "system", content: MOTARRO_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.65, maxTokens: 2200 }
  );

  const parsed = parseJsonFromModel<GeneratedProductContent>(raw);

  return {
    description: String(parsed.description || "").trim(),
    seoTitle: String(parsed.seoTitle || "").trim().slice(0, 60),
    seoDescription: String(parsed.seoDescription || "").trim().slice(0, 160),
    seoKeywords: String(parsed.seoKeywords || "").trim(),
    faqs: Array.isArray(parsed.faqs)
      ? parsed.faqs
          .filter((faq) => faq?.question && faq?.answer)
          .slice(0, 3)
          .map((faq) => ({
            question: String(faq.question).trim(),
            answer: String(faq.answer).trim(),
          }))
      : [],
  };
}
