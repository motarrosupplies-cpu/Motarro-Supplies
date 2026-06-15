"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { CampaignHeroUpload } from "@/components/admin/campaign-hero-upload";
import {
  CampaignAudienceSettings,
  buildAudiencePreviewBody,
} from "@/components/admin/campaign-audience-settings";
import type { ParentOption } from "@/components/admin/campaign-audience-settings";
import type { EmailCampaignDto } from "@/lib/emailCampaignMap";
import { getAdminAuthHeaders } from "@/lib/auth/adminFetch";
import { parsePatternLines } from "@/lib/campaignEmailFilters";

export default function NewCampaignPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [emailBody, setEmailBody] = useState("");
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/campaigns", {
          cache: "no-store",
          headers: await getAdminAuthHeaders(),
        });
        const data = await res.json();
        if (!res.ok || !Array.isArray(data) || cancelled) return;
        const sent = (data as EmailCampaignDto[])
          .filter((c) => c.status === "sent")
          .map((c) => ({ id: c.id, title: c.title }));
        setParentOptions(sent);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
      toast({
        title: "Title required",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: await getAdminAuthHeaders(),
        body: JSON.stringify({
          title: title.trim(),
          imageUrl: imageUrl || null,
          emailBody,
          status: "draft",
          allowlistPatterns: parsePatternLines(allowText),
          blocklistPatterns: parsePatternLines(blockText),
          parentCampaignId: followUpEnabled ? parentCampaignId : null,
          scheduledAt: null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Save failed");
      }
      toast({ title: "Campaign saved" });
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

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/admin/campaigns">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>

      <h1 className="mb-2 text-2xl font-bold">New campaign draft</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        New campaigns start as drafts. After saving, open the campaign and use{" "}
        <strong>Send campaign now</strong> to deliver via Gmail, or set optional
        filters and a scheduled time if you use an external cron later.
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <div>
          <Label htmlFor="title">Title (internal)</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. April school hoodies promo"
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
            placeholder="Write the email content here. HTML can be added later when we wire the sender."
          />
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

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save draft"
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