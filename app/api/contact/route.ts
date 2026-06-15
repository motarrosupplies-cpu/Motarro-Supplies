import { NextResponse } from "next/server";
import { normalizeGmailAppPassword } from "@/lib/campaignMailConfig";
import { isValidEmail, sanitizeMailField } from "@/lib/email-utils";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { checkRateLimit, clientIpFromRequest } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = clientIpFromRequest(request);
    const rate = checkRateLimit(`contact:${ip}`, 5, 60 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSec) },
        }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      message,
      "g-recaptcha-response": recaptchaToken,
      "website-url": honeypot,
    } = body;

    if (honeypot && String(honeypot).trim() !== "") {
      return NextResponse.json({ success: true });
    }

    const safeName = sanitizeMailField(String(name || ""), 120);
    const safeEmail = sanitizeMailField(String(email || ""), 254);
    const safeMessage = sanitizeMailField(String(message || ""), 5000);

    if (!safeName || !safeEmail || !safeMessage) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(safeEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    const recaptchaResult = await verifyRecaptcha(String(recaptchaToken || ""));
    if (!recaptchaResult.success) {
      return NextResponse.json(
        { success: false, error: "Verification failed. Please refresh and try again." },
        { status: 403 }
      );
    }

    const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim();
    if (!gmailPass) {
      console.error("GMAIL_APP_PASSWORD not configured");
      return NextResponse.json(
        { success: false, error: "Failed to send message" },
        { status: 500 }
      );
    }

    const nodemailer = (await import("nodemailer")).default;

    const smtpUser = (
      process.env.GMAIL_FROM || "motarrodotcoza@gmail.com"
    ).trim();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: normalizeGmailAppPassword(gmailPass),
      },
    });

    await transporter.sendMail({
      from: `"Website Contact" <${smtpUser}>`,
      to: "motarrodotcoza@gmail.com",
      replyTo: safeEmail,
      subject: "New Contact Form Submission",
      text: `Name: ${safeName}\nEmail: ${safeEmail}\nMessage: ${safeMessage}`,
      html: `<p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p><strong>Message:</strong><br/>${safeMessage.replace(/\n/g, "<br/>")}</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
