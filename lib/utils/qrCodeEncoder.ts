/**
 * QR Code Data Encoder
 * Encodes different data types into QR code format strings
 */

export interface EmailData {
  email: string;
  subject?: string;
  body?: string;
}

export interface PhoneData {
  phone: string;
}

export interface SMSData {
  phone: string;
  message?: string;
}

export interface VCardData {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  organization?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  title?: string;
}

export interface WiFiData {
  ssid: string;
  password: string;
  security: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

export interface WhatsAppData {
  phone: string;
  message?: string;
}

export interface SocialMediaData {
  platform: string;
  url: string;
}

export interface EventData {
  title: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description?: string;
}

/**
 * Encode data based on QR code type
 */
export function encodeQRCodeData(type: string, content: string | object): string {
  try {
    switch (type) {
      case 'url':
        // URL is already encoded
        return typeof content === 'string' ? content : String(content);
      
      case 'text':
        // Plain text
        return typeof content === 'string' ? content : JSON.stringify(content);
      
      case 'email':
        // Email format: mailto:email?subject=Subject&body=Body
        if (typeof content === 'string') {
          // Try to parse as JSON, fallback to plain email
          try {
            const emailData: EmailData = JSON.parse(content);
            let mailto = `mailto:${emailData.email}`;
            const params: string[] = [];
            if (emailData.subject) params.push(`subject=${encodeURIComponent(emailData.subject)}`);
            if (emailData.body) params.push(`body=${encodeURIComponent(emailData.body)}`);
            if (params.length > 0) mailto += `?${params.join('&')}`;
            return mailto;
          } catch {
            // Plain email address
            return `mailto:${content}`;
          }
        } else {
          const emailData = content as EmailData;
          let mailto = `mailto:${emailData.email}`;
          const params: string[] = [];
          if (emailData.subject) params.push(`subject=${encodeURIComponent(emailData.subject)}`);
          if (emailData.body) params.push(`body=${encodeURIComponent(emailData.body)}`);
          if (params.length > 0) mailto += `?${params.join('&')}`;
          return mailto;
        }
      
      case 'call':
        // Phone format: tel:+1234567890
        const phone = typeof content === 'string' ? content : (content as PhoneData).phone;
        return `tel:${phone.replace(/\s/g, '')}`;
      
      case 'sms':
        // SMS format: sms:+1234567890?body=Message
        if (typeof content === 'string') {
          try {
            const smsData: SMSData = JSON.parse(content);
            let sms = `sms:${smsData.phone.replace(/\s/g, '')}`;
            if (smsData.message) sms += `?body=${encodeURIComponent(smsData.message)}`;
            return sms;
          } catch {
            return `sms:${content.replace(/\s/g, '')}`;
          }
        } else {
          const smsData = content as SMSData;
          let sms = `sms:${smsData.phone.replace(/\s/g, '')}`;
          if (smsData.message) sms += `?body=${encodeURIComponent(smsData.message)}`;
          return sms;
        }
      
      case 'whatsapp':
        // WhatsApp format: https://wa.me/1234567890?text=Message
        if (typeof content === 'string') {
          try {
            const whatsappData: WhatsAppData = JSON.parse(content);
            const phone = whatsappData.phone.replace(/\D/g, ''); // Remove non-digits
            let url = `https://wa.me/${phone}`;
            if (whatsappData.message) url += `?text=${encodeURIComponent(whatsappData.message)}`;
            return url;
          } catch {
            const phone = content.replace(/\D/g, '');
            return `https://wa.me/${phone}`;
          }
        } else {
          const whatsappData = content as WhatsAppData;
          const phone = whatsappData.phone.replace(/\D/g, '');
          let url = `https://wa.me/${phone}`;
          if (whatsappData.message) url += `?text=${encodeURIComponent(whatsappData.message)}`;
          return url;
        }
      
      case 'vcard':
        // vCard format
        if (typeof content === 'string') {
          try {
            const vcardData: VCardData = JSON.parse(content);
            return formatVCard(vcardData);
          } catch {
            // Simple vCard with just name
            return `BEGIN:VCARD\nVERSION:3.0\nFN:${content}\nEND:VCARD`;
          }
        } else {
          return formatVCard(content as VCardData);
        }
      
      case 'wifi':
        // WiFi format: WIFI:T:WPA;S:SSID;P:Password;H:false;;
        if (typeof content === 'string') {
          try {
            const wifiData: WiFiData = JSON.parse(content);
            return formatWiFi(wifiData);
          } catch {
            // Fallback: assume it's just SSID
            return `WIFI:T:WPA;S:${content};P:;;`;
          }
        } else {
          return formatWiFi(content as WiFiData);
        }
      
      case 'pdf':
      case 'images':
      case 'video':
        // These are URLs to files
        return typeof content === 'string' ? content : String(content);
      
      case 'app':
        // App store links or deep links
        return typeof content === 'string' ? content : String(content);
      
      case 'social':
        // Social media URL
        if (typeof content === 'string') {
          try {
            const socialData: SocialMediaData = JSON.parse(content);
            return socialData.url;
          } catch {
            return content;
          }
        } else {
          return (content as SocialMediaData).url;
        }
      
      case 'event':
        // Event format (iCalendar)
        if (typeof content === 'string') {
          try {
            const eventData: EventData = JSON.parse(content);
            return formatEvent(eventData);
          } catch {
            return content;
          }
        } else {
          return formatEvent(content as EventData);
        }
      
      case 'barcode':
        // 2D barcode - just the data
        return typeof content === 'string' ? content : JSON.stringify(content);
      
      case 'discount':
        // Discount code - can be URL or plain text
        return typeof content === 'string' ? content : JSON.stringify(content);
      
      default:
        return typeof content === 'string' ? content : JSON.stringify(content);
    }
  } catch (error) {
    console.error('Error encoding QR code data:', error);
    return typeof content === 'string' ? content : JSON.stringify(content);
  }
}

/**
 * Format vCard data
 */
function formatVCard(data: VCardData): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];
  
  if (data.fullName) {
    lines.push(`FN:${data.fullName}`);
  } else if (data.firstName || data.lastName) {
    const name = [data.firstName, data.lastName].filter(Boolean).join(' ');
    lines.push(`FN:${name}`);
    if (data.firstName && data.lastName) {
      lines.push(`N:${data.lastName};${data.firstName};;;`);
    }
  }
  
  if (data.organization) lines.push(`ORG:${data.organization}`);
  if (data.title) lines.push(`TITLE:${data.title}`);
  if (data.phone) lines.push(`TEL:${data.phone}`);
  if (data.email) lines.push(`EMAIL:${data.email}`);
  if (data.website) lines.push(`URL:${data.website}`);
  
  if (data.address || data.city || data.state || data.zip || data.country) {
    const addressParts = [
      data.address,
      data.city,
      data.state,
      data.zip,
      data.country
    ].filter(Boolean);
    lines.push(`ADR:;;${addressParts.join(';')};;;;`);
  }
  
  lines.push('END:VCARD');
  return lines.join('\n');
}

/**
 * Format WiFi data
 */
function formatWiFi(data: WiFiData): string {
  const parts: string[] = [];
  parts.push(`T:${data.security}`);
  parts.push(`S:${data.ssid}`);
  if (data.password) parts.push(`P:${data.password}`);
  if (data.hidden) parts.push(`H:${data.hidden}`);
  return `WIFI:${parts.join(';')};;`;
}

/**
 * Format Event data (iCalendar format)
 */
function formatEvent(data: EventData): string {
  const lines: string[] = [
    'BEGIN:VEVENT',
    `SUMMARY:${data.title}`,
    `DTSTART:${formatICalDate(data.startDate)}`,
  ];
  
  if (data.endDate) {
    lines.push(`DTEND:${formatICalDate(data.endDate)}`);
  }
  
  if (data.location) lines.push(`LOCATION:${data.location}`);
  if (data.description) lines.push(`DESCRIPTION:${data.description}`);
  
  lines.push('END:VEVENT');
  return lines.join('\n');
}

/**
 * Format date for iCalendar
 */
function formatICalDate(dateString: string): string {
  // Convert to YYYYMMDDTHHMMSSZ format
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

