#!/usr/bin/env node
// Converts every PNG under src/assets to a same-named .webp (quality 80),
// downscaling anything wider than 1920px in the process. Originals are
// kept in place so the change is reversible until the imports are updated
// and verified.
import { readdir, stat } from 'node:fs/promises'
import { join, extname } from 'node:path'
import sharp from 'sharp'

const ASSETS_DIR = join(import.meta.dirname, '..', 'src', 'assets')
const MAX_WIDTH = 1920
const QUALITY = 80

async function findPngs(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await findPngs(full)))
    } else if (extname(entry.name).toLowerCase() === '.png') {
      files.push(full)
    }
  }
  return files
}

async function main() {
  const pngs = await findPngs(ASSETS_DIR)
  let totalBefore = 0
  let totalAfter = 0

  for (const pngPath of pngs) {
    const webpPath = pngPath.replace(/\.png$/i, '.webp')
    const before = (await stat(pngPath)).size

    const image = sharp(pngPath)
    const metadata = await image.metadata()
    if (metadata.width && metadata.width > MAX_WIDTH) {
      image.resize({ width: MAX_WIDTH })
    }

    await image.webp({ quality: QUALITY }).toFile(webpPath)

    const after = (await stat(webpPath)).size
    totalBefore += before
    totalAfter += after
    console.log(
      `${pngPath.replace(ASSETS_DIR, 'src/assets')} ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`
    )
  }

  console.log('---')
  console.log(`Total: ${(totalBefore / 1024 / 1024).toFixed(2)}MB -> ${(totalAfter / 1024 / 1024).toFixed(2)}MB`)
}

main()
