import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
const heroPath = join(projectRoot, 'public', 'images', 'hero.webp')
const optimizedPath = join(projectRoot, 'public', 'images', 'hero-optimized.webp')

async function fileSize(path) {
  const stats = await fs.stat(path)
  return stats.size
}

function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}

async function optimizeHero() {
  try {
    await fs.access(heroPath)
  } catch {
    console.warn(`[optimize-images] Skipping hero image – file not found at ${heroPath}`)
    return
  }

  const originalSize = await fileSize(heroPath)

  await sharp(heroPath)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 58, effort: 6 })
    .toFile(optimizedPath)

  const optimizedSize = await fileSize(optimizedPath)

  console.log('[optimize-images] Hero image optimized successfully')
  console.log(`  Before: ${formatBytes(originalSize)}`)
  console.log(`  After : ${formatBytes(optimizedSize)}`)
  console.log(`  Savings: ${(100 - (optimizedSize / originalSize) * 100).toFixed(1)}%`)
  console.log(`  Output : ${optimizedPath}`)
}

async function main() {
  await optimizeHero()
}

main().catch((error) => {
  console.error('[optimize-images] Optimization failed:', error)
  process.exitCode = 1
})
