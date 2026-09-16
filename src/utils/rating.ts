import { getFunctionsInstance } from '../firebase/config'

export interface RateProductResult {
  rating: number
  ratingSum: number
  ratingCount: number
}

/**
 * Mahsulotga baho qo'yadi — Cloud Function `rateProduct` orqali (atomik,
 * O(1)). `telegram.ts` bilan bir xil naqsh: `firebase/functions` DINAMIK
 * import, hech qachon throw qilmaydi.
 *
 * `telegram.ts`dan farqli, bu yerda oddiy `boolean` emas — yangilangan
 * o'rtacha reyting va hisoblagichlar qaytariladi (`null` — muvaffaqiyatsiz),
 * chunki chaqiruvchi (ShopSingle.tsx) natijani Redux'dagi mahsulotga
 * darhol yozishi kerak (butun kolleksiyani qayta o'qimasdan).
 *
 * `request.auth` shart — kirmagan foydalanuvchi uchun bu funksiya
 * chaqirilmasin (ShopSingle.tsx allaqachon "kirish kerak" ko'rsatadi).
 */
export const rateProduct = async (productId: number, rating: number): Promise<RateProductResult | null> => {
  try {
    const [{ httpsCallable }, functions] = await Promise.all([import('firebase/functions'), getFunctionsInstance()])
    const call = httpsCallable<{ productId: number; rating: number }, RateProductResult>(functions, 'rateProduct')
    const res = await call({ productId, rating })
    return res.data
  } catch (e) {
    console.error('[Rating]', e)
    return null
  }
}
