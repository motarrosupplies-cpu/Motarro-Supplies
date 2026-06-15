import { supabaseAdmin } from "@/lib/supabaseClient";
import { getTitanJetConfig } from "@/lib/titan-jet/config";

export type TitanJetMarkupRule = {
  id: string;
  rule_type: "global" | "category" | "brand";
  rule_value: string | null;
  markup_percent: number;
};

let cachedRules: TitanJetMarkupRule[] | null = null;
let cacheExpiresAt = 0;

export async function getTitanJetMarkupRules(): Promise<TitanJetMarkupRule[]> {
  const now = Date.now();
  if (cachedRules && now < cacheExpiresAt) {
    return cachedRules;
  }

  if (!supabaseAdmin) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("titan_jet_markup_rules")
    .select("id, rule_type, rule_value, markup_percent")
    .order("rule_type", { ascending: true });

  if (error) {
    console.error("[titan-jet/markup] failed to load rules", error);
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

export function clearTitanJetMarkupCache() {
  cachedRules = null;
  cacheExpiresAt = 0;
}

export async function resolveTitanJetMarkupPercent(
  category: string,
  brand: string
): Promise<number> {
  const rules = await getTitanJetMarkupRules();
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

  return getTitanJetConfig().markupPercent;
}

export function applyTitanJetMarkup(
  price: number,
  markupPercent: number
): number {
  if (!markupPercent) return price;
  return Math.round(price * (1 + markupPercent / 100) * 100) / 100;
}
