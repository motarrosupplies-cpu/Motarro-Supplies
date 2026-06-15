"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageCircle, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getAdminAccessToken, getAdminAuthHeaders } from "@/lib/auth/adminFetch";
import { supabase } from "@/lib/supabaseClient";
import type { QualifiedLead } from "@/lib/xai/types";

type AiHealthState = {
  authOk: boolean;
  email?: string;
  xaiConfigured?: boolean;
  xaiOk?: boolean;
  model?: string;
  fingerprint?: string | null;
  redactedApiKey?: string;
  acls?: string[];
  error?: string;
};

export default function AdminLeadQualifierPage() {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [testingHealth, setTestingHealth] = useState(false);
  const [clientEmail, setClientEmail] = useState<string | null>(null);
  const [health, setHealth] = useState<AiHealthState | null>(null);
  const [lead, setLead] = useState<QualifiedLead | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data: { user } }) => {
      setClientEmail(user?.email ?? null);
    });
  }, []);

  async function runHealthCheck() {
    setTestingHealth(true);
    try {
      const accessToken = await getAdminAccessToken();
      if (!accessToken) {
        setHealth({
          authOk: false,
          error: "No admin session token. Sign in again at /admin/login.",
        });
        return;
      }

      const response = await fetch("/api/admin/ai/health", {
        method: "POST",
        headers: await getAdminAuthHeaders(),
        body: JSON.stringify({ accessToken }),
      });
      const data = await response.json();

      if (!response.ok) {
        setHealth({
          authOk: false,
          email: clientEmail ?? undefined,
          xaiConfigured: data.xai?.configured,
          model: data.xai?.model,
          error: data.auth?.error || data.error || "Admin auth failed",
        });
        return;
      }

      setHealth({
        authOk: true,
        email: data.auth?.email,
        xaiConfigured: data.xai?.configured,
        xaiOk: data.xai?.ok,
        model: data.xai?.model,
        fingerprint: data.xai?.fingerprint,
        redactedApiKey: data.xai?.keyInfo?.redactedApiKey,
        acls: data.xai?.keyInfo?.acls,
        error: data.xai?.ok ? undefined : data.xai?.error,
      });
    } catch (error) {
      setHealth({
        authOk: false,
        email: clientEmail ?? undefined,
        error: error instanceof Error ? error.message : "Health check failed",
      });
    } finally {
      setTestingHealth(false);
    }
  }

  async function handleAnalyse() {
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Paste a customer WhatsApp message first.",
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

      const response = await fetch("/api/admin/ai/qualify-lead", {
        method: "POST",
        headers: await getAdminAuthHeaders(),
        body: JSON.stringify({ message, accessToken }),
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
        throw new Error(detail || "Failed to analyse lead");
      }
      setLead(data.lead);
      setWhatsappUrl(data.whatsappUrl);
    } catch (error) {
      toast({
        title: "Lead analysis failed",
        description:
          error instanceof Error ? error.message : "Could not analyse message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lead qualifier</h1>
        <p className="text-muted-foreground">
          Paste a WhatsApp enquiry and get a structured summary with suggested
          products and a reply draft.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Run this first if Analyse lead fails. It checks admin auth and your xAI API key on the server.
          </p>
          <p>
            <span className="font-medium">Browser session:</span>{" "}
            {clientEmail || "Not signed in"}
          </p>
          {health && (
            <div className="rounded-md border bg-muted/40 p-3 space-y-1">
              <p>
                <span className="font-medium">Admin auth:</span>{" "}
                {health.authOk ? "OK" : "Failed"}
                {health.email ? ` (${health.email})` : ""}
              </p>
              <p>
                <span className="font-medium">XAI_API_KEY on server:</span>{" "}
                {health.xaiConfigured ? "Present" : "Missing — add in Vercel and redeploy"}
              </p>
              {health.model && (
                <p>
                  <span className="font-medium">Model:</span> {health.model}
                </p>
              )}
              {health.fingerprint && (
                <p>
                  <span className="font-medium">Key in Vercel:</span>{" "}
                  {health.fingerprint}
                </p>
              )}
              {health.redactedApiKey && (
                <p>
                  <span className="font-medium">Key xAI sees:</span>{" "}
                  {health.redactedApiKey}
                </p>
              )}
              {health.acls && health.acls.length > 0 && (
                <p>
                  <span className="font-medium">ACLs:</span> {health.acls.join(", ")}
                </p>
              )}
              {health.xaiConfigured && (
                <p>
                  <span className="font-medium">xAI test call:</span>{" "}
                  {health.xaiOk ? "OK" : "Failed"}
                </p>
              )}
              {health.error && (
                <div className="space-y-2">
                  <p className="text-destructive">{health.error}</p>
                  {health.error.includes("403") || health.error.includes("permission") || health.error.includes("Forbidden") ? (
                    <p className="text-muted-foreground">
                      If permissions already show &quot;All models/endpoints&quot;, the usual fix is:
                      click <strong>Update API key</strong> in console.x.ai, create a <strong>new</strong> key,
                      paste it into Vercel <code>XAI_API_KEY</code>, remove <code>XAI_MODEL</code> or set it to{" "}
                      <code>grok-4.3</code>, then redeploy. Compare &quot;Key in Vercel&quot; with &quot;Key xAI sees&quot; above —
                      they should match the same key.
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          )}
          <Button variant="outline" onClick={runHealthCheck} disabled={testingHealth}>
            {testingHealth ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Test AI setup
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            rows={8}
            placeholder="Paste the customer's WhatsApp message here..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <Button onClick={handleAnalyse} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Analyse lead
          </Button>
        </CardContent>
      </Card>

      {lead && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lead summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge>{lead.intent}</Badge>
                <Badge variant="outline">{lead.urgency} urgency</Badge>
                {lead.branding && <Badge variant="secondary">Branding</Badge>}
              </div>
              <p>
                <span className="font-medium">Products:</span>{" "}
                {lead.products.length > 0 ? lead.products.join(", ") : "Not specified"}
              </p>
              <p>
                <span className="font-medium">Quantity:</span>{" "}
                {lead.quantity ?? "Not specified"}
              </p>
              <p>
                <span className="font-medium">Deadline:</span>{" "}
                {lead.deadline || "Not specified"}
              </p>
              <p>
                <span className="font-medium">Location:</span>{" "}
                {lead.location || "Not specified"}
              </p>
              <p>
                <span className="font-medium">Budget hint:</span>{" "}
                {lead.budgetHint || "Not specified"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Suggested reply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea rows={10} value={lead.suggestedReply} readOnly />
              {whatsappUrl && (
                <Button asChild>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                    Open in WhatsApp
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Suggested products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lead.suggestedProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No close catalog matches found.
                </p>
              ) : (
                lead.suggestedProducts.map((product) => (
                  <div
                    key={product.href}
                    className="rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.reason}</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={product.href.replace("https://www.motarro.co.za", "")}>
                        View product
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
