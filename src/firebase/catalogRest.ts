import { Product, BlogPost } from '../types'

/**
 * KATALOGNI MIJOZ UCHUN O'QISH — Firestore SDK'siz, oddiy `fetch` bilan.
 *
 * NEGA SDK EMAS: `firebase/firestore` chunk'i ~553 kB (+`re2js`) va u
 * ATAYLAB lazy — bosh sahifa uni umuman so'ramaydi (CLAUDE.md, Kod
 * bo'limi; vite.config.js dagi izoh). Katalog esa aynan BOSH SAHIFADA
 * kerak. SDK'ni bu yerda ishlatsak, u bosh sahifa bundle'iga tushib,
 * butun code-splitting bekor bo'lardi.
 *
 * Firestore'ning REST API'si xuddi shu ma'lumotni oddiy GET bilan
 * beradi va `firestore.rules` unga ham bir xil amal qiladi
 * (`products`/`blogs` uchun `allow read: if true`). Auth kerak emas —
 * katalog ommaviy.
 *
 * Bu fayl `firebase/*` dan HECH NARSA import qilmaydi (na statik, na
 * dinamik) — shuning uchun uni bemalol bosh sahifa oqimidan chaqirsa
 * bo'ladi. App.tsx uni baribir `await import(...)` bilan oladi, ya'ni
 * u alohida kichik chunk bo'lib qoladi.
 */

// Yangi env kaliti QO'SHILMAYDI — mavjud `VITE_FIREBASE_PROJECT_ID`.
const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID

