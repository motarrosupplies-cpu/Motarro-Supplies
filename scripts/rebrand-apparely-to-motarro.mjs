/**
 * Bulk rebrand: Apparely → MOTARRO Supplies in source files.
 * Run: node scripts/rebrand-apparely-to-motarro.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist'])
const EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.txt', '.md', '.mjs'])

const replacements = [
  ['https://apparely.co.za', 'https://www.motarro.co.za'],
  ['http://apparely.co.za', 'https://www.motarro.co.za'],
  ['www.apparely.co.za', 'www.motarro.co.za'],
  ['apparely.co.za', 'www.motarro.co.za'],
  ['APPARELY_SYSTEM_PROMPT', 'MOTARRO_SYSTEM_PROMPT'],
  ['APPARELY_SITE_URL', 'MOTARRO_SITE_URL'],
  ['APPARELY_LOGO_STORAGE_URL', 'MOTARRO_LOGO_URL'],
  ['APPARELY_LOGO_SITE_URL', 'MOTARRO_LOGO_URL'],
  ['APPARELY_EMAIL_LOGO_URL', 'MOTARRO_EMAIL_LOGO_URL'],
  ['@apparely', '@motarrosupplies'],
  ['Apparely Logo', 'MOTARRO Supplies Logo'],
  ['Apparely - ', 'MOTARRO Supplies — '],
  ['| Apparely', '| MOTARRO Supplies'],
  ['Apparely.', 'MOTARRO Supplies.'],
  ['Apparely,', 'MOTARRO Supplies,'],
  ['Apparely ', 'MOTARRO Supplies '],
  ['Apparely', 'MOTARRO Supplies'],
  ['apparely', 'motarro'],
]

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, files)
    else if (EXT.has(extname(name))) files.push(p)
  }
  return files
}

let changed = 0
for (const file of walk(ROOT)) {
  if (file.includes('rebrand-apparely')) continue
  let content = readFileSync(file, 'utf8')
  const original = content
  for (const [from, to] of replacements) {
    content = content.split(from).join(to)
  }
  if (content !== original) {
    writeFileSync(file, content, 'utf8')
    changed++
    console.log('Updated:', file.replace(ROOT, ''))
  }
}
console.log(`Done. ${changed} files updated.`)
