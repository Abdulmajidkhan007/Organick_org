# Qo'lda sinash rejasi — telefon raqam + parol bilan kirish

> Telefondan bajariladi. Har bir qadamda **kutilgan natija** yozilgan —
> boshqacha bo'lsa, o'sha qatorni belgilab menga yuboring.
>
> Avtomatik sinaladigan yagona narsa — `/auth` sahifasining 8 ta
> kenglikda toshib ketmasligi (`npm run test:e2e`). Firebase, SMS va
> haqiqiy parollar FAQAT qo'lda sinaladi: ular real loyiha va real
> raqam talab qiladi.

---

## 0. Sinashdan OLDIN (bir marta)

| # | Ish | Qayerda |
|---|---|---|
| 0.1 | `VITE_PHONE_AUTH_DOMAIN` ni tasodifiy qiymat bilan to'ldiring, masalan `4f9c2a71b03de85a.local` | Netlify → Site settings → Environment variables (va lokal `.env`) |
| 0.2 | Firebase Console → Authentication → Sign-in method: **Phone** va **Email/Password** ikkalasi ham **Enabled** | Firebase Console |
| 0.3 | Firebase Console → Authentication → Settings → Authorized domains ichida sayt domeni bor | Firebase Console |
| 0.4 | Netlify'da qayta deploy qiling (env o'zgargani uchun eski build yaramaydi) | Netlify |

> ⚠️ **`VITE_PHONE_AUTH_DOMAIN` bir marta qo'yiladi va keyin
> O'ZGARTIRILMAYDI.** Uni o'zgartirsangiz mavjud mijozlarning parollari
> ishlamay qoladi (SMS bilan kirib, parolni qaytadan qo'yishga to'g'ri
> keladi). Sinashni ham, ishga tushirishni ham AYNAN BIR XIL qiymat
> bilan qiling.

Agar 0.1 bajarilmasa — sayt sinmaydi, lekin telefon+parol **o'chiq**
turadi: `/auth` da sariq ogohlantirish chiqadi va faqat SMS bilan kirish
ishlaydi. Bu ataylab shunday (pastda 5.4 ga qarang).

---

## 1. Ro'yxatdan o'tish (asosiy stsenariy) — SMS BIR MARTA

| # | Qadam | Kutilgan natija |
|---|---|---|
| 1.1 | `/auth` ni oching | Ochilishida **«Telefon + parol»** tab tanlangan bo'ladi |
| 1.2 | Yuqoridan **«Ro'yxatdan o'tish»** ni bosing | Ism va Telefon maydonlari, ostida «SMS faqat BIR MARTA yuboriladi…» izohi |
| 1.3 | Ism yozing, raqamni `+998901234567` ko'rinishida kiriting, **«Kod yuborish»** | Telefonga SMS keladi, ekran kod so'raydi |
| 1.4 | Kodni kiriting, **«Tasdiqlash»** | **Bosh sahifaga o'TMAYDI** — «Parol yarating» ekrani chiqadi |
| 1.5 | 8+ belgili parol kiriting, tasdiqlang, **«Parolni saqlash»** | Bosh sahifaga o'tadi, yuqori o'ngda hisobingiz ko'rinadi |
| 1.6 | Navbar'dagi hisob menyusini oching | Ismingiz ko'rinadi. **`...@....local` ko'rinishidagi g'alati email HECH QAYERDA ko'rinmasligi kerak** |

## 2. Kirish (SMS'siz) — asosiy foyda shu yerda

| # | Qadam | Kutilgan natija |
|---|---|---|
| 2.1 | Chiqing (logout) | Bosh sahifa, hisob ko'rinmaydi |
| 2.2 | `/auth`, telefon va 1.5 dagi parolni kiriting, **«Kirish»** | **SMS KELMAYDI.** Darhol kiradi |
| 2.3 | Xuddi shu ishni **boshqa qurilmada** (yoki inkognito oynada) qiling | Yana SMS'siz kiradi — bir hisob, ko'p qurilma |
| 2.4 | Raqamni boshqa ko'rinishda yozing: `901234567`, `998901234567`, `+998 90 123-45-67` | Uchalasi ham **bir xil ishlaydi** — raqam ichkarida bir ko'rinishga keltiriladi |

## 3. Xato holatlari (bu yerda hech narsa "jimgina" sinmasligi kerak)

| # | Qadam | Kutilgan natija |
|---|---|---|
| 3.1 | Kirishda parolni **noto'g'ri** kiriting | «Telefon raqam yoki parol noto'g'ri. Agar hali parol yaratmagan bo'lsangiz, «SMS bilan kirish» orqali kiring va parol o'rnating.» |
| 3.2 | Hech qachon ro'yxatdan o'tmagan raqam + biror parol | 3.1 dagi xuddi shu xabar (Firebase ikkalasini ajratmaydi — ataylab bitta xabar) |
| 3.3 | Raqamni `123` deb yozing | «Telefon raqam noto'g'ri. Masalan: +998901234567» |
| 3.4 | Parol maydonini bo'sh qoldiring | «Parol kiritish shart» |
| 3.5 | Parol yaratishda 5 ta belgi kiriting | «Parol kamida 8 ta belgidan iborat bo'lishi kerak» |
| 3.6 | Parol yaratishda tasdiqni boshqacha yozing | «Parollar mos kelmaydi» |
| 3.7 | SMS kodini noto'g'ri kiriting | «Kod noto'g'ri yoki muddati o'tgan…», ekran OTP'da qoladi |
| 3.8 | Ketma-ket ko'p marta noto'g'ri urinib ko'ring | «Juda ko'p urinish. Bir oz kutib…» |
| 3.9 | Internetni o'chirib kirishga urinib ko'ring | «Internet aloqasi yo'q. Ulanishni tekshiring.» |

