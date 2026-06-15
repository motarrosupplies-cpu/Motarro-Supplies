/**
 * Patterns are matched as case-insensitive substrings on the full email.
 * Example block: "@laerskooledleen.co.za" — blocks any address containing that text.
 * Allow list: if non-empty, only emails matching at least one pattern are kept.
 */
export function normalizePattern(line: string): string {
  return line.trim().toLowerCase();
}

export function parsePatternLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map(normalizePattern)
    .filter(Boolean);
}

export function filterEmailsByPatterns(
  emails: string[],
  allowlistPatterns: string[],
  blocklistPatterns: string[]
): string[] {
  const allow = allowlistPatterns.map(normalizePattern).filter(Boolean);
  const block = blocklistPatterns.map(normalizePattern).filter(Boolean);

  const seen = new Set<string>();
  let out = emails
    .map((e) => e.trim().toLowerCase())
    .filter((e) => {
      if (!e || !e.includes("@")) return false;
      if (seen.has(e)) return false;
      seen.add(e);
      return true;
    });

  if (allow.length > 0) {
    out = out.filter((email) =>
      allow.some((pattern) => email.includes(pattern))
    );
  }

  if (block.length > 0) {
    out = out.filter(
      (email) => !block.some((pattern) => email.includes(pattern))
    );
  }

  return out;
}
