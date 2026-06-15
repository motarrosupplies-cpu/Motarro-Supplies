import 'server-only';
import type { QRCodeDesign } from '@/types/qr-code';
import { encodeQRCodeData } from './qrCodeEncoder';

export interface QRCodeGenerationOptions {
  data: string; // The data to encode
  design?: QRCodeDesign;
  size?: number; // Output size in pixels (default: 300)
  format?: 'png' | 'svg'; // Output format
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'; // Error correction level
}

/**
 * Get dot type based on shape style (for SVG rendering)
 */
function getDotType(shape?: string): 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded' {
  switch (shape) {
    case 'rounded':
      return 'classy-rounded';
    case 'dots':
      return 'dots';
    case 'horizontal':
      return 'classy';
    default:
      return 'square';
  }
}

/**
 * Apply shape transformation to QR code using canvas manipulation
 * This processes the QR code image to transform square dots into different shapes
 */
async function applyShapeStyle(
  qrCodeBuffer: Buffer,
  shape: string | undefined,
  size: number
): Promise<Buffer> {
  if (!shape || shape === 'standard' || shape === 'square') {
    return qrCodeBuffer; // No transformation needed
  }

  try {
    const { createCanvas, loadImage } = await import('canvas');
    const qrImage = await loadImage(qrCodeBuffer);
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Get image data to process individual pixels
    const tempCanvas = createCanvas(size, size);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(qrImage, 0, 0, size, size);
    const imageData = tempCtx.getImageData(0, 0, size, size);
    const data = imageData.data;
    
    // Fill background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    
    // Detect module size (QR codes have finder patterns, we can estimate module size)
    // Typically, QR codes have 25x25 to 177x177 modules depending on version
    // We'll detect by finding the first black pixel and measuring spacing
    let moduleSize = 1;
    for (let y = 0; y < Math.min(50, size); y++) {
      for (let x = 0; x < Math.min(50, size); x++) {
        const idx = (y * size + x) * 4;
        if (data[idx] < 128) { // Black pixel
          // Measure to next white pixel
          let nextWhite = x + 1;
          while (nextWhite < size && data[(y * size + nextWhite) * 4] < 128) {
            nextWhite++;
          }
          if (nextWhite - x > moduleSize) {
            moduleSize = nextWhite - x;
          }
          break;
        }
      }
      if (moduleSize > 1) break;
    }
    
    // Default module size if detection fails
    if (moduleSize < 2) {
      moduleSize = Math.max(2, Math.floor(size / 25)); // Estimate based on typical QR code
    }
    
    ctx.fillStyle = '#000000';
    const halfModule = moduleSize / 2;
    
    // Process each module and draw with appropriate shape
    for (let y = 0; y < size; y += moduleSize) {
      for (let x = 0; x < size; x += moduleSize) {
        // Check if this module is black
        const sampleX = Math.min(x + Math.floor(moduleSize / 2), size - 1);
        const sampleY = Math.min(y + Math.floor(moduleSize / 2), size - 1);
        const idx = (sampleY * size + sampleX) * 4;
        const isBlack = data[idx] < 128;
        
        if (isBlack) {
          const centerX = x + halfModule;
          const centerY = y + halfModule;
          
          switch (shape) {
            case 'rounded':
            case 'classy-rounded':
              // Rounded squares
              ctx.beginPath();
              const roundedRadius = moduleSize * 0.3;
              // Use manual rounded rectangle path (roundRect not available in all Node versions)
              ctx.moveTo(x + roundedRadius, y);
              ctx.lineTo(x + moduleSize - roundedRadius, y);
              ctx.quadraticCurveTo(x + moduleSize, y, x + moduleSize, y + roundedRadius);
              ctx.lineTo(x + moduleSize, y + moduleSize - roundedRadius);
              ctx.quadraticCurveTo(x + moduleSize, y + moduleSize, x + moduleSize - roundedRadius, y + moduleSize);
              ctx.lineTo(x + roundedRadius, y + moduleSize);
              ctx.quadraticCurveTo(x, y + moduleSize, x, y + moduleSize - roundedRadius);
              ctx.lineTo(x, y + roundedRadius);
              ctx.quadraticCurveTo(x, y, x + roundedRadius, y);
              ctx.closePath();
              ctx.fill();
              break;
              
            case 'dots':
              // Circular dots
              ctx.beginPath();
              ctx.arc(centerX, centerY, halfModule * 0.8, 0, Math.PI * 2);
              ctx.fill();
              break;
              
            case 'horizontal':
            case 'classy':
              // Horizontal bars
              ctx.fillRect(x, y + moduleSize * 0.2, moduleSize, moduleSize * 0.6);
              break;
              
            case 'extra-rounded':
              // Extra rounded squares
              ctx.beginPath();
              const extraRadius = moduleSize * 0.5;
              // Use manual rounded rectangle path
              ctx.moveTo(x + extraRadius, y);
              ctx.lineTo(x + moduleSize - extraRadius, y);
              ctx.quadraticCurveTo(x + moduleSize, y, x + moduleSize, y + extraRadius);
              ctx.lineTo(x + moduleSize, y + moduleSize - extraRadius);
              ctx.quadraticCurveTo(x + moduleSize, y + moduleSize, x + moduleSize - extraRadius, y + moduleSize);
              ctx.lineTo(x + extraRadius, y + moduleSize);
              ctx.quadraticCurveTo(x, y + moduleSize, x, y + moduleSize - extraRadius);
              ctx.lineTo(x, y + extraRadius);
              ctx.quadraticCurveTo(x, y, x + extraRadius, y);
              ctx.closePath();
              ctx.fill();
              break;
              
            default:
              // Square (default)
              ctx.fillRect(x, y, moduleSize, moduleSize);
          }
        }
      }
    }
    
    return canvas.toBuffer('image/png');
  } catch (error: any) {
    console.error('Error applying shape style:', error);
    return qrCodeBuffer; // Return original if transformation fails
  }
}

