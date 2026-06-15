import type { SupabaseClient } from "@supabase/supabase-js";
import { getCampaignMailConfig } from "@/lib/campaignMailConfig";
import { buildCampaignEmailHtml } from "@/lib/emailCampaignTemplate";
import { resolveRecipientsForSend } from "@/lib/emailCampaignSend";

export interface SendCampaignResult {
  ok: boolean;
  error?: string;
  recipientCount?: number;
}

export interface ProcessCampaignsResult {
  processed: number;
  completed: number;
  skippedNoGmail: boolean;
  errors: string[];
}

/**
 * Sends one campaign immediately from **draft** or **scheduled** (Gmail + snapshot).
 * Idempotent with respect to concurrent calls: only one claim wins.
 */
export async function sendEmailCampaignNow(
  admin: SupabaseClient,
  campaignId: string
): Promise<SendCampaignResult> {
  const mailCfg = getCampaignMailConfig();
  if (!mailCfg) {
    return {
      ok: false,
      error:
        "Mail not configured: set GMAIL_APP_PASSWORD or CAMPAIGN_GMAIL_APP_PASSWORD for campaigns.",
    };
  }

  const now = new Date().toISOString();
  const { data: claimed, error: claimErr } = await admin
    .from("email_campaigns")
    .update({ status: "sending", updated_at: now })
    .eq("id", campaignId)
    .in("status", ["draft", "scheduled"])
    .select("*")
    .maybeSingle();

  if (claimErr) {
    return { ok: false, error: claimErr.message };
  }
  if (!claimed) {
    return {
      ok: false,
      error:
        "Campaign is not in draft or scheduled status (already sent, archived, or in progress).",
    };
  }

  const row = claimed as Record<string, unknown>;
  const id = campaignId;

  try {
    const { emails } = await resolveRecipientsForSend(admin, {
      parentCampaignId: (row.parent_campaign_id as string) || null,
      allowlistPatterns: Array.isArray(row.allowlist_patterns)
        ? (row.allowlist_patterns as string[])
        : [],
      blocklistPatterns: Array.isArray(row.blocklist_patterns)
        ? (row.blocklist_patterns as string[])
        : [],
    });

    if (emails.length === 0) {
      await admin
        .from("email_campaigns")
        .update({ status: "draft", updated_at: new Date().toISOString() })
        .eq("id", id);
      return {
        ok: false,
        error:
          "No recipients after filters. Check allow/block list, Customers, or follow-up parent.",
      };
    }

    const nodemailer = (await import("nodemailer")).default;
    console.info(
      "[email-campaign] SMTP login:",
      mailCfg.authUser,
      "From:",
      mailCfg.fromAddress
    );
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: mailCfg.authUser,
        pass: mailCfg.authPass,
      },
    });

    const title = String(row.title || "MOTARRO Supplies");
    const html = buildCampaignEmailHtml({
      title,
      image_url: (row.image_url as string) || null,
      email_body: String(row.email_body || ""),
    });

    for (const to of emails) {
      await transporter.sendMail({
        from: { name: mailCfg.fromName, address: mailCfg.fromAddress },
        replyTo: mailCfg.replyTo,
        to,
        subject: title,
        html,
      });
    }

    const { error: insErr } = await admin
      .from("email_campaign_recipients")
      .insert(emails.map((email) => ({ campaign_id: id, email })));

    if (insErr) {
      console.error("[sendEmailCampaignNow] recipient log failed", insErr);
    }

    await admin
      .from("email_campaigns")
      .update({ status: "sent", updated_at: new Date().toISOString() })
      .eq("id", id);

    return { ok: true, recipientCount: emails.length };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await admin
      .from("email_campaigns")
      .update({ status: "draft", updated_at: new Date().toISOString() })
      .eq("id", id);
    return { ok: false, error: msg };
  }
}

/**
 * For external schedulers: due **scheduled** campaigns (scheduled_at <= now).
 */
export async function processDueEmailCampaigns(
  admin: SupabaseClient
): Promise<ProcessCampaignsResult> {
  const result: ProcessCampaignsResult = {
    processed: 0,
    completed: 0,
    skippedNoGmail: false,
    errors: [],
  };

  if (!getCampaignMailConfig()) {
    result.skippedNoGmail = true;
    result.errors.push(
      "GMAIL_APP_PASSWORD or CAMPAIGN_GMAIL_APP_PASSWORD is not set — campaign emails are not sent."
    );
    return result;
  }

  const now = new Date().toISOString();
  const { data: due, error: listErr } = await admin
    .from("email_campaigns")
    .select("id")
    .eq("status", "scheduled")
    .lte("scheduled_at", now);

  if (listErr) {
    result.errors.push(listErr.message);
    return result;
  }

  for (const raw of due || []) {
    const id = (raw as { id: string }).id;
    result.processed += 1;
    const sendResult = await sendEmailCampaignNow(admin, id);
    if (sendResult.ok) {
      result.completed += 1;
    } else {
      result.errors.push(`${id}: ${sendResult.error}`);
    }
  }

  return result;
}
