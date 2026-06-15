import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, sanitizeMailField } from "@/lib/email-utils";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { checkRateLimit, clientIpFromRequest } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabaseClient";

// Generate a unique discount code
function generateDiscountCode(): string {
  const prefix = "WELCOME10";
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${random}`;
}

// Function to send discount code email
async function sendDiscountEmail(email: string, discountCode: string) {
  if (!process.env.GMAIL_APP_PASSWORD) {
    console.warn('GMAIL_APP_PASSWORD not configured, skipping email send');
    return;
  }

  try {
    const nodemailer = (await import("nodemailer")).default;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "dartonstaker@gmail.com", // Your Gmail account
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .discount-box { background: white; border: 3px dashed #9333ea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .code { font-size: 32px; font-weight: bold; color: #9333ea; letter-spacing: 3px; margin: 10px 0; }
          .button { display: inline-block; background: #9333ea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to MOTARRO Supplies!</h1>
            <p>Thank you for subscribing to our newsletter</p>
          </div>
          <div class="content">
            <h2>Your Exclusive Discount Code</h2>
            <p>As a thank you for joining our newsletter, here's your special discount code:</p>
            
            <div class="discount-box">
              <p style="margin: 0; font-size: 18px; color: #666;">Use code:</p>
              <div class="code">${discountCode}</div>
              <p style="margin: 0; font-size: 24px; color: #9333ea; font-weight: bold;">10% OFF</p>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Valid for 30 days</p>
            </div>

            <p>Use this code at checkout to save 10% on your next order of custom printed apparel!</p>
            
            <div style="text-align: center;">
              <a href="https://www.motarro.co.za/custom-printing" class="button">Start Shopping Now</a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              <strong>Terms & Conditions:</strong><br>
              • Valid for 30 days from date of issue<br>
              • Cannot be combined with other offers<br>
              • Applies to custom printing orders only<br>
              • One use per customer
            </p>
          </div>
          <div class="footer">
            <p>MOTARRO Supplies — Custom Printing in Kempton Park & Johannesburg</p>
            <p>Questions? Reply to this email or WhatsApp us at +27 69 622 8848</p>
            <p><a href="https://www.motarro.co.za/unsubscribe?email=${encodeURIComponent(email)}" style="color: #9333ea;">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
Welcome to MOTARRO Supplies!

Thank you for subscribing to our newsletter!

Your Exclusive Discount Code: ${discountCode}
Get 10% OFF your next order!

Valid for 30 days. Use this code at checkout to save 10% on your next order of custom printed apparel.

Start shopping now: https://www.motarro.co.za/custom-printing

Terms & Conditions:
- Valid for 30 days from date of issue
- Cannot be combined with other offers
- Applies to custom printing orders only
- One use per customer

Questions? Reply to this email or WhatsApp us at +27 69 622 8848

Unsubscribe: https://www.motarro.co.za/unsubscribe?email=${encodeURIComponent(email)}
    `;

    await transporter.sendMail({
      from: '"MOTARRO Supplies" <dartonstaker@gmail.com>',
      to: email,
      replyTo: "motarrodotcoza@gmail.com",
      subject: "🎉 Welcome! Your 10% Discount Code Inside",
      text: emailText,
      html: emailHtml
    });

    console.log(`Discount code email sent to ${email}`);
  } catch (error) {
    console.error('Error sending discount email:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = clientIpFromRequest(request);
    const rate = checkRateLimit(`newsletter:${ip}`, 10, 60 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSec) },
        }
      );
    }

    const {
      email,
      source = "popup",
      "g-recaptcha-response": recaptchaToken,
      "website-url": honeypot,
    } = await request.json();

    if (honeypot && String(honeypot).trim() !== "") {
      return NextResponse.json({ success: true, message: "Subscribed!" });
    }

    const safeEmail = sanitizeMailField(String(email || ""), 254);
    if (!isValidEmail(safeEmail)) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    const recaptchaResult = await verifyRecaptcha(String(recaptchaToken || ""));
    if (!recaptchaResult.success) {
      return NextResponse.json(
        { error: "Verification failed. Please refresh and try again." },
        { status: 403 }
      );
    }

    // Use admin client to bypass RLS for server-side operations
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, email, discount_code, email_sent')
      .eq('email', safeEmail.toLowerCase())
      .single();

    // If exists and already sent email, return success (don't send duplicate)
    if (existing && existing.email_sent) {
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed!',
        alreadySubscribed: true
      });
    }

    // If exists but email not sent, resend the discount code
    if (existing && !existing.email_sent) {
      // Send email with existing code
      await sendDiscountEmail(existing.email, existing.discount_code);
      
      // Update email_sent status
      await supabaseAdmin
        .from('newsletter_subscribers')
        .update({
          email_sent: true,
          email_sent_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      return NextResponse.json({
        success: true,
        message: 'Discount code sent!',
        resend: true
      });
    }

    // Generate new discount code
    const discountCode = generateDiscountCode();
    
    // Set expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Insert new subscriber
    const { data: subscriber, error: insertError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .insert({
        email: safeEmail.toLowerCase(),
        discount_code: discountCode,
        discount_percent: 10,
        code_expires_at: expiresAt.toISOString(),
        source: source,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting subscriber:', insertError);
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      );
    }

    // Send discount code email
    await sendDiscountEmail(subscriber.email, subscriber.discount_code);

    // Update email_sent status
    await supabaseAdmin
      .from('newsletter_subscribers')
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString()
      })
      .eq('id', subscriber.id);

    return NextResponse.json({
      success: true,
      message: 'Discount code sent to your email!'
    });

  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    );
  }
}

