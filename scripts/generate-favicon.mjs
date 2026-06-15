import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'favicon.ico')
const dest = path.join(root, 'public', 'favicon.ico')

if (!fs.existsSync(src)) {
  console.error('Missing favicon.ico at project root')
  process.exit(1)
}

const buf = fs.readFileSync(src)
if (buf.length < 4 || buf[0] !== 0 || buf[1] !== 0 || buf[2] !== 1 || buf[3] !== 0) {
  console.error('favicon.ico is not a valid ICO file')
  process.exit(1)
}

fs.copyFileSync(src, dest)
console.log(`Copied favicon.ico → public/favicon.ico (${buf.length} bytes)`)
