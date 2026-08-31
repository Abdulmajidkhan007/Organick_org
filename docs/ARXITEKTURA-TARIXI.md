# Arxitektura tarixi va texnik qarzlar

Bu fayl — "nega shunday qilingan" degan savollarga javob. Qoidalar `CLAUDE.md` da.
Sana: 2026-08-30. Tekshirilgan commit: `b79e69d` (PR #7 va #8 merge bo'lgandan keyin).

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
- `dist/assets/index-*.js` — **~989 kB** (gzip ~301 kB), bitta chunk, code-splitting yo'q.
  Sababi: Firebase SDK + React Router + i18next + motion hammasi bitta bundle'da,
  `App.tsx` da barcha sahifalar statik import qilingan (`lazy` yo'q).
  Sourcemap tahlili bo'yicha ulushlar (raw): `@firebase/firestore` 996 kB (28%),
  `react-dom` 533 kB (15%), `@firebase/auth` 446 kB (12.5%), `react-router` 361 kB (10%),
  `motion-dom` + `framer-motion` 468 kB (13%). Firestore har sahifada yuklanadi,
  lekin unga faqat `/admin` va `/dashboard` muhtoj.
- `src/assets/` — **3.1 MB**: 77 ta `.webp` + 4 ta `.svg`. PNG qolmagan.
  2026-08-30 da `scripts/optimize-images.mjs` bilan konvertatsiya qilindi
  (PR #7): 32 MB → 3.1 MB, ya'ni −90%.
- `dist/` jami ≈ **3.8 MB** (avval 30 MB edi).

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


---

## 9. Rasm optimizatsiyasi (PR #7, 2026-08-30)

Loyihaning eng katta unumdorlik muammosi shu edi va hal qilindi.

**Oldin (Playwright + `vite preview` bilan o'lchangan, haqiqiy transfer):**

| Sahifa | Oldin | Keyin | Farq |
|---|---|---|---|
| `/` | 9 196 KB | **1 262 KB** | −86.3% |
| `/shop` | 4 210 KB | 867 KB | −79.4% |
| `/about` | 4 426 KB | 648 KB | −85.4% |
| `/contact` | 3 896 KB | 647 KB | −83.4% |
| `/service` | 2 553 KB | 451 KB | −82.3% |

Faqat rasm baytlari: 8 888 KB → 953 KB (−89.3%).

**Nima qilindi:** `scripts/optimize-images.mjs` (sharp, WebP quality 80,
1920px dan kengroqlarini kichraytiradi) bilan 77 ta PNG konvertatsiya qilindi,
81 ta import qatori 15 ta faylda yangilandi, eski PNG lar o'chirildi.
15 ta route brauzerda tekshirildi — sinngan rasm 0 ta, dizayn o'zgarishsiz.

**Nega WebP, AVIF emas:** AVIF yana ~40% yutuq berardi (o'lchangan: 14 MB →
605 KB AVIF vs 1 001 KB WebP), lekin konvertatsiya sekinroq va `<picture>`
fallback kerak bo'lardi. WebP allaqachon yetarli yutuq berdi.

**Qolgan qarz:** `sharp` `devDependencies` da — build vaqtida kerak emas
(skript qo'lda ishlaydi), lekin Netlify har build'da uni o'rnatadi.

---

## 10. Firestore xavfsizligi va admin claim (2026-08-31)

Bu sessiyagacha `orders` kolleksiyasi amalda ochiq edi. To'rt muammo birga
hal qilindi, chunki ularni alohida tuzatish panelni sindirardi.

**Nima ochiq edi:**

| # | Joy | Muammo |
|---|---|---|
| 1 | `firestore.rules:8` `allow read: if true` | Loyiha ID'sini bilgan har kim barcha mijozlarning ismi, telefoni va manzilini o'qiy olardi. Blaze rejasida bu o'qishlar hisobga ham tushardi. |
| 2 | `firestore.rules:9` `allow update, delete: if request.auth != null` | Google bilan kirgan **istalgan** odam har qanday buyurtmani o'chira olardi. |
| 3 | `ADMIN_EMAILS` → `isAdmin` | Faqat UI to'sig'i. Redux devtools'da `isAdmin: true` qilib qo'ygan odam `/admin` ga kirardi. |
| 4 | `subscribeUserOrders` | Butun kolleksiyani yuklab, **brauzerda** filtrlardi — ya'ni har bir mijoz boshqalarning buyurtmalarini oldiga yuklab olardi. |

**Nega 1, 2 va 4 birga qilindi:** qoidani toraytirish (1) eski so'rovni
(4) darhol yiqitadi — filtrsiz `list` so'rovi `permission-denied` oladi va
foydalanuvchi paneli bo'shab qoladi. Shuning uchun so'rov ham, qoida ham bir
vaqtda yangilandi: qoida `resource.data.userId == request.auth.uid` deydi,
so'rov esa aynan `where('userId','==',uid)` bilan cheklanadi. Firestore
qoidalari `list` so'rovini shu tarzda — so'rovning o'z filtriga qarab —
tekshiradi.

**Nega custom claim, `ADMIN_EMAILS` emas:** claim ID token ichida serverda
imzolanadi, uni brauzerdan o'zgartirib bo'lmaydi, va eng muhimi —
`firestore.rules` uni **serverda** o'qiy oladi. Email ro'yxati esa faqat
bundle ichidagi massiv edi: qoidalar uni ko'rmasdi, shuning uchun u hech
qachon haqiqiy chegara bo'la olmasdi.

**Narxi:** `where` + `orderBy` composite index talab qiladi
(`orders`: `userId` ASC, `createdAt` DESC) — `firestore.indexes.json` da.
Index'siz panel bo'sh ko'rinadi, shuning uchun deploy tartibi muhim:
index → claim → kod → qoidalar (`docs/XAVFSIZLIK-MIGRATSIYA.md`).

**Ataylab qoldirilgan:**
- `allow create: if true` — mehmon buyurtma bera olishi kerak. Ya'ni hozir
  kirgan foydalanuvchi boshqa `userId` bilan hujjat yarata oladi (buyurtmani
  boshqa odamning kabinetiga "tashlash"). Buni to'sish uchun tayyor qatorlar
  migratsiya hujjatida turibdi, lekin ular kiritilmadi — ular checkout
  oqimiga tegadi va alohida sinovni talab qiladi.
- `userId: null` bo'lgan eski mehmon buyurtmalari hech kimga biriktirilmagan
  va endi foydalanuvchi panelida ko'rinmaydi. Ularni egasiga qaytarish uchun
  bir martalik `userEmail` → `uid` migratsiyasi kerak; buyurtmalarga
  tegilmadi.

**Checkout haqiqatni aytadigan bo'ldi.** Oldin (1-bo'lim, 5-band) Firestore
yozuvi yiqilsa ham mijozga "qabul qilindi" deyilardi. Endi Firestore va
Telegram natijalari alohida kuzatiladi: Firestore yiqilib Telegram ketgan
bo'lsa sariq ogohlantirish ("kabinetda ko'rinmaydi, raqamni saqlang"),
ikkalasi ham yiqilsa qizil "yuborilmadi" ekrani chiqadi. `sendTelegram`
endi `Promise<boolean>` qaytaradi — avval u `void` edi va xatoni yutib
yuborardi, shuning uchun Checkout Telegram ketgan-ketmaganini bila olmasdi.

**Ochiq qolgan (bu sessiyada tegilmagan):** mobil ko'rinishda (375px)
gorizontal scroll 3px — sabab `src/Components/Footer.tsx:48` dagi newsletter
tugmasi (`whitespace-nowrap`, h-14 px-5) footer'dan 3px chiqib ketadi;
bosh sahifada 8px. Bu bu sessiyadan oldin ham bor edi (`350b11a` bilan
o'lchab solishtirildi) va dizayn ishi bo'lgani uchun tegilmadi.
