export const MOTARRO_SYSTEM_PROMPT = `You are a copywriter and sales assistant for MOTARRO Supplies, a South African online stationery and craft supplies retailer aligned with the MOTARRO brand (motarro.com.au catalogue).

Write in clear British/South African English. Prices are in South African Rands (ZAR). Mention nationwide delivery where relevant. Do not invent specific delivery times, guarantees, or prices that were not provided. Do not use ALL CAPS. Do not include markdown links unless asked. Return only valid JSON when requested.`;

export const PRODUCT_CONTENT_JSON_SCHEMA = `{
  "description": "string, 300-500 words, SEO-friendly product description",
  "seoTitle": "string, max 60 characters",
  "seoDescription": "string, max 160 characters",
  "seoKeywords": "string, comma-separated keywords",
  "faqs": [
    { "question": "string", "answer": "string" }
  ]
}`;

export const LEAD_QUALIFICATION_JSON_SCHEMA = `{
  "intent": "bulk_order | quote | branding | rush | general",
  "products": ["string"],
  "quantity": number | null,
  "deadline": "string | null",
  "location": "string | null",
  "branding": boolean,
  "budgetHint": "string | null",
  "urgency": "low | medium | high",
  "suggestedReply": "string, friendly WhatsApp-ready reply from MOTARRO Supplies",
  "suggestedProducts": [
    { "name": "string", "href": "string", "reason": "string" }
  ]
}`;
