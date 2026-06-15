"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { CampaignHeroUpload } from "@/components/admin/campaign-hero-upload";
import {
  CampaignAudienceSettings,
  buildAudiencePreviewBody,
  isoFromLocalInput,
  localInputFromIso,
  patternsToText,
} from "@/components/admin/campaign-audience-settings";
import type { ParentOption } from "@/components/admin/campaign-audience-settings";
import type { EmailCampaignDto } from "@/lib/emailCampaignMap";
import { getAdminAuthHeaders } from "@/lib/auth/adminFetch";
import { parsePatternLines } from "@/lib/campaignEmailFilters";

export default function EditCampaignPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [emailBody, setEmailBody] = useState("");
  const [status, setStatus] = useState("draft");
  const [allowText, setAllowText] = useState("");
  const [blockText, setBlockText] = useState("");
  const [followUpEnabled, setFollowUpEnabled] = useState(false);
  const [parentCampaignId, setParentCampaignId] = useState<string | null>(null);
  const [scheduledAtLocal, setScheduledAtLocal] = useState("");
  const [parentOptions, setParentOptions] = useState<ParentOption[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [preview, setPreview] = useState<{
    count: number;
    sample: string[];
    source: string;
    notice?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingNow, setSendingNow] = useState(false);

  const canSendNow = status === "draft" || status === "scheduled";

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const headers = await getAdminAuthHeaders();
        const [oneRes, listRes] = await Promise.all([
          fetch(`/api/admin/campaigns/${id}`, { cache: "no-store", headers }),
          fetch("/api/admin/campaigns", { cache: "no-store", headers }),
        ]);
        const data = await oneRes.json();
        if (!oneRes.ok) {
          throw new Error(data.error || "Not found");
        }
        if (cancelled) return;

        const c = data as EmailCampaignDto;
        setTitle(c.title || "");
        setImageUrl(c.imageUrl || null);
        setEmailBody(c.emailBody || "");
        setStatus(c.status || "draft");
        setAllowText(patternsToText(c.allowlistPatterns || []));
        setBlockText(patternsToText(c.blocklistPatterns || []));
        setScheduledAtLocal(localInputFromIso(c.scheduledAt));
        setParentCampaignId(c.parentCampaignId || null);
        setFollowUpEnabled(Boolean(c.parentCampaignId));

        if (listRes.ok) {
          const list = await listRes.json();
          if (Array.isArray(list) && !cancelled) {
            const sent = (list as EmailCampaignDto[])
              .filter((row) => row.status === "sent" && row.id !== id)
              .map((row) => ({ id: row.id, title: row.title }));
            setParentOptions(sent);
          }
        }
      } catch (e) {
        if (!cancelled) {
          toast({
            title: "Load failed",
            description: e instanceof Error ? e.message : "Error",
            variant: "destructive",
          });
          router.push("/admin/campaigns");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, router, toast]);

  const runPreview = async () => {
    setPreviewLoading(true);
    setPreview(null);
    try {
      const res = await fetch("/api/admin/campaigns/audience-preview", {
        method: "POST",
        headers: await getAdminAuthHeaders(),
        body: JSON.stringify(
          buildAudiencePreviewBody(
            allowText,
            blockText,
            followUpEnabled,
            parentCampaignId
          )
        ),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Preview failed");
      }
      setPreview({
        count: data.count ?? 0,
        sample: Array.isArray(data.sample) ? data.sample : [],
        source: data.source ?? "customers",
        notice: data.notice,
      });
    } catch (e) {
      toast({
        title: "Preview failed",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }

    let scheduledIso: string | null = null;
    if (status === "scheduled") {
      scheduledIso = isoFromLocalInput(scheduledAtLocal);
      if (!scheduledIso) {
        toast({
          title: "Scheduled time required",
          description: "Pick a date and time when status is Scheduled.",
          variant: "destructive",
        });
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: "PATCH",
        headers: await getAdminAuthHeaders(),
        body: JSON.stringify({
          title: title.trim(),
          imageUrl: imageUrl || null,
          emailBody,
          status,
          allowlistPatterns: parsePatternLines(allowText),
          blocklistPatterns: parsePatternLines(blockText),
          scheduledAt: scheduledIso,
          parentCampaignId: followUpEnabled ? parentCampaignId : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Save failed");
      }
      toast({ title: "Saved" });
      router.push("/admin/campaigns");
    } catch (err) {
      toast({
        title: "Could not save",
        description: err instanceof Error ? err.message : "Error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const sendCampaignNow = async () => {
    if (!canSendNow) return;
    if (
      !confirm(
        "Send this campaign now via Gmail to everyone in the audience (from your last saved settings)? Save the form first if you changed copy, image, or filters."
      )
    ) {
      return;
    }
    setSendingNow(true);
    try {
      const res = await fetch(`/api/admin/campaigns/${id}/send`, {
        method: "POST",
        headers: await getAdminAuthHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Send failed");
      }
      toast({
        title: "Campaign sent",
        description: `Delivered to ${data.recipientCount ?? 0} recipient(s).`,
      });
      setStatus("sent");
      router.push("/admin/campaigns");
    } catch (e) {
      toast({
        title: "Send failed",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    } finally {
      setSendingNow(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto flex items-center gap-2 px-4 py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/admin/campaigns">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>

      <h1 className="mb-6 text-2xl font-bold">Edit campaign</h1>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <CampaignHeroUpload
          imageUrl={imageUrl}
          onImageUrlChange={setImageUrl}
          disabled={saving}
        />
        <div>
          <Label htmlFor="emailBody">Email copy</Label>
          <Textarea
            id="emailBody"
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            rows={12}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={setStatus}
            disabled={status === "sending"}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {status === "sending" && (
                <SelectItem value="sending">Sending (in progress)</SelectItem>
              )}
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            <strong>Send campaign now</strong> (below) pushes mail immediately from
            draft or scheduled. <strong>Scheduled</strong> is only needed if you
            use an external cron hitting{" "}
            <code className="text-[10px]">/api/cron/process-email-campaigns</code>.
          </p>
        </div>

        <CampaignAudienceSettings
          allowText={allowText}
          blockText={blockText}
          onAllowTextChange={setAllowText}
          onBlockTextChange={setBlockText}
          followUpEnabled={followUpEnabled}
          onFollowUpEnabledChange={setFollowUpEnabled}
          parentCampaignId={parentCampaignId}
          onParentCampaignIdChange={setParentCampaignId}
          parentOptions={parentOptions}
          scheduledAtLocal={scheduledAtLocal}
          onScheduledAtLocalChange={setScheduledAtLocal}
          disabled={saving}
          previewLoading={previewLoading}
          preview={preview}
          onPreview={() => void runPreview()}
        />

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h2 className="text-sm font-semibold">Send now</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Sends immediately through Gmail using the{" "}
            <strong>last saved</strong> title, image, body, and audience filters.
            Click <strong>Save</strong> first if you edited anything. Recipients see
            From: <strong>MOTARRO Supplies</strong> &lt;motarrodotcoza@gmail.com&gt; by
            default — use Vercel env{" "}
            <code className="text-[10px]">CAMPAIGN_GMAIL_USER</code> +{" "}
            <code className="text-[10px]">CAMPAIGN_GMAIL_APP_PASSWORD</code> for
            that inbox if it differs from your invoice Gmail login.
          </p>
          <Button
            type="button"
            className="mt-3"
            disabled={!canSendNow || sendingNow || saving || loading}
            onClick={() => void sendCampaignNow()}
          >
            {sendingNow ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Send campaign now
          </Button>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save"
            )}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/campaigns">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
