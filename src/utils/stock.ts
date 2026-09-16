import { getFunctionsInstance } from '../firebase/config'

/**
 * Buyurtma berilgandan keyin zaxirani Firestore'da (Cloud Function
 * `applyOrderStock` orqali) atomik kamaytiradi. `telegram.ts` bilan bir
 * xil naqsh: `firebase/functions` DINAMIK import (bosh sahifa
 * bundle'iga tushmasin), hech qachon throw qilmaydi.
 *
 * Miqdorni bu yerdan hech narsa yubormaymiz — funksiya `orderId`ni
 * o'qib, kamaytiriladigan miqdorni Firestore'dagi buyurtma hujjatining
 * o'zidan oladi (functions/src/index.ts, `applyOrderStock` izohi).
 *
 * Qaytaradi: server yozuvi muvaffaqiyatli bo'ldimi. `false` — mijoz
 * BUYURTMASI bekor qilinmaydi (u aybdor emas), lekin chaqiruvchi buni
 * ko'rsatishi kerak (jim yutilmasin), Checkout.tsx -> `delivery.stockOk`.
 */
export const applyOrderStock = async (orderId: string): Promise<boolean> => {
  try {
    const [{ httpsCallable }, functions] = await Promise.all([import('firebase/functions'), getFunctionsInstance()])
    const call = httpsCallable<{ orderId: string }, { ok: boolean; alreadyApplied?: boolean }>(functions, 'applyOrderStock')
    const res = await call({ orderId })
    return Boolean(res.data?.ok)
  } catch (e) {
    console.error('[Stock]', e)
    return false
  }
}
