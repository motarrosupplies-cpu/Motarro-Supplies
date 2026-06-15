"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  CAMPAIGN_HERO_ACCEPT_ATTR,
  CAMPAIGN_HERO_MAX_BYTES,
  CAMPAIGN_HERO_ALLOWED_MIME_TYPES,
  campaignHeroConstraintsHint,
} from "@/lib/campaignHeroImage";
import { getAdminAuthHeaders } from "@/lib/auth/adminFetch";
import { useToast } from "@/components/ui/use-toast";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

const ALLOWED = new Set<string>(CAMPAIGN_HERO_ALLOWED_MIME_TYPES);

interface CampaignHeroUploadProps {
  imageUrl: string | null;
  onImageUrlChange: (url: string | null) => void;
  disabled?: boolean;
}

export function CampaignHeroUpload({
  imageUrl,
  onImageUrlChange,
  disabled,
}: CampaignHeroUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const validateLocal = (file: File): string | null => {
    if (file.size > CAMPAIGN_HERO_MAX_BYTES) {
      return `File is too large (max ${CAMPAIGN_HERO_MAX_BYTES / 1024} KB for email).`;
    }
    if (!ALLOWED.has(file.type)) {
      return "Use JPG, PNG, or GIF only (best email compatibility).";
    }
    return null;
  };

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const localErr = validateLocal(file);
    if (localErr) {
      toast({ title: localErr, variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const authHeaders = await getAdminAuthHeaders();
      const uploadHeaders: Record<string, string> = {};
      if (authHeaders.Authorization) {
        uploadHeaders.Authorization = authHeaders.Authorization;
      }
      const res = await fetch("/api/admin/campaigns/upload-image", {
        method: "POST",
        headers: uploadHeaders,
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }
      if (typeof data.url !== "string" || !data.url) {
        throw new Error("Invalid response from server");
      }
      onImageUrlChange(data.url);
      toast({ title: "Image uploaded" });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Error",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="campaign-hero-file">Hero image</Label>
      <p className="text-xs text-muted-foreground">
        {campaignHeroConstraintsHint()}
      </p>
      <input
        ref={inputRef}
        id="campaign-hero-file"
        type="file"
        accept={CAMPAIGN_HERO_ACCEPT_ATTR}
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(e) => void onPick(e)}
      />
      {imageUrl ? (
        <div className="space-y-3 rounded-md border p-3">
          <div className="relative mx-auto flex max-h-48 w-full max-w-md items-center justify-center overflow-hidden rounded-md border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Campaign hero preview"
              className="max-h-48 w-full object-contain"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="mr-2 h-4 w-4" />
              )}
              Replace image
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              disabled={disabled || uploading}
              onClick={() => onImageUrlChange(null)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <ImagePlus className="mr-2 h-4 w-4" />
              Upload hero image
            </>
          )}
        </Button>
      )}
    </div>
  );
}
