# CLAUDE.md — Organick loyihasi uchun ish qoidalari

> Bu fayl har sessiyada o'qiladi. Faqat QOIDALAR va XARITA.
> "Nega shunday" degan tarixiy izohlar: `docs/ARXITEKTURA-TARIXI.md`.

---

## 1. Loyiha nima

Organick — organik oziq-ovqat do'koni uchun **frontend-only SPA**.
Backend server YO'Q. Ma'lumot uch joyda yashaydi:

- **localStorage** — mahsulotlar, bloglar, savat, til, dark mode, buyurtma nusxasi
- **Firebase** — Auth (Google / Email / Telefon) va Firestore (`orders` kolleksiyasi)
- **Telegram Bot API** — brauzerdan to'g'ridan-to'g'ri xabar yuborish (buyurtma, kontakt, newsletter)

Stack: React 19 + TypeScript + Vite 8 + Redux Toolkit 2 + Tailwind v4 + i18next (uz/en/ru) + React Router 7. Deploy: Netlify.

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

Qo'lda tekshirish:
```bash
npm run dev           # http://localhost:5173
npm run preview       # build'ni lokal ko'rish
```

**Ma'lum holat (bu yozilganda tasdiqlangan):**
- `npm run lint` → exit 0, LEKIN `eslint.config.js` da `files: ['**/*.{js,jsx}']` yozilgan,
  shuning uchun `src/` dagi 37 ta `.ts/.tsx` fayl **umuman tekshirilmaydi**.
  Tasdiq: `npx eslint src/App.tsx` → `File ignored because no matching configuration was supplied`.
- `npx tsc --noEmit` → **exit 2**, sabab: `tsconfig.json:17` `baseUrl` deprecated (TS 6).
  Ya'ni typecheck hozir "qizil". Buni tuzatmasdan CI qo'shilmaydi.
- `npm run test:e2e` → 8 test, hammasi o'tadi (~8s). Chromium konteynerda
  oldindan bor (`/opt/pw-browsers/chromium`), `playwright install` KERAK EMAS.
  Test faqat LAYOUT ni tekshiradi — Firebase chaqiruvlari sinalmaydi
  (real loyiha va real SMS kerak, ular qo'lda sinaladi:
  `docs/QOLDA-SINASH-TELEFON-PAROL.md`).
- `npm run build` → exit 0, ~1.5s. **Code-splitting BOR** (route'lar `React.lazy`).
  Eng katta chunk'lar: `firebase-firestore` 553 kB (LAZY — bosh sahifa uni
  yuklamaydi), `react-vendor` 252 kB, `firebase-auth` 117 kB, `index` 114 kB,
  `ui` 54 kB. `dist/` ≈ 4.1 MB.
  Bosh sahifa yuklaydigan JS: **525 kB raw / 167 kB gzip** (ilgari 1 194 / 359).
  `index` 105 -> 114 kB ga o'sgani telefon+parol uchun qo'shilgan 40 ta
  i18n kalitidan (25 tasi xato xabari, uchala tilda) — tarjimalar
  `src/i18n/index.ts` orqali STATIK import qilinadi, ya'ni ular doim
  bosh sahifa bundle'ida. Yangi matn qo'shishning narxi shu.

### `.env`
```bash
cp .env.example .env   # keyin qiymatlarni to'ldiring
```
`.env` `.gitignore` da. Netlify'da o'zgaruvchilar Site Settings → Environment Variables da.

---

## 3. BUZILMAS QOIDALAR

### Maxfiylik
- **`.env` fayli commit QILINMAYDI.** Har qanday token/kalit kodga yozib qo'yilmaydi.
- **Yangi maxfiy kalit `VITE_` prefiksi bilan qo'shilmaydi.** `VITE_*` o'zgaruvchilar
  build paytida JS bundle ichiga **ochiq matn** sifatida joylashadi va brauzerda ko'rinadi.
  Hozirgi `VITE_TELEGRAM_BOT_TOKEN` (`src/utils/telegram.ts:2`) — aynan shu muammo.
  Yangi sirlar faqat server tomonda (Netlify Function / Cloud Function) saqlanadi.
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

### Ma'lumot va qaytarib bo'lmaydigan amallar
- **Firestore'dagi `orders` hujjatlari o'chirilmaydi** va `firestore.rules` "kengroq" qilinmaydi
  (masalan `allow write: if true`) — bu real buyurtmalarni yo'qotadi/ochib qo'yadi.
- **`localStorage` kalitlari nomini o'zgartirmang** — foydalanuvchilarning savati va
  admin kiritgan mahsulot/bloglari yo'qoladi. Amaldagi kalitlar:
  `organick_cart`, `organick_products`, `organick_blogs`, `organick_orders`,
  `organick_darkMode`, `i18nextLng`.
  Sxema o'zgarsa — migratsiya yozing, kalitni almashtirmang.
- **Telegram yuborish kodi test paytida real guruhga ulanmaydi** — `.env` siz
  `sendTelegram` jimgina `false` qaytadi (`src/utils/telegram.ts`), shu holat
  saqlansin. (Throw qilmaydi; qaytgan qiymat "yetib bordimi" degani.)
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
  SPA fallback allaqachon bor (`netlify.toml`, `public/_redirects`), ularga tegmang.
