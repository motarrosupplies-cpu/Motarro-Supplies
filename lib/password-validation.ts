export interface PasswordRequirement {
  id: string
  label: string
  test: (password: string) => boolean
}

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (password) => password.length >= 8,
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter (a-z)',
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter (A-Z)',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'digit',
    label: 'One number (0-9)',
    test: (password) => /[0-9]/.test(password),
  },
  {
    id: 'special',
    label: 'One special character (!@#$%^&* etc.)',
    test: (password) => /[!@#$%^&*()_+\-=[\]{}|;':",./<>?]/.test(password),
  },
]

export function getPasswordValidationErrors(password: string): string[] {
  return PASSWORD_REQUIREMENTS
    .filter((requirement) => !requirement.test(password))
    .map((requirement) => requirement.label)
}

export function isPasswordValid(password: string): boolean {
  return getPasswordValidationErrors(password).length === 0
}

export function getPasswordValidationMessage(password: string): string | null {
  const errors = getPasswordValidationErrors(password)
  if (errors.length === 0) return null
  return `Password must include: ${errors.join(', ')}.`
}
