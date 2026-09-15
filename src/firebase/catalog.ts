import {
  collection,
  doc,
  deleteDoc,
  getDocs,
  limit,
  query,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { getDb } from './config'
import { Product, BlogPost } from '../types'

/**
 * KATALOGGA YOZISH — FAQAT ADMIN, Firestore SDK bilan.
 *
 * `firestore.ts` / `userProfile.ts` bilan bir xil naqsh: bu fayl
 * `firebase/firestore` ni STATIK import qiladi va shu ATAYLAB — uni
 * faqat `/admin` (lazy route, `Admin/Dashboard`) ishlatadi, ya'ni SDK
 * o'sha chunk'da qoladi va bosh sahifaga yetib bormaydi.
 *
 * Mijoz TOMONI bu faylni ISHLATMAYDI — u REST bilan o'qiydi
 * (`catalogRest.ts`). Bu ikkisini aralashtirmang.
 */

/**
 * Firestore `undefined` qiymatni QABUL QILMAYDI (xato tashlaydi), lekin
 * `Product.description` / `stock` / `imgWidth` ixtiyoriy. Shuning uchun
 * yozishdan oldin `undefined` maydonlarni olib tashlaymiz (`null` emas —
 * o'qishda ular yo'q bo'lib qolgani ma'qul).
 */
const stripUndefined = <T extends object>(obj: T): Record<string, unknown> =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))

// Hujjat ID'si — mahsulot/blog `id` sining matn ko'rinishi. Shu bilan
// REST o'qishda hujjat NOMIdan `id` ni tiklab olamiz (catalogRest.ts).
const productRef = (db: Awaited<ReturnType<typeof getDb>>, id: number) => doc(db, 'products', String(id))
const blogRef = (db: Awaited<ReturnType<typeof getDb>>, id: number) => doc(db, 'blogs', String(id))

/**
 * Mahsulotni yozadi (yangi bo'lsa yaratadi, mavjud bo'lsa BUTUNLAY
 * almashtiradi — admin formasi har doim to'liq hujjat yuboradi).
 * Xato bo'lsa THROW qiladi: chaqiruvchi uni mijozga KO'RSATISHI shart,
 * jimgina yutib yuborilmasin.
 */
export const saveProductToFirestore = async (product: Product): Promise<void> => {
  const db = await getDb()
  await setDoc(productRef(db, product.id), stripUndefined(product))
}

export const deleteProductFromFirestore = async (id: number): Promise<void> => {
  const db = await getDb()
  await deleteDoc(productRef(db, id))
}

export const saveBlogToFirestore = async (blog: BlogPost): Promise<void> => {
  const db = await getDb()
  await setDoc(blogRef(db, blog.id), stripUndefined(blog))
}

export const deleteBlogFromFirestore = async (id: number): Promise<void> => {
  const db = await getDb()
  await deleteDoc(blogRef(db, id))
}

/**
 * Kolleksiyada ALOQACHON hujjat bormi? Bitta hujjat so'raymiz
 * (`limit(1)`) — butun kolleksiyani o'qish shart emas.
 */
const hasAnyDoc = async (db: Awaited<ReturnType<typeof getDb>>, name: string): Promise<boolean> => {
  const snap = await getDocs(query(collection(db, name), limit(1)))
  return !snap.empty
}

export interface CatalogSeedResult {
  /** `false` bo'lsa hech narsa YOZILMADI (kolleksiya bo'sh emas edi). */
  written: boolean
  products: number
  blogs: number
}

/**
 * BIR MARTALIK KO'CHIRISH: kod ichidagi seed katalogni Firestore'ga
 * yozadi.
 *
 * XAVFSIZLIK SHARTI: ikkala kolleksiya ham BO'SH bo'lsagina yozadi.
 * Bittasida ham hujjat bo'lsa — `written: false` qaytaradi va HECH
 * NARSA yozmaydi. Mavjud katalog ustiga yozib yuborish real
 * ma'lumotni yo'qotardi (CLAUDE.md — qaytarib bo'lmaydigan amallar).
 *
 * Yozish `writeBatch` bilan, ya'ni atomik: yo hammasi tushadi, yo
 * hech biri (yarim to'lgan katalog qolmaydi). Batch chegarasi 500 ta
 * amal — seed 26 ta, bemalol sig'adi.
 */
export const seedCatalogToFirestore = async (
  products: Product[],
  blogs: BlogPost[],
): Promise<CatalogSeedResult> => {
  const db = await getDb()

  const [productsExist, blogsExist] = await Promise.all([
    hasAnyDoc(db, 'products'),
    hasAnyDoc(db, 'blogs'),
  ])
  if (productsExist || blogsExist) {
    return { written: false, products: 0, blogs: 0 }
  }

  const batch = writeBatch(db)
  products.forEach(p => batch.set(productRef(db, p.id), stripUndefined(p)))
  blogs.forEach(b => batch.set(blogRef(db, b.id), stripUndefined(b)))
  await batch.commit()

  return { written: true, products: products.length, blogs: blogs.length }
}
