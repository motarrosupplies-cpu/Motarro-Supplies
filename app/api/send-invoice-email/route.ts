import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { verifyAdminRequest } from "@/lib/auth/verifyAdminApi";
import { isValidEmail, sanitizeMailField } from "@/lib/email-utils";

const MAX_PDF_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { to, subject, message, pdfBase64, invoiceNumber } =
      await request.json();

    if (!to || !subject || !message || !pdfBase64) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, message, pdfBase64" },
        { status: 400 }
      );
    }

    const recipient = sanitizeMailField(String(to), 254);
    const safeSubject = sanitizeMailField(String(subject), 200);
    const safeMessage = sanitizeMailField(String(message), 5000);
    const safeInvoiceNumber = sanitizeMailField(
      String(invoiceNumber || "invoice"),
      64
    );

    if (!isValidEmail(recipient)) {
      return NextResponse.json(
        { error: "Invalid recipient email address" },
        { status: 400 }
      );
    }

    if (!process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json(
        { error: "Gmail SMTP not configured" },
        { status: 500 }
      );
    }

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = Buffer.from(String(pdfBase64), "base64");
    } catch {
      return NextResponse.json(
        { error: "Invalid PDF attachment" },
        { status: 400 }
      );
    }

    if (!pdfBuffer.length || pdfBuffer.length > MAX_PDF_BYTES) {
      return NextResponse.json(
        { error: "PDF attachment is missing or too large" },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "dartonstaker@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const htmlEmail = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${safeSubject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; }
          .message { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #8B5CF6; }
          .footer { text-align: center; margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 6px; font-size: 12px; color: #666; }
          .invoice-info { background: #e8f4fd; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #3B82F6; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MOTARRO Supplies™</h1>
          <p>Your Invoice is Ready</p>
        </div>
        <div class="content">
          <div class="invoice-info">
            <strong>Invoice Number:</strong> ${safeInvoiceNumber}<br>
            <strong>Sent:</strong> ${new Date().toLocaleDateString("en-GB")}
          </div>
          <div class="message">
            ${safeMessage.replace(/\n/g, "<br>")}
          </div>
          <p style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <strong>📎 Invoice PDF Attached:</strong> Please find your invoice attached to this email.
          </p>
          <div class="footer">
            <p><strong>MOTARRO Supplies™</strong> - Custom Apparel &amp; Printing Solutions</p>
            <p>South Africa | <a href="mailto:motarrodotcoza@gmail.com">motarrodotcoza@gmail.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: '"MOTARRO Supplies™" <dartonstaker@gmail.com>',
      to: recipient,
      replyTo: "motarrodotcoza@gmail.com",
      subject: safeSubject,
      html: htmlEmail,
      attachments: [
        {
          filename: `invoice-${safeInvoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    console.log(`Invoice email sent by ${auth.email} to ${recipient}`);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Error sending invoice email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