- **`firebase/firestore` ni bosh sahifadan chaqiriladigan modulga STATIK
  import qilmang.** Firestore SDK (+`re2js`) ~553 kB — u faqat lazy
  chunk'larda bo'lishi kerak. Qoidalar:
  `src/firebase/config.ts` da `db` eksporti YO'Q, uning o'rniga
  `getDb(): Promise<Firestore>` (dinamik import, keshlanadi).
  `src/firebase/firestore.ts` statik import qilsa BO'LADI — uni faqat lazy
  route'lar (Checkout, UserDashboard, Admin/Dashboard) ishlatadi.
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
  `src/i18n/locales/uz.json`, `en.json`, `ru.json` (hozir uchalasi ham 289 kalit, teng).
  Komponentga to'g'ridan-to'g'ri o'zbekcha matn yozib qo'yilmaydi.

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
├── netlify.toml            # build cmd + SPA redirect
├── firebase.json           # firestore rules+indexes yo'llari (deploy uchun)
├── firestore.rules         # Firestore qoidalari (Console'dan qo'lda Publish qilinadi)
├── firestore.indexes.json  # orders(userId, createdAt) composite index
├── scripts/optimize-images.mjs # PNG -> WebP (quality 80, max 1920px)
├── playwright.config.ts    # e2e: dev server + oldindan o'rnatilgan Chromium
├── tests/e2e/auth-layout.spec.ts # /auth 8 kenglikda toshib ketmasligi
├── index.html              # FontAwesome 6.7.2 CDN shu yerda
├── .env.example            # kerakli barcha env kalitlar ro'yxati
├── public/_redirects       # Netlify SPA fallback
└── src/
    ├── main.tsx            # kirish nuqtasi: style, Fonts, i18n, App
    ├── App.tsx             # BrowserRouter + Provider + route'lar (React.lazy + Suspense) + onAuthStateChanged
    ├── Store.ts            # Redux store: data / cart / auth / ui / orders
    ├── Data.ts             # mahsulot+blog "ma'lumot bazasi" + Data slice (193 qator)
    ├── types/index.ts      # BARCHA TypeScript interfeyslari shu yerda
    ├── style.css           # Tailwind + global class'lar (inpHover, admin-sidebar, ...)
    ├── Fonts.css
    ├── hooks/index.ts      # useAppDispatch / useAppSelector
    ├── firebase/
    │   ├── config.ts       # Firebase init; `auth` (darhol) + `getDb()` (lazy Firestore)
    │   ├── auth.ts         # login helperlari + hasAdminClaim (custom claim)
    │   └── firestore.ts    # orders CRUD + onSnapshot obunalar
    ├── utils/
    │   ├── telegram.ts     # sendTelegram(text, threadId)
    │   └── phoneAuth.ts    # normalizePhone + psevdo-email (telefon+parol)
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
    │   ├── Checkout.tsx    # (298 q.) buyurtma berish + getStatusStyle eksporti
    │   ├── Contact.tsx  ContactForm.tsx
    │   ├── ScrollIndicator.tsx   # Navbar ichida; sof scroll listener + CSS (motion YO'Q)
    │   ├── RouteLoader.tsx       # lazy route uchun <Suspense> fallback
    │   ├── NotFound.tsx
    │   ├── UserDashboard.tsx     # (219 q.) foydalanuvchi buyurtmalari
    │   └── Admin/Dashboard.tsx   # (754 q.) ENG KATTA FAYL — admin panel
    └── assets/             # 3.1 MB: 77 ta .webp + 4 ta .svg (PNG QOLMAGAN)
```

**Eng katta 10 fayl** (`find src -name '*.ts*' -o -name '*.css' -o -name '*.json' | xargs wc -l`):
`Admin/Dashboard.tsx` 770 · `Auth/AuthPage.tsx` 676 · `style.css` 403 ·
`locales/uz.json` `ru.json` `en.json` har biri 392 · `Home.tsx` 366 ·
`Navbar.tsx` 360 · `Checkout.tsx` 346 · `UserDashboard.tsx` 242 ·
`ShopSingle.tsx` 230.

---

## 5. Ma'lumot oqimi (qisqa)

**Buyurtma:** `Checkout.tsx handleOrder()`
→ validatsiya → `dispatch(addOrder)` (localStorage) → `addOrderToFirestore()`
→ `decreaseStock` → `sendTelegram()` → savat tozalanadi.
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

**Mahsulot/blog CRUD:** faqat Redux + localStorage (`Data.ts`), server yo'q —
o'zgarish faqat admin o'z brauzerida ko'rinadi.

---

## 6. Hujjatlar ro'yxati

| Fayl | Nima uchun | Holati |
|---|---|---|
| `CLAUDE.md` | Qoidalar va xarita (shu fayl) | Dolzarb |
| `docs/ARXITEKTURA-TARIXI.md` | Qarorlar, sabablar, ma'lum qarzlar | Dolzarb |
| `docs/XAVFSIZLIK-MIGRATSIYA.md` | Admin huquqi (claim + `admins/{uid}`), qoidalar, index — **telefondan, CLI'siz** tartib va Rules Playground testlari; D-bo'lim: telefon+parol sozlash va qolgan xavf | Dolzarb |
| `docs/QOLDA-SINASH-TELEFON-PAROL.md` | Telefon+parol oqimini qo'lda sinash rejasi (telefonda bajariladi) | Dolzarb |
| `README.md` | O'rnatish/deploy yo'riqnomasi (inglizcha) | **Qisman eskirgan** — 2 ta thread env kaliti yozilmagan, `src/firebase/config.ts` da `getFirestore` borligi aytilmagan |
| `.env.example` | Kerakli env kalitlarning to'liq ro'yxati | Dolzarb (README dan to'liqroq) |

README va `.env.example` ziddiyatga tushsa — **`.env.example` to'g'ri**.
