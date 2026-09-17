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

Mahsulot va bloglar ham shunday edi: `Data.ts` da CRUD bor edi, lekin u faqat
`organick_products` / `organick_blogs` localStorage kalitlariga yozardi. Admin yangi
mahsulot qo'shsa — **faqat o'z brauzerida** ko'rinardi, mijozlarda emas.

> **2026-09-15 da tuzatildi (17-bo'lim):** katalog endi Firestore'dagi
> `products` / `blogs` kolleksiyalarida. Mijoz uni REST bilan o'qiydi,
> admin SDK bilan yozadi; localStorage kalitlari **kesh** bo'lib qoldi.
> Yuqoridagi `orders` uchun "ikki manba" muammosi esa o'z joyida.

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

---

## 11. Telefon raqam + parol bilan kirish (2026-09-03)

### Muammo

Telefon bilan kirishning yagona yo'li SMS OTP edi: mijoz **har safar**
kod kutardi. Bu ikki narsani anglatardi — har kirish uchun SMS pul
to'lanadi, va OTP yuborish endpoint'i firibgarlik uchun ochiq nishon
(begona raqamlarga ko'p SMS yuborib hisobni "quritish").

### Nega psevdo-email

Firebase Auth'da **telefon + parol** provayderi yo'q. Faqat `phone`
(parolsiz SMS) va `password` (email + parol) bor. Uch variant ko'rildi:

| Variant | Nega tanlanmadi / tanlandi |
|---|---|
| Har kirishda SMS (hozirgi holat) | Muammoning o'zi |
| O'z backend'i + custom token | Serverni talab qiladi. Loyiha ataylab frontend-only |
| **OTP dan keyin `password` provayderini biriktirish** | ✅ Server kerak emas, SMS bir marta ketadi |

Tanlangan yo'lda OTP tasdiqlangandan keyin hisobga
`linkWithCredential(EmailAuthProvider.credential(...))` bilan parol
biriktiriladi. `password` provayderi email talab qilgani uchun email
raqamdan yasaladi: `+998901234567` -> `998901234567@<domen>`.
Bu manzil **hech qachon ishlatilmaydi** — na xat yuboriladi, na mijozga
ko'rsatiladi. U shunchaki Firebase ichidagi kalit.

### Ko'rilgan xavf va u qanchalik yopilgan

Psevdo-email sxemasining o'z hujumi bor: agar domen taxmin qilinadigan
bo'lsa, hujumchi `998901234567@<domen>` ni **oldindan** band qilib,
o'sha raqamning egasiga parol qo'yish imkonini bermay qo'yadi
(`linkWithCredential` `email-already-in-use` beradi).

Uch to'siq qo'yildi, lekin ularning kuchi **bir xil emas** va buni
yashirmaslik kerak:

1. **Domen `VITE_PHONE_AUTH_DOMAIN` env'idan, tasodifiy.** Bu faqat
   obskurlik. Frontend-only ilovada brauzer psevdo-emailni o'zi yasashi
   shart, demak domen bundle ichida ochiq turadi — **sir emas**. Shu
   sabab u CLAUDE.md dagi "VITE_ bilan yangi sir qo'shilmaydi"
   qoidasiga zid emas: qo'shilgani sir emas, konfiguratsiya.
2. **Ro'yxatdan o'tish formasida bloklash** (`isReservedAuthEmail`,
   AuthPage va `registerWithEmail` — ikki qatlamda). **Bizning formadan**
   kelgan hujumni to'liq yopadi. Haqiqiy himoya shu.
3. **Qolgan xavf ochiq:** Firebase'ning `signUp` REST endpoint'i va API
   kalit ochiq, ya'ni domenni bundle'dan topgan hujumchi formani chetlab
   o'ta oladi. Buni faqat server to'xtatadi — Firebase Auth blocking
   function (`beforeUserCreated`). Namuna kodi va o'rnatish tartibi:
   `docs/XAVFSIZLIK-MIGRATSIYA.md` D4. **Hozircha qo'yilmagan.**

Ya'ni bu o'zgarish SMS xarajati va OTP firibgarligini kamaytirdi, lekin
o'rniga kichikroq, aniq nomlangan yangi xavfni oldi.

### Env berilmasa nima bo'ladi

Zaxira domen **ataylab yo'q**. Sababi: domen har bir mijozning
psevdo-emailining bir qismi, ya'ni uni keyin o'zgartirish hamma parolni
buzadi. Agar kod zaxira domen bilan jimgina ishga tushsa, admin env'ni
keyinroq qo'shgan kunda barcha mijozlar "sababsiz" paroldan ayrilardi.
Shuning uchun env bo'lmasa `isPhonePasswordEnabled()` `false` qaytaradi:
telefon+parol o'chadi, `/auth` ogohlantirish ko'rsatadi, SMS oqimi
ilgarigidek ishlaydi.

### Yo'l-yo'lakay tuzatilgan narsalar

- **Xato xabarlari uchala tilga chiqdi.** Ilgari `AuthPage` ichida
  o'zbekcha matnlar hardcode qilingan edi (`auth/user-not-found` va h.k.),
  ya'ni en/ru mijoz o'zbekcha xato ko'rardi. Endi Firebase kodi ->
  i18n kaliti xaritasi (`ERROR_KEY_BY_CODE`), 25 ta xato uchala tilda.
- **reCAPTCHA verifier qayta ishlatilmaydi.** Ilgari har yuborishda yangi
  `RecaptchaVerifier` yaratilar, eskisi tozalanmasdi — "kodni qayta
  yuborish" tugmasi qo'shilgandan keyin bu "already rendered in this
  element" xatosiga olib kelardi. Endi verifier ref'da saqlanadi,
  yangisidan oldin va komponent yopilganda `clear()` qilinadi.
- **Psevdo-email UI'dan filtrlanadi.** `App.tsx` uni Redux'ga `null`
  qilib yozadi, aks holda u Navbar, UserDashboard, admin panel va
  buyurtmaning `userEmail` maydonida ko'rinardi. O'rniga ismi ham,
  emaili ham yo'q mijozga telefon raqami ko'rsatiladi.
- **Parol uzunligi 6 -> 8**, lekin **faqat ro'yxatdan o'tishda**:
  eski mijozlarning 6 belgili paroli kirishda ishlayveradi.

### Nima sinaladi va nima sinalmaydi

`npm run test:e2e` (Playwright) faqat **layout**ni tekshiradi: `/auth`
8 ta kenglikda (320…1024) gorizontal scroll bermasligi. Firebase
oqimlarining o'zi avtomatik sinalmaydi — ular real loyiha, real raqam va
real SMS talab qiladi. Ular uchun qo'lda sinash rejasi yozilgan:
`docs/QOLDA-SINASH-TELEFON-PAROL.md`.

---

## 12. Netlify'dan Firebase Hosting'ga o'tish (2026-09-12)

**Nega:** Netlify loyihani bekor qildi — sayt ochiq emas edi. Qayta boshqa
Netlify hisobiga ulash o'rniga Firebase Hosting tanlandi, chunki loyiha
Auth va Firestore uchun allaqachon Firebase'ga bog'liq (bir xil
`organick-e1c5a` project ID, bitta Console, bitta billing — Blaze rejasi
allaqachon yoqilgan). Ikkinchi hosting provayder qo'shish o'rniga bitta
platformaga tushirish tanlandi.

**Nega GitHub Actions, qo'lda `firebase deploy` emas:** loyiha egasida
kompyuter yo'q, faqat telefon. `npm run build && firebase deploy` buyrug'ini
terminal'siz bajarish imkonsiz. Shuning uchun deploy butunlay CI'ga
o'tkazildi: `master`ga push (yoki PR merge) — va sayt o'zi yangilanadi.
Bir martalik qo'lda ish faqat GitHub Secrets va Firebase Console
sozlashlariga qoldi (`docs/DEPLOY.md`) — ular ham CLI talab qilmaydi.

**Nega Firestore qoidalari CI'ga qo'shilmadi:** `firebase deploy` parametrsiz
chaqirilsa `firestore.rules` ham deploy bo'lardi. Bu ataylab bloklandi —
workflow faqat `firebase deploy --only hosting` chaqiradi. Sabab: qoidalar
o'zgarishi buyurtma ma'lumotlarining kimga ochiq bo'lishini belgilaydi
(10-bo'lim); bunday o'zgarish avtomatik, review'siz push bilan ketishi
xavfli. Qoidalar hamon qo'lda, Firebase Console → Rules orqali, ataylab
sekin va ko'rinadigan tarzda qo'llanadi (`docs/XAVFSIZLIK-MIGRATSIYA.md`).

**Nega ikki alohida workflow (`deploy.yml`, `pr-check.yml`):** PR'larda
deploy huquqi (`FIREBASE_SERVICE_ACCOUNT`) kerak emas — faqat kod
buziladimi-yo'qmi (lint + build) tekshiriladi. Deploy'ni faqat `master`ga
push'ga bog'lash xato PR'ning production'ga chiqib ketishini oldini oladi.
Preview channel (`firebase hosting:channel:deploy`) ham ataylab qo'shilmadi
— talab qilinmagan, va u ham service account kalitini PR workflow'iga
oshirib qo'yardi.

**Nega `vite.config.js`ga tegilmadi:** `manualChunks` (firebase-auth /
firebase-firestore ajratilgani) hosting provayderiga bog'liq emas — bu
bundle strategiyasi, deploy joyidan mustaqil. Hosting o'zgarishi build
chiqishini o'zgartirmasligi kerak edi va o'zgartirmadi.

**Narxi:** `netlify.toml` va `public/_redirects` o'chirildi (endi
`firebase.json`'dagi `hosting.rewrites` bir xil ishni qiladi — barcha
yo'l `/index.html`ga). Kesh sarlavhalari (`Cache-Control`) qiymati
Netlify'dagi bilan **aynan bir xil** qoldirildi
(`/assets/**` → `max-age=31536000, immutable`, `/index.html` →
`max-age=0, must-revalidate`) — faqat sintaksis Firebase glob formatiga
o'tkazildi, xatti-harakat o'zgarmadi.

---

## 13. Telegram bot tokenini brauzerdan chiqarish — Cloud Function (2026-09-12)

### Muammo

2.1-bo'limda yozilgan muammo hal qilindi: `VITE_TELEGRAM_BOT_TOKEN` Vite
tomonidan build vaqtida bundle ichiga **ochiq matn** sifatida yozilardi —
deploy qilingan saytning JS faylini ochgan har kim bot nomidan guruhga
yozishi mumkin edi. 2.2-bo'limdagi eski (git tarixida qolgan) token bilan
birga — ikkita mustaqil sizib chiqish yo'li bor edi.

### Yechim

`functions/` papkasida bitta Cloud Function — `sendTelegramMessage`
(`onCall`, Node 20, firebase-functions v2). Frontend endi Telegram Bot
API'ga to'g'ridan-to'g'ri murojaat qilmaydi, `httpsCallable` bilan shu
funksiyani chaqiradi, funksiya esa tokenni Secret Manager'dan o'qib
Telegram'ga yuboradi. Uch yo'nalish bitta funksiyada `kind` parametri
bilan ajratiladi: `'newsletter' | 'contact' | 'order'` — har biri o'z
Telegram mavzu (thread) ID'siga boradi.

`src/utils/telegram.ts`dagi `sendTelegram()` funksiyasining **imzosi**
o'zgardi (`threadIdEnvValue: string` -> `kind: TelegramMessageKind`), lekin
**qaytadigan qiymati saqlandi** — hamon `Promise<boolean>`, hech qachon
throw qilmaydi. `Checkout.tsx`dagi `telegramOk` mantiqi tegilmagan holda
ishlayveradi.

### Nega matnni klient tuzadi, funksiya emas

Cloud Function tayyor `text` (HTML formatlangan) va `kind`ni qabul qiladi —
xabar matnini o'zi qayta qurmaydi. Sabab: matn uch joyda (`Checkout.tsx`,
`ContactForm.tsx`, `Admin/Dashboard.tsx`) turlicha, i18n orqali tarjima
qilingan holatlarga (masalan admin javobidagi status nomi) bog'liq —
buni serverga ko'chirish i18n lug'atlarini funksiyaga ham olib borishni
talab qilardi, bu ish hajmini keragidan oshirardi. Xavf kichik: guruh ID
endi sir (oldin ham shunday edi), token endi sir — mehmon faqat **qaysi**
matnni yuborishini tanlaydi, **qayerga** yuborilishini (qaysi guruh/token)
emas. Buni cheklash uchun uzunlik chegarasi (4000 belgi) va IP-limit bor.

### Suiiste'mol himoyasi: App Check emas, IP-limit

Newsletter va kontakt formalarini **mehmonlar** (auth'siz) to'ldiradi,
buyurtma ham mehmon sifatida beriladi — ya'ni `request.auth` bo'yicha
cheklab bo'lmaydi. Ikki variant ko'rildi:

| Variant | Nega tanlanmadi / tanlandi |
|---|---|
| Firebase App Check (reCAPTCHA) | Firebase Console'da App Check'ni yoqish, reCAPTCHA v3/Enterprise sayt kaliti olish, uni yangi `VITE_` o'zgaruvchisi sifatida qo'shish va "Enforce" rejimiga o'tkazish kerak — yana bir ko'p qadamli, CLI'siz-lekin-og'ir Console sozlashi (11-bo'limdagi telefon+parol domenidan farqli, bu YANGI kalit talab qiladi). Lokal test ham App Check debug token talab qilib murakkablashadi. |
| **IP bo'yicha limit (Firestore, Admin SDK)** | ✅ Tanlandi. Qo'shimcha Console qadami yo'q — allaqachon shart bo'lgan Secret Manager qadamidan tashqari hech narsa kerak emas. Kamchiligi: umumiy IP (NAT, VPN) orqasidagi bir nechta odam bitta limitni baham ko'radi va IP soxtalashtirilishi mumkin — App Check'dan zaifroq, lekin kichik do'kon oqimi uchun yetarli. |

Amalga oshirilishi: `functions/src/index.ts` ichida bitta IP'dan 10
daqiqada eng ko'pi 5 ta xabar. Hisoblagich `_telegramRateLimits`
kolleksiyasida, **Admin SDK** orqali yoziladi — bu `firestore.rules`ga
umuman tegmaydi, chunki Admin SDK qoidalardan chetlab o'tadi (10-bo'limdagi
`orders`/`admins` qoidalari o'zgarishsiz qoladi). Noto'g'ri so'rovlar
(bo'sh matn, noma'lum `kind`, juda uzun matn) limitga qo'shilmasdan turib
rad etiladi — validatsiya IP-tekshiruvdan oldin ishlaydi.

**Ataylab qoldirilgan:** `_telegramRateLimits` hujjatlari hech qachon
o'chirilmaydi (TTL yo'q) — Firestore TTL siyosati alohida Console qadami
talab qilardi, bu esa IP-limitni App Check kabi og'ir qilib qo'yardi.
Har bir hujjat bir nechta bayt, noyob IP'lar soni esa kichik do'kon uchun
past — narxi e'tiborga olinmaydi.

### Nega thread ID'lar ham `defineSecret()` orqali

Uchta mavzu (topic) ID'sining o'zi sir emas — tokensiz ulardan foyda yo'q.
Lekin ular ham Secret Manager'ga qo'yildi (oddiy `functions/.env` o'rniga):
shunday qilinsa **bitta** Cloud Shell skripti (`docs/DEPLOY.md`, 5-qadam)
hammasini sozlaydi, GitHub Actions'ga qo'shimcha secret yoki `functions/.env`
generatsiya qilish qadami kerak bo'lmaydi, va mavzu raqami o'zgarsa kod
qayta deploy qilinmasdan, faqat Secret Manager qiymati yangilanadi.

### Bundle va lazy-loading

`firebase/functions` SDK'i `firebase/firestore` bilan bir xil naqshda
kechiktirib yuklanadi: `src/firebase/config.ts` da `getFunctionsInstance()`
(dinamik `import()`, keshlanadi), `db` eksporti yo'qligi kabi `functions`
eksporti ham yo'q. Sabab bir xil: `sendTelegram()` ni `Footer.tsx`
(bosh sahifada ham bor) chaqiradi, shuning uchun statik import qilinsa
Functions SDK bosh sahifa bundle'iga tushib qolardi. `vite.config.js`dagi
`manualChunks`ga tegilmadi — dinamik import Rollup'ni funksiyalar
SDK'sini o'zi alohida chunk'ga ajratishga majbur qiladi, qo'lda guruhlashsiz
ham. Tekshirildi: build'dan keyin bosh sahifa (`index.html`) faqat
`index`, `react-vendor`, `ui`, `firebase-auth` chunk'larini oldindan
yuklaydi — `firebase-firestore` va Functions SDK chunk'i ilgarigidek lazy.

### Sinov

Firebase Emulator Suite (`functions` + `firestore`) lokal ishga tushirilib
sinaldi: validatsiya xatolari (bo'sh matn, noma'lum `kind`, 4000 belgidan
uzun matn), muvaffaqiyatli yo'l (soxta token bilan — Telegram API 401
qaytaradi, funksiya buni tutib `{ok:false}` qaytaradi, throw qilmaydi) va
IP-limit (5-chaqiruvdan keyin `resource-exhausted`) qo'lda tekshirildi.
Birinchi (sovuq) chaqiruv lokal emulyatorda **~1.9s**, keyingi (issiq)
chaqiruvlar **~50-70ms** ni oldi — bu Cloud Run konteyner sovuq boshlanishini
o'z ichiga olmagan lokal o'lchov, haqiqiy production'da birinchi so'rov
buni hisobga olib ehtimol biroz sekinroq (odatda kichik Node.js
funksiyalari uchun 1-3s atrofida) bo'ladi.

### `@google-cloud/firestore` nega `functions/package.json`da aniq dependency

`firebase-admin`ning `firestore/index.js` moduli `@google-cloud/firestore`ni
to'g'ridan-to'g'ri talab qiladi, lekin `firebase-admin` uni o'zining
`package.json`ida **optionalDependencies** sifatida belgilagan (shu paket
`^9.1.0`, lockfile'da tasdiqlangan). `npm ci` optional paketni o'rnata
olmasa ham xato QAYTARMAYDI — jimgina o'tkazib yuboradi. Ba'zi CI
muhitlarida (registry ustida turli platforma/arch filtri yoki vaqtinchalik
tarmoq xatosi) aynan shu optional paket o'rnatilmay qoldi, natijada deploy
paytida `Error: Cannot find module '@google-cloud/firestore'` chiqdi —
`firebase-admin` firestore moduli import qilingan zahoti. Oldingi TS7006
xatosi ham xuddi shu sababdan edi: paket yo'q bo'lgani uchun uning tip
fayllari ham yo'q edi.

Yechim: `@google-cloud/firestore@^9.1.0` `functions/package.json`ning
`dependencies`iga aniq yozib qo'yildi (lockfile'dagi versiya bilan bir
xil), so'ng `package-lock.json` qayta generatsiya qilindi
(`npm install --prefix functions --package-lock-only`). Endi lockfile'da
bu paket ikki marta ko'rinadi — `firebase-admin`ning
`optionalDependencies`ida (o'zgarmadi) va ildiz `functions` loyihasining
`dependencies`ida — va paketning o'z `node_modules` yozuvida `optional:
true` belgisi YO'Q, ya'ni `npm ci --omit=optional` uni baribir o'rnatadi.
Tekshirish: `rm -rf functions/node_modules && npm ci --prefix functions
--omit=optional && ls functions/node_modules/@google-cloud/firestore`.

### Deploy buyrug'ida `--force` (Artifact Registry cleanup policy)

`master`ga push bo'lganda hosting va `sendTelegramMessage` funksiyasi
muvaffaqiyatli deploy bo'laverdi, lekin `firebase-tools` oxirida baribir
`exit 1` bilan tugardi: `us-central1` uchun Artifact Registry'da avtomatik
tozalash siyosati (eski konteyner image'larini o'chirish qoidasi)
o'rnatilmagani haqida ogohlantirib, buni o'rnatish uchun `--force`
kerakligini aytadi. Deploy'ning o'zi (hosting + funksiya + 5 sekret)
muvaffaqiyatli bo'lgani uchun bu xato workflow'ni yashil emas, qizil qilib
ko'rsatardi — ish natijasi to'g'ri bo'lsa ham.

Yechim: `.github/workflows/deploy.yml`dagi deploy qadamiga `--force`
qo'shildi. Narxi: `--force` cleanup policy so'rovini ham, boshqa har
qanday tasdiqni ham o'tkazib yuboradi — jumladan, `functions/src/index.ts`
dan funksiya olib tashlansa, `--force` bilan deploy uni production'dan
so'ramasdan o'chirib tashlaydi (oddiy holatda firebase-tools buni
tasdiqlashni so'raydi). Shuning uchun `functions/`dan funksiya o'chirish
CLAUDE.md'da BUZILMAS QOIDA qilib belgilandi.

---

## 14. Ommaviy formalarga haqiqiy validatsiya (2026-09-13)

### Muammo

Uchala ommaviy forma (kontakt, newsletter, checkout) faqat "bo'sh emasmi"
tekshirardi, regex yo'q edi. `ContactForm.tsx` va `Footer.tsx`da `<form>`
elementi umuman yo'q, tugmalar `type="button"` — shuning uchun
`<input type="email">`ning brauzer o'zi qiladigan tekshiruvi ham ishlamas
edi (forma submit bo'lmagani uchun brauzer uni tekshirmaydi). Natijada
"ali2." va "hbbbb" kabi qiymatlar Telegram'ga borardi.

Ikkinchi, alohida muammo — `ContactForm.tsx`da `await sendTelegram(...)`
hech qachon throw qilmasdi (`sendTelegram` imzosi bo'yicha
`Promise<boolean>`, xato holida `false` qaytaradi, 13-bo'limga qarang),
shuning uchun undan keyingi `try/catch`dagi `catch` bloki **hech qachon
bajarilmaydigan o'lik kod** edi: `setStatus('ok')` shartsiz chaqirilardi —
Telegram chaqiruvi muvaffaqiyatsiz bo'lsa ham foydalanuvchiga "yuborildi"
deb ko'rsatilardi. `Footer.tsx`da esa `if (ok)` bor edi, lekin `else` yo'q —
xato holida tugma shunchaki yana bosiladigan holga qaytardi, hech narsa
deyilmasdi.

`Checkout.tsx`da telefon tekshiruvi bor edi (`errors` naqshi bilan), lekin
faqat pastki chegara: `phone.replace(/\D/g, '').length >= 9` — yuqori
chegara yo'qligi uchun 17 xonali raqam ham o'tib ketardi.

### Yechim

`src/utils/validate.ts` — ikkita funksiya, uchala formada ishlatiladi:

- `isValidEmail(v)` — oddiy `x@y.z` shakl tekshiruvi (regex).
- `isValidPhone(v)` — `phoneAuth.ts`dagi ikkita mavjud funksiyani
  **qayta ishlatadi**, yangi regex yozmaydi: avval `normalizePhone(v)`
  bilan E.164'ga keltiradi, so'ng shu modulning o'z `isValidPhone`
  (E.164 shaklini 9–15 raqam chegarasida tekshiruvchi) bilan tasdiqlaydi.
  Chegara BIR JOYDA (`phoneAuth.ts`) yozilgan holicha qoladi — bu yerda
  takrorlanmaydi. `normalizePhone`ning o'zi o'zgartirilmadi (auth oqimi
  buzilmasin uchun CLAUDE.md qoidasi).

`ContactForm.tsx` va `Checkout.tsx`dagi `errors: Record<string, string>` +
maydon ostida qizil matn naqshi endi barcha uchta formada bir xil.
`ContactForm`dagi o'lik `try/catch` olib tashlandi:
`const ok = await sendTelegram(...); setStatus(ok ? 'ok' : 'err')` —
`sendTelegram` hech qachon throw qilmagani uchun `try/catch`ning hojati
yo'q edi, shart operatori yetarli. `Footer.tsx`ga `else` qo'shildi va
xato uchun forma ichida (alert emas) matn chiqadigan bo'ldi.

Checkout'dagi uchta qattiq yozilgan o'zbekcha xato matni (`"Ism kiritish
shart"` va h.k.) `checkout.errors.*` i18n kalitlariga ko'chirildi — ilgari
ular til almashtirilsa ham doim o'zbekcha chiqardi.

### Nega alohida `validate.ts`, nega `zod`/`yup` emas

Loyihada backend yo'q, tekshiruv shakli oddiy (ikki qoida: email formati,
telefon uzunlik chegarasi). Yangi kutubxona qo'shish CLAUDE.md qoidasiga
zid (bosh sahifa bundle hajmi — 6-bo'lim) va bu masshtabda ortiqcha.
Alohida fayl (komponent ichiga emas) tanlangani sababi — uchala forma bir
xil ikkita qoidani ishlatadi, uchta nusxa yozish o'rniga bitta manba.

## 15. Admin panelni tab'larga bo'lish + ikkita bug (2026-09-14)

### Admin panelning bo'linishi

`Admin/Dashboard.tsx` 770 qatorga yetgan edi (4 ta tab bitta faylda).
Endi u faqat sidebar, tab tanlash va tab'lar orasida **umumiy** bo'lgan
state'ni ushlab turadi: `orders` obunasi (badge va "Boshqaruv paneli"
tab'i ikkalasiga ham kerak) va `showProductForm`/`showBlogForm` (ular
"Boshqaruv paneli" tab'idagi tezkor tugmalar orqali ham ochiladi). Har bir
tab'ga XOS holat (masalan tahrirlanayotgan mahsulot, buyurtma filtri,
javob matni) endi o'sha tab'ning o'z faylida — bu ataylab shunday: shu
holat boshqa hech qaerga kerak emas, Dashboard'ni ortiqcha prop-drilling
bilan og'irlashtirish shart emas.

To'rtta yangi fayl **statik** import qilingan (`lazy()` emas):
`Admin/Dashboard` allaqachon `App.tsx`da lazy route, uning ICHIDA yana
lazy qilish foyda bermaydi — admin sahifasiga kirilganda baribir hammasi
darhol kerak bo'ladi, faqat ortiqcha Suspense sakrashi qo'shiladi.

### Muammo 1 — yon menyuda yolg'iz "0"

`Admin/Dashboard.tsx`da yon menyu badge'i shunday chizilardi:
`{item.badge && item.badge > 0 && (...)}`. `item.badge` — kutilayotgan
buyurtmalar soni (`pendingCount`). Bu son `0` bo'lganda `0 && (0 > 0)`
ifodasi JavaScript'da qisqa tutashadi va **`0`ning o'zini** qaytaradi
(`false`ni emas). React esa `0`ni bo'sh deb hisoblamaydi — uni matn tugun
sifatida chizadi. Natija: buyurtma bo'lmaganda "Buyurtmalar" ikonkasi
yonida hech narsaga bog'lanmagan yolg'iz "0" turib qolardi. Tuzatish —
`!!item.badge && item.badge > 0` (yoki teng ravishda `item.badge ? (...)
: null`): `!!0` `false`ga aylanadi, React hech narsa chizmaydi.

Bu — React'dagi keng tarqalgan naqsh xatosi (`count && <Badge/>` shakli
son `0` bo'lganda har doim shunday sinadi), shuning uchun tekshiruv
sifatida `tests/e2e/admin-orders-badge.spec.ts` qo'shildi: buyurtma yo'q
holatda sidebar matnida yolg'iz `"0"` so'zi yo'qligini tasdiqlaydi.

### Muammo 2 — buyurtmadagi mahsulot rasmi o'lik havolaga aylanadi

`Checkout.tsx`da buyurtma yaratilganda `OrderItem.productImg` maydoniga
`product.img` yoziladi. `product.img` — `Data.ts`da Vite orqali import
qilingan qiymat, ya'ni build vaqtida haqiqiy fayl yo'liga emas, **hash'li
chunk URL'iga** aylanadi: masalan `/assets/CalabreseBroccoli-Ch-JHt5w.webp`.
Bu hash mazmun bo'yicha hisoblanadi (content hash) va **har yangi build'da
o'zgaradi** — hatto rasm faylining o'zi o'zgarmasa ham, boshqa fayllar
o'zgarsa yoki Vite versiyasi yangilansa hash boshqacha chiqishi mumkin.

Firestore'dagi `orders` hujjatlari esa **yaratilgan paytdagi** hash bilan
abadiy saqlanadi (buyurtma hujjatlari o'chirilmaydi/o'zgartirilmaydi —
CLAUDE.md, 3-bo'lim). Keyingi deploy'dan so'ng eski buyurtmaning
`productImg`si endi mavjud bo'lmagan faylga ishora qiladi — admin panelda
ham (`Admin/OrdersTab.tsx`), ham foydalanuvchi kabinetida
(`UserDashboard.tsx`) rasm o'rniga brauzerning "buzilgan rasm" belgisi
chiqadi.

To'g'ri manba — **joriy** build'dagi mahsulot ma'lumoti, ya'ni Redux
`data.products` (u ham `Data.ts`dan, ham joriy hash bilan keladi).
`OrderItemThumb.tsx` (yangi, `src/Components/`) buni markazlashtiradi:

1. `item.productId` bo'yicha `data.products`dan mahsulotni qidiradi —
   topilsa uning `img`i (joriy build'ning haqiqiy URL'i) ishlatiladi.
2. Topilmasa (mahsulot keyinchalik o'chirilgan) — `item.productImg`
   **zaxira** sifatida ishlatiladi (eski buyurtmalar uchun, ular hali
   yangi build'da yaratilganda to'g'ri edi).
3. Ikkalasi ham yo'q, yoki zaxira havola ham `onError`ga tushsa (aynan
   shu hash-eskirish holati) — `<img>` o'rniga `fa-box` ikonkasi
   chiziladi, sahifa "buzilgan rasm" belgisi bilan emas.

`types/index.ts`dagi `productImg` maydoni **o'chirilmadi** — eski
buyurtmalarda hamon bor va zaxira sifatida kerak; faqat uning ustuvorligi
pasaytirildi (birinchi emas, oxirgi variant).

Kelajakda mahsulot rasmini buyurtmaga yozish kerak bo'lsa — Vite import
URL'i emas, **barqaror identifikator** (`productId`, yoki agar tashqi
CDN/Storage'ga o'tilsa — o'sha joydagi doimiy URL) saqlanishi kerak;
hash'li build artefaktlariga to'g'ridan-to'g'ri havola qaytarilmasin.

## 16. Mahsulotlar jadvali telefonda karta ro'yxatiga almashtirildi (2026-09-14)

Admin panelning boshqa tab'lari (`OrdersTab`, `BlogsTab`) allaqachon
telefon uchun karta ko'rinishida edi, faqat `ProductsTab.tsx` hamon
7 ustunli `<table>` chizardi (`overflow-x-auto` ichida). O'lchash
(headless Chromium, haqiqiy `dist/assets/index-*.css` bilan, real
komponent razmetkasi asosida qurilgan fixture'da) shuni ko'rsatdi —
jadvalning eng kam kengligi **558px**, ammo mobil ekranlar undan tor:

| Ekran kengligi | Yashirin (scrollWidth − clientWidth) |
|---|---|
| 360px | 198px |
| 390px | 168px |
| 414px | 144px |
| 768px | 0px (bu yerda jadval to'g'ri sig'adi) |

Yashirin qismga aynan oxirgi ustun — "Amallar" (tahrirlash/o'chirish)
tushardi, ya'ni telefonda har bir qator uchun gorizontal scroll qilib
o'ngga surish kerak edi. Ustiga, tahrirlash/o'chirish tugmalari 33×28px
edi — barmoq uchun tavsiya etilgan eng kichik o'lcham (44×44px) dan
kichik.

**Yechim:** `md` (768px) dan kichik ekranlarda jadval o'rniga karta
ro'yxati (`md:hidden` — rasm, nomi, kategoriya, narx, stock va amal
tugmalari, gorizontal scroll'siz), `md` va undan katta ekranlarda esa
jadval o'zgarishsiz qoladi (`hidden md:block`). Ikkala ko'rinishdagi
tahrirlash/o'chirish tugmalari `w-11 h-11` (44×44px) ga kengaytirildi —
faqat kartada emas, jadvalda ham, chunki eski 33×28 o'lcham teginish
uchun umuman mos emas edi (planshetlar ham teginish orqali boshqariladi).

Qayta o'lchash (bir xil usul, yangi razmetka bilan, `/admin` auth ortida
bo'lgani uchun Playwright uni to'g'ridan-to'g'ri ocholmaydi — shuning
uchun alohida HTML fixture'da, real build CSS bilan):

| Ekran kengligi | Layout | Yashirin | Tugma o'lchami |
|---|---|---|---|
| 360px | karta | 0px | 44×44px |
| 390px | karta | 0px | 44×44px |
| 414px | karta | 0px | 44×44px |
| 768px | jadval | 0px | 44×44px |

Light va dark rejimda ham natija bir xil. Ma'lumot oqimi, Redux,
localStorage kalitlari o'zgarmadi — bu sof ko'rinish (CSS/markup) ishi;
`OrdersTab`, `BlogsTab`, `StatsTab`, `Dashboard.tsx` (sidebar)ga
tegilmadi.

---

## 17. Katalogni Firestore'ga ko'chirish (2026-09-15)

### Muammo

3-bo'limda yozilgan holat: `Data.ts` dagi mahsulot/blog CRUD faqat
`organick_products` / `organick_blogs` localStorage kalitlariga yozardi.
Ya'ni admin yangi mahsulot qo'shsa u **faqat adminning o'z brauzerida**
ko'rinardi — boshqa qurilmada, boshqa mijozda yo'q. "Admin panel" degan
nom shu haqiqatni yashirardi.

### Nega mijoz uchun REST, SDK emas

Katalog aynan **bosh sahifada** kerak. Firestore SDK chunk'i esa 553 kB
(+`re2js`) va u ataylab lazy — bosh sahifa uni umuman so'ramaydi
(`vite.config.js` dagi izoh, 13-bo'lim "Bundle va lazy-loading").
SDK'ni katalog o'qish uchun ishlatsak, u bosh sahifa bundle'iga tushib
butun code-splitting bekor bo'lardi: ~544 kB → ~1.1 MB.

Firestore'ning REST API'si xuddi shu ma'lumotni oddiy `fetch` GET bilan
beradi va `firestore.rules` unga **bir xil** amal qiladi — qoida SDK'ga
emas, serverga yozilgan. Shuning uchun mijoz yo'li:

```
GET https://firestore.googleapis.com/v1/projects/<projectId>/databases/(default)/documents/products
```

`src/firebase/catalogRest.ts` shu javobni (`stringValue` / `integerValue` /
`doubleValue` / `arrayValue` ko'rinishidagi maydonlarni) `Product[]` va
`BlogPost[]` ga aylantiradi. Fayl `firebase/*` dan **hech narsa** import
qilmaydi — na statik, na dinamik.

`projectId` mavjud `VITE_FIREBASE_PROJECT_ID` dan olinadi, yangi env
kaliti qo'shilmadi.

Ikkita tafsilot:
- REST standart holatda bir sahifada atigi **20 hujjat** qaytaradi.
  Shuning uchun `pageSize=300` qo'yiladi va `nextPageToken` bo'yicha
  oxirigacha o'qiladi — katalog 20 tadan oshsa jimgina qirqilib qolmasin.
- Hujjat `id` si **hujjat nomidan** olinadi (`products/12` → 12), maydon
  ichidagi `id` dan emas: ikki manba bir-biriga zid bo'lib qolmasligi uchun.

Admin **yozish** yo'li esa SDK bilan (`src/firebase/catalog.ts`,
`firebase/firestore` ni statik import qiladi) — `/admin` allaqachon lazy
route, ya'ni SDK o'sha chunk'da qoladi. Bu `firestore.ts` va
`userProfile.ts` bilan bir xil naqsh.

### Ma'lumot oqimi va "sayt hech qachon bo'sh bo'lmasin"

1. Boshlang'ich holat — **sinxron**: localStorage keshi, u bo'lmasa kod
   ichidagi seed. Sahifa darhol chiziladi, tarmoq kutilmaydi.
2. `App.tsx` bir marta REST o'qiydi (`await import('./firebase/catalogRest')`
   — dinamik, bosh sahifa bundle'iga qo'shilmasin uchun) va natijani
   `setProducts`/`setBlogs` bilan Redux'ga yozadi. **Haqiqat manbai shu.**
3. REST yiqilsa (tarmoq yo'q, qoida rad etdi, loyiha ID xato) hech narsa
   almashtirilmaydi — ekranda kesh, u ham bo'lmasa seed qoladi.

Bo'sh kolleksiya ham `null` bo'lib qaytadi (`catalogRest.ts` →
`nonEmptyOrNull`), ya'ni bo'sh ro'yxat mavjud keshni **almashtirib
yubormaydi**. Aks holda qoida noto'g'ri Publish qilingan payt saytda
bo'sh do'kon ko'rinardi.

`organick_products` / `organick_blogs` kalitlari **nomi o'zgarmadi**
(CLAUDE.md), lekin ma'nosi o'zgardi: endi ular haqiqat manbai emas, kesh.

Regressiya testi: `tests/e2e/catalog-offline.spec.ts` REST so'rovini
`page.route(...).abort()` bilan to'sadi va bosh sahifada 12 ta mahsulot
kartasi baribir chizilishini tekshiradi (toza brauzer konteksti, ya'ni
localStorage bo'sh — eng yomon holat, "seed'ga qaytish").

### Nega seed rasmlar `public/` ga ko'chdi

`Data.ts` dagi seed rasmlar Vite importi edi (`import img1 from
"./assets/shop/CalabreseBroccoli.webp"`). Vite ularni build paytida
**hash'li** URL'ga aylantiradi va hash har build'da o'zgaradi.

Endi rasm yo'li Firestore'ga **yoziladi** — hash'li URL yozilsa keyingi
deploy'dan keyin u 404 bo'lardi. Buyurtma rasmlari bilan aynan shu xato
bo'lgan edi (9-sessiya, `OrderItemThumb.tsx` shuning uchun rasmni
`productId` orqali qayta topadi).

Shuning uchun:
- `src/assets/shop/*.webp` → `public/shop/*.webp` (18 ta)
- `src/assets/blog/*.webp` → `public/blog/*.webp` (8 ta)
- `src/assets/about/{Food1,Undefined,Pomegranate,Potato}.webp` →
  `public/shop/` (4 ta — ular ham mahsulot rasmi edi, faqat `Data.ts`
  ishlatardi; `about/` da qolganlari `About.tsx` niki, ular tegilmadi)

Fayllar `.webp` holida, qayta siqilmasdan ko'chdi — `dist/` ga
o'zgarishsiz nomi bilan nusxalanadi, URL abadiy bir xil.

Kesh sarlavhasi `firebase.json` da: `/shop/**` va `/blog/**` uchun
`public, max-age=604800` — **`immutable` EMAS**, chunki hash yo'q, ya'ni
fayl mazmuni o'zgarishi mumkin. (`/assets/**` esa hash'li, u
`max-age=31536000, immutable` bo'lib qoladi.)

Shu yo'l bilan `Shop.tsx`, `ShopSingle.tsx`, `Cart.tsx`, `Checkout.tsx`,
`Blog.tsx` dagi fon rasmlari ham importdan oddiy satrga o'tdi.

### Bundle ta'siri

| | Ilgari | Endi |
|---|---|---|
| Bosh sahifa JS (raw) | 544.7 kB | 545.8 kB |
| Bosh sahifa JS (gzip) | 172.4 kB | 172.7 kB |
| `firebase/firestore` bosh sahifada | yo'q | yo'q |

+1.1 kB — bu **faqat** 6 ta yangi i18n kaliti (uchala tilda), ya'ni
CLAUDE.md da yozilgan "yangi matn qo'shishning narxi". `catalogRest.ts`
alohida 2.2 kB chunk bo'lib qoldi, bosh sahifa bundle'iga tushmadi.

Tekshirish (har build'dan keyin):
```bash
grep -l "firebase/firestore" dist/assets/index-*.js   # bo'sh chiqishi SHART
```

### Qolgan qarz (keyingi sessiya uchun — quyida 18/19-bo'limlarda yopildi)

> Bu ro'yxat yozilganda "keyingi sessiya" deb nomlangan edi; hujjat
> ichidagi bo'lim raqami (18, 19) va haqiqiy sessiya hisobi mos
> kelmasligi mumkin (sessiyalar o'zlarini o'zicha raqamlagan) — shuning
> uchun bu yerda raqam o'rniga natija qaysi bo'limda ekani ko'rsatiladi.

1. **`decreaseStock` (Checkout.tsx) va `updateProductRating`
   (ShopSingle.tsx) hali ham localStorage'da.** Ular Firestore'ga
   ko'chirilmadi, chunki ikkalasi ham **oddiy mijozdan** `products` ga
   yozishni talab qiladi — ya'ni `allow write` ni hammaga ochib qo'yish
   kerak bo'lardi. To'g'ri yechim — atomik server yozuvi
   (Cloud Function + `FieldValue.increment`) — **19-bo'limda hal qilindi**.

   Oqibati bugun: mijoz buyurtma bergach stock uning brauzerida kamayadi,
   lekin serverdagi katalogda emas. Keyingi REST o'qishda (sahifa
   yangilanganda) serverdagi qiymat qaytib keladi, ya'ni **lokal kamayish
   yo'qoladi**. Reyting ham shunday. Ilgari bu qiymatlar o'sha brauzerda
   abadiy qolardi — bu o'zgarish ataylab: katalogning haqiqat manbai endi
   server. Bu vaqtincha — **19-bo'limda** (2026-09-16) yopildi.

2. **Firebase Storage yo'q.** Admin rasmni hamon **qo'lda URL** sifatida
   kiritadi (`ProductsTab.tsx` → "Rasm URL" maydoni oddiy matn).
   Storage — alohida `storage.rules` va Console sozlamasi bilan —
   **18-bo'limda hal qilindi** (2026-09-16). `img` maydoni oddiy satr
   bo'lib qolgani uchun bu keyinchalik sxemani o'zgartirmaydi.

3. **3-bo'limdagi `orders` uchun "ikki manba" muammosi** o'z joyida
   qoldi — bu sessiya faqat katalogga tegdi.

## 18. Admin rasm yuklash — Firebase Storage (2026-09-16)

### Muammo

17-bo'limda yozilgan qarz #2: admin rasmni hamon **qo'lda URL** sifatida
kiritishi kerak edi (`ProductsTab.tsx` / `BlogsTab.tsx` — rasm maydoni
`type="text"`). Egasi faqat telefondan ishlaydi: telefonda "rasmni
boshqa saytga yuklab, URL nusxalab kel" oqimi amalda ishlamaydi.

### Nega siqish BRAUZERDA qilinadi, server tomonda emas

Telefon kamerasidan kelgan rasm odatda **3-5 MB JPEG**. Loyihadagi
katalog rasmlari (webp) o'rtacha 29 KB (shop) / 50 KB (blog) — 9-bo'limda
shu farqni yo'qotmaslik uchun aynan `scripts/optimize-images.mjs`
yozilgan edi, lekin u `sharp` bilan **Node'da** ishlaydi, brauzerda emas
— bu yerda yordam bermaydi.

Variant edi: (a) siqilmagan faylni to'g'ridan-to'g'ri Storage'ga yuklab,
keyin Cloud Function orqali siqish, yoki (b) brauzerda, yuklashdan
OLDIN siqish. (a) yechim server tomonda `sharp`/`squoosh` kabi og'ir
bog'liqlik, alohida Cloud Function chaqiruvi (+kutish, +xarajat) va
"siqilmagan fayl vaqtincha Storage'da yotadi" degan oraliq holatni talab
qilardi. (b) ni tanladik: `<canvas>` + `toBlob('image/webp', 0.8)` —
brauzerda allaqachon bor API, yangi bog'liqlik SHART EMAS. Fayl hech
qachon 1 MB dan katta holda tarmoqqa chiqmaydi, ya'ni mijozning o'zi
telefon internetida yuklaganda ham tezroq.

**Yangi kutubxona (`browser-image-compression` va h.k.) ATAYLAB
olinmadi** — `canvas.toBlob` vazifani to'liq bajaradi, qo'shimcha
bog'liqlik faqat bundle va ta'minot zanjiri (supply chain) xavfini
oshirardi.

`src/utils/compressImage.ts`: eni eng ko'pi 1200px (bo'yi mutanosib),
webp 0.8 sifat. `toBlob` webp qo'llab-quvvatlamasa (ba'zi eski
brauzerlar `null` qaytaradi) — jpeg 0.8 ga qaytadi. Natija 1 MB dan
katta bo'lsa sifat pasaytirilib eng ko'pi 3 marta qayta uriniladi;
oxirida ham katta bo'lsa `CompressImageError('too-large')` tashlanadi —
**jimgina katta fayl yuklab yuborilmaydi**. Xato KOD bilan keladi
(matn bilan emas) — `ImageUploadField.tsx` uni `t()` orqali tarjima
qiladi, util komponent emas, o'zi matn tanlay olmaydi (CLAUDE.md: yangi
matn to'g'ridan-to'g'ri komponentga yozilmaydi qoidasi util'larga ham
tegishli).

O'lchov (taxmin emas — `tests/e2e/compress-image.spec.ts`, Playwright
orqali haqiqiy brauzerda ishga tushadi): 3000×2000 tasodifiy naqshli PNG
(175 724 bayt) → natija **1200×800px, 62 562 bayt, image/webp** — ham
enidan (≤1200px), ham hajmidan (<1 MB) shart bajarildi.

### Nega `firebase/storage` bosh sahifaga tushmaydi

`src/firebase/storage.ts` — `config.ts` dagi `getFunctionsInstance()`
naqshiga ergashadi: `firebase/storage` DINAMIK import qilinadi va
natija (promise) keshlanadi, `getStorage(app)` bir marta chaqiriladi.
Bu faylni faqat `ImageUploadField.tsx` (ProductsTab/BlogsTab, ular esa
faqat lazy `/admin` route) chaqiradi — SDK bosh sahifa bundle'iga
tushmaydi. `vite.config.js` dagi `VENDOR_GROUPS`ga `firebase/storage`
ATAYLAB qo'shilmadi: u faqat admin chunk'ida kerak, alohida guruhga
ajratishning ma'nosi yo'q (13-bo'limdagi `firebase-auth`/`firebase-
firestore` bo'linishi ulardan farqli — ular bosh sahifada HAM kerak).

Tekshirish (har build'dan keyin):
```bash
grep -l "firebase/storage" dist/assets/index-*.js   # bo'sh chiqishi SHART
```

### `storage.rules` — nega `isAdmin()` yo'q

Firestore qoidalaridagi `isAdmin()` (10-bo'lim) Firestore hujjatini
o'qiydi (`admins/{uid}`) yoki auth token claim'ini tekshiradi — bu
mexanizm **Storage qoidalarida yo'q**: Storage `request.auth` dan
tashqari boshqa hech narsani (Firestore hujjatlarini ham) o'qiy olmaydi.
Shuning uchun `storage.rules` yozish sharti "kirgan foydalanuvchi + 1 MB
dan kichik + rasm turi" — `isAdmin()` emas.

Bu xavfsiz, chunki haqiqiy chegara boshqa joyda: `firestore.rules` da
`products`/`blogs` ga yozish hamon faqat admin uchun. Storage'ga tushgan
rasm o'sha yozuvga (mahsulot/blog hujjatining `img` maydoniga) bog'lanmasa
— hech kimga ko'rinmaydigan, katalogga hech qanday ta'sir qilmaydigan
fayl bo'lib qoladi. To'liq izoh: `docs/XAVFSIZLIK-MIGRATSIYA.md`
G-BO'LIM.

### Ma'lumot sxemasi o'zgarmadi

`Product.img` / `BlogPost.img` hamon oddiy `string` (shunday
rejalashtirilgan edi — 17-bo'lim). Storage'dan qaytgan
`getDownloadURL()` natijasi ham oddiy URL satri, qo'lda yozilgan URL
bilan bir xil formatda — Firestore hujjati, `catalogRest.ts` parser,
`firestore.rules` — hech biriga tegilmadi.

### Bundle ta'siri

| | Ilgari | Endi |
|---|---|---|
| Bosh sahifa JS (raw) | 545.74 kB | 547.12 kB |
| Bosh sahifa JS (gzip) | 174.41 kB | 174.78 kB |
| `firebase/storage` bosh sahifada | yo'q | yo'q |

+1.38 kB raw / +0.37 kB gzip — bu ham **faqat** yangi i18n kalitlari
(6 ta, uchala tilda: `uploadImage`, `uploading`, `uploadFailed`,
`uploadTooLarge`, `uploadUnsupported`, `uploadUnreadable`) — 17-bo'limda
yozilgan "yangi matn qo'shishning narxi" shu safar ham takrorlandi.
`compressImage.ts`, `storage.ts` va `ImageUploadField.tsx` — hech biri
bosh sahifa bundle'ida YO'Q (yuqoridagi `grep` bilan tasdiqlangan).

### Qolgan qarz (keyingi sessiyalar uchun)

1. **Eski rasm Storage'dan o'chirilmaydi.** Mahsulot/blog tahrirlanib
   rasm almashtirilganda, avvalgi fayl `catalog/<kind>/...` ostida
   qolib ketaveradi — hech kim unga endi havola qilmaydi, lekin u
   Storage'da joy egallashda davom etadi. Buni tuzatish uchun eski
   `img` qiymatini (agar u `firebase storage` domenidan bo'lsa)
   `deleteObject` bilan o'chirish kerak — bu ONGLI ravishda bu
   sessiyaga kiritilmadi (kichik xavf: eski fayl hech qachon
   ko'rsatilmaydi, faqat saqlash joyi sarflanadi).
2. **`decreaseStock` / `updateProductRating` hamon localStorage'da** —
   17-bo'limdagi qarz, Storage bilan bog'liq emas — **19-bo'limda**
   (2026-09-16, Cloud Function + atomik yozuv) hal qilindi.
3. **`firestore.rules`, Cloud Function, auth, kabinet, dizayn tili
   O'ZGARMADI** — bu sessiyaning maqsadi faqat rasm yuklash edi.

---

## 19. Zaxira (stock) va reyting — atomik, Cloud Function orqali (2026-09-16)

### Muammo

`decreaseStock` (`Checkout.tsx`) va `updateProductRating` (`ShopSingle.tsx`)
faqat Redux + localStorage'ga yozardi — 17-bo'limda katalog Firestore'ga
ko'chgandan keyin ham shu ikkitasi eski holicha qolgan edi (o'sha
bo'limdagi 2-band, keyin 18-bo'limda ham "qarz" sifatida takrorlangan).
Amaliy oqibati ikkita:

1. **Poyga sharti (race condition).** Ikki mijoz bir vaqtda oxirgi
   donani sotib olsa, ikkalasi ham "muvaffaqiyatli" ko'radi — zaxira
   faqat o'sha mijozning brauzerida kamayardi, boshqa hech kimga
   ta'sir qilmasdi.
2. **Reyting hech kimga ko'rinmasdi.** `updateProductRating` ham xuddi
   shunday — faqat baho qo'ygan mijozning localStorage'ida.

To'g'ridan-to'g'ri yechim — `firestore.rules`da `products` yozish
qoidasini mijozga ochish — CLAUDE.md'dagi buzilmas qoidani buzardi:
"Yozish qatorini kengaytirmang" (`products` -> `write: if isAdmin()`),
chunki bu katalogni (nom, narx, rasm) ham har kimga tahrirlash imkonini
berardi, faqat `stock`/`rating` emas — Firestore qoidalari maydon
darajasida emas, HUJJAT darajasida ishlaydi (`allow write` butun
hujjatga tegishli, "faqat shu ikki maydonga yozish" degan granulярlik
yo'q, murakkab qoida bilan ham buni ishonchli qilib bo'lmaydi).

### Yechim — ikkita Cloud Function, Admin SDK

`functions/src/index.ts` ga ikkita yangi `onCall` funksiya qo'shildi —
`sendTelegramMessage` bilan bir xil fayl, bir xil naqsh (Admin SDK,
`db.runTransaction`). Admin SDK Firestore qoidalaridan MUTLAQO chetlab
o'tadi, shuning uchun mijoz `stock`/`rating`ni bilvosita, faqat shu
ikki funksiya orqali va faqat funksiya ruxsat bergan shaklda o'zgartira
oladi — `firestore.rules`dagi `write: if isAdmin()` o'zgarishsiz qoldi.

### Nega ikkita ALOHIDA funksiya, bittasi emas

`applyOrderStock` va `rateProduct` bir-biriga bog'liq emas — turli
paytda (biri checkout'da, biri mahsulot sahifasida), turli auth
talabi bilan (birinchisi mehmonga ochiq, ikkinchisi kirishni talab
qiladi) chaqiriladi. Bitta "universal" funksiyaga birlashtirish
(`{ action: 'stock' | 'rating', ... }` kabi) auth tekshiruvini shartli
qilib murakkablashtirardi va ikkalasining xato turlari (`not-found` vs
`unauthenticated`) aralashib ketardi. Ajratilgan holda har biri o'z
kirish shartini `onCall` darajasida yozadi — o'qish oson, test qilish
oson.

### Nega `applyOrderStock` mijoz yuborgan `items`ga ISHONMAYDI

Funksiya parametr sifatida FAQAT `orderId` qabul qiladi — `items`
YO'Q. Agar mijoz "men shu productId'dan 999 dona sotib oldim" deb
o'zi miqdor yuborsa (hatto orderId to'g'ri bo'lsa ham), zaxirani
soxta so'rov bilan nolga tushirish mumkin bo'lardi (boshqa mijozlarga
zarar — xizmatni rad etish shakli). Shuning uchun funksiya
kamaytiriladigan miqdorni FAQAT `orders/{orderId}` hujjatining o'zidan
o'qiydi — bu hujjat `Checkout.tsx` tomonidan Firestore'ga allaqachon
yozilgan (`addOrderToFirestore`, `orders` -> `allow create: if true`,
lekin keyin `update`/`delete` faqat admin) va mijoz uni endi o'zgartira
olmaydi. Ya'ni "qancha sotib olindi" degan haqiqat FAQAT bitta joyda —
buyurtma hujjatida — saqlanadi, funksiya boshqa hech qanday manbaga
ishonmaydi.

Idempotentlik (`stockApplied` bayrog'i) ham shu mantiqning davomi:
funksiya ikkinchi marta chaqirilsa (tarmoq qayta urinishi, mijoz
tugmani ikki marta bossa — garchi UI buni oldini olishga harakat
qilsa ham), zaxira IKKINCHI marta kamaymaydi.

### Nega `rateProduct` O(1), butun `ratings`ni sanamaydi

Eski `updateProductRating` (localStorage) har safar BUTUN
`userRatings` massivini qayta yig'ib, o'rtachani hisoblardi — bu
kichik massivda arzon, lekin Firestore'da "butun sub-kolleksiyani har
bahoda o'qish" narxli (o'qish soni ortadi, mahsulot mashhur bo'lgani
sayin sekinlashadi). Shuning uchun `products/{id}` hujjatida ikkita
hisoblagich saqlanadi: `ratingSum`, `ratingCount`. Har chaqiruvda
faqat: (1) mijozning ESKI bahosi o'qiladi (`ratings/{uid}`, bitta
hujjat), (2) ikkita son yangilanadi, (3) `rating` shulardan qayta
hisoblanadi. Necha kishi baho qo'ygan bo'lishidan qat'i — bitta
chaqiruv har doim 2 ta o'qish + 2 ta yozish.

### Nega `products/{id}/ratings/{uid}` uchun `firestore.rules`da QOIDA YO'Q

Bu ATAYLAB — kelajakdagi sessiya "qoida yozilmay qolibdi, xato" deb
o'ylamasin, deb shu yerda alohida yozib qo'yilmoqda:

- Bu sub-kolleksiyaga FAQAT `rateProduct` (Admin SDK) yozadi. Admin SDK
  qoidalarni MUTLAQO o'qimaydi — demak bu yerga qoida yozish bu
  yo'lni na qattiqroq, na yumshoqroq qilmaydi.
- Mijoz bu sub-kolleksiyani na o'qiydi, na yozadi — kerak emas: o'rtacha
  baho (`rating`) va sonlar (`ratingSum`/`ratingCount`) allaqachon
  `products/{id}` hujjatida, OMMAVIY o'qiladigan (`read: if true`).
  Mijozning shaxsiy bahosi boshqa hech kimga ko'rsatilmaydi (hozircha
  UI buni talab qilmaydi — faqat "mening bergan bahom" ekranda mahalliy
  `useState` bilan saqlanadi, sahifani yangilasangiz yo'qoladi; buni
  kabinet-darajasida saqlash keyingi ish, hozirgi ish doirasidan
  tashqarida).
- `firestore.rules` faylining oxiridagi
  `match /{document=**} { allow read, write: if false; }` bu
  sub-kolleksiyani HAM avtomatik yopadi (Firestore qoidalari
  segment-darajasida ishlaydi: `match /products/{id}` faqat o'sha
  hujjatning O'ZINI qamraydi, ostidagi sub-kolleksiyalarni EMAS —
  shuning uchun bu yerda maxsus `match` yozish emas, aksincha YOZMASLIK
  to'g'ri xavfsiz standart holatga tushiradi).

Qisqasi: bu qoidalar faylida "kamchilik" emas — mijoz kirishi
kerak bo'lmagan yo'lga qasddan yo'l qo'yilmagan.

### Client tomon: `src/utils/stock.ts` / `src/utils/rating.ts`

Ikkalasi ham `src/utils/telegram.ts` bilan bir xil naqsh: `firebase/
functions`ni DINAMIK import qiladi (bosh sahifa bundle'iga qo'shimcha
og'irlik solmasin — garchi bu ikkala fayl o'zi allaqachon FAQAT lazy
route'lardan, Checkout.tsx va ShopSingle.tsx'dan chaqirilsa ham,
naqshni buzmaslik uchun), va HECH QACHON throw qilmaydi.

Farqi: `telegram.ts` oddiy `boolean` qaytaradi ("yetib bordimi").
`stock.ts` ham xuddi shunday (`boolean` — Checkout.tsx faqat ok/emasligi
bilan qiziqadi). `rating.ts` esa `RateProductResult | null` qaytaradi —
chunki `ShopSingle.tsx` serverda hisoblangan yangi `rating`/`ratingSum`/
`ratingCount`ni Redux'ga DARHOL yozishi kerak (butun mahsulotlar
ro'yxatini qayta o'qimasdan); oddiy `boolean` bu ma'lumotni olib
kela olmasdi. Ikkalasida ham xato `console.error`ga yoziladi — jim
yutilmaydi (`tests/e2e/apply-order-stock.spec.ts` buni tekshiradi).

### Checkout.tsx: `stockOk` — uchinchi mustaqil kanal

15-bo'limda (aslida `Checkout.tsx`ning o'zida) Firestore va Telegram
ikki mustaqil kanal ekani va biri yiqilsa ham "muvaffaqiyatli"
deyilmasligi yozilgan edi. `applyOrderStock` uchinchi kanal sifatida
qo'shildi — LEKIN muvaffaqiyat/muvaffaqiyatsizlik darajasi
BOSHQACHA: Firestore yoki Telegram ikkalasi ham yiqilsa buyurtma
"yuborilmadi" deyiladi (mijoz operatorlarga umuman yetmagan bo'lishi
mumkin). `stockOk = false` esa BUNDAY EMAS — buyurtmaning o'zi
Firestore'ga allaqachon yozilgan, mijoz operatorlarga yetgan, faqat
zaxira hisoblagichi yangilanmagan (texnik, ko'rinmas nosozlik). Shuning
uchun `stockOk = false` buyurtmani "muvaffaqiyatsiz" qilmaydi — alohida,
yumshoqroq ogohlantirish ko'rsatiladi (`checkout.stockWarning`), mijoz
qayta buyurtma berishga undalmaydi.

`applyOrderStock` FAQAT `firestoreOk === true` bo'lganda chaqiriladi —
aks holda `orders/{orderId}` Firestore'da umuman yo'q, funksiya
`not-found` bilan yiqiladi (foydasiz tarmoq so'rovi).

### Eski reducer'lar (`decreaseStock`, `updateProductRating`)

Ikkalasi ham `Data.ts`da O'CHIRILMADI — eski localStorage'dagi
`organick_products` keshi bu maydonlar (`stock`, `userRatings`) bilan
saqlangan bo'lishi mumkin, reducer o'chirilsa TypeScript buzilmasa ham
eski keshni o'qishda hech narsa yiqilmaydi (chunki reducer shunchaki
CHAQIRILMAYDI endi) — lekin kelajakda kimdir "hali ham shu yo'lni
ishlataveraman" deb yangi kod yozmasligi uchun ikkalasi ham izoh bilan
"QARZ — ENDI ISHLATILMAYDI" deb belgilandi. `Product.userRatings`
maydoni ham xuddi shu sababdan turibdi (CLAUDE.md — localStorage
sxemasi/kalitlari buzilmaydi qoidasi).

### `Product` tipiga qo'shilgan maydonlar

`ratingCount?: number`, `ratingSum?: number` — ikkalasi ham
IXTIYORIY, eski Firestore hujjatlarida (yoki eski localStorage
keshida) bu maydonlar yo'q bo'lishi mumkin; `rateProduct` birinchi
chaqiruvda `(product.ratingSum || 0)` / `(product.ratingCount || 0)`
bilan `undefined`ni `0` deb hisoblaydi, ya'ni eski hujjat birinchi
baholanganda avtomatik "to'g'ri" boshlanadi.

### Test — nega to'liq Checkout UI oqimi emas

`tests/e2e/apply-order-stock.spec.ts` — `applyOrderStock` chaqiruvi
`route.abort()` bilan to'silganda: (1) throw QILMAYDI, (2) `false`
qaytaradi, (3) xato `console.error`ga yoziladi (jim yutilmaydi).

Bu sinov to'g'ridan-to'g'ri `src/utils/stock.ts`ni — Checkout.tsx
chaqiradigan AYNAN SHU modulni, Vite dev-server orqali (mock emas) —
chaqiradi, TO'LIQ Checkout formasini to'ldirib yubormaydi. Sabab:
`Checkout.tsx` `applyOrderStock`ni FAQAT `firestoreOk === true`
bo'lganda chaqiradi, ya'ni haqiqiy Firestore YOZISH (`setDoc`)
muvaffaqiyatli bo'lishi kerak. Firestore Web SDK yozish oqimi
oddiy REST emas — backend'ning real tasdiqlashini kutadi (streaming
protokol) va bu konteynerda (real Firebase loyihasi yo'q, chiquvchi
HTTPS proksi orqali, sertifikat ishonchi yo'q — `npx playwright test`
paytida `ERR_TUNNEL_CONNECTION_FAILED`/`ERR_CERT_AUTHORITY_INVALID`
ko'rinadi) soxtalashtirib bo'lmaydi. Bu aynan CLAUDE.md/
`playwright.config.ts`da allaqachon yozilgan chegara — "Firebase
chaqiruvlari sinalmaydi" — shu sababning o'zi. Shuning uchun sinov
funksiyaning shartnomasini (never throw, xato jim yutilmaydi) to'g'ridan-
to'g'ri tekshiradi — bu aynan Checkout.tsx'da `try/catch` bilan
o'ralmagan chaqiruvni (`stockOk = await applyOrderStock(id)`) himoya
qiladigan shartnoma.
