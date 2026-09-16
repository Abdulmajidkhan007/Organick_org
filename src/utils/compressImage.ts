/**
 * Telefon kamerasidan kelgan rasmni (odatda 3-5 MB JPEG) brauzerda
 * siqadi — HECH QANDAY tashqi kutubxonasiz, faqat `<canvas>`.
 *
 * Nega brauzerda: admin faqat telefondan ishlaydi, ya'ni fayl serverga
 * tushishidan OLDIN kichraytirilishi shart — aks holda har bir mijoz
 * o'sha 3-5 MB'ni yuklab olardi va bosh sahifani 9 MB dan 876 KB ga
 * tushirgan mehnat (CLAUDE.md, rasm qoidasi) katalog rasmlarida
 * qaytadan yo'qolardi.
 *
 * `scripts/optimize-images.mjs` bu yerda YORDAM BERMAYDI — u `sharp`
 * bilan Node'da ishlaydi, brauzerda emas.
 */

/** Katalog rasmlari (webp) o'rtacha 29-50 KB — 1200px keng bo'lsa yetarli. */
const MAX_WIDTH = 1200
/** Storage qoidasi (`storage.rules`) 1 MB dan katta faylni rad etadi. */
const MAX_BYTES = 1024 * 1024
/** Sifatni pasaytirib qayta urinish — birinchi urinishdan TASHQARI. */
const MAX_RETRIES = 3

export type CompressImageErrorCode = 'unreadable' | 'unsupported' | 'too-large'

/**
 * Xato KOD bilan keladi, matn bilan emas — matnni ko'rsatadigan
 * komponent uni `t()` orqali tarjima qiladi (CLAUDE.md: komponentga
 * to'g'ridan-to'g'ri matn yozilmaydi, bu qoidaga util ham amal qiladi).
 */
export class CompressImageError extends Error {
  code: CompressImageErrorCode
  constructor(code: CompressImageErrorCode) {
    super(`compressImage: ${code}`)
    this.name = 'CompressImageError'
    this.code = code
  }
}

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new CompressImageError('unreadable'))
    }
    img.src = url
  })

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> =>
  new Promise(resolve => canvas.toBlob(resolve, type, quality))

/**
 * `File` -> siqilgan `Blob`. Eni eng ko'pi 1200px (bo'yi mutanosib
 * kichrayadi), webp 0.8 sifat bilan. `toBlob` webp qo'llab-quvvatlamasa
 * (ba'zi eski brauzerlar `null` qaytaradi) jpeg 0.8 ga qaytadi.
 * Natija 1 MB dan katta bo'lsa sifat pasaytirilib eng ko'pi 3 marta
 * qayta urinadi; oxirida ham katta bo'lsa XATO tashlaydi — jimgina
 * katta faylni yuklab yubormaydi.
 */
export const compressImage = async (file: File): Promise<Blob> => {
  const img = await loadImage(file)

  const scale = Math.min(1, MAX_WIDTH / img.naturalWidth)
  const width = Math.max(1, Math.round(img.naturalWidth * scale))
  const height = Math.max(1, Math.round(img.naturalHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new CompressImageError('unsupported')
  ctx.drawImage(img, 0, 0, width, height)

  let mimeType = 'image/webp'
  let quality = 0.8
  let blob: Blob | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    blob = await canvasToBlob(canvas, mimeType, quality)
    if (!blob && mimeType === 'image/webp') {
      // webp qo'llab-quvvatlanmaydi — jpeg'ga qaytamiz, xuddi shu urinishda.
      mimeType = 'image/jpeg'
      blob = await canvasToBlob(canvas, mimeType, quality)
    }
    if (blob && blob.size <= MAX_BYTES) return blob
    quality = Math.max(0.1, quality - 0.2)
  }

  if (!blob) throw new CompressImageError('unsupported')
  throw new CompressImageError('too-large')
}
