/**
 * Campaign hero images are embedded or linked in email; keep formats and size
 * conservative for client compatibility (WebP is poorly supported in many inboxes).
 */
export const CAMPAIGN_HERO_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
] as const;

/** Hard limit for upload — under ~1 MB helps deliverability and mobile loads. */
export const CAMPAIGN_HERO_MAX_BYTES = 800 * 1024;

export const CAMPAIGN_HERO_ACCEPT_ATTR =
  "image/jpeg,image/jpg,image/png,image/gif,.jpg,.jpeg,.png,.gif";

export function campaignHeroConstraintsHint(): string {
  return "JPG, PNG, or GIF only (email-safe). Max 800 KB — use compressed images for best inbox performance.";
}

export function formatCampaignHeroMaxSize(): string {
  return `${Math.round(CAMPAIGN_HERO_MAX_BYTES / 1024)} KB`;
}
