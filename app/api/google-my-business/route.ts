import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const businessData = {
      business: {
        name: "MOTARRO Supplies",
        alternateName: "MOTARRO Supplies Custom Apparel",
        description: "Custom printed apparel and promotional goods in South Africa. Specializing in corporate uniforms, event merchandise, and personalized clothing.",
        website: "https://www.motarro.co.za",
        phone: "+27-69-622-8848",
        email: "info@www.motarro.co.za",
        address: {
          street: "Kempton Park, Johannesburg",
          city: "Kempton Park",
          province: "Gauteng",
          postalCode: "1619",
          country: "South Africa",
          countryCode: "ZA"
        },
        coordinates: {
          latitude: -26.1087,
          longitude: 28.2333
        },
        hours: {
          monday: "00:00-23:59",
          tuesday: "00:00-23:59", 
          wednesday: "00:00-23:59",
          thursday: "00:00-23:59",
          friday: "00:00-23:59",
          saturday: "00:00-23:59",
          sunday: "00:00-23:59"
        },
        services: [
          "Custom T-Shirt Printing",
          "Corporate Uniforms", 
          "Event Merchandise",
          "Promotional Goods",
          "Bulk Orders",
          "Design Services"
        ],
        categories: [
          "Apparel & Fashion",
          "Printing Services",
          "Corporate Clothing",
          "Event Merchandise",
          "Promotional Products"
        ],
        paymentMethods: [
          "Cash",
          "Credit Card", 
          "EFT",
          "PayFast",
          "Google Pay"
        ],
        currencies: ["ZAR"],
        languages: ["English", "Afrikaans"],
        socialMedia: {
          facebook: "https://www.motarro.co.za/go/facebook",
          instagram: "https://www.motarro.co.za/go/instagram",
          linkedin: "https://www.motarro.co.za/go/linkedin",
          twitter: "https://www.motarro.co.za/go/x"
        },
        ratings: {
          google: 4.8,
          facebook: 4.7,
          totalReviews: 127
        },
        certifications: [
          "BBB Accredited Business",
          "South African Business Registration"
        ],
        yearEstablished: 2020,
        employees: "5-10",
        businessType: "Private Company",
        industry: "Apparel & Fashion"
      },
      seo: {
        keywords: [
          "custom t-shirts Johannesburg",
          "corporate uniforms South Africa",
          "event merchandise printing",
          "custom apparel Kempton Park",
          "t-shirt printing Gauteng",
          "promotional clothing South Africa"
        ],
        metaDescription: "Custom printed apparel and promotional goods in South Africa. High-quality t-shirts, hoodies, and corporate uniforms with fast delivery.",
        title: "MOTARRO Supplies — Custom Printed Apparel & Promotional Goods | South Africa"
      },
      directories: {
        googleMyBusiness: {
          profileId: "motarro-custom-apparel",
          verificationStatus: "verified",
          lastUpdated: new Date().toISOString(),
          profileStrength: "85%",
          customerInteractions: 9,
          profileViews: 67
        },
        localListings: [
          "Yellow Pages South Africa",
          "Hello Peter",
          "Gumtree Business Directory", 
          "SA Yellow",
          "Junk Mail Business Directory"
        ],
        industryDirectories: [
          "Fashion United",
          "Apparel Search",
          "Textile World",
          "PrintWeek",
          "South African Printers Association"
        ]
      }
    };

    return NextResponse.json(businessData, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch business data' },
      { status: 500 }
    );
  }
}
