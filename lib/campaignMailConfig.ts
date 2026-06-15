/**
 * Campaign emails use Gmail SMTP. Env vars (Vercel + local):
 *
 * - CAMPAIGN_FROM_EMAIL — "From" address recipients see (default: motarrodotcoza@gmail.com)
 * - CAMPAIGN_FROM_NAME — display name (default: MOTARRO Supplies)
 * - CAMPAIGN_GMAIL_USER — Google account used to log in to SMTP (must match the App Password account)
 * - CAMPAIGN_GMAIL_APP_PASSWORD — App Password for that account (default: GMAIL_APP_PASSWORD)
 * - CAMPAIGN_REPLY_TO — optional Reply-To header
 *
 * Reads use dynamic `process.env[key]` so Next.js/Webpack does not inline stale values at build time
 * (fixes Vercel: campaign vars added after first deploy were ignored → fallback to GMAIL_FROM).
 */

export interface CampaignMailConfig {
  authUser: string;
  authPass: string;
  fromAddress: string;
  fromName: string;
  replyTo: string;
}

/** Runtime env only — avoids DefinePlugin replacing CAMPAIGN_* with undefined from build time. */
function env(key: string): string | undefined {
  const v = process.env[key];
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
}

/** Google shows app passwords with spaces; SMTP accepts without. */
export function normalizeGmailAppPassword(pass: string): string {
  return pass.replace(/\s+/g, "");
}

export function getCampaignMailConfig(): CampaignMailConfig | null {
  const campaignPassRaw = env("CAMPAIGN_GMAIL_APP_PASSWORD");
  const sharedPassRaw = env("GMAIL_APP_PASSWORD");
  const campaignPass = campaignPassRaw
    ? normalizeGmailAppPassword(campaignPassRaw)
    : "";
  const sharedPass = sharedPassRaw
    ? normalizeGmailAppPassword(sharedPassRaw)
    : "";

  const authPass = campaignPass || sharedPass;
  if (!authPass) {
    return null;
  }

  const fromAddress =
    env("CAMPAIGN_FROM_EMAIL") || "motarrodotcoza@gmail.com";

  const authUserExplicit = env("CAMPAIGN_GMAIL_USER");

  /** Gmail SMTP login must own authPass or Gmail replaces From with that account. */
  const authUser = authUserExplicit
    ? authUserExplicit
    : campaignPass
      ? fromAddress
      : env("GMAIL_FROM") || "dartonstaker@gmail.com";

  const fromName = env("CAMPAIGN_FROM_NAME") || "MOTARRO Supplies";

  const replyTo = env("CAMPAIGN_REPLY_TO") || fromAddress;

  return { authUser, authPass, fromAddress, fromName, replyTo };
}
