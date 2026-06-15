import jsPDF from 'jspdf';
import { Invoice, Quotation, CreditNote, Customer } from '@/types/invoice';

export class PDFGenerator {
  private doc: jsPDF;
  private yPosition: number = 50;
  private pageWidth: number = 210;
  private margin: number = 20;
  private logoUrl: string = 'https://hkervihhlhktjdxcekhi.supabase.co/storage/v1/object/public/product-images/MOTARRO Supplies-logo.PNG';

  constructor() {
    this.doc = new jsPDF();
  }

  // Helper function to format dates as DD/MM/YYYY
  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Helper function to add logo
  private async addLogo(): Promise<void> {
    try {
      // Create an image element to load the logo
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          // Calculate logo dimensions (max width 60mm, maintain aspect ratio)
          const maxWidth = 60;
          const aspectRatio = img.width / img.height;
          const logoWidth = maxWidth;
          const logoHeight = maxWidth / aspectRatio;
          
          // Add logo to PDF (positioned at top-left)
          this.doc.addImage(img, 'PNG', this.margin, 10, logoWidth, logoHeight);
          resolve();
        };
        
        img.onerror = () => {
          // If logo fails to load, just continue without it
          console.warn('Failed to load logo, continuing without it');
          resolve();
        };
        
        img.src = this.logoUrl;
      });
    } catch (error) {
      console.warn('Error adding logo:', error);
      // Continue without logo if there's an error
    }
  }

  // Helper function to add product image
  private async addProductImage(imageUrl: string, x: number, y: number, width: number = 15, height: number = 15): Promise<void> {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        img.onload = () => {
          this.doc.addImage(img, 'PNG', x, y, width, height);
          resolve();
        };
        
        img.onerror = () => {
          console.warn('Failed to load product image, continuing without it');
          resolve();
        };
        
        img.src = imageUrl;
      });
    } catch (error) {
      console.warn('Error adding product image:', error);
    }
  }

  // Generate Invoice PDF with Vercel optimization
  async generateInvoicePDF(invoice: Invoice): Promise<jsPDF> {
    try {
      this.doc = new jsPDF();
      this.yPosition = 50;

      // Add logo first
      await this.addLogo();
      
      // Header
      this.addHeader('INVOICE', invoice.invoiceNumber);
      
      // Company Info
      this.addCompanyInfo();
      
      // Customer Info
      this.addCustomerInfo(invoice.customer);
      
      // Invoice Details
      this.addInvoiceDetails(invoice);
      
      // Items Table with Images
      await this.addItemsTableWithImages(invoice.items, 'Image', 'Description', 'Qty', 'Unit Price', 'Total');
      
      // Only add new page if we don't have enough space for totals section
      const spaceNeeded = 40; // Space needed for totals section
      const availableSpace = 297 - this.yPosition - 20; // A4 page height minus margin
      
      if (spaceNeeded > availableSpace && this.yPosition > 200) {
        this.doc.addPage();
        this.yPosition = 30;
      }
      
      // Totals
      this.addTotals(invoice.subtotal, invoice.taxAmount, invoice.total, invoice.deliveryFee, invoice.includeVat);
      
      // Notes and Terms
      if (invoice.notes) {
        this.addNotes(invoice.notes);
      }
      if (invoice.terms) {
        this.addTerms(invoice.terms);
      }

      return this.doc;
    } catch (error) {
      // Return a basic PDF with error message if generation fails
      const fallbackDoc = new jsPDF();
      fallbackDoc.setFontSize(16);
      fallbackDoc.text('Invoice Generation Error', 20, 50);
      fallbackDoc.setFontSize(12);
      fallbackDoc.text('Please try again or contact support.', 20, 70);
      return fallbackDoc;
    }
  }

  // Generate Quotation PDF with Vercel optimization
  async generateQuotationPDF(quotation: Quotation): Promise<jsPDF> {
    try {
      this.doc = new jsPDF();
      this.yPosition = 50;

      // Add logo first
      await this.addLogo();
      
      // Header
      this.addHeader('QUOTATION', quotation.quotationNumber);
      
      // Company Info
      this.addCompanyInfo();
      
      // Customer Info
      this.addCustomerInfo(quotation.customer);
      
      // Quotation Details
      this.addQuotationDetails(quotation);
      
      // Items Table with Images
      await this.addItemsTableWithImages(quotation.items, 'Image', 'Description', 'Qty', 'Unit Price', 'Total');
      
      // Only add new page if we don't have enough space for totals section
      const spaceNeeded = 40; // Space needed for totals section
      const availableSpace = 297 - this.yPosition - 20; // A4 page height minus margin
      
      if (spaceNeeded > availableSpace && this.yPosition > 200) {
        this.doc.addPage();
        this.yPosition = 30;
      }
      
      // Totals
      this.addTotals(quotation.subtotal, quotation.taxAmount, quotation.total, quotation.deliveryFee, quotation.includeVat);
      
      // Notes and Terms
      if (quotation.notes) {
        this.addNotes(quotation.notes);
      }
      if (quotation.terms) {
        this.addTerms(quotation.terms);
      }

      return this.doc;
    } catch (error) {
      // Return a basic PDF with error message if generation fails
      const fallbackDoc = new jsPDF();
      fallbackDoc.setFontSize(16);
      fallbackDoc.text('Quotation Generation Error', 20, 50);
      fallbackDoc.setFontSize(12);
      fallbackDoc.text('Please try again or contact support.', 20, 70);
      return fallbackDoc;
    }
  }

  // Generate Credit Note PDF with Vercel optimization
  async generateCreditNotePDF(creditNote: CreditNote): Promise<jsPDF> {
    try {
      this.doc = new jsPDF();
      this.yPosition = 50;

      // Add logo first
      await this.addLogo();
      
      // Header
      this.addHeader('CREDIT NOTE', creditNote.creditNoteNumber);
      
      // Company Info
      this.addCompanyInfo();
      
      // Customer Info
      this.addCustomerInfo(creditNote.customer);
      
      // Credit Note Details
      this.addCreditNoteDetails(creditNote);
      
      // Items Table (no images for credit notes)
      this.addItemsTable(creditNote.items, 'Description', 'Qty', 'Unit Price', 'Total');
      
      // Only add new page if we don't have enough space for totals section
      const spaceNeeded = 40; // Space needed for totals section
      const availableSpace = 297 - this.yPosition - 20; // A4 page height minus margin
      
      if (spaceNeeded > availableSpace && this.yPosition > 200) {
        this.doc.addPage();
        this.yPosition = 30;
      }
      
      // Totals
      this.addTotals(creditNote.subtotal, creditNote.taxAmount, creditNote.total);
      
      // Notes
      if (creditNote.notes) {
        this.addNotes(creditNote.notes);
      }

      return this.doc;
    } catch (error) {
      // Return a basic PDF with error message if generation fails
      const fallbackDoc = new jsPDF();
      fallbackDoc.setFontSize(16);
      fallbackDoc.text('Credit Note Generation Error', 20, 50);
      fallbackDoc.setFontSize(12);
      fallbackDoc.text('Please try again or contact support.', 20, 70);
      return fallbackDoc;
    }
  }

  private addHeader(title: string, documentNumber: string) {
    // Title - moved up significantly to reduce wasted space
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, 60); // Moved from 80 to 60
    
    // Document Number
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Document No: ${documentNumber}`, this.pageWidth - this.margin - 60, 30);
    
    // Date
    this.doc.text(`Date: ${this.formatDate(new Date())}`, this.pageWidth - this.margin - 60, 40);
    
    this.yPosition = 80; // Reduced from 110 to 80
  }

  private addCompanyInfo() {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('MOTARRO Supplies', this.margin, this.yPosition);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Phone: 069 622 8848', this.margin, this.yPosition + 5);
    this.doc.text('Email: motarrodotcoza@gmail.com', this.margin, this.yPosition + 10);
    
    // Add bank details
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('FNB Bank Details:', this.margin, this.yPosition + 20);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Account Number: 63167132273', this.margin, this.yPosition + 25);
    this.doc.text('Branch Code: 255355', this.margin, this.yPosition + 30);
    
    this.yPosition += 35; // Further reduced spacing for better space utilization
  }

  private addCustomerInfo(customer: Customer) {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Bill To:', this.pageWidth - this.margin - 60, this.yPosition);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    let lineOffset = 5;
    
    this.doc.text(`${customer.firstName} ${customer.lastName}`, this.pageWidth - this.margin - 60, this.yPosition + lineOffset);
    lineOffset += 5;
    
    if (customer.company) {
      this.doc.text(customer.company, this.pageWidth - this.margin - 60, this.yPosition + lineOffset);
      lineOffset += 5;
    }
    
    if (customer.address) {
      this.doc.text(customer.address.street, this.pageWidth - this.margin - 60, this.yPosition + lineOffset);
      lineOffset += 5;
      this.doc.text(`${customer.address.city}, ${customer.address.state} ${customer.address.zipCode}`, this.pageWidth - this.margin - 60, this.yPosition + lineOffset);
      lineOffset += 5;
      this.doc.text(customer.address.country, this.pageWidth - this.margin - 60, this.yPosition + lineOffset);
      lineOffset += 5;
    }
    
    this.doc.text(`Email: ${customer.email}`, this.pageWidth - this.margin - 60, this.yPosition + lineOffset);
    lineOffset += 5;
    
    if (customer.phone) {
      this.doc.text(`Phone: ${customer.phone}`, this.pageWidth - this.margin - 60, this.yPosition + lineOffset);
      lineOffset += 5;
    }
    
    // Dynamic spacing based on actual content
    this.yPosition += Math.max(35, lineOffset + 10);
  }

  private addInvoiceDetails(invoice: Invoice) {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Issue Date: ${this.formatDate(invoice.issueDate)}`, this.margin, this.yPosition);
    this.doc.text(`Due Date: ${this.formatDate(invoice.dueDate)}`, this.margin, this.yPosition + 5); // Reduced from +7 to +5
    this.doc.text(`Status: ${invoice.status}`, this.margin, this.yPosition + 10); // Reduced from +14 to +10
    
    this.yPosition += 15; // Further reduced spacing for better space utilization
  }

  private addQuotationDetails(quotation: Quotation) {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Issue Date: ${this.formatDate(quotation.issueDate)}`, this.margin, this.yPosition);
    this.doc.text(`Expiry Date: ${this.formatDate(quotation.expiryDate)}`, this.margin, this.yPosition + 5); // Reduced from +7 to +5
    this.doc.text(`Status: ${quotation.status}`, this.margin, this.yPosition + 10); // Reduced from +14 to +10
    
    this.yPosition += 15; // Further reduced spacing for better space utilization
  }

  private addCreditNoteDetails(creditNote: CreditNote) {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Issue Date: ${this.formatDate(creditNote.issueDate)}`, this.margin, this.yPosition);
    this.doc.text(`Status: ${creditNote.status}`, this.margin, this.yPosition + 5); // Reduced from +7 to +5
    this.doc.text(`Reason: ${creditNote.reason}`, this.margin, this.yPosition + 10); // Reduced from +14 to +10
    
    this.yPosition += 20; // Reduced from 30 to +20
  }

  // New method for items table with images (for invoices and quotes)
  private async addItemsTableWithImages(items: any[], ...headers: string[]) {
    const tableTop = this.yPosition;
    const tableWidth = this.pageWidth - (2 * this.margin);
    
    // Column widths optimized for single page
    const imageColWidth = 25; // Image column
    const descColWidth = 80; // Description column
    const qtyColWidth = 20; // Quantity column
    const priceColWidth = 30; // Unit Price column
    const totalColWidth = 30; // Total column
    
    // Headers
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(headers[0], this.margin, tableTop); // Image
    this.doc.text(headers[1], this.margin + imageColWidth, tableTop); // Description
    this.doc.text(headers[2], this.margin + imageColWidth + descColWidth, tableTop); // Qty
    this.doc.text(headers[3], this.margin + imageColWidth + descColWidth + qtyColWidth, tableTop); // Unit Price
    this.doc.text(headers[4], this.margin + imageColWidth + descColWidth + qtyColWidth + priceColWidth, tableTop); // Total
    
    // Separator line
    this.doc.line(this.margin, tableTop + 5, this.pageWidth - this.margin, tableTop + 5);
    
    // Items
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    let currentY = tableTop + 15;
    const rowHeight = 16; // Further optimized row height to save space
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Check if we need a new page - only when we're actually running out of space
      const remainingItems = items.length - i;
      const spaceNeeded = remainingItems * rowHeight + 40; // 40 units for totals section
      const availableSpace = 297 - currentY - 20; // A4 page height minus margin
      
      // Only break if we have more than 3 items and are running out of space
      if (spaceNeeded > availableSpace && remainingItems > 3 && currentY > 200) {
        this.doc.addPage();
        currentY = 30;
        
        // Re-add headers on new page
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(headers[0], this.margin, currentY);
        this.doc.text(headers[1], this.margin + imageColWidth, currentY);
        this.doc.text(headers[2], this.margin + imageColWidth + descColWidth, currentY);
        this.doc.text(headers[3], this.margin + imageColWidth + descColWidth + qtyColWidth, currentY);
        this.doc.text(headers[4], this.margin + imageColWidth + descColWidth + qtyColWidth + priceColWidth, currentY);
        
        this.doc.line(this.margin, currentY + 5, this.pageWidth - this.margin, currentY + 5);
        currentY += 15;
      }
      
      // Add product image if available - with better error handling
      if (item.productImage && item.productImage.trim() !== '') {
        try {
          await this.addProductImage(item.productImage, this.margin, currentY, 15, 15);
        } catch (error) {
          // Add a placeholder rectangle if image fails
          this.doc.rect(this.margin, currentY, 15, 15);
          this.doc.setFontSize(6);
          this.doc.text('No Image', this.margin + 2, currentY + 8);
        }
      } else {
        // Add a placeholder rectangle for items without images
        this.doc.rect(this.margin, currentY, 15, 15);
        this.doc.setFontSize(6);
        this.doc.text('No Image', this.margin + 2, currentY + 8);
      }
      
      // Add text content
      this.doc.text(item.description, this.margin + imageColWidth, currentY);
      this.doc.text(item.quantity.toString(), this.margin + imageColWidth + descColWidth, currentY);
      this.doc.text(`R ${item.unitPrice.toFixed(2)}`, this.margin + imageColWidth + descColWidth + qtyColWidth, currentY);
      this.doc.text(`R ${item.total.toFixed(2)}`, this.margin + imageColWidth + descColWidth + qtyColWidth + priceColWidth, currentY);
      
      currentY += rowHeight;
    }
    
    this.yPosition = currentY + 5;
  }

  // Original method for items table without images (for credit notes)
  private addItemsTable(items: any[], ...headers: string[]) {
    const tableTop = this.yPosition;
    const tableWidth = this.pageWidth - (2 * this.margin);
    const colWidth = tableWidth / headers.length;
    
    // Headers
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    headers.forEach((header, index) => {
      this.doc.text(header, this.margin + (index * colWidth), tableTop);
    });
    
    // Separator line
    this.doc.line(this.margin, tableTop + 5, this.pageWidth - this.margin, tableTop + 5);
    
    // Items
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    let currentY = tableTop + 15;
    
    items.forEach((item, index) => {
      // Check if we need a new page - only when we're actually running out of space
      const remainingItems = items.length - index;
      const spaceNeeded = remainingItems * 8 + 40; // 8 units per row + 40 for totals
      const availableSpace = 297 - currentY - 20; // A4 page height minus margin
      
      // Only break if we have more than 3 items and are running out of space
      if (spaceNeeded > availableSpace && remainingItems > 3 && currentY > 200) {
        this.doc.addPage();
        currentY = 30;
      }
      
      this.doc.text(item.description, this.margin, currentY);
      this.doc.text(item.quantity.toString(), this.margin + colWidth, currentY);
      this.doc.text(`R ${item.unitPrice.toFixed(2)}`, this.margin + (2 * colWidth), currentY);
      this.doc.text(`R ${item.total.toFixed(2)}`, this.margin + (3 * colWidth), currentY);
      
      currentY += 8;
    });
    
    this.yPosition = currentY + 10;
  }

  private addTotals(
    subtotal: number,
    taxAmount: number,
    total: number,
    deliveryFee?: number,
    includeVat = false,
  ) {
    const totalsX = this.pageWidth - this.margin - 60;
    let yOffset = 0;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(includeVat ? 'Subtotal (excl. VAT):' : 'Subtotal:', totalsX, this.yPosition + yOffset);
    this.doc.text(`R ${subtotal.toFixed(2)}`, totalsX + 40, this.yPosition + yOffset);
    yOffset += 10;
    
    if (includeVat) {
      this.doc.text('VAT (15%):', totalsX, this.yPosition + yOffset);
      this.doc.text(`R ${taxAmount.toFixed(2)}`, totalsX + 40, this.yPosition + yOffset);
      yOffset += 10;
    }
    
    if (deliveryFee && deliveryFee > 0) {
      this.doc.text(includeVat ? 'Delivery Fee (incl. VAT):' : 'Delivery Fee:', totalsX, this.yPosition + yOffset);
      this.doc.text(`R ${deliveryFee.toFixed(2)}`, totalsX + 40, this.yPosition + yOffset);
      yOffset += 10;
    }
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(includeVat ? 'Total (incl. VAT):' : 'Total:', totalsX, this.yPosition + yOffset);
    this.doc.text(`R ${total.toFixed(2)}`, totalsX + 40, this.yPosition + yOffset);
    
    this.yPosition += yOffset + 15;
  }

  private addNotes(notes: string) {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Notes:', this.margin, this.yPosition);
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    const words = notes.split(' ');
    let line = '';
    let lineY = this.yPosition + 7;
    
    words.forEach(word => {
      const testLine = line + word + ' ';
      if (this.doc.getTextWidth(testLine) > this.pageWidth - (2 * this.margin)) {
        this.doc.text(line, this.margin, lineY);
        line = word + ' ';
        lineY += 5;
      } else {
        line = testLine;
      }
    });
    this.doc.text(line, this.margin, lineY);
    
    this.yPosition = lineY + 15;
  }

  private addTerms(terms: string) {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Terms & Conditions:', this.margin, this.yPosition);
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    const words = terms.split(' ');
    let line = '';
    let lineY = this.yPosition + 7;
    
    words.forEach(word => {
      const testLine = line + word + ' ';
      if (this.doc.getTextWidth(testLine) > this.pageWidth - (2 * this.margin)) {
        this.doc.text(line, this.margin, lineY);
        line = word + ' ';
        lineY += 5;
      } else {
        line = testLine;
      }
    });
    this.doc.text(line, this.margin, lineY);
    
    this.yPosition = lineY + 15;
  }
}

export const pdfGenerator = new PDFGenerator(); 