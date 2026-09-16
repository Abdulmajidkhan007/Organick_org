import { test, expect } from '@playwright/test'

/**
 * `compressImage` (src/utils/compressImage.ts) — sof funksiya sifatida
 * sinaladi, taxmin emas, O'LCHOV bilan: telefon kamerasidan kelgan
 * katta rasmni (bu yerda 3000x2000 canvas'dan yasalgan PNG, real
 * telefon fotosi kabi bir necha MB) beramiz va natijaning ENI 1200px
 * dan oshmasligini, HAJMI 1 MB dan kichikligini raqam bilan tekshiramiz.
 *
 * Dev server Vite orqali ishlayotgani uchun modulni to'g'ridan-to'g'ri
 * `/src/utils/compressImage.ts` yo'li bilan brauzerda dinamik import
 * qilamiz — alohida test sahifasi kerak emas.
 */
test('compressImage — 3000x2000 rasmni 1200px va 1 MB dan pastga siqadi', async ({ page }) => {
  await page.goto('/')

  const result = await page.evaluate(async () => {
    const { compressImage } = await import('/src/utils/compressImage.ts')

    // "Telefon rasmi": 3000x2000, tasodifiy rangli to'rtburchaklar bilan
    // to'ldirilgan — bir xil rangdagi rasm juda oson siqiladi, bu esa
    // siqishning REAL ishlashini ko'rsatmaydi.
    const canvas = document.createElement('canvas')
    canvas.width = 3000
    canvas.height = 2000
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    for (let i = 0; i < 800; i++) {
      ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 50%)`
      ctx.fillRect(Math.random() * 3000, Math.random() * 2000, Math.random() * 250, Math.random() * 250)
    }

    const sourceBlob: Blob = await new Promise(resolve => canvas.toBlob(b => resolve(b as Blob), 'image/png'))
    const file = new File([sourceBlob], 'telefon-rasm.png', { type: 'image/png' })

    const compressed = await compressImage(file)

    // Natija enini o'lchash uchun qayta Image sifatida ochamiz.
    const url = URL.createObjectURL(compressed)
    const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = () => reject(new Error('compressed blob rasm sifatida ochilmadi'))
      img.src = url
    })
    URL.revokeObjectURL(url)

    return {
      sourceWidth: 3000,
      sourceSize: sourceBlob.size,
      compressedSize: compressed.size,
      compressedType: compressed.type,
      width: dims.width,
      height: dims.height,
    }
  })

  console.log(
    `[compressImage] manba: ${result.sourceWidth}px / ${result.sourceSize} bayt -> ` +
    `natija: ${result.width}x${result.height}px / ${result.compressedSize} bayt (${result.compressedType})`
  )

  expect(result.width).toBeLessThanOrEqual(1200)
  expect(result.compressedSize).toBeLessThan(1024 * 1024)
  // Siqish haqiqatan ham ISHLAGANI — natija manbadan sezilarli kichik.
  expect(result.compressedSize).toBeLessThan(result.sourceSize)
})