const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`

// Firestore REST standart holatda BIR SAHIFADA atigi 20 hujjat qaytaradi.
// Katalog undan katta bo'lishi tabiiy, shuning uchun sahifa hajmini
// oshirib, `nextPageToken` bo'yicha oxirigacha o'qiymiz.
const PAGE_SIZE = 300

/** Firestore REST hujjat maydonining qiymati (faqat bizga keraklilari). */
interface RestValue {
  stringValue?: string
  integerValue?: string
  doubleValue?: number
  booleanValue?: boolean
  nullValue?: null
  timestampValue?: string
  arrayValue?: { values?: RestValue[] }
  mapValue?: { fields?: Record<string, RestValue> }
}

interface RestDocument {
  name?: string
  fields?: Record<string, RestValue>
}

interface RestListResponse {
  documents?: RestDocument[]
  nextPageToken?: string
}

/** REST qiymatini oddiy JS qiymatiga aylantiradi. */
const fromValue = (v: RestValue): unknown => {
  if (v.stringValue !== undefined) return v.stringValue
  // integerValue REST'da MATN bo'lib keladi (int64 JSON'da aniq emas).
  if (v.integerValue !== undefined) return Number(v.integerValue)
  if (v.doubleValue !== undefined) return v.doubleValue
  if (v.booleanValue !== undefined) return v.booleanValue
  if (v.timestampValue !== undefined) return v.timestampValue
  if (v.arrayValue !== undefined) return (v.arrayValue.values ?? []).map(fromValue)
  if (v.mapValue !== undefined) return fromFields(v.mapValue.fields)
  // nullValue va noma'lum turlar
  return null
}

const fromFields = (fields?: Record<string, RestValue>): Record<string, unknown> => {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(fields ?? {})) out[k] = fromValue(v)
  return out
}

/** `projects/.../documents/products/12` -> `12` */
const docId = (name?: string): string => (name ?? '').split('/').pop() ?? ''

/**
 * Kolleksiyani oxirigacha o'qiydi. Xato (tarmoq, 403, 404) bo'lsa
 * THROW qiladi — chaqiruvchi (App.tsx) uni tutib keshga/seed'ga qaytadi.
 */
const listCollection = async (name: string, signal?: AbortSignal): Promise<RestDocument[]> => {
  const docs: RestDocument[] = []
  let pageToken: string | undefined

  do {
    const url = new URL(`${BASE}/${name}`)
    url.searchParams.set('pageSize', String(PAGE_SIZE))
    if (pageToken) url.searchParams.set('pageToken', pageToken)

    const res = await fetch(url.toString(), { signal })
    if (!res.ok) throw new Error(`Firestore REST ${name}: HTTP ${res.status}`)

    const json = (await res.json()) as RestListResponse
    // Bo'sh kolleksiyada `documents` UMUMAN kelmaydi — bu xato emas.
    if (json.documents) docs.push(...json.documents)
    pageToken = json.nextPageToken
  } while (pageToken)

  return docs
}

/**
 * `AbortError` — XATO EMAS: komponent unmount bo'lganda (React
 * StrictMode dev'da effektni ikki marta ishga tushiradi) so'rovni
 * O'ZIMIZ bekor qilamiz. Uni konsolga yozish yolg'on tashvish beradi.
 */
const isAbort = (e: unknown): boolean =>
  e instanceof DOMException ? e.name === 'AbortError' : (e as { name?: string })?.name === 'AbortError'

const asNumber = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback

const asString = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback)

/**
 * Hujjatni `Product` ga aylantiradi. `id` hujjat NOMIdan olinadi
 * (`products/12` -> 12), maydon ichidagi `id` emas — shu bilan ikki
 * manba bir-biriga zid bo'lib qolmaydi.
 *
 * Nomi raqam bo'lmagan yoki nomi bo'sh hujjat TASHLAB YUBORILADI
 * (`null`) — bitta buzuq hujjat butun katalogni yiqitmasin.
 */
const toProduct = (doc: RestDocument): Product | null => {
  const id = Number(docId(doc.name))
  if (!Number.isFinite(id)) return null

  const f = fromFields(doc.fields)
  const name = asString(f.name)
  if (!name) return null

  const product: Product = {
    id,
    category: asString(f.category, 'Vegetable'),
    img: asString(f.img),
    name,
    oldPrice: asNumber(f.oldPrice, 0),
    price: asNumber(f.price, 0),
    rating: asNumber(f.rating, 5),
    stock: asNumber(f.stock, 50),
  }
  if (typeof f.imgWidth === 'number') product.imgWidth = f.imgWidth
  if (typeof f.imgHeight === 'number') product.imgHeight = f.imgHeight
  if (typeof f.description === 'string') product.description = f.description
  if (Array.isArray(f.userRatings)) {
    product.userRatings = (f.userRatings as Record<string, unknown>[])
      .filter(r => r && typeof r === 'object')
      .map(r => ({
        userId: asString(r.userId),
        rating: asNumber(r.rating, 0),
        date: asString(r.date),
      }))
  }
  return product
}

const toBlog = (doc: RestDocument): BlogPost | null => {
  const id = Number(docId(doc.name))
  if (!Number.isFinite(id)) return null

  const f = fromFields(doc.fields)
  const title = asString(f.title)
  if (!title) return null

  const blog: BlogPost = {
    id,
    date: asString(f.date),
    img: asString(f.img),
    user: asString(f.user),
    title,
    description: asString(f.description),
  }
  if (typeof f.content === 'string') blog.content = f.content
  return blog
}

/** Katalog bo'sh bo'lsa `null` qaytaradi (seed/keshni almashtirmaslik uchun). */
const nonEmptyOrNull = <T,>(items: T[]): T[] | null => (items.length > 0 ? items : null)

export interface CatalogFromRest {
  products: Product[] | null
  blogs: BlogPost[] | null
}

/**
 * Ikkala kolleksiyani parallel o'qiydi.
 *
 * MUHIM: biri yiqilsa ikkinchisi baribir qo'llanadi (`allSettled`) va
 * BO'SH kolleksiya `null` bo'lib qaytadi — ya'ni chaqiruvchi mavjud
 * keshni/seed'ni BO'SH ro'yxat bilan almashtirib yubormaydi. Sayt hech
 * qachon bo'sh katalog ko'rsatmasligi kerak.
 */
export const fetchCatalog = async (signal?: AbortSignal): Promise<CatalogFromRest> => {
  const [productsRes, blogsRes] = await Promise.allSettled([
    listCollection('products', signal),
    listCollection('blogs', signal),
  ])

  let products: Product[] | null = null
  if (productsRes.status === 'fulfilled') {
    products = nonEmptyOrNull(
      productsRes.value.map(toProduct).filter((p): p is Product => p !== null).sort((a, b) => a.id - b.id),
    )
  } else if (!isAbort(productsRes.reason)) {
    console.error('[catalogRest] products:', productsRes.reason)
  }

  let blogs: BlogPost[] | null = null
  if (blogsRes.status === 'fulfilled') {
    blogs = nonEmptyOrNull(
      blogsRes.value.map(toBlog).filter((b): b is BlogPost => b !== null).sort((a, b) => a.id - b.id),
    )
  } else if (!isAbort(blogsRes.reason)) {
    console.error('[catalogRest] blogs:', blogsRes.reason)
  }

  return { products, blogs }
}
