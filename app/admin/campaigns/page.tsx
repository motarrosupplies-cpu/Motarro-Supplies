"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ArrowLeft, ChevronDown, Loader2, Megaphone, Plus, Trash2 } from "lucide-react";
import type { EmailCampaignDto } from "@/lib/emailCampaignMap";
import { getAdminAuthHeaders } from "@/lib/auth/adminFetch";
import { cn } from "@/lib/utils";

function statusBadgeClass(status: string) {
  switch (status) {
    case "scheduled":
      return "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100";
    case "sent":
      return "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100";
    case "cancelled":
    case "archived":
      return "border-muted-foreground/30 bg-muted text-muted-foreground";
    case "sending":
      return "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100";
    default:
      return "";
  }
}

export default function AdminCampaignsPage() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<EmailCampaignDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/campaigns", {
        cache: "no-store",
        headers: await getAdminAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load");
      }
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (e) {
      toast({
        title: "Could not load campaigns",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: "DELETE",
        headers: await getAdminAuthHeaders(),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Delete failed");
      }
      toast({ title: "Campaign removed" });
      setCampaigns((c) => c.filter((x) => x.id !== id));
    } catch (e) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              <Megaphone className="h-8 w-8" />
              Campaigns
            </h1>
            <p className="text-muted-foreground">
              Drafts, scheduling, audience filters, and follow-ups. Gmail + cron
              send is the next integration step.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/admin/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            New campaign
          </Link>
        </Button>
      </div>

      <Collapsible className="mb-8 rounded-lg border bg-card">
        <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 px-4 py-3 text-left font-medium hover:bg-muted/50">
          How statuses, scheduling &amp; follow-ups work
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t px-4 py-3 text-sm text-muted-foreground">
          <ul className="list-inside list-disc space-y-2">
            <li>
              <strong className="text-foreground">Draft</strong> — Editing
              content, hero image, allow/block patterns, and optional follow-up
              parent. Nothing is queued.
            </li>
            <li>
              <strong className="text-foreground">Send now</strong> — On the edit
              screen, use <strong>Send campaign now</strong> to deliver immediately
              from <strong>Draft</strong> or <strong>Scheduled</strong> (no cron
              required). Uses the last saved content and audience rules.
            </li>
            <li>
              <strong className="text-foreground">Scheduled</strong> — Optional: set
              a future time if you use an external scheduler calling{" "}
              <code className="text-xs">/api/cron/process-email-campaigns</code> with{" "}
              <code className="text-xs">Bearer CRON_SECRET</code>. Otherwise you can
              stay on <strong>Draft</strong> and send manually.
            </li>
            <li>
              <strong className="text-foreground">Sending</strong> — Reserved
              for the dispatcher while messages are going out (optional
              intermediate state).
            </li>
            <li>
              <strong className="text-foreground">Sent</strong> — Completed send.
              Stored recipient emails are what a <strong>follow-up</strong> campaign
              uses so the reminder hits the same people (your new allow/block
              lines still apply on top of that list).
            </li>
            <li>
              <strong className="text-foreground">Cancelled</strong> — Scheduled
              send was abandoned before it ran.
            </li>
            <li>
              <strong className="text-foreground">Archived</strong> — Keeps the
              record but out of the main workflow.
            </li>
          </ul>
          <p className="mt-3 text-xs">
            <strong className="text-foreground">Allow list</strong> (optional):
            if any lines are set, only addresses containing one of those
            substrings (case-insensitive) stay in the audience.{" "}
            <strong className="text-foreground">Block list</strong>: lines
            remove matches (e.g. <code className="text-xs">@laerskooledleen</code>
            ).
          </p>
        </CollapsibleContent>
      </Collapsible>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading…
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No campaigns yet.</p>
            <Button asChild className="mt-4">
              <Link href="/admin/campaigns/new">Create your first draft</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => (
            <Card key={c.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                <div>
                  <CardTitle className="text-lg">{c.title}</CardTitle>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn(statusBadgeClass(c.status))}
                    >
                      {c.status}
                    </Badge>
                    {c.parentCampaignId && (
                      <Badge variant="outline">Follow-up</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Updated {new Date(c.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  {c.status === "scheduled" && c.scheduledAt && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Sends after{" "}
                      <strong className="text-foreground">
                        {new Date(c.scheduledAt).toLocaleString()}
                      </strong>{" "}
                      (local display)
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/campaigns/${c.id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deletingId === c.id}
                    onClick={() => void handleDelete(c.id)}
                  >
                    {deletingId === c.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {c.imageUrl && (
                  <div className="relative mb-3 h-28 w-full max-w-sm overflow-hidden rounded-md border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.imageUrl}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                {(c.allowlistPatterns?.length || c.blocklistPatterns?.length) ? (
                  <p className="mb-2 text-xs text-muted-foreground">
                    {c.allowlistPatterns?.length ? (
                      <span>
                        Allow: {c.allowlistPatterns.length} pattern(s).{" "}
                      </span>
                    ) : null}
                    {c.blocklistPatterns?.length ? (
                      <span>
                        Block: {c.blocklistPatterns.length} pattern(s).
                      </span>
                    ) : null}
                  </p>
                ) : null}
                <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
                  {c.emailBody || "(No body yet)"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
