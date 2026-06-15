const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/** Reject CRLF and other header-injection characters in mail fields. */
export function sanitizeMailField(value: string, maxLength = 500): string {
  return value
    .replace(/[\r\n\0]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function isValidEmail(email: string): boolean {
  const normalized = sanitizeMailField(email, 254);
  if (!normalized || normalized.length > 254) return false;
  return EMAIL_RE.test(normalized);
}
