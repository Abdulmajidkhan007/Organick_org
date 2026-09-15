# CLAUDE.md — Organick loyihasi uchun ish qoidalari

> Bu fayl har sessiyada o'qiladi. Faqat QOIDALAR va XARITA.
> "Nega shunday" degan tarixiy izohlar: `docs/ARXITEKTURA-TARIXI.md`.

---

## 1. Loyiha nima

Organick — organik oziq-ovqat do'koni uchun **frontend-only SPA**, bitta
tor maqsadli istisno bilan: Telegram bot tokenini sir saqlash uchun bitta
Cloud Function (`functions/`). An'anaviy backend (API server, ma'lumotlar
bazasi serveri) YO'Q. Ma'lumot uch joyda yashaydi:

- **localStorage** — savat, til, dark mode, buyurtma nusxasi va katalog KESHI
  (mahsulot/blog uchun endi haqiqat manbai emas — pastga qarang)
- **Firebase** — Auth (Google / Email / Telefon), Firestore (`orders`, `users`,
  `products`, `blogs` kolleksiyalari) va bitta Cloud Function (`sendTelegramMessage`)
- **Telegram Bot API** — xabar (buyurtma, kontakt, newsletter) shu Cloud Function orqali yuboriladi; brauzer Telegram'ga to'g'ridan-to'g'ri murojaat qilmaydi

Stack: React 19 + TypeScript + Vite 8 + Redux Toolkit 2 + Tailwind v4 + i18next (uz/en/ru) + React Router 7. Deploy: Firebase Hosting, GitHub Actions orqali `master`ga push bo'lganda avtomatik (`docs/DEPLOY.md`).

---

## 2. Ish tartibi

### Branch va commit
- `master` — asosiy branch. To'g'ridan-to'g'ri `master` ga push QILINMAYDI.
- Ish branchi: `claude/<qisqa-mavzu>` ko'rinishida.
- Commit xabari imperativ va qisqa: `fix: mobil savat overlay`, `feat: buyurtma filtri`.

### TEKSHIRUV BUYRUQLARI (har push oldidan hammasi bajariladi)

```bash
npm ci                # bog'liqliklarni o'rnatish (node_modules repo'da yo'q)
npm run lint          # ESLint — DIQQAT: hozir faqat .js/.jsx ni tekshiradi (2-bo'limga qarang)
npx tsc --noEmit      # TypeScript tekshiruvi — build buni O'ZI qilmaydi
npm run build         # Vite production build (dist/)
npm run test:e2e      # Playwright: /auth 8 kenglikda gorizontal scroll bermasligi
```

