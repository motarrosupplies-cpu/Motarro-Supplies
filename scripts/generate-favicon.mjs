import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import toIco from 'to-ico'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'favicon.png')
const buf = fs.readFileSync(src)

const images = await Promise.all(
  [16, 32, 48].map((size) => sharp(buf).resize(size, size).png().toBuffer())
)

const ico = await toIco(images)
fs.writeFileSync(path.join(root, 'public', 'favicon.ico'), ico)
console.log(`Wrote public/favicon.ico (${ico.length} bytes)`)
