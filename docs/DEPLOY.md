# Deploy — Firebase Hosting (telefondan, CLI'siz)

> Bu hujjat loyiha egasi uchun: kompyuter yo'q, faqat telefon (brauzer +
> GitHub/Google ilovalari yoki mobil brauzer). Terminal, `npm`, `firebase`
> CLI kerak EMAS — hammasi GitHub Actions ichida avtomatik ishlaydi.

## Qanday ishlaydi

`master` branch'ga push (yoki PR merge) bo'lganda `.github/workflows/deploy.yml`
avtomatik ishga tushadi: `npm ci` → `npm run lint` → `npm run build` →
`firebase deploy --only hosting`. Firestore qoidalari/indekslari bu jarayon
orqali **hech qachon** o'zgartirilmaydi — ular alohida, qo'lda Firebase
Console'dan boshqariladi (`docs/XAVFSIZLIK-MIGRATSIYA.md`).

Pull request ochilganda esa faqat `.github/workflows/pr-check.yml` ishlaydi
(lint + build) — deploy yo'q, preview link yo'q.

Bir marta quyidagi qadamlarni bajarsangiz, keyingi har bir push o'zi
deploy qiladi.

---

## 1-qadam: GitHub Secrets qo'shish

Repo sahifasida (mobil brauzerda ham ishlaydi):
**Settings → Secrets and variables → Actions → "New repository secret"**

Quyidagi nomlar bilan **9 ta** secret qo'shing (nomi aynan shunday yozilsin,
qiymati esa sizning `.env` faylingizdagi bilan bir xil bo'lsin):

| Secret nomi | Qayerdan olinadi |
|---|---|
| `VITE_FIREBASE_API_KEY` | `.env` faylingizdan yoki Firebase Console → Project settings → General → "Your apps" → Web app → SDK config |
| `VITE_FIREBASE_AUTH_DOMAIN` | xuddi shu joydan |
| `VITE_FIREBASE_PROJECT_ID` | xuddi shu joydan (`organick-e1c5a` bo'lishi kerak) |
| `VITE_FIREBASE_STORAGE_BUCKET` | xuddi shu joydan |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | xuddi shu joydan |
| `VITE_FIREBASE_APP_ID` | xuddi shu joydan |
| `VITE_FIREBASE_MEASUREMENT_ID` | xuddi shu joydan |
| `VITE_PHONE_AUTH_DOMAIN` | Hozircha kod bu o'zgaruvchini o'qimaydi — kelajakda kerak bo'lsa tayyor turishi uchun qo'shilgan. Bo'sh qoldirmang: `VITE_FIREBASE_AUTH_DOMAIN` bilan bir xil qiymatni yozing. |
| `FIREBASE_SERVICE_ACCOUNT` | 2-qadamga qarang — bu bitta secret ichiga **butun JSON fayl matni** yoziladi |

Eslatma: Telegram bilan bog'liq `VITE_TELEGRAM_*` kalitlar bu ro'yxatda
YO'Q — ular alohida ish (7b), bu workflow'ga tegishli emas.

---

## 2-qadam: Firebase service account (deploy uchun "kalit")

GitHub Actions'ga Firebase Hosting'ga deploy qilish huquqini berish uchun
maxsus "xizmat hisobi" kaliti kerak. Buni Firebase Console'ning o'zidan
olish mumkin — Google Cloud Console kerak emas:

1. https://console.firebase.google.com → loyihangizni oching (`organick-e1c5a`)
2. Chap tomondagi tishli belgi (⚙️) → **Project settings**
3. Yuqoridagi tab'lardan **Service accounts** ni tanlang
4. **Generate new private key** tugmasini bosing → tasdiqlang
5. Telefon `.json` faylni yuklab oladi (masalan `organick-e1c5a-firebase-adminsdk-xxxxx.json`)
6. Shu faylni telefoningizdagi Fayllar ilovasida oching (matn ko'rinishida —
   agar to'g'ridan-to'g'ri ochilmasa, "Fayllar" ilovasida uzoq bosib
   "Matn muharririda ochish" yoki brauzerda `file://` orqali ko'ring, yoki
   faylni o'zingizga (Telegram "Saved Messages" kabi) yuboring va u yerda oching)
7. Butun JSON matnini (birinchi `{` dan oxirgi `}` gacha, hammasini) nusxalang
8. GitHub'da **1-qadamdagi** joyga qaytib, `FIREBASE_SERVICE_ACCOUNT` nomli
   secret yarating va qiymat qismiga shu butun JSON matnini joylashtiring

**Diqqat:** bu faylni hech kimga yubormang, hech qayerga (chat, email) ochiq
saqlamang — u loyihangizga to'liq Firebase admin kirish huquqini beradi.
GitHub Secret ichiga yozilgandan keyin uni telefondan o'chirib tashlashingiz
mumkin (GitHub'dagi nusxa saqlanib qoladi, faqat siz uni qayta o'qiy
olmaysiz — shuning uchun xato qilsangiz, yangi kalit generatsiya qilib,
secret qiymatini almashtirasiz).

---

## 3-qadam: Firebase Console — Authorized domains

Telefon/Google/Email orqali kirish (Auth) ishlashi uchun Hosting domenlari
ruxsat etilgan bo'lishi kerak:

1. https://console.firebase.google.com → loyihangiz → **Authentication**
2. **Settings** tab → **Authorized domains**
3. Odatda Firebase Hosting'ni yoqganingizda quyidagilar **o'zi** qo'shiladi:
   - `organick-e1c5a.web.app`
   - `organick-e1c5a.firebaseapp.com`
   Ro'yxatda bor-yo'qligini tekshiring, yo'q bo'lsa **Add domain** bilan
   qo'shing.
4. Eski Netlify domeni ro'yxatda qolgan bo'lsa (masalan
   `...netlify.app` yoki avvalgi custom domen) — uning yonidagi
   "..." (uch nuqta) yoki chelak belgisini bosib **o'chiring**. Netlify
   loyihasi allaqachon bekor qilingani uchun bu domen endi ishlamaydi,
   lekin ro'yxatda qolishi mumkin emas joydan kirish imkonini
   qoldiradi — tozalab qo'ying.

---

## 4-qadam: Birinchi deploy'ni tekshirish

1. `master` branch'ga birror commit push qiling (yoki bu PR'ni merge qiling)
2. GitHub repo sahifasida **Actions** tab'ini oching
3. "Deploy to Firebase Hosting" workflow'ini toping, yashil ✅ bo'lishini
   kutib turing (2-3 daqiqa)
4. Saytni oching: `https://organick-e1c5a.web.app`

Agar workflow qizil ❌ bilan tugasa — **Actions** tab'ida shu run'ni ochib,
qaysi qadamda (lint / build / deploy) xato chiqganini o'qing. Ko'p uchraydigan
sabab: 1-qadamdagi secret nomi noto'g'ri yozilgan yoki bo'sh qolgan.

---

## Eski Netlify izlarini tozalash

- Netlify loyihasi allaqachon bekor qilingan — Netlify tomonida
  qiladigan ish yo'q.
- `netlify.toml` va `public/_redirects` fayllari repodan o'chirildi (bu
  o'zgarish bilan birga) — endi kerak emas, chunki SPA yo'naltirish
  `firebase.json` ichida (`hosting.rewrites`).
- 3-qadamdagi Authorized domains tozalashni unutmang.
