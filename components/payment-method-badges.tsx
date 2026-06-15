import { cn } from '@/lib/utils'

const DEFAULT_METHODS = ['PayFast', 'Visa', 'Mastercard'] as const

type PaymentMethod = (typeof DEFAULT_METHODS)[number]

type PaymentMethodBadgesProps = {
  methods?: readonly PaymentMethod[]
  highlightGooglePay?: boolean
  className?: string
  label?: string
}

function GooglePayMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 41 17"
      aria-hidden
      className={cn('h-4 w-auto', className)}
    >
      <path
        fill="#4285F4"
        d="M3.9 8.5c0-.6.1-1.2.2-1.7H0v3.2h2.2a3.7 3.7 0 0 1-1.6 2.4v2h2.6c1.5-1.4 2.4-3.4 2.4-5.9z"
      />
      <path
        fill="#34A853"
        d="M8.1 13.1c1.1 0 2-.4 2.7-1l2.5 1.9c-1.2 1.1-2.7 1.8-4.4 1.8-3.4 0-6.2-2.3-7.2-5.4H0v2.3A8 8 0 0 0 8.1 16c2.4 0 4.4-.8 5.9-2.2l-2.5-1.9c-.7.4-1.6.7-2.7.7z"
      />
      <path
        fill="#FBBC05"
        d="M1 4.6A8 8 0 0 0 0 8.5c0 1.3.3 2.5.9 3.6V4.6z"
      />
      <path
        fill="#EA4335"
        d="M8.1 3.2c1.3 0 2.5.4 3.4 1.3l2.5-2.5C12.5.9 10.5 0 8.1 0 4.9 0 2.1 1.8.9 4.6l2.1 1.6c1-2.9 3.8-5 5.1-5z"
      />
      <path
        fill="#5F6368"
        d="M16.2 3.4h1.8l2.1 5.3 2.1-5.3h1.8l-3.2 7.4h-1.9l-1.7-4.3-1.7 4.3h-1.9L16.2 3.4zm9.8 0h1.7v7.4h-1.7V3.4zm3.5 0h4.2c1.2 0 2.1.3 2.7.9.6.6.9 1.4.9 2.4 0 1-.3 1.8-.9 2.4-.6.6-1.5.9-2.7.9h-2.5v-6.6zm1.7 1.4v3.8h2.4c.6 0 1-.2 1.3-.5.3-.3.4-.7.4-1.2 0-.5-.1-.9-.4-1.2-.3-.3-.7-.5-1.3-.5h-2.4z"
      />
    </svg>
  )
}

export function PaymentMethodBadges({
  methods = DEFAULT_METHODS,
  highlightGooglePay = false,
  className,
  label,
}: PaymentMethodBadgesProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-3', className)}>
      {label ? <span className="text-xs text-slate-600 font-medium">{label}</span> : null}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {methods.map((name) => {
          const isGooglePay = name === 'Google Pay'

          return (
            <div
              key={name}
              title={name}
              className={cn(
                'flex items-center justify-center px-3 py-1.5 rounded-md border transition-colors',
                isGooglePay && highlightGooglePay
                  ? 'bg-slate-900 border-slate-900'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              )}
            >
              {isGooglePay ? (
                <GooglePayMark className={highlightGooglePay ? 'brightness-0 invert' : undefined} />
              ) : (
                <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">{name}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
