/** Maps legacy DB values after constraint changes. */
export function normalizeCampaignStatus(status: string): string {
  if (status === "ready") return "draft";
  return status;
}

export interface EmailCampaignDto {
  id: string;
  title: string;
  imageUrl: string | null;
  emailBody: string;
  status: string;
  allowlistPatterns: string[];
  blocklistPatterns: string[];
  scheduledAt: string | null;
  parentCampaignId: string | null;
  createdAt: string;
  updatedAt: string;
}

export function mapCampaignRow(r: Record<string, unknown>): EmailCampaignDto {
  const allow = r.allowlist_patterns;
  const block = r.blocklist_patterns;
  return {
    id: r.id as string,
    title: r.title as string,
    imageUrl: (r.image_url as string) || null,
    emailBody: (r.email_body as string) || "",
    status: normalizeCampaignStatus(String(r.status || "draft")),
    allowlistPatterns: Array.isArray(allow)
      ? (allow as string[]).map((s) => String(s))
      : [],
    blocklistPatterns: Array.isArray(block)
      ? (block as string[]).map((s) => String(s))
      : [],
    scheduledAt: (r.scheduled_at as string) || null,
    parentCampaignId: (r.parent_campaign_id as string) || null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}
