"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { getAdminAuthHeaders } from "@/lib/auth/adminFetch";
import type { TitanJetMarkupRule } from "@/lib/titan-jet/markup";
import { Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";

type DraftRule = {
  id?: string;
  rule_type: "global" | "category" | "brand";
  rule_value: string;
  markup_percent: string;
};

export default function AdminTitanJetPage() {
  const { toast } = useToast();
  const [rules, setRules] = useState<DraftRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<{
    productCount: number;
    lastSync: {
      status: string;
      product_count: number;
      finished_at: string | null;
      error_message: string | null;
    } | null;
  } | null>(null);

  async function loadRules() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/titan-jet/markup", {
        headers: await getAdminAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to load rules");
      setRules(
        (data.rules as TitanJetMarkupRule[]).map((rule) => ({
          id: rule.id,
          rule_type: rule.rule_type,
          rule_value: rule.rule_value || "",
          markup_percent: String(rule.markup_percent),
        }))
      );
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load rules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadStatus() {
    try {
      const response = await fetch("/api/admin/titan-jet/status", {
        headers: await getAdminAuthHeaders(),
      });
      const data = await response.json();
      if (response.ok) {
        setStatus({ productCount: data.productCount, lastSync: data.lastSync });
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    void loadRules();
    void loadStatus();
  }, []);

  async function saveRules() {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/titan-jet/markup", {
        method: "PUT",
        headers: await getAdminAuthHeaders(),
        body: JSON.stringify({
          rules: rules.map((rule) => ({
            id: rule.id,
            rule_type: rule.rule_type,
            rule_value: rule.rule_type === "global" ? null : rule.rule_value,
            markup_percent: Number(rule.markup_percent),
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save rules");
      setRules(
        (data.rules as TitanJetMarkupRule[]).map((rule) => ({
          id: rule.id,
          rule_type: rule.rule_type,
          rule_value: rule.rule_value || "",
          markup_percent: String(rule.markup_percent),
        }))
      );
      toast({ title: "Saved", description: "Titan Jet markup rules updated." });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save rules",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function syncFeed() {
    setSyncing(true);
    try {
      const response = await fetch("/api/admin/titan-jet/sync", {
        method: "POST",
        headers: await getAdminAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Sync failed");
      toast({
        title: "Sync complete",
        description: `${data.productCount} products synced. View them at /sublimation-supplies`,
      });
      await loadStatus();
    } catch (error) {
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "Could not sync feed",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  }

  function addRule() {
    setRules((current) => [
      ...current,
      { rule_type: "category", rule_value: "", markup_percent: "15" },
    ]);
  }

  function updateRule(index: number, patch: Partial<DraftRule>) {
    setRules((current) =>
      current.map((rule, ruleIndex) =>
        ruleIndex === index ? { ...rule, ...patch } : rule
      )
    );
  }

  async function deleteRule(index: number) {
    const rule = rules[index];
    if (rule.id) {
      const response = await fetch(`/api/admin/titan-jet/markup?id=${rule.id}`, {
        method: "DELETE",
        headers: await getAdminAuthHeaders(),
      });
      if (!response.ok) {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to delete rule",
          variant: "destructive",
        });
        return;
      }
    }
    setRules((current) => current.filter((_, ruleIndex) => ruleIndex !== index));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Titan Jet Catalog</h1>
          <p className="text-muted-foreground">
            Sync WooCommerce products from titanjet.co.za and manage markup rules.
          </p>
        </div>
        <Button onClick={syncFeed} disabled={syncing}>
          {syncing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Sync feed now
        </Button>
      </div>

      {status && (
        <Card>
          <CardHeader>
            <CardTitle>Catalog status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>{status.productCount}</strong> active products in Supabase
            </p>
            {status.lastSync ? (
              <p className="text-muted-foreground">
                Last sync: <strong>{status.lastSync.status}</strong>
                {status.lastSync.finished_at
                  ? ` at ${new Date(status.lastSync.finished_at).toLocaleString()}`
                  : ""}
                {status.lastSync.error_message
                  ? ` — ${status.lastSync.error_message}`
                  : ""}
              </p>
            ) : (
              <p className="text-muted-foreground">No sync runs recorded yet.</p>
            )}
            <p>
              Storefront:{" "}
              <a href="/sublimation-supplies" className="text-primary underline">
                www.motarro.co.za/sublimation-supplies
              </a>
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Markup rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Priority: brand rule, then category rule, then global rule, then
            `TITAN_JET_PRICE_MARKUP_PERCENT` env fallback.
          </p>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading rules...
            </div>
          ) : (
            <>
              {rules.map((rule, index) => (
                <div
                  key={rule.id || `draft-${index}`}
                  className="grid gap-3 md:grid-cols-[160px_1fr_140px_auto] items-end border rounded-xl p-4"
                >
                  <div className="space-y-2">
                    <Label>Rule type</Label>
                    <Select
                      value={rule.rule_type}
                      onValueChange={(value: DraftRule["rule_type"]) =>
                        updateRule(index, {
                          rule_type: value,
                          rule_value: value === "global" ? "" : rule.rule_value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">Global</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="brand">Brand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input
                      value={rule.rule_value}
                      disabled={rule.rule_type === "global"}
                      placeholder={
                        rule.rule_type === "category"
                          ? "e.g. 4. Heat Transfer Products"
                          : rule.rule_type === "brand"
                            ? "e.g. Coool Sublimation"
                            : "All products"
                      }
                      onChange={(event) =>
                        updateRule(index, { rule_value: event.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Markup %</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={rule.markup_percent}
                      onChange={(event) =>
                        updateRule(index, { markup_percent: event.target.value })
                      }
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => void deleteRule(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={addRule}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add rule
                </Button>
                <Button type="button" onClick={saveRules} disabled={saving}>
                  {saving ? "Saving..." : "Save rules"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled sync</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Configure an external cron to call:</p>
          <code className="block rounded bg-muted p-3 text-xs">
            GET /api/cron/sync-titan-jet-feed
            <br />
            Authorization: Bearer CRON_SECRET
          </code>
          <p>
            Run `supabase-titan-jet-schema.sql` in Supabase before the first sync.
            Products are fetched from the public WooCommerce Store API — no Titan Jet
            credentials required.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
