const VAT_RATE = 0.15

export interface DocumentTotals {
  subtotal: number
  taxAmount: number
  deliveryFee: number
  total: number
  includeVat: boolean
}

export function calculateDocumentTotals(
  itemsTotal: number,
  deliveryFee = 0,
  includeVat = false,
): DocumentTotals {
  if (includeVat) {
    const taxAmount = itemsTotal * VAT_RATE / (1 + VAT_RATE)
    const subtotal = itemsTotal - taxAmount
    return {
      subtotal,
      taxAmount,
      deliveryFee,
      total: itemsTotal + deliveryFee,
      includeVat: true,
    }
  }

  return {
    subtotal: itemsTotal,
    taxAmount: 0,
    deliveryFee,
    total: itemsTotal + deliveryFee,
    includeVat: false,
  }
}

export function formatDocumentTotals(doc: {
  subtotal: number
  taxAmount: number
  deliveryFee?: number
  total: number
  includeVat?: boolean
}): DocumentTotals {
  return {
    subtotal: doc.subtotal,
    taxAmount: doc.taxAmount,
    deliveryFee: doc.deliveryFee ?? 0,
    total: doc.total,
    includeVat: doc.includeVat ?? doc.taxAmount > 0,
  }
}
