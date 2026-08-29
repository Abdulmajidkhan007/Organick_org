# Arxitektura tarixi va texnik qarzlar

Bu fayl — "nega shunday qilingan" degan savollarga javob. Qoidalar `CLAUDE.md` da.
Sana: 2026-08-29. Tekshirilgan commit: `55c71a3`.

---

## 1. Loyiha qanday shakllangan

Git tarixidan ko'rinishicha loyiha oddiy statik landing sifatida boshlangan
(`src/Components/*.jsx`), keyin bosqichma-bosqich kengaygan:

1. **JSX → TSX ko'chirish.** Bugun `src/` da bironta `.jsx` qolmagan, hammasi `.tsx`.
   Lekin `eslint.config.js` o'sha JSX davridan qolgan va hali ham `files: ['**/*.{js,jsx}']`
   deb yozilgan — ya'ni lint migratsiyadan keyin yangilanmagan.
2. **i18n qo'shilishi** (uz asosiy til) — `src/i18n/`, 3 til, 281 kalitdan iborat.
3. **Firebase Auth** — Google, Email/Parol, Telefon (SMS OTP).
4. **Buyurtmalar: localStorage → Firestore.** Commit `d19e156` "Migrate orders from
   localStorage to Firebase Firestore". Lekin `src/slices/ordersSlice.ts` olib
   tashlanmagan — ikkala yo'l ham qoldi.
5. **Firestore ruxsat xatosi.** Commit `55c71a3` "handle Firestore permission error
   gracefully, add fallback to localStorage" — `Checkout.tsx:91-95` da `try/catch`
   qo'shilib, yozish muvaffaqiyatsiz bo'lsa ham buyurtma "qabul qilindi" deb ko'rsatiladi.
   Bu **ataylab qilingan** UX qarori: mijoz yo'qotilmasin, chunki xabar baribir
   Telegram orqali adminga boradi.

**Xulosa:** hozirgi arxitektura "server yozmaslik" qaroriga qurilgan. Barcha muammolarning
katta qismi shu bitta qarordan kelib chiqadi.

---

## 2. Serversiz arxitekturaning narxi

### 2.1. Telegram bot tokeni brauzerda
`src/utils/telegram.ts:2` da `import.meta.env.VITE_TELEGRAM_BOT_TOKEN` o'qiladi.
Vite `VITE_*` o'zgaruvchilarni build paytida **matn sifatida bundle ichiga qo'yadi**.
Ya'ni deploy qilingan saytning JS faylini ochgan har kim tokenni oladi va bot nomidan
guruhga yozishi, xabarlarni o'chirishi, webhook qo'yishi mumkin.

Bu "sozlash xatosi" emas — brauzerdan to'g'ridan-to'g'ri Bot API ga murojaat qilishning
o'zi shunday. To'g'ri yechim: Netlify Function (yoki shunga o'xshash) yozib, token faqat
serverda qolishi. Hozircha bu qilinmagan, chunki loyiha butunlay statik hosting'da.

### 2.2. Tarixda ochiq qolgan token
`git rev-list --all` bo'yicha **3 ta commit**da `src/Components/Footer.jsx:10` da
haqiqiy bot tokeni matn sifatida yozilgan bo'lgan (`8411922705:AAE-...`).
Hozirgi `HEAD` da yo'q, lekin **git tarixida qoladi** — repo klon qilingan har kimda bor.
Kod tuzatilishi tokenni bekor qilmaydi: BotFather'da `/revoke` qilish shart.

### 2.3. Admin faqat frontendda tekshiriladi
`src/firebase/auth.ts:39`:
```ts
export const ADMIN_EMAILS = ['admin@organick.com', '<shaxsiy-email>']  // qatorni faylda ko'ring
```
`App.tsx:42` da shu ro'yxat bo'yicha `isAdmin` qo'yiladi, `Admin/Dashboard.tsx:87` esa
`user.isAdmin` bo'lmasa "ruxsat yo'q" ekranini ko'rsatadi. Bu **faqat UI to'sig'i**:
Redux holatini brauzer devtools'da o'zgartirgan odam admin panelini ochadi.

Haqiqiy chegara faqat `firestore.rules` da bo'lishi mumkin. U yerda esa:
```
allow update, delete: if request.auth != null;   // firestore.rules:9
```
ya'ni **istalgan tizimga kirgan foydalanuvchi** har qanday buyurtma statusini
o'zgartira oladi yoki o'chirib yuboradi. Firebase Custom Claims yoki
`admins/{uid}` hujjati kerak.

### 2.4. Buyurtmalar hammaga ochiq
`firestore.rules:8` — `allow read: if true`. `Order` tipida (`src/types/index.ts:72`)
`customerName`, `customerPhone`, `customerAddress` bor. Ya'ni loyihaning Firebase
project ID sini bilgan har kim barcha mijozlarning ismi, telefoni va manzilini o'qiy oladi.

Bu qoida ataylab shunday qo'yilgan: `subscribeUserOrders` (`src/firebase/firestore.ts:29`)
`orders` kolleksiyasini **to'liq** yuklab, keyin brauzerda `userId`/`email` bo'yicha
filtrlaydi. Ya'ni qoidani toraytirish uchun avval so'rovni `where('userId','==',uid)`
ko'rinishiga o'tkazish kerak, aks holda foydalanuvchi paneli buziladi. Ikkalasi bitta
o'zgarishda qilinadi.

---

## 3. Ikki manba muammosi (localStorage vs Firestore)

Bugun buyurtma **ikki joyga** yoziladi:
- `dispatch(addOrder(order))` → `organick_orders` localStorage kaliti (`ordersSlice.ts:16`)
- `addOrderToFirestore(order)` → Firestore

Lekin **o'qishda** faqat Firestore ishlatiladi: `Admin/Dashboard.tsx:52` va
`UserDashboard.tsx` `subscribeAllOrders`/`subscribeUserOrders` ni chaqiradi.
`ordersSlice` dagi `updateOrderStatus` reduceri esa hech qayerda `dispatch` qilinmaydi.

Natija: Firestore yozish muvaffaqiyatsiz bo'lsa, buyurtma localStorage'da yotadi va
**hech qachon ko'rsatilmaydi** — ya'ni "fallback" aslida fallback emas.
Yoki `ordersSlice` o'chirilishi, yoki dashboard'lar ikkala manbani birlashtirishi kerak.

Mahsulot va bloglar ham shunga o'xshash: `Data.ts` da CRUD bor, lekin u faqat
`organick_products` / `organick_blogs` localStorage kalitlariga yozadi. Admin yangi
mahsulot qo'shsa — **faqat o'z brauzerida** ko'rinadi, mijozlarda emas. Bu tizimning
hozirgi holati, xato emas, lekin "admin panel" nomi shuni yashiradi.

---

## 4. Tekshiruv qamrovi

Bu yozilganda loyihada **bironta test yo'q** — na unit, na e2e, test kutubxonasi ham
`package.json` da yo'q. Sifat to'sig'i sifatida faqat quyidagilar bor:

| Buyruq | Holat | Nimani qoplaydi |
|---|---|---|
| `npm run lint` | exit 0 | **Hech nimani** — `.ts/.tsx` config'ga tushmaydi |
| `npx tsc --noEmit` | **exit 2** | Tiplarni, lekin hozir `tsconfig.json:17` xatosi bilan qizil |
| `npm run build` | exit 0 | Faqat bundle yig'ilishi (Vite typecheck QILMAYDI) |

CI (`.github/workflows/`) ham yo'q, ya'ni hech narsa avtomatik tekshirilmaydi.

`tsconfig.json` da `strict: false`, `noUnusedLocals: false`, `noUnusedParameters: false` —
ya'ni typecheck tuzatilgandan keyin ham u yumshoq rejimda ishlaydi.

---

## 5. Takrorlangan kod va o'lik joylar

- **Buyurtma statuslari 3 marta** yozilgan: `Checkout.tsx:16` (rang bilan),
  `Admin/Dashboard.tsx:13` (emoji bilan), `i18n/locales/*.json` (`status.*` kalitlari).
  Yangi status qo'shish uchun 3 joyni yangilash kerak.
- **`getStatusStyle` `Checkout.tsx:24` da eksport qilingan** va `Admin/Dashboard.tsx:9`,
  `UserDashboard.tsx:7` uni **checkout sahifasidan** import qiladi. Sahifa fayli
  umumiy util rolini o'ynayapti — bog'liqlik teskari yo'nalishda.
- **Sahifa "header" bloki** (`shopback` + `shopfront` rasmlari bilan) `Shop.tsx`,
  `ShopSingle.tsx`, `Cart.tsx`, `Checkout.tsx` da deyarli bir xil takrorlangan.
- **`Navbar` va `FooterBottom` 14 ta komponentda** qo'lda import qilinadi — layout
  route ishlatilmagan.
- **`/shopsingle` va `/portfoilosingle` route'lari** (`App.tsx:60`, `:66`) parametrsiz;
  `/shopsingle` hech qayerdan chaqirilmaydi (`/shop/:id` ishlatiladi).
- **`@fortawesome/fontawesome-free` paketi ishlatilmaydi** — `main.tsx:6` da import
  izohga olingan, ikonlar `index.html` dagi CDN orqali keladi. Paket `package.json`
  dependencies'da qolgan (commit `64782cd` da CDN'ga o'tilgan).
- **`tsconfig.json:18` `paths: {"@/*": ["src/*"]}`** — `vite.config.js` da mos alias yo'q,
  hech qayerda ishlatilmaydi, ishlatilsa build sinadi.

---

## 6. Bundle va aktivlar

`npm run build` chiqishi:
- `dist/assets/index-*.js` — **987 kB** (gzip 300 kB), bitta chunk, code-splitting yo'q.
  Sababi: Firebase SDK + React Router + i18next + motion hammasi bitta bundle'da,
  `App.tsx` da barcha sahifalar statik import qilingan (`lazy` yo'q).
- `src/assets/` — **32 MB** PNG. Eng og'irlari: `NotFoundback.png` 2.58 MB,
  `Contact3.png` 1.99 MB, `shopback.png` 1.30 MB. Hech biri siqilmagan yoki
  `.webp` ga o'tkazilmagan (faqat bitta `Cucumber.webp` bor).
- `dist/` jami ≈ 30 MB.

---

## 7. Muhit va deploy

- Sirlar manbai: lokalda `.env` (`.env.example` dan nusxa), Netlify'da
  Site Settings → Environment Variables. Repoda `.env` yo'q va `.gitignore` da.
- `.env.example` da **12 ta** kalit bor; `README.md` esa faqat 10 tasini yozgan —
  `VITE_TELEGRAM_THREAD_ID_CONTACT` va `VITE_TELEGRAM_THREAD_ID_ORDERS` tushib qolgan
  (ikkalasi ham kodda ishlatiladi: `Checkout.tsx:118`, `Admin/Dashboard.tsx:167`).
  Shuning uchun `.env.example` — yagona ishonchli manba.
- Deploy: Netlify, `netlify.toml` (`npm run build` → `dist`, Node 20) + SPA redirect
  ikki joyda: `netlify.toml` va `public/_redirects` (ikkalasi bir xil ishni qiladi).
- `firestore.rules` repoda bor, lekin **avtomatik deploy qilinmaydi** — Firebase
  konsolida yoki `firebase deploy --only firestore:rules` bilan qo'lda qo'yiladi.
  Ya'ni repodagi fayl real qoidalar bilan bir xilligiga kafolat yo'q.

---

## 8. Bog'liqliklar holati

`npm audit` (2026-08-29): **9 ta zaiflik** — 1 critical, 6 high, 2 moderate.
Ular orasida `react-router` (open redirect / XSS / DoS) va `vite` bor, ya'ni
`react-router-dom` versiyasini ko'tarish kerak. `npm audit fix` mavjud deb ko'rsatilgan,
lekin router major xatti-harakatini o'zgartirishi mumkin — o'zgartirishdan keyin
barcha route'lar qo'lda tekshirilsin.
