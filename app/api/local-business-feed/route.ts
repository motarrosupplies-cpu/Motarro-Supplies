import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    
    const localBusinessFeed = `<?xml version="1.0" encoding="UTF-8"?>
<localBusinessFeed xmlns="http://www.localbusiness.org/schemas/feed/1.0">
  <business>
    <id>motarro-custom-apparel</id>
    <name>MOTARRO Supplies</name>
    <alternateName>MOTARRO Supplies Custom Apparel</alternateName>
    <description>Custom printed apparel and promotional goods in South Africa. Specializing in corporate uniforms, event merchandise, and personalized clothing.</description>
    <website>https://www.motarro.co.za</website>
    <phone>+27-69-622-8848</phone>
    <email>info@www.motarro.co.za</email>
    
    <address>
      <street>Kempton Park, Johannesburg</street>
      <city>Kempton Park</city>
      <province>Gauteng</province>
      <postalCode>1619</postalCode>
      <country>South Africa</country>
      <countryCode>ZA</countryCode>
    </address>
    
    <coordinates>
      <latitude>-26.1087</latitude>
      <longitude>28.2333</longitude>
    </coordinates>
    
    <hours>
      <monday>00:00-23:59</monday>
      <tuesday>00:00-23:59</tuesday>
      <wednesday>00:00-23:59</wednesday>
      <thursday>00:00-23:59</thursday>
      <friday>00:00-23:59</friday>
      <saturday>00:00-23:59</saturday>
      <sunday>00:00-23:59</sunday>
    </hours>
    
    <services>
      <service>Custom T-Shirt Printing</service>
      <service>Corporate Uniforms</service>
      <service>Event Merchandise</service>
      <service>Promotional Goods</service>
      <service>Bulk Orders</service>
      <service>Design Services</service>
    </services>
    
    <categories>
      <category>Apparel &amp; Fashion</category>
      <category>Printing Services</category>
      <category>Corporate Clothing</category>
      <category>Event Merchandise</category>
      <category>Promotional Products</category>
    </categories>
    
    <paymentMethods>
      <method>Cash</method>
      <method>Credit Card</method>
      <method>EFT</method>
      <method>PayFast</method>
      <method>Google Pay</method>
    </paymentMethods>
    
    <currencies>
      <currency>ZAR</currency>
    </currencies>
    
    <languages>
      <language>English</language>
      <language>Afrikaans</language>
    </languages>
    
    <socialMedia>
      <facebook>https://www.motarro.co.za/go/facebook</facebook>
      <instagram>https://www.motarro.co.za/go/instagram</instagram>
      <linkedin>https://www.motarro.co.za/go/linkedin</linkedin>
      <twitter>https://www.motarro.co.za/go/x</twitter>
    </socialMedia>
    
    <ratings>
      <google>4.8</google>
      <facebook>4.7</facebook>
      <totalReviews>127</totalReviews>
    </ratings>
    
    <certifications>
      <certification>BBB Accredited Business</certification>
      <certification>South African Business Registration</certification>
    </certifications>
    
    <businessInfo>
      <yearEstablished>2020</yearEstablished>
      <employees>5-10</employees>
      <businessType>Private Company</businessType>
      <industry>Apparel &amp; Fashion</industry>
    </businessInfo>
    
    <seo>
      <keywords>
        <keyword>custom t-shirts Johannesburg</keyword>
        <keyword>corporate uniforms South Africa</keyword>
        <keyword>event merchandise printing</keyword>
        <keyword>custom apparel Kempton Park</keyword>
        <keyword>t-shirt printing Gauteng</keyword>
        <keyword>promotional clothing South Africa</keyword>
      </keywords>
      <metaDescription>Custom printed apparel and promotional goods in South Africa. High-quality t-shirts, hoodies, and corporate uniforms with fast delivery.</metaDescription>
      <title>MOTARRO Supplies — Custom Printed Apparel &amp; Promotional Goods | South Africa</title>
    </seo>
    
    <lastUpdated>${currentDate}</lastUpdated>
    <feedVersion>1.0</feedVersion>
  </business>
</localBusinessFeed>`;

    return new Response(localBusinessFeed, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    return new Response('Error generating local business feed', { status: 500 });
  }
}
