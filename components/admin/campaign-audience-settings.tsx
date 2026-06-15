"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parsePatternLines } from "@/lib/campaignEmailFilters";
import { Loader2, Users } from "lucide-react";

export interface ParentOption {
  id: string;
  title: string;
}

interface CampaignAudienceSettingsProps {
  allowText: string;
  blockText: string;
  onAllowTextChange: (v: string) => void;
  onBlockTextChange: (v: string) => void;
  followUpEnabled: boolean;
  onFollowUpEnabledChange: (v: boolean) => void;
  parentCampaignId: string | null;
  onParentCampaignIdChange: (v: string | null) => void;
  parentOptions: ParentOption[];
  scheduledAtLocal: string;
  onScheduledAtLocalChange: (v: string) => void;
  disabled?: boolean;
  previewLoading: boolean;
  preview: {
    count: number;
    sample: string[];
    source: string;
    notice?: string;
  } | null;
  onPreview: () => void;
}

export function CampaignAudienceSettings({
  allowText,
  blockText,
  onAllowTextChange,
  onBlockTextChange,
  followUpEnabled,
  onFollowUpEnabledChange,
  parentCampaignId,
  onParentCampaignIdChange,
  parentOptions,
  scheduledAtLocal,
  onScheduledAtLocalChange,
  disabled,
  previewLoading,
  preview,
  onPreview,
}: CampaignAudienceSettingsProps) {
  return (
    <div className="space-y-6 rounded-lg border bg-card p-4">
      <div>
        <h2 className="text-lg font-semibold">Audience filters</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          One pattern per line. Matching is case-insensitive and uses substring
          checks on the full email (e.g. block <code className="text-xs">@laerskooledleen</code>).
          Leave allow list empty to include all customers (after blocks). Any line
          that is a full email (e.g. you@gmail.com) is always included as a
          recipient even if that address is not in Customers yet. Follow-ups start
          from the parent campaign&apos;s stored recipient list, then apply these
          filters again.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="allowlist">Allow list (optional)</Label>
          <Textarea
            id="allowlist"
            value={allowText}
            onChange={(e) => onAllowTextChange(e.target.value)}
            rows={5}
            placeholder={"@gmail.com\nparent@school.co.za"}
            disabled={disabled}
            className="font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blocklist">Block list</Label>
          <Textarea
            id="blocklist"
            value={blockText}
            onChange={(e) => onBlockTextChange(e.target.value)}
            rows={5}
            placeholder={"@laerskooledleen.co.za\nbounce@example.com"}
            disabled={disabled}
            className="font-mono text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-md border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Switch
            id="follow-up"
            checked={followUpEnabled}
            onCheckedChange={(c) => {
              onFollowUpEnabledChange(c);
              if (!c) onParentCampaignIdChange(null);
            }}
            disabled={disabled}
          />
          <div>
            <Label htmlFor="follow-up" className="cursor-pointer font-medium">
              Follow-up / reminder campaign
            </Label>
            <p className="text-xs text-muted-foreground">
              Target the same people as a previous sent campaign (new copy &amp;
              image).
            </p>
          </div>
        </div>
      </div>

      {followUpEnabled && (
        <div className="space-y-2">
          <Label>Parent campaign (must be sent first)</Label>
          <Select
            value={parentCampaignId ?? "__none__"}
            onValueChange={(v) =>
              onParentCampaignIdChange(v === "__none__" ? null : v)
            }
            disabled={disabled || parentOptions.length === 0}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  parentOptions.length === 0
                    ? "No sent campaigns yet"
                    : "Choose parent campaign"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {parentOptions.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="scheduled-local">Scheduled send (local time)</Label>
        <p className="text-xs text-muted-foreground">
          Optional: only if you use an external scheduler or the cron API for delayed
          sends. To send immediately, use <strong>Send campaign now</strong> on the
          edit page (draft or scheduled). Requires{" "}
          <code className="text-[10px]">GMAIL_APP_PASSWORD</code> in env.
        </p>
        <input
          id="scheduled-local"
          type="datetime-local"
          value={scheduledAtLocal}
          onChange={(e) => onScheduledAtLocalChange(e.target.value)}
          disabled={disabled}
          className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || previewLoading}
          onClick={() => onPreview()}
        >
          {previewLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Users className="mr-2 h-4 w-4" />
          )}
          Preview audience
        </Button>
        {preview && (
          <span className="text-sm text-muted-foreground">
            <strong className="text-foreground">{preview.count}</strong>{" "}
            recipient{preview.count === 1 ? "" : "s"}
            {preview.source === "follow_up_parent"
              ? " (from parent send list)"
              : " (from Customers)"}
          </span>
        )}
      </div>
      {preview?.notice && (
        <p className="text-sm text-amber-700 dark:text-amber-400">
          {preview.notice}
        </p>
      )}
      {preview && preview.sample.length > 0 && (
        <ul className="rounded-md border bg-muted/30 p-3 font-mono text-xs text-muted-foreground">
          {preview.sample.map((e) => (
            <li key={e}>{e}</li>
          ))}
          {preview.count > preview.sample.length && (
            <li className="italic">
              … and {preview.count - preview.sample.length} more
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export function patternsToText(patterns: string[]): string {
  return patterns.length ? patterns.join("\n") : "";
}

export function localInputFromIso(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function isoFromLocalInput(local: string): string | null {
  if (!local.trim()) return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/** Build JSON body for audience-preview API from UI state */
export function buildAudiencePreviewBody(
  allowText: string,
  blockText: string,
  followUpEnabled: boolean,
  parentCampaignId: string | null
) {
  return {
    allowlistPatterns: parsePatternLines(allowText),
    blocklistPatterns: parsePatternLines(blockText),
    parentCampaignId: followUpEnabled ? parentCampaignId : null,
  };
}
