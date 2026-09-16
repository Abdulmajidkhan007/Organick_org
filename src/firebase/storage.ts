import app from './config'

/**
 * KATALOG RASMINI YUKLASH — FAQAT ADMIN, Firebase Storage bilan.
 *
 * `firebase/storage` bu yerda `config.ts` dagi `getFunctionsInstance()`
 * naqshiga ergashib DINAMIK import qilinadi va natija keshlanadi — bu
 * modul faqat ProductsTab/BlogsTab (lazy `/admin` route) tomonidan
 * chaqiriladi, shuning uchun SDK bosh sahifa bundle'iga hech qachon
 * tushmaydi. Bu faylni bosh sahifadan chaqiriladigan hech qanday
 * modulga (statik ham, dinamik ham) import qilmang.
 */
let storageModulePromise: Promise<typeof import('firebase/storage')> | null = null

const getStorageModule = () => {
  if (!storageModulePromise) {
    storageModulePromise = import('firebase/storage').catch(e => {
      storageModulePromise = null
      throw e
    })
  }
  return storageModulePromise
}

let storageInstance: import('firebase/storage').FirebaseStorage | null = null

/**
 * Siqilgan rasmni (`compressImage` natijasi) `catalog/<kind>/...` ostiga
 * yuklaydi va ochiq yuklab olish URL'ini qaytaradi. Bu URL to'g'ridan-
 * to'g'ri `Product.img` / `BlogPost.img` maydoniga yoziladi — sxema
 * o'zgarmaydi, chunki u ham oddiy satr (avvalgi qo'lda yozilgan URL
 * kabi).
 *
 * `storage.rules`: `catalog/**` ostiga faqat KIRGAN foydalanuvchi,
 * 1 MB dan kichik, rasm turidagi fayl yoza oladi. Haqiqiy chegara
 * (faqat ADMIN) Firestore'da — `products`/`blogs` ga yozish
 * `isAdmin()` bilan cheklangan, Storage'ga tushgan rasm katalogga
 * kirmasa hech narsa emas (storage.rules'dagi izohga qarang).
 *
 * ONGLI QARZ: mahsulot/blog tahrirlanganda ESKI fayl Storage'da
 * qoladi — o'chirish bu sessiyada qo'shilmagan
 * (docs/ARXITEKTURA-TARIXI.md).
 */
export const uploadCatalogImage = async (blob: Blob, kind: 'product' | 'blog'): Promise<string> => {
  const { getStorage, ref, uploadBytes, getDownloadURL } = await getStorageModule()
  if (!storageInstance) storageInstance = getStorage(app)

  const path = `catalog/${kind}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.webp`
  const fileRef = ref(storageInstance, path)
  await uploadBytes(fileRef, blob, { contentType: blob.type || 'image/webp' })
  return getDownloadURL(fileRef)
}
