import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/verifyAdminApi";
import {
  clearTitanJetMarkupCache,
  getTitanJetMarkupRules,
} from "@/lib/titan-jet/markup";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const rules = await getTitanJetMarkupRules();
  return NextResponse.json({ rules });
}

export async function PUT(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  }

  const body = await request.json();
  const rules = Array.isArray(body.rules) ? body.rules : [];

  for (const rule of rules) {
    const markupPercent = Number(rule.markup_percent);
    if (!Number.isFinite(markupPercent) || markupPercent < 0) {
      return NextResponse.json({ error: "Invalid markup percent" }, { status: 400 });
    }

    const ruleType = String(rule.rule_type || "").trim();
    if (!["global", "category", "brand"].includes(ruleType)) {
      return NextResponse.json({ error: "Invalid rule type" }, { status: 400 });
    }

    const ruleValue =
      ruleType === "global"
        ? null
        : String(rule.rule_value || "").trim() || null;

    if (ruleType !== "global" && !ruleValue) {
      return NextResponse.json(
        { error: "Category and brand rules require a value" },
        { status: 400 }
      );
    }

    const payload = {
      rule_type: ruleType,
      rule_value: ruleValue,
      markup_percent: markupPercent,
      updated_at: new Date().toISOString(),
    };

    if (rule.id) {
      const { data, error } = await supabaseAdmin
        .from("titan_jet_markup_rules")
        .update(payload)
        .eq("id", rule.id)
        .select("id")
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json(
          { error: "Markup rule not found. Refresh the page and try again." },
          { status: 404 }
        );
      }

      continue;
    }

    const { error } = await supabaseAdmin.from("titan_jet_markup_rules").insert(payload);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  clearTitanJetMarkupCache();
  const updated = await getTitanJetMarkupRules();
  return NextResponse.json({ rules: updated });
}

export async function DELETE(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Rule id is required" }, { status: 400 });
  }

  const { data: existing } = await supabaseAdmin
    .from("titan_jet_markup_rules")
    .select("rule_type")
    .eq("id", id)
    .maybeSingle();

  if (existing?.rule_type === "global") {
    return NextResponse.json(
      { error: "The global markup rule cannot be deleted" },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("titan_jet_markup_rules")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  clearTitanJetMarkupCache();
  return NextResponse.json({ success: true });
}