/**
 * Generate gradient color stops for foreground
 */
function generateGradientColors(baseColor: string): { colorStops: Array<{ offset: number; color: string }> } {
  // Convert hex to RGB
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Create gradient from darker to lighter
  const darker = `rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)})`;
  const lighter = `rgb(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)})`;
  
  return {
    colorStops: [
      { offset: 0, color: darker },
      { offset: 1, color: lighter }
    ]
  };
}

/**
 * Apply logo overlay to QR code image
 */
async function applyLogo(
  qrCodeBuffer: Buffer,
  logoUrl: string | undefined,
  size: number
): Promise<Buffer> {
  if (!logoUrl) return qrCodeBuffer;
  
  try {
    const { createCanvas, loadImage } = await import('canvas');
    
    // Load QR code image
    const qrImage = await loadImage(qrCodeBuffer);
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Draw QR code
    ctx.drawImage(qrImage, 0, 0, size, size);
    
    // Handle preset logos (convert emoji to image)
    let logoImage: any = null;
    if (logoUrl.startsWith('preset:')) {
      // For preset logos, we'll create a simple icon
      // In production, you might want to use actual SVG icons
      const presetId = logoUrl.replace('preset:', '');
      // For now, skip preset logos or use a placeholder
      // You can enhance this later with actual icon images
      return qrCodeBuffer;
    } else if (logoUrl.startsWith('data:')) {
      // Data URL logo
      logoImage = await loadImage(logoUrl);
    } else {
      // URL logo - fetch it
      const response = await fetch(logoUrl);
      const arrayBuffer = await response.arrayBuffer();
      logoImage = await loadImage(Buffer.from(arrayBuffer));
    }
    
    if (logoImage) {
      // Calculate logo size (20% of QR code size)
      const logoSize = size * 0.2;
      const logoX = (size - logoSize) / 2;
      const logoY = (size - logoSize) / 2;
      
      // Draw white background for logo
      const padding = logoSize * 0.1;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(
        logoX - padding,
        logoY - padding,
        logoSize + padding * 2,
        logoSize + padding * 2
      );
      
      // Draw logo
      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
    }
    
    return canvas.toBuffer('image/png');
  } catch (error: any) {
    console.error('Error applying logo:', error);
    // Return original QR code if logo fails
    return qrCodeBuffer;
  }
}

