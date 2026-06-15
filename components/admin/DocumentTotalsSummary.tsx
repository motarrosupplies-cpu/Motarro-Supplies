import { Separator } from '@/components/ui/separator'
import type { DocumentTotals } from '@/lib/invoice-totals'

interface DocumentTotalsSummaryProps {
  totals: DocumentTotals
}

export function DocumentTotalsSummary({ totals }: DocumentTotalsSummaryProps) {
  const { subtotal, taxAmount, deliveryFee, total, includeVat } = totals

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>{includeVat ? 'Subtotal (excl. VAT):' : 'Subtotal:'}</span>
        <span>R {subtotal.toFixed(2)}</span>
      </div>
      {includeVat ? (
        <div className="flex justify-between">
          <span>VAT (15%):</span>
          <span>R {taxAmount.toFixed(2)}</span>
        </div>
      ) : null}
      {deliveryFee > 0 ? (
        <div className="flex justify-between">
          <span>{includeVat ? 'Delivery Fee (incl. VAT):' : 'Delivery Fee:'}</span>
          <span>R {deliveryFee.toFixed(2)}</span>
        </div>
      ) : null}
      <Separator />
      <div className="flex justify-between font-bold text-lg">
        <span>{includeVat ? 'Total (incl. VAT):' : 'Total:'}</span>
        <span>R {total.toFixed(2)}</span>
      </div>
    </div>
  )
}