`functions/` — ALOHIDA npm loyihasi (o'z `package.json`/`tsconfig.json`),
yuqoridagi buyruqlar unga tegmaydi. O'zining tekshiruvi:
```bash
npm ci --prefix functions
npm run build --prefix functions   # tsc — Cloud Function'ning o'z typecheck'i
```

Qo'lda tekshirish:
```bash
npm run dev           # http://localhost:5173
npm run preview       # build'ni lokal ko'rish
```

**Ma'lum holat (bu yozilganda tasdiqlangan):**
- `npm run lint` → exit 0, LEKIN `eslint.config.js` da `files: ['**/*.{js,jsx}']` yozilgan,
  shuning uchun `src/` dagi 37 ta `.ts/.tsx` fayl **umuman tekshirilmaydi**.
  Tasdiq: `npx eslint src/App.tsx` → `File ignored because no matching configuration was supplied`.
  `functions/` ham `ignores`ga qo'shilgan — u alohida TS loyihasi, o'z `tsc`i bilan tekshiriladi.
- `npx tsc --noEmit` → **exit 2**, sabab: `tsconfig.json:17` `baseUrl` deprecated (TS 6).
  Ya'ni typecheck hozir "qizil". Buni tuzatmasdan CI qo'shilmaydi.
- `npm run test:e2e` → 12 test, hammasi o'tadi (~10-12s): 8 tasi `/auth` layout
  (eski), 1 tasi `tests/e2e/contact-form-validation.spec.ts`
  (`/contact` noto'g'ri email bilan sendTelegram chaqirilmasligini
  tekshiradi), 1 tasi `tests/e2e/admin-orders-badge.spec.ts`, 1 tasi
  `tests/e2e/dashboard-guard.spec.ts` (`/dashboard` kirmagan holda ochilsa
  "kirish kerak" ekrani chiqishi va profil forma UMUMAN ko'rinmasligi),
  1 tasi yangi `tests/e2e/catalog-offline.spec.ts` (Firestore REST so'rovi
  `route.abort()` bilan to'silsa ham bosh sahifada 12 ta mahsulot kartasi
  chizilishi — seed'ga qaytish ishlashi).
  Chromium konteynerda oldindan bor
  (`/opt/pw-browsers/chromium`), `playwright install` KERAK EMAS.
  Layout/guard testlari faqat LAYOUT ni tekshiradi — Firebase chaqiruvlari
  sinalmaydi (real loyiha va real SMS kerak, ular qo'lda sinaladi:
  `docs/QOLDA-SINASH-TELEFON-PAROL.md`).
- `npm run build` → exit 0, ~0.6s. **Code-splitting BOR** (route'lar `React.lazy`).
  Eng katta chunk'lar: `firebase-firestore` 553 kB (LAZY — bosh sahifa uni
  yuklamaydi), `react-vendor` 252 kB, `firebase-auth` 117 kB, `index` 122 kB,
  `ui` 54 kB. `dist/` ≈ 4.0 MB.
  Bosh sahifa yuklaydigan JS: **545.8 kB raw / 172.7 kB gzip**
  (ilgari 544.7/172.4 — farq katalogning 6 ta yangi i18n kalitidan,
  uchala tilda). O'lchash: `dist/index.html` dagi `<script>` va
  `modulepreload` havolalari yig'indisi.
  Katalog REST moduli (`catalogRest.ts`) ALOHIDA 2.2 kB chunk — u
  `App.tsx` da dinamik import qilingani uchun bosh sahifa bundle'iga
  tushmaydi.
  `index` 117 -> 121 kB ga o'sgani foydalanuvchi kabineti (profil, manzillar,
  parol) uchun qo'shilgan yangi `dashboard.profile.*` i18n kalitlaridan
  (uchala tilda) — tarjimalar `src/i18n/index.ts` orqali STATIK import
  qilinadi, ya'ni ular doim bosh sahifa bundle'ida. Yangi matn qo'shishning
  narxi shu. `firebase-auth` ham bir necha baytga o'sdi
  (`reauthenticateWithCredential` importi, `src/firebase/auth.ts` →
  `changePasswordWithReauth`) — bu funksiya ham har sahifada yuklanadi,
  chunki `auth.ts` statik.
  `firebase/firestore` bosh sahifa chunk'iga TUSHMAGANI tasdiqlangan:
  `grep -l "firebase/firestore" dist/assets/index-*.js` bo'sh natija beradi
  (yangi `src/firebase/userProfile.ts` ham `firestore.ts` naqshiga ergashib
  faqat lazy route'larda — UserDashboard, Checkout — ishlatiladi).

### `.env`
```bash
cp .env.example .env   # keyin qiymatlarni to'ldiring
```
`.env` `.gitignore` da. CI'da (GitHub Actions) build env'lari repo Secrets'dan keladi —
qadamlar `docs/DEPLOY.md` da (telefondan, CLI'siz).

---

## 3. BUZILMAS QOIDALAR

### Maxfiylik
- **`.env` fayli commit QILINMAYDI.** Har qanday token/kalit kodga yozib qo'yilmaydi.
- **Yangi maxfiy kalit `VITE_` prefiksi bilan qo'shilmaydi.** `VITE_*` o'zgaruvchilar
  build paytida JS bundle ichiga **ochiq matn** sifatida joylashadi va brauzerda ko'rinadi.
  Eski `VITE_TELEGRAM_BOT_TOKEN` aynan shu muammo edi — 2026-09-12'da tuzatildi:
  token endi brauzerda YO'Q, `functions/src/index.ts` dagi Cloud Function
  (`sendTelegramMessage`) orqali, Secret Manager'dan o'qiladi
  (`docs/ARXITEKTURA-TARIXI.md` 13-bo'lim). Yangi sirlar ham shu naqsh bilan —
  faqat server (Cloud Function) tomonda, `defineSecret()` orqali saqlanadi.
  `VITE_PHONE_AUTH_DOMAIN` bu qoidaga ZID EMAS: u sir emas, konfiguratsiya.
  Brauzer psevdo-emailni o'zi yasashi shart, demak domen baribir bundle'da
  ko'rinadi — himoya uning maxfiyligiga TAYANMAYDI (`src/utils/phoneAuth.ts`).
- **`VITE_PHONE_AUTH_DOMAIN` bir marta qo'yiladi va O'ZGARTIRILMAYDI.**
  U har bir mijozning psevdo-emailining bir qismi: o'zgarsa hamma parol
  ishlamay qoladi. Env berilmagan bo'lsa kod zaxira domenga o'tmaydi —
  telefon+parol o'chadi (`isPhonePasswordEnabled()`), bu ataylab shunday.
- **Mijoz ma'lumoti (telefon, manzil) yangi ochiq joyga yozilmaydi.** `orders`
  o'qish huquqi endi toraytirilgan: `read` faqat o'z buyurtmasi
  (`resource.data.userId == request.auth.uid`) yoki admin claim'i uchun.
  Buni qayta kengaytirmang.
  Xuddi shu qoida `users/{uid}` (foydalanuvchi kabineti — ism, telefon,
  manzillar) uchun ham: `allow read, write: if request.auth.uid == uid` —
  **admin ham o'qimaydi**. Buni kengaytirib, admin uchun ochib qo'ymang.
  `products` / `blogs` esa ATAYLAB boshqacha: `read: if true` (katalog
  ommaviy, mijoz uni auth'siz REST bilan o'qiydi), `write: if isAdmin()`.
  **Yozish qatorini kengaytirmang** — shu sabab `decreaseStock` va reyting
  hali ham localStorage'da (ular mijozdan yozishni talab qiladi).

### Ma'lumot va qaytarib bo'lmaydigan amallar
- **`functions/src/index.ts` dan funksiya OLIB TASHLANMAYDI** — deploy
  `--force` bilan ishlaydi, ya'ni kodda yo'q funksiya production'dan
  so'ramasdan o'chiriladi.
- **Firestore'dagi `orders` hujjatlari o'chirilmaydi** va `firestore.rules` "kengroq" qilinmaydi
  (masalan `allow write: if true`) — bu real buyurtmalarni yo'qotadi/ochib qo'yadi.
- **`localStorage` kalitlari nomini o'zgartirmang** — foydalanuvchilarning savati va
  admin kiritgan mahsulot/bloglari yo'qoladi. Amaldagi kalitlar:
  `organick_cart`, `organick_products`, `organick_blogs`, `organick_orders`,
  `organick_darkMode`, `i18nextLng`.
  (`organick_products` / `organick_blogs` endi haqiqat manbai emas, Firestore
  katalogining KESHI — lekin kalit nomi baribir o'zgarmaydi.)
  Sxema o'zgarsa — migratsiya yozing, kalitni almashtirmang.
- **`sendTelegram` hech qachon throw qilmaydi**, qaytgan qiymat "yetib
  bordimi" degani (`Promise<boolean>`). Lokal `npm run dev`da (Cloud
  Function ishga tushirilmagan, faqat `vite`) `httpsCallable` chaqiruvi
  tarmoq xatosiga uchraydi va `catch` uni tutib `false` qaytaradi — ya'ni
  test paytida hech qachon real guruhga xabar ketmaydi, ilgarigidek. Shu
  holat saqlansin.
- **Admin chegarasi — custom claim `{ admin: true }` YOKI `admins/{uid}` hujjati.**
  `ADMIN_EMAILS` ro'yxati olib tashlandi. Ikki manba, **claim birinchi**:
  `src/firebase/auth.ts` → `checkIsAdmin()` va `firestore.rules` → `isAdmin()`
  aynan bir xil tartibda tekshiradi. Claim bor bo'lsa `admins/{uid}` umuman
  o'qilmaydi (`||` short-circuit) — tartibni almashtirmang, aks holda har bir
  admin so'rovi ortiqcha Firestore o'qishiga aylanadi.
  `hasAdminClaim()` o'chirilmaydi — u `checkIsAdmin()` ning tez yo'li.
  `admins` kolleksiyasiga **yozish hech kimga ochilmaydi** (`allow write: if false`);
  admin faqat Firebase Console orqali qo'shiladi.
  Redux'dagi `user.isAdmin` baribir **faqat UI uchun** — unga tayanib maxfiy
  amal yozilmaydi, haqiqiy chegara qoidalarda.
  O'rnatish (telefondan, CLI'siz): `docs/XAVFSIZLIK-MIGRATSIYA.md`.

### Kod
- **Mahsulot kodi `any` bilan "tuzatilmaydi"** — `tsconfig.json` da `strict: false`,
  shuning uchun tipni to'g'ri yozish sizning zimmangizda.
- **Yangi `.jsx` fayl qo'shilmaydi** — loyiha to'liq `.tsx` ga ko'chirilgan.
- **`@/...` importi ishlatilmaydi** — `tsconfig.json:18` da `paths` bor, lekin
  `vite.config.js` da mos alias YO'Q, ya'ni ishlatilsa build sinadi.
- **Route qo'shsangiz** — `src/App.tsx` dagi `<Routes>` ga qo'shing, va uni
  **`lazy(() => import(...))`** bilan qo'shing (Home'dan tashqari hammasi shunday;
  komponentlar named eksport, shuning uchun `.then(m => ({ default: m.X }))` kerak).
  Statik import qo'shsangiz o'sha sahifaning kodi bosh sahifa bundle'iga qaytib tushadi.
  SPA fallback allaqachon bor (`firebase.json` → `hosting.rewrites`), unga tegmang.
- **`firebase/firestore` ni bosh sahifadan chaqiriladigan modulga STATIK
  import qilmang.** Firestore SDK (+`re2js`) ~553 kB — u faqat lazy
  chunk'larda bo'lishi kerak. Qoidalar:
  `src/firebase/config.ts` da `db` eksporti YO'Q, uning o'rniga
  `getDb(): Promise<Firestore>` (dinamik import, keshlanadi).
  `src/firebase/firestore.ts`, `userProfile.ts` va `catalog.ts` statik
  import qilsa BO'LADI — ularni faqat lazy route'lar (Checkout,
  UserDashboard, Admin/Dashboard) ishlatadi.
  `src/firebase/catalogRest.ts` esa BOSH SAHIFA oqimidan chaqiriladi,
  shuning uchun u `firebase/*` dan hech narsa import qilmaydi (sof
  `fetch`) — bu qoidani buzmang.
  `src/firebase/auth.ts` esa har sahifada yuklanadi, shuning uchun undagi
  `checkIsAdmin()` firestore'ni `await import(...)` bilan oladi — buni
  statik importga aylantirmang.
  `vite.config.js` da `firebase-auth` va `firebase-firestore` ATAYLAB ikki
  alohida manual chunk: bittaga qo'shsangiz bosh sahifa auth uchun
  firestore'ni ham tortib oladi.
- **Yangi rasm `.png`/`.jpg` holida qo'shilmaydi.** `src/assets/` da faqat
  `.webp` (va ikonlar uchun `.svg`). Yangi rasm qo'shsangiz: faylni
  `src/assets/` ga qo'ying, `node scripts/optimize-images.mjs` ni ishlating,
  keyin `.webp` ni import qiling va originalni o'chiring.
  Sabab: bosh sahifa 9 196 KB dan 1 262 KB ga aynan shu bilan tushgan.
  **ISTISNO — `public/shop/` va `public/blog/`:** katalog (mahsulot/blog)
  rasmlari SHU YERDA turadi va Vite importi bilan EMAS, oddiy satr yo'li
  bilan (`/shop/Onion.webp`) ishlatiladi. Sabab: bu yo'l Firestore'ga
  yoziladi, Vite importi esa har build'da hash'ni o'zgartiradi va eski
  yozuv 404 bo'lib qolardi. Bu rasmlar ham `.webp` bo'lishi shart, lekin
  ular `src/assets/` ga KO'CHIRILMAYDI. Qolgan hamma rasm (home, about,
  team, portfoilo, ...) avvalgidek `src/assets/` da, import bilan.
  Kesh sarlavhalari `firebase.json` da: `/assets/**` -> `immutable`,
  `/shop/**` va `/blog/**` -> `max-age=604800` (hash yo'q, `immutable` EMAS).
- **Telefon + parol oqimiga tegsangiz** — psevdo-email uchta joyda
  bog'langan, uchalasi bir vaqtda o'zgaradi:
  `src/utils/phoneAuth.ts` (raqamni bir ko'rinishga keltirish va email
  yasash), `src/firebase/auth.ts` (`signInWithPhonePassword`,
  `attachPasswordToPhoneUser`), `src/App.tsx` (psevdo-emailni Redux'ga
  yozmaslik). **`normalizePhone()` ni o'zgartirmang** — ro'yxatdan o'tish
  va kirish AYNAN bir xil email yasashi kerak, aks holda mijoz to'g'ri
  parol bilan ham kira olmaydi.
  Oddiy email ro'yxatdan o'tishdagi `isReservedAuthEmail()` bloki
  OLIB TASHLANMAYDI — usiz hujumchi birovning raqamidan yasalgan
  manzilni band qilib, egasini bloklaydi.
- **Yangi matn qo'shsangiz** — uchala tilga ham qo'shing:
  `src/i18n/locales/uz.json`, `en.json`, `ru.json` (hozir uchalasi ham 381 kalit, teng).
  Komponentga to'g'ridan-to'g'ri o'zbekcha matn yozib qo'yilmaydi.
  Iloji bo'lsa mavjud kalitni qayta ishlating (masalan parol xatolari —
  `auth.errors.*` — kabinetdagi parol o'zgartirish ham shu kalitlardan
  foydalanadi, ularni takrorlamaydi).

---

## 4. Qayerda nima turadi

```
.
├── CLAUDE.md               # shu fayl
├── docs/ARXITEKTURA-TARIXI.md  # nega shunday qilingan, qarorlar tarixi
├── docs/XAVFSIZLIK-MIGRATSIYA.md # qoidalar/claim/index + telefon+parol (D-bo'lim)
├── docs/QOLDA-SINASH-TELEFON-PAROL.md # telefon+parol uchun qo'lda sinash rejasi
├── package.json            # skriptlar: dev / build / lint / preview
├── vite.config.js          # react + tailwind plaginlari (alias YO'Q)
├── tsconfig.json           # strict: false, noEmit, paths (ishlatilmaydi)
├── eslint.config.js        # faqat js/jsx ni qamraydi (kamchilik)
├── firebase.json           # hosting (public "dist", SPA rewrite, kesh sarlavhalari) + firestore rules+indexes yo'llari
├── .firebaserc             # default Firebase project ID (loyiha ID shu yerda, boshqa joyda YO'Q)
├── .github/workflows/deploy.yml    # master push -> lint+build -> firebase deploy --only hosting,functions
├── .github/workflows/pr-check.yml  # PR -> lint+build+functions build (deploy YO'Q)
├── firestore.rules         # Firestore qoidalari: orders / admins / users / products / blogs (Console'dan qo'lda Publish)
├── firestore.indexes.json  # orders(userId, createdAt) composite index
├── scripts/optimize-images.mjs # PNG -> WebP (quality 80, max 1920px)
├── playwright.config.ts    # e2e: dev server + oldindan o'rnatilgan Chromium
├── tests/e2e/auth-layout.spec.ts # /auth 8 kenglikda toshib ketmasligi
├── tests/e2e/dashboard-guard.spec.ts # /dashboard kirmagan holda "kirish kerak", profil forma ko'rinmasligi
├── tests/e2e/catalog-offline.spec.ts # REST bloklansa ham bosh sahifada mahsulotlar ko'rinishi (seed'ga qaytish)
├── public/shop/  public/blog/  # KATALOG rasmlari — hash'siz, barqaror URL (Firestore'ga shu yo'l yoziladi)
├── index.html              # FontAwesome 6.7.2 CDN shu yerda
├── .env.example            # kerakli barcha env kalitlar ro'yxati
├── docs/DEPLOY.md          # Firebase Hosting + Cloud Function deploy — telefondan, CLI'siz qadamlar
├── functions/               # Cloud Function — o'z package.json/tsconfig.json bilan ALOHIDA loyiha
│   └── src/index.ts         # sendTelegramMessage (onCall): Telegram sirlari + IP-limit shu yerda
└── src/
    ├── main.tsx            # kirish nuqtasi: style, Fonts, i18n, App
    ├── App.tsx             # BrowserRouter + Provider + route'lar (React.lazy + Suspense) + onAuthStateChanged
    ├── Store.ts            # Redux store: data / cart / auth / ui / orders
    ├── Data.ts             # seed katalog + Data slice: setProducts/setBlogs (REST) + CRUD (249 qator)
    ├── types/index.ts      # BARCHA TypeScript interfeyslari shu yerda
    ├── style.css           # Tailwind + global class'lar (inpHover, admin-sidebar, ...)
    ├── Fonts.css
    ├── hooks/index.ts      # useAppDispatch / useAppSelector
    ├── firebase/
    │   ├── config.ts       # Firebase init; `auth` (darhol) + `getDb()` (lazy Firestore)
    │   ├── auth.ts         # login helperlari + hasAdminClaim (custom claim) + changePasswordWithReauth
    │   ├── firestore.ts    # orders CRUD + onSnapshot obunalar
    │   ├── userProfile.ts  # users/{uid} CRUD: getUserProfile / saveUserProfile (firestore.ts naqshiga ergashadi)
    │   ├── catalog.ts      # products/blogs YOZISH — SDK bilan, FAQAT admin (lazy route)
    │   └── catalogRest.ts  # products/blogs O'QISH — sof fetch (REST), `firebase/*` SIZ
    ├── utils/
    │   ├── telegram.ts     # sendTelegram(text, kind) — Cloud Function'ni chaqiradi
    │   ├── phoneAuth.ts    # normalizePhone + psevdo-email (telefon+parol)
    │   └── validate.ts     # isValidEmail + isValidPhone — kontakt/newsletter/checkout formalari
    ├── i18n/
    │   ├── index.ts        # i18next init (lng: 'uz')
    │   └── locales/        # uz.json / en.json / ru.json
    ├── slices/
    │   ├── cartSlice.ts    # savat + localStorage sinxronizatsiyasi
    │   ├── authSlice.ts    # foydalanuvchi holati
    │   ├── uiSlice.ts      # qidiruv, dark mode, til, mobil menyu
    │   └── ordersSlice.ts  # buyurtmalarning localStorage nusxasi
    ├── Components/
    │   ├── Navbar.tsx      # (352 q.) menyu, qidiruv, til, dark mode, savat tugmasi
    │   ├── Footer.tsx      # FooterBottom ham shu yerda + newsletter
    │   ├── Home.tsx        # (334 q.)
    │   ├── About.tsx  Service.tsx  Team.tsx  Blog.tsx
    │   ├── Portfoilo.tsx  PortfoiloSingle.tsx      # nomi shunday yozilgan (typo tarixiy)
    │   ├── Shop.tsx  ShopSingle.tsx                # katalog va mahsulot sahifasi
    │   ├── Cart.tsx  CartSidebar.tsx
    │   ├── Checkout.tsx    # (375 q.) buyurtma berish + getStatusStyle eksporti + saqlangan manzil tugmalari
    │   ├── Contact.tsx  ContactForm.tsx
    │   ├── ScrollIndicator.tsx   # Navbar ichida; sof scroll listener + CSS (motion YO'Q)
    │   ├── RouteLoader.tsx       # lazy route uchun <Suspense> fallback
    │   ├── NotFound.tsx
    │   ├── UserDashboard.tsx     # (556 q.) tab'lar: Buyurtmalarim (o'zgarishsiz) + Profil (ism/manzillar/parol)
    │   ├── OrderItemThumb.tsx    # buyurtma qatoridagi mahsulot rasmi (productId orqali qayta topiladi, zaxira — ikonka)
    │   └── Admin/                # admin panel — tab'larga bo'lingan, hammasi STATIK import (lazy route ichida yana lazy shart emas)
    │       ├── Dashboard.tsx     # (182 q.) sidebar + tab tanlash + umumiy state (orders, showProductForm/showBlogForm)
    │       ├── StatsTab.tsx      # (88 q.) "Boshqaruv paneli" tab'i
    │       ├── OrdersTab.tsx     # (222 q.) buyurtmalar ro'yxati + javob berish
    │       ├── ProductsTab.tsx   # (212 q.) mahsulotlar CRUD
    │       └── BlogsTab.tsx      # (147 q.) bloglar CRUD
    └── assets/             # 3.1 MB: 77 ta .webp + 4 ta .svg (PNG QOLMAGAN)
```

**Eng katta 10 fayl** (`find src -name '*.ts*' -o -name '*.css' -o -name '*.json' | xargs wc -l`):
`Auth/AuthPage.tsx` 686 · `UserDashboard.tsx` 556 ·
`locales/uz.json` `ru.json` `en.json` har biri 463 ·
`style.css` 403 · `Admin/ProductsTab.tsx` 376 · `Checkout.tsx` 376 ·
`Home.tsx` 366 · `Navbar.tsx` 360 · `Data.ts` 249 · `ShopSingle.tsx` 231 ·
`Admin/OrdersTab.tsx` 222 · `firebase/catalogRest.ts` 218.
(`ProductsTab.tsx` 272 -> 376 ga o'sdi — Firestore yozish, xato ko'rsatish
va bir martalik ko'chirish paneli qo'shildi, 2026-09-15.)

---

## 5. Ma'lumot oqimi (qisqa)

**Buyurtma:** `Checkout.tsx handleOrder()`
→ validatsiya → `dispatch(addOrder)` (localStorage) → `addOrderToFirestore()`
→ `decreaseStock` → `sendTelegram(text, 'order')` (Cloud Function chaqiradi,
token brauzerda yo'q) → savat tozalanadi.
Firestore va Telegram — ikki **mustaqil** kanal; ikkalasining natijasi
`delivery` state'ida saqlanadi va mijozga rostini ko'rsatadi:
Firestore yiqilsa ogohlantirish chiqadi, ikkalasi ham yiqilsa "yuborilmadi"
deyiladi (endi jimgina "muvaffaqiyatli" deyilmaydi).

**Buyurtmani ko'rish:** admin — `subscribeAllOrders()` (hamma hujjat, qoidalar
buni faqat admin claim'iga ochadi); foydalanuvchi — `subscribeUserOrders()`
serverda `where('userId','==',uid)` bilan **faqat o'z** buyurtmalarini oladi.
Bu so'rov `orders(userId ASC, createdAt DESC)` composite index talab qiladi
(`firestore.indexes.json`). `userId: null` mehmon buyurtmalari foydalanuvchi
panelida ko'rinmaydi — ular hech bir hisobga biriktirilmagan.

**Auth:** `App.tsx onAuthStateChanged` → `checkIsAdmin(firebaseUser)` →
`setUser({..., isAdmin})`. `checkIsAdmin` avval ID token claim'ini o'qiydi
(tarmoq so'rovi yo'q), u `false` bo'lsagina `getDoc(admins/{uid})` yuboradi;
har qanday xatoda `false` (fail-closed, oq ekran chiqmaydi). Auth holati
o'zgarganda **bir marta** bajariladi, render'da emas. Claim o'rnatilgandan
keyin admin qayta kirishi kerak (token keshi 1 soatgacha yashaydi);
`admins/{uid}` hujjati esa keyingi kirishdayoq ishlaydi.

**Telefon + parol:** Firebase'da bunday provayder yo'q, shuning uchun OTP
dan keyin hisobga `password` provayderi biriktiriladi
(`attachPasswordToPhoneUser` -> `linkWithCredential`), uning emaili
raqamdan yasaladi: `+998901234567` -> `998901234567@$VITE_PHONE_AUTH_DOMAIN`.
Keyingi kirishlar `signInWithEmailAndPassword` — **SMS ketmaydi**.
SMS uchta joyda qoladi: ro'yxatdan o'tish, parolni tiklash
(`updatePassword`) va parolsiz zaxira kirish. Psevdo-email mijozga
ko'rsatilmaydi — `App.tsx` uni Redux'ga `null` qilib yozadi.
To'liq izoh: `src/utils/phoneAuth.ts`. Sozlash va qolgan xavf:
`docs/XAVFSIZLIK-MIGRATSIYA.md` D-bo'lim.

**Mahsulot/blog CRUD (katalog):** haqiqat manbai — Firestore'dagi
`products` / `blogs`. Ikki yo'l ATAYLAB ajratilgan:
- **Mijoz o'qiydi — REST bilan, SDK'siz** (`src/firebase/catalogRest.ts`,
  oddiy `fetch`). Sabab: Firestore SDK 553 kB va u lazy bo'lishi shart,
  katalog esa bosh sahifada kerak. Bu faylga `firebase/*` ni HECH QACHON
  import qilmang. `App.tsx` uni `await import(...)` bilan, bir marta
  chaqiradi.
- **Admin yozadi — SDK bilan** (`src/firebase/catalog.ts`,
  `firebase/firestore` statik import; `/admin` allaqachon lazy route).
  Yozish xatosi JIM YUTILMAYDI — adminga ko'rsatiladi.

Oqim: sinxron kesh/seed -> ekran darhol chiziladi -> REST javobi
`setProducts`/`setBlogs` bilan Redux'ga yoziladi va keshga saqlanadi.
REST yiqilsa keshga, u ham bo'lmasa seed'ga qaytiladi — **sayt hech
qachon bo'sh katalog ko'rsatmaydi** (`tests/e2e/catalog-offline.spec.ts`
shuni tekshiradi). `organick_products` / `organick_blogs` kalitlari
o'z nomida qoldi, lekin endi ular KESH.

Bir martalik ko'chirish: `/admin` -> Mahsulotlar -> "Boshlang'ich
katalogni Firestore'ga yozish" tugmasi. Ikkala kolleksiya ham BO'SH
bo'lgandagina yozadi (`docs/XAVFSIZLIK-MIGRATSIYA.md` F-BO'LIM).

**Hali ko'chirilmagan (qarz, 13-sessiya):** `decreaseStock`
(`Checkout.tsx`) va `updateProductRating` (`ShopSingle.tsx`) hamon faqat
localStorage'ga yozadi — ular atomik server yozuvini (Cloud Function)
talab qiladi, aks holda `products` ga yozish har kimga ochilardi.
Ularni Firestore'ga "tezda" ulab qo'ymang. Admin rasmi ham hamon qo'lda
URL (Storage yo'q).

**Foydalanuvchi profili:** `/dashboard` → "Profil" tab'i (`UserDashboard.tsx`
→ `ProfileTab`) `src/firebase/userProfile.ts` orqali `users/{uid}`
hujjatiga o'qiydi/yozadi (`getUserProfile` / `saveUserProfile`,
`firestore.ts` naqshiga ergashadi). Uch mustaqil karta:
- **Ism** — `updateDisplayName` bilan Firebase Auth'ga YOZILADI, bir vaqtda
  `users/{uid}.fullName` ga ham (ikkalasi — Redux'dagi `user.displayName`
  ham `dispatch(setUser(...))` bilan darhol yangilanadi, `onAuthStateChanged`
  kutilmaydi, u profil yangilanishida ishga tushmaydi).
- **Manzillar** — `users/{uid}.addresses` massivi, eng ko'pi 5 ta
  (`MAX_ADDRESSES`). `Checkout.tsx` ularni o'qib, manzil maydoni ostida
  bir bosishda to'ldiradigan tugmalar ko'rsatadi — ixtiyoriy, qo'lda
  yozish ham ishlayveradi.
- **Parol** — faqat `auth.currentUser.providerData` da `password`
  provayderi bo'lganda ko'rinadi (Google'da parol yo'q).
  `changePasswordWithReauth` (`src/firebase/auth.ts`) avval
  `EmailAuthProvider` bilan qayta-autentifikatsiya, keyin `updatePassword`.
  Xato xabarlari **mavjud** `auth.errors.*` kalitlaridan (yangi kalit
  qo'shilmagan — AuthPage bilan bir xil naqsh).
`firestore.rules` → `users/{uid}`: **faqat egasi**, admin ham o'qimaydi
(`docs/XAVFSIZLIK-MIGRATSIYA.md` E-bo'lim).

---

## 6. Hujjatlar ro'yxati

| Fayl | Nima uchun | Holati |
|---|---|---|
| `CLAUDE.md` | Qoidalar va xarita (shu fayl) | Dolzarb |
| `docs/ARXITEKTURA-TARIXI.md` | Qarorlar, sabablar, ma'lum qarzlar | Dolzarb |
| `docs/XAVFSIZLIK-MIGRATSIYA.md` | Admin huquqi (claim + `admins/{uid}`), qoidalar, index — **telefondan, CLI'siz** tartib va Rules Playground testlari; D-bo'lim: telefon+parol sozlash va qolgan xavf; E-bo'lim: `users/{uid}` (foydalanuvchi kabineti) qoidasi va testlari; F-bo'lim: `products`/`blogs` (katalog) qoidasi, bir martalik ko'chirish va 3 ta Playground testi | Dolzarb |
| `docs/QOLDA-SINASH-TELEFON-PAROL.md` | Telefon+parol oqimini qo'lda sinash rejasi (telefonda bajariladi) | Dolzarb |
| `docs/DEPLOY.md` | Firebase Hosting deploy: GitHub Secrets, service account, Authorized domains — **telefondan, CLI'siz** tartib | Dolzarb |
| `README.md` | O'rnatish/deploy yo'riqnomasi (inglizcha) | **Qisman eskirgan** — 2 ta thread env kaliti yozilmagan, `src/firebase/config.ts` da `getFirestore` borligi aytilmagan |
| `.env.example` | Kerakli env kalitlarning to'liq ro'yxati | Dolzarb (README dan to'liqroq) |

README va `.env.example` ziddiyatga tushsa — **`.env.example` to'g'ri**.
