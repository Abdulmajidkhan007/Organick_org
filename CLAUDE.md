# CLAUDE.md — Organick loyihasi uchun ish qoidalari

> Har sessiyada o'qiladi — qisqa. **To'liq qoidalar, xarita, ma'lumot oqimi va o'lchovlar —
> `docs/QOIDALAR.md` (bo'lim raqamlari bir xil).** Tegishli kodga tegishdan oldin o'sha
> bo'limni o'qing. "Nega shunday" — `docs/ARXITEKTURA-TARIXI.md`.

## 1. Loyiha nima

Organik oziq-ovqat do'koni — **frontend-only SPA** + tor maqsadli Cloud Function'lar
(`functions/src/index.ts`): `sendTelegramMessage` (bot tokeni serverda), `applyOrderStock`,
`rateProduct` (zaxira/reyting atomik), `blockPseudoEmailSignup` (`beforeUserCreated`).
Ma'lumot: localStorage (savat, til, tema, katalog KESHI) · Firebase Auth (Google/Email/Telefon) ·
Firestore (`orders`, `users`, `products`, `blogs`, `messages`) · Telegram (faqat Function orqali).
Stack: React 19 + TS + Vite 8 + Redux Toolkit 2 + Tailwind v4 + i18next (uz/en/ru) +
React Router 7. Deploy: Firebase Hosting, `master` ga push'da GitHub Actions (`docs/DEPLOY.md`).

## 2. Ish tartibi

- `master` ga to'g'ridan-to'g'ri push YO'Q. Branch `claude/<mavzu>` → PR. Commit qisqa, imperativ.
- **Har push oldidan:**
  ```bash
  npm ci && npm run lint && npx tsc --noEmit && npm run build && npm run test:e2e
  npm ci --prefix functions && npm run build --prefix functions   # functions/ alohida loyiha
  ```
  Chromium `/opt/pw-browsers/chromium` da bor — `playwright install` kerak emas.
- `.env` — `.env.example` dan; README bilan ziddiyatda `.env.example` to'g'ri.

## 3. Buzilmas qoidalar (qisqa)

**Maxfiylik**
- `.env` commit qilinmaydi. Yangi sir `VITE_` bilan qo'shilmaydi (bundle'ga ochiq tushadi) —
  faqat Cloud Function + `defineSecret()`.
- `VITE_PHONE_AUTH_DOMAIN` bir marta qo'yiladi, O'ZGARTIRILMAYDI (hamma parol buziladi).
- `orders` o'qish faqat egasi/admin; `users/{uid}` — faqat egasi (admin ham emas).
  `products`/`blogs` yozish faqat admin — zaxira/reyting Function orqali. Qoidalarni kengaytirma.

**Qaytarib bo'lmaydigan amallar**
- `functions/src/index.ts` dan funksiya olib tashlanmaydi (deploy `--force` production'dan o'chiradi).
- `orders` o'chirilmaydi; `firestore.rules` kengaytirilmaydi.
- localStorage kalit nomlari o'zgarmaydi (`organick_cart`, `organick_products`, `organick_blogs`,
  `organick_orders`, `organick_darkMode`, `i18nextLng`) — sxema o'zgarsa migratsiya.
- `sendTelegram` throw qilmaydi (`Promise<boolean>`).
- Admin = claim `{admin:true}` YOKI `admins/{uid}`, **claim birinchi** (`checkIsAdmin()` va
  `isAdmin()` bir xil tartib). `admins` ga yozish hech kimga ochilmaydi. Redux `isAdmin` — faqat UI.

**Kod**
- `any` bilan tuzatilmaydi (`strict: false` — tipni o'zing to'g'ri yoz). Yangi `.jsx` yo'q.
  `@/...` import yo'q (alias yo'q).
- Yangi route — `src/App.tsx` da `lazy(() => import(...))` bilan.
- `firebase/firestore` va `firebase/storage` bosh sahifa yo'lidagi modulga statik import
  qilinmaydi (`getDb()` dinamik; `catalogRest.ts` sof `fetch`; `auth.ts` firestore'ni
  `await import`). `firebase-auth`/`firebase-firestore` chunk'lari alohida qoladi.
- Rasm: `src/assets/` da faqat `.webp`/`.svg` (`scripts/optimize-images.mjs`); katalog rasmlari
  `public/shop/`, `public/blog/` da satr yo'li bilan; admin yuklashi — `compressImage` (≤1200px,
  <1 MB) → Storage.
- Telefon+parol: `phoneAuth.ts`, `auth.ts`, `App.tsx` birga o'zgaradi; `normalizePhone()` va
  `isReservedAuthEmail()` tegilmaydi.
- Yangi matn — uchala tilga (`src/i18n/locales/uz|en|ru.json`), komponentga qattiq matn yo'q.

## 4–6. Xarita, ma'lumot oqimi, hujjatlar

`docs/QOIDALAR.md` 4–6-bo'limlar. Asosiy hujjatlar: `docs/ARXITEKTURA-TARIXI.md`,
`docs/XAVFSIZLIK-MIGRATSIYA.md` (qoidalar, telefondan sozlash), `docs/DEPLOY.md`,
`docs/QOLDA-SINASH-TELEFON-PAROL.md`.
