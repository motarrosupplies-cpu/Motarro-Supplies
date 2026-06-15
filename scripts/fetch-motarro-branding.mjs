/** One-off: inspect Motarro AU storefront HTML for colors and logo URLs */
const res = await fetch("https://www.motarro.com.au/");
const html = await res.text();
const hex = [...new Set([...html.matchAll(/#[0-9a-fA-F]{6}/g)].map((m) => m[0]))];
const cssVars = [...html.matchAll(/--[a-z-]+:\s*[^;]+/gi)].map((m) => m[0]).slice(0, 40);
const files = [...new Set([...html.matchAll(/cdn\/shop\/files\/[^"'\s?]+/g)].map((m) => m[0]))];
console.log("hex colors:", hex.slice(0, 25));
console.log("css vars:", cssVars);
console.log("cdn files:", files.filter((f) => /logo|brand|mark/i.test(f)));
