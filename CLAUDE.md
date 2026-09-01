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
- `npm run build` → exit 0, ~2s, lekin hali bitta chunk **~989 kB** (gzip ~301 kB, Vite hisoboti),
  code-splitting yo'q. `dist/` ≈ 3.8 MB.

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
- **Route qo'shsangiz** — `src/App.tsx` dagi `<Routes>` ga qo'shing va
  SPA fallback allaqachon bor (`netlify.toml`, `public/_redirects`), ularga tegmang.
- **Yangi rasm `.png`/`.jpg` holida qo'shilmaydi.** `src/assets/` da faqat
  `.webp` (va ikonlar uchun `.svg`). Yangi rasm qo'shsangiz: faylni
  `src/assets/` ga qo'ying, `node scripts/optimize-images.mjs` ni ishlating,
  keyin `.webp` ni import qiling va originalni o'chiring.
  Sabab: bosh sahifa 9 196 KB dan 1 262 KB ga aynan shu bilan tushgan.
- **Yangi matn qo'shsangiz** — uchala tilga ham qo'shing:
  `src/i18n/locales/uz.json`, `en.json`, `ru.json` (hozir uchalasi ham 289 kalit, teng).
  Komponentga to'g'ridan-to'g'ri o'zbekcha matn yozib qo'yilmaydi.

---

## 4. Qayerda nima turadi

```
.
├── CLAUDE.md               # shu fayl
├── docs/ARXITEKTURA-TARIXI.md  # nega shunday qilingan, qarorlar tarixi
├── docs/XAVFSIZLIK-MIGRATSIYA.md # qoidalar/claim/index — qo'lda bajariladigan qadamlar
├── package.json            # skriptlar: dev / build / lint / preview
├── vite.config.js          # react + tailwind plaginlari (alias YO'Q)
├── tsconfig.json           # strict: false, noEmit, paths (ishlatilmaydi)
├── eslint.config.js        # faqat js/jsx ni qamraydi (kamchilik)
├── netlify.toml            # build cmd + SPA redirect
├── firebase.json           # firestore rules+indexes yo'llari (deploy uchun)
├── firestore.rules         # Firestore qoidalari (Console'dan qo'lda Publish qilinadi)
├── firestore.indexes.json  # orders(userId, createdAt) composite index
├── scripts/optimize-images.mjs # PNG -> WebP (quality 80, max 1920px)
├── index.html              # FontAwesome 6.7.2 CDN shu yerda
├── .env.example            # kerakli barcha env kalitlar ro'yxati
├── public/_redirects       # Netlify SPA fallback
└── src/
    ├── main.tsx            # kirish nuqtasi: style, Fonts, i18n, App
    ├── App.tsx             # BrowserRouter + Provider + barcha route'lar + onAuthStateChanged
    ├── Store.ts            # Redux store: data / cart / auth / ui / orders
    ├── Data.ts             # mahsulot+blog "ma'lumot bazasi" + Data slice (193 qator)
    ├── types/index.ts      # BARCHA TypeScript interfeyslari shu yerda
    ├── style.css           # Tailwind + global class'lar (inpHover, admin-sidebar, ...)
    ├── Fonts.css
    ├── hooks/index.ts      # useAppDispatch / useAppSelector
    ├── firebase/
    │   ├── config.ts       # Firebase init, `auth` va `db` eksporti
    │   ├── auth.ts         # login helperlari + hasAdminClaim (custom claim)
    │   └── firestore.ts    # orders CRUD + onSnapshot obunalar
    ├── utils/telegram.ts   # sendTelegram(text, threadId)
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
    │   ├── ScrollIndicator.tsx   # Navbar ichida ishlatiladi
    │   ├── NotFound.tsx
    │   ├── UserDashboard.tsx     # (219 q.) foydalanuvchi buyurtmalari
    │   └── Admin/Dashboard.tsx   # (754 q.) ENG KATTA FAYL — admin panel
    └── assets/             # 3.1 MB: 77 ta .webp + 4 ta .svg (PNG QOLMAGAN)
```

**Eng katta 10 fayl** (`find src -name '*.ts*' -o -name '*.css' -o -name '*.json' | xargs wc -l`):
`Admin/Dashboard.tsx` 754 · `style.css` 360 · `Navbar.tsx` 352 ·
`locales/uz.json` `ru.json` `en.json` har biri 351 · `Home.tsx` 334 ·
`Auth/AuthPage.tsx` 324 · `Checkout.tsx` 298 · `UserDashboard.tsx` 219.

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

**Mahsulot/blog CRUD:** faqat Redux + localStorage (`Data.ts`), server yo'q —
o'zgarish faqat admin o'z brauzerida ko'rinadi.

---

## 6. Hujjatlar ro'yxati

| Fayl | Nima uchun | Holati |
|---|---|---|
| `CLAUDE.md` | Qoidalar va xarita (shu fayl) | Dolzarb |
| `docs/ARXITEKTURA-TARIXI.md` | Qarorlar, sabablar, ma'lum qarzlar | Dolzarb |
| `docs/XAVFSIZLIK-MIGRATSIYA.md` | Admin huquqi (claim + `admins/{uid}`), qoidalar, index — **telefondan, CLI'siz** tartib va Rules Playground testlari | Dolzarb |
| `README.md` | O'rnatish/deploy yo'riqnomasi (inglizcha) | **Qisman eskirgan** — 2 ta thread env kaliti yozilmagan, `src/firebase/config.ts` da `getFirestore` borligi aytilmagan |
| `.env.example` | Kerakli env kalitlarning to'liq ro'yxati | Dolzarb (README dan to'liqroq) |

README va `.env.example` ziddiyatga tushsa — **`.env.example` to'g'ri**.
