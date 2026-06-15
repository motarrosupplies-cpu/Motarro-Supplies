import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/verifyAdminApi";
import { supabaseAdmin } from "@/lib/supabaseClient";
import {
  CAMPAIGN_HERO_ALLOWED_MIME_TYPES,
  CAMPAIGN_HERO_MAX_BYTES,
} from "@/lib/campaignHeroImage";

const BUCKET = "product-images";
const FOLDER = "campaign-heroes";

const ALLOWED_SET = new Set<string>(CAMPAIGN_HERO_ALLOWED_MIME_TYPES);

function extForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server misconfigured: storage unavailable." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided. Use form field "file".' },
        { status: 400 }
      );
    }

    if (file.size > CAMPAIGN_HERO_MAX_BYTES) {
      return NextResponse.json(
        {
          error: `Image is ${(file.size / 1024).toFixed(0)} KB. Max ${CAMPAIGN_HERO_MAX_BYTES / 1024} KB for email-friendly campaigns — compress or resize and try again.`,
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_SET.has(file.type)) {
      return NextResponse.json(
        {
          error:
            "Use JPG, PNG, or GIF only. WebP and other formats are not reliable in email clients.",
        },
        { status: 400 }
      );
    }

    const ext = extForMime(file.type);
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const filePath = `${FOLDER}/${fileName}`;

    const bytes = await file.arrayBuffer();
    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, bytes, {
        cacheControl: "2592000",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error("[campaign hero upload]", error);
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    return NextResponse.json({
      url: urlData.publicUrl,
      size: file.size,
    });
  } catch (err) {
    console.error("[campaign hero upload]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
