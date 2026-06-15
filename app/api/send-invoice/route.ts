import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { to, subject, pdfBase64 } = await request.json();
    
    // Validate required fields
    if (!to || !subject || !pdfBase64) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, pdfBase64' },
        { status: 400 }
      );
    }
    
    // Simulate sending email (user will add real logic later)
    // Note: Removed console.log statements for security
    // console.log('Send invoice to:', to);
    // console.log('Subject:', subject);
    // console.log('PDF (base64, first 100 chars):', pdfBase64?.slice(0, 100));
    
    // Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send invoice' },
      { status: 500 }
    );
  }
} 