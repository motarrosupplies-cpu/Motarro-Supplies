import { promises as fs } from "node:fs";
import path from "node:path";

const TEXT_EXTS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".md",
  ".mdx",
  ".json",
  ".txt",
]);

const ROOT = process.cwd();

async function listFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === "node_modules" || e.name === ".next" || e.name === ".git") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await listFiles(full)));
    else out.push(full);
  }
  return out;
}

function extractExternalLinks(text: string): string[] {
  // Basic URL extractor. We’ll de-dupe later.
  const matches = text.match(/https?:\/\/[^\s"'<>)]{5,}/g) || [];
  return matches.map((m) => m.replace(/[),.;]+$/g, ""));
}

async function headOrGet(url: string, timeoutMs: number): Promise<number> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    // Try HEAD first.
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "follow", signal: ctrl.signal });
      return res.status;
    } catch {
      // Some servers block HEAD; fall back to GET.
      const res = await fetch(url, { method: "GET", redirect: "follow", signal: ctrl.signal });
      return res.status;
    }
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  const files = await listFiles(ROOT);

  // --- external links ---
  const linksByFile = new Map<string, string[]>();
  const allLinks = new Set<string>();

  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    if (!TEXT_EXTS.has(ext)) continue;
    const rel = path.relative(ROOT, f);
    const content = await fs.readFile(f, "utf8").catch(() => "");
    if (!content) continue;
    const links = extractExternalLinks(content);
    if (links.length === 0) continue;
    linksByFile.set(rel, links);
    for (const l of links) allLinks.add(l);
  }

  const uniq = Array.from(allLinks).sort();
  const broken: Array<{ url: string; status: number }> = [];

  // Keep this conservative for CI/local runs.
  const TIMEOUT_MS = 12000;
  const CONCURRENCY = 8;
  let idx = 0;

  async function worker() {
    while (idx < uniq.length) {
      const i = idx++;
      const url = uniq[i];
      // Skip mailto/tel and very likely false positives
      if (!url.startsWith("http")) continue;
      try {
        const status = await headOrGet(url, TIMEOUT_MS);
        if (status >= 400) broken.push({ url, status });
      } catch {
        broken.push({ url, status: 0 });
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  // --- titles length + missing h1 (best-effort heuristics) ---
  const appDir = path.join(ROOT, "app");
  const appFiles = files.filter((f) => f.startsWith(appDir) && f.endsWith("page.tsx"));
  const longTitles: Array<{ file: string; title: string; length: number }> = [];
  const missingH1: string[] = [];

  for (const f of appFiles) {
    const rel = path.relative(ROOT, f);
    const content = await fs.readFile(f, "utf8").catch(() => "");
    if (!content) continue;
    // crude: catches metadata.title = "..."
    const titleMatches = Array.from(content.matchAll(/title\s*:\s*["'`](.{10,300})["'`]/g));
    for (const m of titleMatches) {
      const t = String(m[1] || "").trim();
      if (t.length > 70) longTitles.push({ file: rel, title: t, length: t.length });
    }
    // crude: missing <h1
    if (!content.includes("<h1") && !content.includes("h1 ")) {
      missingH1.push(rel);
    }
  }

  const report = {
    generated_at: new Date().toISOString(),
    broken_external_links: broken.sort((a, b) => b.status - a.status),
    long_titles_over_70: longTitles.sort((a, b) => b.length - a.length),
    pages_missing_h1: missingH1.sort(),
  };

  await fs.writeFile(
    path.join(ROOT, "semrush-warnings-audit.json"),
    JSON.stringify(report, null, 2),
    "utf8"
  );

  console.log("Wrote semrush-warnings-audit.json");
  console.log("Broken external links:", broken.length);
  console.log("Long titles > 70:", longTitles.length);
  console.log("Pages missing <h1> (heuristic):", missingH1.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