/**
 * Apply frame to QR code image
 */
async function applyFrame(
  qrCodeBuffer: Buffer,
  frame: string | undefined,
  size: number
): Promise<Buffer> {
  if (!frame || frame === 'none') return qrCodeBuffer;
  
  try {
    const { createCanvas, loadImage } = await import('canvas');
    
    const qrImage = await loadImage(qrCodeBuffer);
    const padding = size * 0.1; // 10% padding for frame
    const canvas = createCanvas(size + padding * 2, size + padding * 2);
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw QR code
    ctx.drawImage(qrImage, padding, padding, size, size);
    
    // Apply frame style
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    
    switch (frame) {
      case 'rounded':
        // Draw rounded rectangle frame - centered around QR code
        const cornerRadius = 20;
        const frameX = padding * 0.5;
        const frameY = padding * 0.5;
        const frameWidth = size + padding;
        const frameHeight = size + padding;
        
        ctx.strokeStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(frameX + cornerRadius, frameY);
        ctx.lineTo(frameX + frameWidth - cornerRadius, frameY);
        ctx.quadraticCurveTo(frameX + frameWidth, frameY, frameX + frameWidth, frameY + cornerRadius);
        ctx.lineTo(frameX + frameWidth, frameY + frameHeight - cornerRadius);
        ctx.quadraticCurveTo(frameX + frameWidth, frameY + frameHeight, frameX + frameWidth - cornerRadius, frameY + frameHeight);
        ctx.lineTo(frameX + cornerRadius, frameY + frameHeight);
        ctx.quadraticCurveTo(frameX, frameY + frameHeight, frameX, frameY + frameHeight - cornerRadius);
        ctx.lineTo(frameX, frameY + cornerRadius);
        ctx.quadraticCurveTo(frameX, frameY, frameX + cornerRadius, frameY);
        ctx.closePath();
        ctx.stroke();
        break;
      case 'circular':
        // Draw circular border around QR code (don't clip - keep QR code fully visible and functional)
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        // Calculate radius to fully encompass the QR code (using diagonal)
        // This ensures all finder patterns and timing patterns remain visible
        const qrDiagonal = Math.sqrt(size * size + size * size);
        const radius = qrDiagonal / 2 + padding * 0.2; // Slightly larger to ensure full QR code is visible
        
        // Draw QR code first (fully visible, not clipped)
        ctx.drawImage(qrImage, padding, padding, size, size);
        
        // Draw circular border around the QR code (centered)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'scan-me':
      case 'scan-me-button':
        // Draw "Scan Me" frame with button below
        const buttonHeight = 50;
        const buttonPadding = 10;
        const totalHeight = size + padding * 2 + buttonHeight + buttonPadding;
        const newCanvas = createCanvas(size + padding * 2, totalHeight);
        const newCtx = newCanvas.getContext('2d');
        
        // Fill background
        newCtx.fillStyle = '#FFFFFF';
        newCtx.fillRect(0, 0, newCanvas.width, newCanvas.height);
        
        // Draw QR code
        newCtx.drawImage(qrImage, padding, padding, size, size);
        
        // Draw rounded rectangle frame
        const scanCornerRadius = 10;
        newCtx.strokeStyle = '#000000';
        newCtx.lineWidth = 4;
        newCtx.beginPath();
        newCtx.moveTo(padding * 0.5 + scanCornerRadius, padding * 0.5);
        newCtx.lineTo(size + padding - scanCornerRadius, padding * 0.5);
        newCtx.quadraticCurveTo(size + padding, padding * 0.5, size + padding, padding * 0.5 + scanCornerRadius);
        newCtx.lineTo(size + padding, size + padding - scanCornerRadius);
        newCtx.quadraticCurveTo(size + padding, size + padding, size + padding - scanCornerRadius, size + padding);
        newCtx.lineTo(padding * 0.5 + scanCornerRadius, size + padding);
        newCtx.quadraticCurveTo(padding * 0.5, size + padding, padding * 0.5, size + padding - scanCornerRadius);
        newCtx.lineTo(padding * 0.5, padding * 0.5 + scanCornerRadius);
        newCtx.quadraticCurveTo(padding * 0.5, padding * 0.5, padding * 0.5 + scanCornerRadius, padding * 0.5);
        newCtx.closePath();
        newCtx.stroke();
        
        // Draw "SCAN ME" button below
        const buttonY = size + padding * 2 + buttonPadding;
        const buttonWidth = size + padding;
        const buttonX = padding * 0.5;
        const buttonRadius = 8;
        
        // Button background
        newCtx.fillStyle = '#000000';
        newCtx.beginPath();
        newCtx.moveTo(buttonX + buttonRadius, buttonY);
        newCtx.lineTo(buttonX + buttonWidth - buttonRadius, buttonY);
        newCtx.quadraticCurveTo(buttonX + buttonWidth, buttonY, buttonX + buttonWidth, buttonY + buttonRadius);
        newCtx.lineTo(buttonX + buttonWidth, buttonY + buttonHeight - buttonRadius);
        newCtx.quadraticCurveTo(buttonX + buttonWidth, buttonY + buttonHeight, buttonX + buttonWidth - buttonRadius, buttonY + buttonHeight);
        newCtx.lineTo(buttonX + buttonRadius, buttonY + buttonHeight);
        newCtx.quadraticCurveTo(buttonX, buttonY + buttonHeight, buttonX, buttonY + buttonHeight - buttonRadius);
        newCtx.lineTo(buttonX, buttonY + buttonRadius);
        newCtx.quadraticCurveTo(buttonX, buttonY, buttonX + buttonRadius, buttonY);
        newCtx.closePath();
        newCtx.fill();
        
        // Button text
        newCtx.fillStyle = '#FFFFFF';
        newCtx.font = 'bold 20px Arial';
        newCtx.textAlign = 'center';
        newCtx.textBaseline = 'middle';
        newCtx.fillText('SCAN ME', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        
        return newCanvas.toBuffer('image/png');
      
      case 'scan-me-simple':
        // Simple "Scan Me" text above
        const simpleCanvas = createCanvas(size + padding * 2, size + padding * 2 + 40);
        const simpleCtx = simpleCanvas.getContext('2d');
        simpleCtx.fillStyle = '#FFFFFF';
        simpleCtx.fillRect(0, 0, simpleCanvas.width, simpleCanvas.height);
        simpleCtx.drawImage(qrImage, padding, 40, size, size);
        simpleCtx.fillStyle = '#000000';
        simpleCtx.font = 'bold 20px Arial';
        simpleCtx.textAlign = 'center';
        simpleCtx.fillText('SCAN ME', simpleCanvas.width / 2, 25);
        return simpleCanvas.toBuffer('image/png');
      
      case 'scan-me-qr':
      case 'scan-me-menu':
        // Use scan-me-button style for these variants
        // Recursively call with scan-me-button (but prevent infinite loop by checking)
        if (frame === 'scan-me-button') {
          return qrCodeBuffer; // Prevent infinite recursion
        }
        return applyFrame(qrCodeBuffer, 'scan-me-button', size);
    }
    
    return canvas.toBuffer('image/png');
  } catch (error: any) {
    console.error('Error applying frame:', error);
    return qrCodeBuffer;
  }
}

/**
 * Generate QR code image buffer
 * NOTE: This function can only be used on the server side (API routes, server components)
 */
export async function generateQRCodeImage(
  options: QRCodeGenerationOptions
): Promise<Buffer | string> {
  try {
    // Use dynamic import - webpack externals config should prevent bundling
    const QRCode = await import('qrcode');
    
    const {
      data,
      design = {},
      size = 300,
      format = 'png',
      errorCorrectionLevel = design.logo_url ? 'H' : 'M', // High error correction for logo support
    } = options;

    // Get dot type based on shape
    const dotType = getDotType(design.shape);
    
    // Build QR code options
    const qrOptions: any = {
      errorCorrectionLevel,
      type: format === 'png' ? 'png' : 'svg',
      width: size,
      margin: 2,
      color: {
        dark: design.foreground_color || '#000000',
        light: design.transparent_background ? '#0000' : (design.background_color || '#FFFFFF'),
      },
    };

    // Add dot type for shape customization
    if (format === 'png') {
      qrOptions.rendererOpts = {
        ...qrOptions.rendererOpts,
      };
      // Note: qrcode library doesn't directly support dot types in PNG
      // We'll handle this via canvas manipulation if needed
    }

    // Generate base QR code
    let qrCodeBuffer: Buffer;
    if (format === 'svg') {
      // For SVG, we can use dot types directly
      if (dotType !== 'square') {
        qrOptions.dots = dotType;
      }
      const svgString = await QRCode.default.toString(data, qrOptions);
      return svgString;
    } else {
      // For PNG, generate standard QR code first, then apply shape transformation
      qrCodeBuffer = await QRCode.default.toBuffer(data, qrOptions) as Buffer;
    }

    // Apply shape style transformation (for PNG only)
    if (format === 'png' && design.shape) {
      qrCodeBuffer = await applyShapeStyle(qrCodeBuffer, design.shape, size);
    }

    // Apply gradient if needed (requires canvas manipulation)
    if (design.gradient && design.foreground_color) {
      try {
        const { createCanvas, loadImage } = await import('canvas');
        const qrImage = await loadImage(qrCodeBuffer);
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');
        
        // Draw QR code
        ctx.drawImage(qrImage, 0, 0, size, size);
        
        // Apply gradient overlay
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        const gradientColors = generateGradientColors(design.foreground_color);
        gradientColors.colorStops.forEach(({ offset, color }) => {
          gradient.addColorStop(offset, color);
        });
        
        // Use composite operation to apply gradient
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        ctx.globalCompositeOperation = 'source-over';
        
        qrCodeBuffer = canvas.toBuffer('image/png');
      } catch (error: any) {
        console.error('Error applying gradient:', error);
        // Continue with non-gradient version
      }
    }

    // Apply logo overlay
    if (design.logo_url) {
      qrCodeBuffer = await applyLogo(
        qrCodeBuffer, 
        design.logo_url, 
        size, 
        design.logo_remove_bg || false
      );
    }

    // Apply frame
    if (design.frame) {
      qrCodeBuffer = await applyFrame(qrCodeBuffer, design.frame, size);
    }

    return qrCodeBuffer;
  } catch (error: any) {
    console.error('Error in generateQRCodeImage:', error);
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
}

/**
 * Generate QR code data URL (for preview in browser)
 * NOTE: This only works on the server side. For client-side, use the API endpoint.
 */
export async function generateQRCodeDataURL(
  options: QRCodeGenerationOptions
): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error('generateQRCodeDataURL can only be used on the server side. Use the API endpoint for client-side generation.');
  }

  try {
    // Generate as buffer first, then convert to data URL
    const buffer = await generateQRCodeImage({
      ...options,
      format: 'png',
    }) as Buffer;
    
    return `data:image/png;base64,${buffer.toString('base64')}`;
  } catch (error: any) {
    console.error('Error in generateQRCodeDataURL:', error);
    throw new Error(`Failed to generate QR code data URL: ${error.message}`);
  }
}

/**
 * Get the full URL for a QR code short URL
 */
export function getQRCodeUrl(shortUrl: string): string {
  // Use the domain from environment or default
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.motarro.co.za';
  return `${baseUrl}/qr/${shortUrl}`;
}

/**
 * Get the redirect URL for scanning
 */
export function getQRCodeRedirectUrl(shortUrl: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.motarro.co.za';
  return `${baseUrl}/api/qr-codes/redirect/${shortUrl}`;
}

