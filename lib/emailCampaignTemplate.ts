function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function preheaderFromBody(text: string, maxLen = 140): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  if (oneLine.length <= maxLen) return oneLine;
  return `${oneLine.slice(0, maxLen - 1)}…`;
}

const SITE_URL = "https://www.motarro.co.za";

/**
 * Shared HTML layout for all campaign sends — table-based, inline styles for clients.
 */
export function buildCampaignEmailHtml(campaign: {
  title: string;
  image_url: string | null;
  email_body: string;
}): string {
  const bodyHtml = escapeHtml(campaign.email_body).replace(/\r?\n/g, "<br/>");
  const preheader = escapeHtml(preheaderFromBody(campaign.email_body || campaign.title));
  const heroBlock = campaign.image_url
    ? `<tr><td style="padding:0 24px 20px;">
  <img src="${escapeHtml(campaign.image_url)}" alt="" width="552" style="display:block;width:100%;max-width:552px;height:auto;border:0;border-radius:6px;" />
</td></tr>`
    : "";

  const titleEscaped = escapeHtml(campaign.title);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${titleEscaped}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;">
<span style="display:none !important;visibility:hidden;mso-hide:all;font-size:1px;color:#f4f4f5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:28px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e4e4e7;">
<tr><td style="background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 50%,#8b5cf6 100%);padding:22px 24px;">
<span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.03em;">MOTARRO Supplies</span>
</td></tr>
${heroBlock}
<tr><td style="padding:8px 24px 28px;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#18181b;">
<div style="margin:0 0 12px;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.06em;">Message</div>
<div style="margin:0;">${bodyHtml}</div>
</td></tr>
<tr><td style="padding:20px 24px;background-color:#fafafa;border-top:1px solid #e4e4e7;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.55;color:#71717a;">
<strong style="color:#3f3f46;">MOTARRO Supplies</strong> · South Africa<br />
<a href="${SITE_URL}" style="color:#6d28d9;text-decoration:none;">${SITE_URL}</a><br /><br />
You received this email because you have a relationship with MOTARRO Supplies or agreed to marketing contact (POPIA).
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
