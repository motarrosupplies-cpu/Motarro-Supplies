import type { SupabaseClient } from "@supabase/supabase-js";
import { filterEmailsByPatterns, normalizePattern } from "@/lib/campaignEmailFilters";

/** Lines in the allow list that look like full emails are always added as candidates (even if not in Customers). */
export function mergeExplicitAllowlistEmails(
  baseEmails: string[],
  allowlistPatterns: string[]
): string[] {
  const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const extras = allowlistPatterns
    .map((p) => normalizePattern(p))
    .filter((p) => p && looksLikeEmail.test(p));
  const set = new Set<string>();
  for (const e of baseEmails) {
    const x = e.trim().toLowerCase();
    if (x.includes("@")) set.add(x);
  }
  for (const e of extras) set.add(e);
  return [...set];
}

/**
 * When Gmail + a cron (or queue worker) are wired:
 * 1. Select campaigns where status = 'scheduled' AND scheduled_at <= now().
 * 2. For each row, resolve recipient emails (see resolveRecipientsForSend).
 * 3. Insert into email_campaign_recipients for this campaign_id (snapshot).
 * 4. Send via Gmail API using image_url + email_body.
 * 5. Set status to 'sent' (or 'sending' → 'sent' with error handling).
 *
 * Follow-ups: parent_campaign_id set → start from parent's email_campaign_recipients,
 * then apply this campaign's allow/block patterns.
 */
export async function resolveRecipientsForSend(
  admin: SupabaseClient,
  params: {
    parentCampaignId: string | null;
    allowlistPatterns: string[];
    blocklistPatterns: string[];
  }
): Promise<{ emails: string[]; source: "customers" | "follow_up_parent" }> {
  if (params.parentCampaignId) {
    const { data: rows, error } = await admin
      .from("email_campaign_recipients")
      .select("email")
      .eq("campaign_id", params.parentCampaignId);

    if (error) throw new Error(error.message);

    const emails = (rows || [])
      .map((r: { email: string }) => r.email)
      .filter(Boolean);

    const merged = mergeExplicitAllowlistEmails(
      emails,
      params.allowlistPatterns
    );

    return {
      emails: filterEmailsByPatterns(
        merged,
        params.allowlistPatterns,
        params.blocklistPatterns
      ),
      source: "follow_up_parent",
    };
  }

  const { data: customers, error } = await admin
    .from("customers")
    .select("email");

  if (error) throw new Error(error.message);

  const emails = (customers || [])
    .map((c: { email: string | null }) => c.email)
    .filter((e): e is string => Boolean(e && String(e).includes("@")));

  const merged = mergeExplicitAllowlistEmails(
    emails,
    params.allowlistPatterns
  );

  return {
    emails: filterEmailsByPatterns(
      merged,
      params.allowlistPatterns,
      params.blocklistPatterns
    ),
    source: "customers",
  };
}
