import { supabaseAdmin } from "@/lib/supabaseClient";
import { getKevroConfig } from "@/lib/kevro/config";

export type KevroMarkupRule = {
  id: string;
  rule_type: "global" | "category" | "brand";
  rule_value: string | null;
  markup_percent: number;
};

let cachedRules: KevroMarkupRule[] | null = null;
let cacheExpiresAt = 0;

export async function getKevroMarkupRules(): Promise<KevroMarkupRule[]> {
  const now = Date.now();
  if (cachedRules && now < cacheExpiresAt) {
    return cachedRules;
  }

  if (!supabaseAdmin) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("kevro_markup_rules")
    .select("id, rule_type, rule_value, markup_percent")
    .order("rule_type", { ascending: true });

  if (error) {
    console.error("[kevro/markup] failed to load rules", error);
    return cachedRules ?? [];
  }

  cachedRules = (data ?? []).map((row) => ({
    id: row.id,
    rule_type: row.rule_type,
    rule_value: row.rule_value,
    markup_percent: Number(row.markup_percent) || 0,
  }));
  cacheExpiresAt = now + 60_000;
  return cachedRules;
}

export function clearKevroMarkupCache() {
  cachedRules = null;
  cacheExpiresAt = 0;
}

export async function resolveKevroMarkupPercent(
  category: string,
  brand: string
): Promise<number> {
  const rules = await getKevroMarkupRules();
  const brandRule = rules.find(
    (rule) => rule.rule_type === "brand" && rule.rule_value === brand
  );
  if (brandRule) return brandRule.markup_percent;

  const categoryRule = rules.find(
    (rule) => rule.rule_type === "category" && rule.rule_value === category
  );
  if (categoryRule) return categoryRule.markup_percent;

  const globalRule = rules.find((rule) => rule.rule_type === "global");
  if (globalRule) return globalRule.markup_percent;

  return getKevroConfig().markupPercent;
}

export function applyKevroMarkup(price: number, markupPercent: number): number {
  if (!markupPercent) return price;
  return Math.round(price * (1 + markupPercent / 100) * 100) / 100;
}