> Uchala tilda ham sinang: Navbar'dagi til almashtirgichni **uz / en / ru**
> ga o'tkazib, 3.1–3.6 ni takrorlang. **O'zbekcha matn en/ru rejimda
> chiqmasligi kerak.**

## 4. Parolni unutgan holat (SMS orqali tiklash — email YO'Q)

| # | Qadam | Kutilgan natija |
|---|---|---|
| 4.1 | `/auth` → «Kirish» → telefon tab → **«Parolni unutdingizmi?»** | Raqam bo'sh bo'lsa xato; raqam kiritilgan bo'lsa SMS ketadi |
| 4.2 | Kodni kiriting | «Yangi parol» ekrani (bosh sahifaga o'tmaydi) |
| 4.3 | Yangi parol qo'ying, saqlang | Bosh sahifaga o'tadi |
| 4.4 | Chiqing, **eski** parol bilan kirishga urinib ko'ring | Kirmaydi (3.1 dagi xabar) |
| 4.5 | **Yangi** parol bilan kiring | Kiradi |

## 5. Eski oqimlar buzilmaganini tekshirish

| # | Qadam | Kutilgan natija |
|---|---|---|
| 5.1 | **Google** bilan kiring | Ilgarigidek ishlaydi |
| 5.2 | **Email + parol** bilan (eski hisobingiz bilan) kiring | Ishlaydi. Eski 6 belgili parol ham kirishga yaraydi — uzunlik faqat YANGI ro'yxatdan o'tishda tekshiriladi |
| 5.3 | «SMS bilan kirish» havolasini bosing (parolsiz eski oqim) | SMS keladi, tasdiqlagach darhol bosh sahifaga o'tadi |
| 5.4 | (ixtiyoriy) `VITE_PHONE_AUTH_DOMAIN` ni bo'sh qoldirib deploy qiling | `/auth` da sariq ogohlantirish, faqat SMS oqimi. Sayt sinmaydi |

## 6. Xavfsizlik tekshiruvi (bu ikkitasi MAJBURIY)

| # | Qadam | Kutilgan natija |
|---|---|---|
| 6.1 | `/auth` → «Ro'yxatdan o'tish» → **«Email orqali kirish»** tab → email sifatida `998901234567@4f9c2a71b03de85a.local` (ya'ni sizning domeningiz) yozing | «Bu email domeni bilan ro'yxatdan o'tib bo'lmaydi…» — hisob **YARATILMAYDI** |
| 6.2 | Xuddi shunday `test@nimadir.local` va `test@x.invalid` bilan urinib ko'ring | Ular ham bloklanadi |
| 6.3 | Firebase Console → Authentication → Users ro'yxatiga qarang | Telefon bilan ro'yxatdan o'tgan mijozda **Providers ustunida ikkita belgi** bo'ladi: telefon va email. Email — `998…@<domen>` |

> 6.1 bizning formani qo'riqlaydi. **Formani chetlab o'tib** (to'g'ridan-to'g'ri
> Firebase REST API orqali) o'sha manzilni band qilish hali ham mumkin —
> buni faqat server tomon to'xtatadi. Tavsiya etilgan qadam
> `docs/XAVFSIZLIK-MIGRATSIYA.md` → «Telefon+parol — qolgan xavf» da.

## 7. Ko'rinish (avtomatik sinaladi, lekin ko'z bilan ham qarang)

| # | Qadam | Kutilgan natija |
|---|---|---|
| 7.1 | `/auth` ni telefonda oching, yon tomonga surib ko'ring | Sahifa yon tomonga **surilmasligi** kerak |
| 7.2 | Dark mode'ni yoqib, 1–4 bo'limlarni yana bir bor ko'zdan kechiring | Matnlar o'qiladi, tugmalar ko'rinadi |
| 7.3 | Uzun xato xabari chiqqan holatda ekranni ko'ring (3.1) | Xabar qatorlarga bo'linadi, quticha chegaradan chiqmaydi |

---

## Nimani sinash SHART EMAS

- **Buyurtma oqimi** — o'zgarmagan. Yagona farq: `userEmail` maydoniga
  endi psevdo-email tushmaydi — telefon bilan kirgan mijozda u bo'sh
  bo'ladi. Mijozning raqami buyurtmada baribir bor: uni
  `customerPhone` maydoni Checkout formasidan oladi.
- **Firestore qoidalari** — umuman tegilmagan.
- **Admin paneli** — o'zgarmagan (faqat ismi yo'q adminda endi email
  o'rniga raqam ko'rsatiladi).
