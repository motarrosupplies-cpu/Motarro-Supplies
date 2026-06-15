"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getAdminAccessToken, getAdminAuthHeaders } from "@/lib/auth/adminFetch";
import type { GeneratedProductContent } from "@/lib/xai/types";

export type AiProductContext = {
  name: string;
  category?: string | null;
  subcategory?: string | null;
  price?: number | null;
  sku?: string | null;
  colors?: string[];
  sizes?: string[];
  existingDescription?: string | null;
};

interface AiProductContentPanelProps {
  context: AiProductContext;
  onApply: (content: GeneratedProductContent) => void;
}

export function AiProductContentPanel({
  context,
  onApply,
}: AiProductContentPanelProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<GeneratedProductContent | null>(null);

  async function handleGenerate() {
    if (!context.name?.trim()) {
      toast({
        title: "Product name required",
        description: "Enter a product name before generating AI content.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const accessToken = await getAdminAccessToken();
      if (!accessToken) {
        throw new Error("Admin session missing. Refresh the page or sign in again.");
      }

      const response = await fetch("/api/admin/ai/product-content", {
        method: "POST",
        headers: await getAdminAuthHeaders(),
        body: JSON.stringify({ ...context, accessToken }),
      });
      const data = await response.json();
      if (!response.ok) {
        const detail = [
          data.code ? `code: ${data.code}` : null,
          data.error || "Request failed",
        ]
          .filter(Boolean)
          .join(" — ");

        if (data.code === "auth") {
          throw new Error(detail || "Session expired. Refresh the page or sign in again.");
        }
        if (data.code === "xai") {
          throw new Error(
            detail ||
              "xAI request failed. Confirm XAI_API_KEY in Vercel and redeploy."
          );
        }
        throw new Error(detail || "Failed to generate content");
      }
      setPreview(data.content);
      toast({
        title: "Content generated",
        description: "Review the draft below, then apply it to the form.",
      });
    } catch (error) {
      toast({
        title: "AI generation failed",
        description:
          error instanceof Error ? error.message : "Could not generate content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">AI content assistant</p>
          <p className="text-xs text-muted-foreground">
            Generate description, SEO fields, and FAQs with Grok.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generate
        </Button>
      </div>

      {preview && (
        <div className="space-y-3 rounded-md border bg-background p-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">SEO title</p>
            <p className="text-sm">{preview.seoTitle}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">SEO description</p>
            <p className="text-sm">{preview.seoDescription}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Description preview</p>
            <p className="text-sm line-clamp-4 whitespace-pre-wrap">{preview.description}</p>
          </div>
          {preview.faqs.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">FAQs</p>
              <ul className="text-sm space-y-1">
                {preview.faqs.map((faq) => (
                  <li key={faq.question}>
                    <span className="font-medium">{faq.question}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-1">
                Copy FAQs into product-faqs.json manually — they are not saved on the product record.
              </p>
            </div>
          )}
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onApply(preview);
              toast({
                title: "Applied to form",
                description: "Review the fields before saving the product.",
              });
            }}
          >
            Apply to form
          </Button>
        </div>
      )}
    </div>
  );
}
