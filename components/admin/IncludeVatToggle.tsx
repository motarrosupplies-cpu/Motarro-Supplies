import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface IncludeVatToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id?: string
}

export function IncludeVatToggle({ checked, onCheckedChange, id = 'includeVat' }: IncludeVatToggleProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-4">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <div className="space-y-1">
        <Label htmlFor={id} className="cursor-pointer font-medium">
          Include VAT (15%)
        </Label>
        <p className="text-sm text-muted-foreground">
          Turn off while you are not VAT registered. Prices will be shown without a VAT breakdown.
        </p>
      </div>
    </div>
  )
}
