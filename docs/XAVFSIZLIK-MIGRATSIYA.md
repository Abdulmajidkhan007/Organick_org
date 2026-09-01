# Xavfsizlik migratsiyasi — orders qoidalari va admin huquqi

> Bu hujjat **qo'lda bajariladigan** qadamlarni yozadi. Kod tomoni tayyor.
>
> **Butun ish telefondan, brauzerdan bajariladi.** Kompyuter, `firebase`
> CLI, `gcloud`, `node` — hech biri KERAK EMAS. A-BO'LIM yetarli.

`PROJECT_ID` — Firebase loyihangiz ID'si (`.env` dagi `VITE_FIREBASE_PROJECT_ID`).

---

## Admin huquqi qayerdan keladi

Admin ikki manbadan aniqlanadi, **shu tartibda**:

| # | Manba | Kim qo'yadi | Kerakmi |
|---|---|---|---|
| 1 | Custom claim `{ admin: true }` | Faqat server (Admin SDK / Cloud Shell) | Ixtiyoriy, tez yo'l |
| 2 | `admins/{uid}` hujjati Firestore'da | Firebase Console, telefondan | **Asosiy yo'l** |

`firestore.rules` dagi `isAdmin()` avval claim'ni ko'radi. Claim bo'lsa
`admins/{uid}` **umuman o'qilmaydi** (`||` qisqa tutashuv qiladi) — ya'ni
zaxira yo'l claim'i borlar uchun bir tiyin ham qo'shimcha xarajat
keltirmaydi. Xuddi shu tartib frontendda ham bor:
`src/firebase/auth.ts` → `checkIsAdmin()`.

Ikkovidan **bittasi** yetarli. Ikkalasi ham bo'lsa — bu ham to'g'ri.

---

## ⚠️ OGOHLANTIRISH — adminni olib tashlaganda

> ### Adminni olib tashlaganda IKKALA joydan ham o'chiring:
> ### 1) `admins/{uid}` hujjati   VA   2) custom claim `{ admin: true }`
>
> **Bittasi qolsa — o'sha odam admin bo'lib qolaveradi.**
>
> Hujjatni o'chirdingiz, claim qoldi → hali ham admin.
> Claim'ni oldingiz, hujjat qoldi → hali ham admin.
>
> Agar o'sha odamga claim hech qachon qo'yilmagan bo'lsa (ya'ni siz
> faqat A-BO'LIM bilan ishlagansiz), unda faqat hujjatni o'chirish
> yetarli. Ishonchingiz komil bo'lmasa — **ikkalasini ham** tekshiring:
> Console → Firestore → `admins` kolleksiyasida hujjat bormi, va
> B-BO'LIMdagi skript bilan `customClaims` nima ekanini ko'ring.
>
> Claim olingandan keyin ham eski ID token **1 soatgacha** amal qiladi.
> Zudlik bilan uzish kerak bo'lsa: Console → Authentication → Users →
> o'sha foydalanuvchi → **Disable account**.

---

# A-BO'LIM — Telefondan, CLI'siz (ASOSIY YO'L)

Hammasi Firebase Console'da (`console.firebase.google.com`) qilinadi.
Telefon brauzerida ochiladi. Chrome'da sahifa tor bo'lsa —
**⋮ menyu → "Desktop site"** ni yoqing, jadval va tugmalar to'liq ko'rinadi.

**Qadamlar tartibi muhim:**

```
A1  UID'ni topish
A2  index yaratish        ← eng birinchi: qurilishi vaqt oladi, hech narsani sindirmaydi
A3  admins/{uid} hujjati  ← qoidalar kuchga kirishidan OLDIN tayyor tursin
A4  qoidalarni Publish    ← eng oxirida
A5  tekshirish
```

Nega shu tartib: A4 dan keyin `/admin` faqat A3 bajarilgan bo'lsagina
ochiladi. Agar A4 ni A3 dan oldin qilsangiz, hujjat yaratilgunga qadar
admin panel yopiq bo'lib turadi (Console'ning o'zi qoidalardan o'tmaydi,
shuning uchun hujjatni baribir yarata olasiz — shunchaki oraliqda sayt
"admin emas" deydi).

---

## A1-QADAM. O'z UID'ingizni topish

1. `console.firebase.google.com` ni oching → loyihangizni tanlang.
2. Chap menyu (☰) → **Build → Authentication**.
3. Yuqoridagi **Users** tabini bosing.
4. Jadvalda o'z emailingizni toping (masalan `santexnika.atoyo@gmail.com`).
5. Eng o'ng ustun — **User UID**. U 28 belgili satr, masalan
   `xY3kPq7mNb2LrTt9WsVd0FgHjKl1`.
6. Uni **bosib turing → Copy** (yoki qatorning oxiridagi nusxa ikonkasini bosing).

**UID topilmadi?** Demak bu email bilan hali saytga kirilmagan. Avval
saytni oching → **Kirish** → o'sha hisob bilan kiring → keyin bu qadamga
qayting. Ro'yxatda paydo bo'ladi.

> UID'ni biror joyga yozib qo'ying — u keyingi qadamda kerak, va uni
> qo'lda terish xato qilishning eng oson yo'li. Nusxa oling.

---

## A2-QADAM. Composite index yaratish (BIRINCHI!)

Foydalanuvchi paneli `where('userId','==',uid)` + `orderBy('createdAt','desc')`
so'rovini yuboradi. Firestore bunga **composite index** talab qiladi.
Index'siz `/dashboard` bo'sh ko'rinadi.

Index qurilishi bir necha daqiqa oladi, shuning uchun uni **eng birinchi**
boshlaymiz — u hech narsani sindirmaydi, shunchaki fonda quriladi.

### Variant 1 — saytdagi xato havolasi orqali (eng oson)

1. Saytga oddiy foydalanuvchi sifatida kiring → **/dashboard** ni oching.
2. Brauzer konsolida (yoki sahifadagi xato matnida) shunday satr chiqadi:
   `The query requires an index. You can create it here: https://console.firebase.google.com/...`
3. **O'sha havolani bosing** — Console index yaratish formasini
   maydonlari to'ldirilgan holda ochadi.
4. **Create index** tugmasini bosing. Tamom.

### Variant 2 — qo'lda

1. Console → chap menyu → **Build → Firestore Database**.
2. Yuqorida **Indexes** tabini bosing.
3. **Composite** bo'limida **Create index** tugmasi.
4. Formani shunday to'ldiring:

   | Maydon | Qiymat |
   |---|---|
   | Collection ID | `orders` |
   | Field path 1 | `userId` → **Ascending** |
   | Field path 2 | `createdAt` → **Descending** |
   | Query scopes | **Collection** |

5. **Create** ni bosing.

**Tekshirish:** Indexes ro'yxatida holat **Building** deb turadi.
U **Enabled** ga o'tishini kuting (odatda 1–5 daqiqa). A3 ga o'tishdan
oldin `Enabled` bo'lishi shart emas, lekin `/dashboard` ni sinashdan
oldin — shart.

---

## A3-QADAM. `admins/{uid}` hujjatini yaratish

Bu — admin huquqini beradigan asosiy qadam.

1. Console → **Build → Firestore Database** → **Data** tabi.
2. **Start collection** tugmasini bosing.
   (Agar bazada allaqachon `orders` bor bo'lsa, tugma ro'yxatning eng
   tepasida, `+ Start collection` ko'rinishida turadi.)
3. **Collection ID** maydoniga aynan shunday yozing:

   ```
   admins
   ```

   Katta-kichik harf muhim. `Admins` yoki `admin` **ishlamaydi**.
   → **Next** ni bosing.

4. Endi **Document ID** so'raladi. Console avtomatik tasodifiy ID
   qo'yib beradi — **uni o'chirib tashlang** va o'rniga A1-qadamda
   nusxa olgan **UID**'ingizni qo'ying:

   ```
   xY3kPq7mNb2LrTt9WsVd0FgHjKl1     ← bu misol, O'ZINGIZNIKINI qo'ying
   ```

   > "Auto-ID" tugmasini **BOSMANG**. Hujjat ID'si aynan UID bo'lishi
   > shart — qoida `admins/$(request.auth.uid)` ni qidiradi.

5. **Field** maydonlari bo'sh qoladi. Hujjatning **mavjudligining o'zi**
   admin degani, ichida nima borligi ahamiyatsiz.
   - Agar Console bo'sh maydon bilan saqlashga ruxsat bermasa, bitta
     eslatma maydoni qo'shing:
     Field: `note`, Type: `string`, Value: `admin — qo'lda qo'shildi`.
   - Bu maydon hech qayerda o'qilmaydi, faqat o'zingiz uchun.

6. **Save** ni bosing.

**Tekshirish:** Data tabida `admins` kolleksiyasi va uning ichida
UID'ingiz nomli bitta hujjat turibdi.

---

## A4-QADAM. Qoidalarni Publish qilish

> Bu — sezgir qadam. **Avval eski matnni saqlang.**

1. Console → **Build → Firestore Database** → **Rules** tabi.
2. Tahrirlagichdagi **hozirgi matnni to'liq belgilang va telefoningizga
   nusxa oling** (Notes/Keep ilovasiga qo'ying). Bu sizning "orqaga
   qaytish" nusxangiz.
   > Console'ning o'zida ham **History** bor (Rules tabining yuqorisida),
   > u yerdan har qanday eski versiyani bitta tugma bilan tiklash mumkin.
   > Qo'lda nusxa — ikkinchi himoya.
3. Tahrirlagichdagi hamma matnni o'chiring va o'rniga repodagi
   **`firestore.rules`** faylining **to'liq** matnini qo'ying.
   Faylni telefonda ochish: GitHub → repo → `firestore.rules` →
   o'ng yuqoridagi nusxa ikonkasi.
4. **Publish** tugmasini bosing.
5. Tasdiqlash oynasi chiqsa → **Publish**.

Qoidalar bir necha soniyada kuchga kiradi.

---

## A5-QADAM. Ishlayotganini tekshirish

Saytga o'z hisobingiz bilan kiring (agar kirgan bo'lsangiz — **chiqib,
qaytadan kiring**, shunda `checkIsAdmin` qayta ishlaydi):

| Tekshiruv | Kutilgan | Chiqmasa nima qilish |
|---|---|---|
| `/admin` ochiladimi | ✅ Ha, admin panel ko'rinadi | A3 — hujjat ID'si UID'ga **aynan** tengmi? Bo'sh joy qolmaganmi? |
| Admin panelda buyurtmalar ro'yxati | ✅ Hammasi ko'rinadi | A4 — qoidalar Publish bo'lganmi? |
| Buyurtma holatini o'zgartirish | ✅ Ishlaydi | A4 |
| Oddiy hisob bilan `/dashboard` | ✅ Faqat **o'z** buyurtmalari | A2 — index `Enabled` bo'ldimi? |
| Kirmasdan buyurtma berish | ✅ Ishlaydi | — |

Brauzer konsolida `Missing or insufficient permissions` chiqsa — bu
qoidalar rad etgani, ya'ni A3 yoki A4 da nimadir noto'g'ri.

---

## Orqaga qaytarish (nimadir sinsa)

Tartib — teskari:

1. **Sayt ishlamay qolsa, birinchi navbatda qoidalarni tiklang:**
   Console → Firestore → **Rules → History** → sinashdan oldingi
   versiyani tanlang → **Restore** (yoki A4/2-qadamda saqlagan matnni
   qaytadan qo'ying va Publish qiling).
   Bu bir necha soniyada eski holatga qaytaradi.
2. Admin huquqini qaytarib olish: `admins/{uid}` hujjatini o'chiring
   (Data tabi → hujjat → ⋮ → **Delete document**).
   ⚠️ Yuqoridagi ogohlantirishni eslang: claim ham qo'yilgan bo'lsa,
   uni ham oling.
3. Index'ni o'chirish **shart emas** — u hech narsani sindirmaydi,
   shunchaki turaveradi.
4. `orders` hujjatlariga **tegmang**. Ular real buyurtmalar; qoidalar
   noto'g'ri bo'lgani ma'lumot buzilgani degani emas.

---

# B-BO'LIM — Cloud Shell orqali custom claim (IXTIYORIY)

> ### Bu bo'lim MAJBURIY EMAS.
> A-BO'LIM to'liq yetarli: `admins/{uid}` hujjati bilan admin panel
> to'liq ishlaydi. B-BO'LIM faqat bitta narsa beradi — har bir admin
> so'rovida `admins/{uid}` hujjatining o'qilishi bekor bo'ladi
> (juda katta trafikda arziydigan tejash). Xavfsizlik darajasi
> ikkalasida ham bir xil: ikkovini ham faqat siz, Console yoki server
> orqali qo'ya olasiz.
>
> **Xohlamasangiz, bu bo'limni butunlay o'tkazib yuboring.**

Custom claim'ni faqat Admin SDK qo'ya oladi; Firebase CLI'da tayyor
buyruq yo'q. Lekin **Google Cloud Shell telefon brauzerida ochiladi** —
kompyuter baribir kerak emas.

## B1. Cloud Shell'ni ochish

1. Telefonda `shell.cloud.google.com` ni oching (Firebase bilan bir xil
   Google hisobi bilan kiring).
2. **Continue / Authorize** ni bosing. Bir necha soniyada terminal ochiladi.
   - Ekran kichik bo'lsa: yuqoridagi menyudan **Open in new window**.
   - Klaviatura chiqmasa — terminal maydoniga bir marta bosing.
3. Cloud Shell allaqachon sizning Google hisobingiz nomidan
   autentifikatsiya qilingan — hech qanday kalit yuklab olish shart emas.

## B2. Skript

Quyidagi blokni **to'liq nusxa olib**, terminalga qo'ying va Enter bosing:

```bash
mkdir -p ~/set-admin && cd ~/set-admin
npm init -y >/dev/null
npm install firebase-admin

cat > set-admin.mjs <<'EOF'
import admin from 'firebase-admin'

const PROJECT_ID = process.env.PROJECT_ID
const EMAIL = process.env.EMAIL

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: PROJECT_ID,
})

const user = await admin.auth().getUserByEmail(EMAIL)
await admin.auth().setCustomUserClaims(user.uid, { admin: true })

const check = await admin.auth().getUser(user.uid)
console.log('✅ Claim o\'rnatildi')
console.log('   email :', check.email)
console.log('   uid   :', check.uid)
console.log('   claims:', JSON.stringify(check.customClaims))
EOF
```

Keyin (PROJECT_ID va EMAIL ni o'zingiznikiga almashtiring):

```bash
PROJECT_ID=sizning-project-id EMAIL=santexnika.atoyo@gmail.com node set-admin.mjs
```

Kutilgan natija:

```
✅ Claim o'rnatildi
   email : santexnika.atoyo@gmail.com
   uid   : xY3kPq7mNb2LrTt9WsVd0FgHjKl1
   claims: {"admin":true}
```

- Boshqa admin ham kerak bo'lsa — `EMAIL=` ni almashtirib buyruqni
  qaytaring. **Har bir admin uchun alohida.**
- `auth/user-not-found` chiqsa — bu email hali Firebase Auth'da yo'q.
  Avval o'sha hisob bilan saytga kiring, keyin qayting.

## B3. Claim qachon kuchga kiradi

Claim ID token ichiga yoziladi, token esa brauzerda **keshlanadi**.
Shuning uchun claim qo'yilgandan keyin:

> **Saytdan chiqing va qaytadan kiring.**
> (yoki 1 soatgacha kuting — token o'zi yangilanadi)

Chiqib-kirmasangiz, hech narsa o'zgarmagandek tuyuladi. Bu normal.

## B4. Claim'ni olib tashlash

```bash
# set-admin.mjs ichidagi setCustomUserClaims qatorini shunga almashtiring:
await admin.auth().setCustomUserClaims(user.uid, null)
```

⚠️ Va yuqoridagi ogohlantirishni eslang: `admins/{uid}` hujjatini ham
o'chiring, aks holda odam admin bo'lib qolaveradi.

---

## `firebase.json` va `firestore.indexes.json` haqida

Repoda bu ikki fayl bor:

- `firebase.json` — `firebase` CLI'ga qoidalar va indexlar qayerdaligini
  aytadi;
- `firestore.indexes.json` — `orders (userId ASC, createdAt DESC)` index
  ta'rifi.

**Ular MAJBURIY EMAS.** Ular faqat kompyuterdan `firebase deploy --only
firestore:rules` / `firestore:indexes` buyruqlarini ishlatmoqchi bo'lgan
odam uchun qulaylik. A-BO'LIM ularsiz, faqat Console orqali xuddi shu
natijaga olib keladi.

Fayllar o'chirilmadi: kelajakda kompyuter paydo bo'lsa yoki CI qo'shilsa,
qoidalarni qo'lda ko'chirish o'rniga bitta buyruq bilan deploy qilish
mumkin bo'ladi. Ular hech narsaga xalaqit bermaydi.

---

## Nima o'zgardi (qisqacha)

| Muammo (avval) | Endi |
|---|---|
| `allow read: if true` — har kim barcha mijoz telefoni/manzilini o'qirdi | `read` faqat o'z buyurtmasi yoki admin |
| `allow update, delete: if request.auth != null` — kirgan **har kim** o'chira olardi | `update, delete` faqat admin |
| `ADMIN_EMAILS` — faqat UI to'sig'i, devtools'da aylanib o'tsa bo'lardi | Custom claim **yoki** `admins/{uid}` hujjati; qoidalar ham shunga tayanadi |
| Admin huquqi faqat claim'da — uni qo'yish uchun kompyuter kerak edi | `admins/{uid}` zaxira yo'li — telefondan, Console orqali |
| `subscribeUserOrders` butun kolleksiyani yuklab brauzerda filtrlardi | Server tomonda `where('userId','==',uid)` |

---

## Rules Playground test stsenariylari

Konsol → **Firestore Database → Rules → Rules Playground**
(Rules tahrirlagichining pastida / yon panelida).

Playground'da `Authenticated` yoqilganda **Custom claims** (auth token
payload) maydoniga JSON kiritish mumkin — claim testlari uchun aynan
shu kerak.

**Tayyorgarlik.** Testlar bazadagi haqiqiy hujjatlarga qaraydi, shuning
uchun avval quyidagilar bo'lsin:

1. `orders/ORD-TEST` hujjati:

```json
{
  "id": "ORD-TEST",
  "userId": "USER_A_UID",
  "userEmail": "a@example.com",
  "customerName": "Test",
  "customerPhone": "+998901234567",
  "customerAddress": "Toshkent",
  "items": [],
  "subtotal": 10,
  "total": 10,
  "status": "pending",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

2. `admins/DOC_ADMIN_UID` hujjati (bo'sh yoki `note` maydoni bilan) —
   bu "claim'siz, hujjatli admin" testlari uchun.
3. `admins/CLAIM_ADMIN_UID` hujjati **YARATILMASIN** — bu "hujjatsiz,
   claim'li admin" testi uchun.

Quyidagi uch UID ishlatiladi:
- `CLAIM_ADMIN_UID` — claim bor, `admins` hujjati **yo'q**
- `DOC_ADMIN_UID` — claim yo'q, `admins` hujjati **bor**
- `USER_A_UID`, `USER_B_UID` — oddiy foydalanuvchilar (ikkalasi ham yo'q)

### Admin manbalari

| # | Stsenariy | Sozlama | Kutilgan |
|---|---|---|---|
| 1 | **Claim bor, `admins` hujjati yo'q → admin** | `get` `/orders/ORD-TEST`, Auth **ON**, uid `CLAIM_ADMIN_UID`, Custom claims `{"admin": true}` | ✅ **Allow** |
| 2 | **Claim yo'q, `admins` hujjati bor → admin** | `get` `/orders/ORD-TEST`, Auth **ON**, uid `DOC_ADMIN_UID`, Custom claims **bo'sh** | ✅ **Allow** |
| 3 | **Ikkalasi ham yo'q → admin EMAS** | `get` `/orders/ORD-TEST`, Auth **ON**, uid `USER_B_UID`, Custom claims **bo'sh** | ❌ **Deny** |
| 4 | Claim `false` bo'lsa ham hujjat bor → admin | `get` `/orders/ORD-TEST`, uid `DOC_ADMIN_UID`, claims `{"admin": false}` | ✅ **Allow** |

> 1-test claim yo'lining hujjatsiz ham ishlashini isbotlaydi — ya'ni
> `||` ning birinchi tarmog'i mustaqil.
> 2-test zaxira yo'lni isbotlaydi.
> 3-test eng muhimi: **hech qanday sukut bo'yicha admin yo'q**.

### `admins` kolleksiyasining o'zi

| # | Stsenariy | Sozlama | Kutilgan |
|---|---|---|---|
| 5 | **Kimdir boshqaning admin hujjatini o'qiydi** | `get` `/admins/DOC_ADMIN_UID`, Auth **ON**, uid `USER_A_UID` | ❌ **Deny** |
| 6 | Admin ham boshqaning hujjatini o'qiy olmaydi | `get` `/admins/DOC_ADMIN_UID`, uid `CLAIM_ADMIN_UID`, claims `{"admin": true}` | ❌ **Deny** |
| 7 | O'z hujjatini o'qish — mumkin | `get` `/admins/DOC_ADMIN_UID`, Auth **ON**, uid `DOC_ADMIN_UID` | ✅ **Allow** |
| 8 | **Kimdir `admins` ga yozadi** | `create` `/admins/USER_A_UID`, Auth **ON**, uid `USER_A_UID`, Document: `{}` | ❌ **Deny** |
| 9 | Admin ham `admins` ga yoza olmaydi | `create` `/admins/USER_B_UID`, uid `CLAIM_ADMIN_UID`, claims `{"admin": true}`, Document: `{}` | ❌ **Deny** |
| 10 | O'z admin hujjatini o'chirish ham mumkin emas | `delete` `/admins/DOC_ADMIN_UID`, uid `DOC_ADMIN_UID` | ❌ **Deny** |
| 11 | Kirmagan mehmon `admins` ni o'qiydi | `get` `/admins/DOC_ADMIN_UID`, Auth **OFF** | ❌ **Deny** |

> 8–10: `allow write: if false` — **hech kim** admin qo'sha olmaydi.
> Console qoidalardan o'tmaydi, shuning uchun A3-QADAM baribir ishlaydi.
> 5–6: adminlar ro'yxatini chetdan sanab chiqib bo'lmaydi.

### `orders` — foydalanuvchi chegaralari

| # | Stsenariy | Sozlama | Kutilgan |
|---|---|---|---|
| 12 | **Mehmon buyurtma yaratadi** | `create` `/orders/ORD-NEW`, Auth **OFF**, Document: yuqoridagi JSON, `userId: null` | ✅ **Allow** |
| 13 | **A foydalanuvchi B ning buyurtmasini o'qiydi** | `get` `/orders/ORD-TEST`, Auth **ON**, uid `USER_B_UID` | ❌ **Deny** |
| 14 | A o'z buyurtmasini o'qiydi | `get` `/orders/ORD-TEST`, Auth **ON**, uid `USER_A_UID` | ✅ **Allow** |
| 15 | **Oddiy foydalanuvchi buyurtmani o'chiradi** | `delete` `/orders/ORD-TEST`, Auth **ON**, uid `USER_A_UID` (o'z buyurtmasi bo'lsa ham!) | ❌ **Deny** |
| 16 | Oddiy foydalanuvchi holatni o'zgartiradi | `update` `/orders/ORD-TEST`, uid `USER_A_UID`, Document: `{"status":"delivered"}` | ❌ **Deny** |
| 17 | Mehmon buyurtma o'qiydi | `get` `/orders/ORD-TEST`, Auth **OFF** | ❌ **Deny** |

### `orders` — admin amallari (ikkala manba bilan ham)

| # | Stsenariy | Sozlama | Kutilgan |
|---|---|---|---|
| 18 | Claim'li admin holatni yangilaydi | `update` `/orders/ORD-TEST`, uid `CLAIM_ADMIN_UID`, claims `{"admin": true}`, Document: `{"status":"confirmed"}` | ✅ **Allow** |
| 19 | Hujjatli admin holatni yangilaydi | `update` `/orders/ORD-TEST`, uid `DOC_ADMIN_UID`, claims bo'sh, Document: `{"status":"confirmed"}` | ✅ **Allow** |
| 20 | Claim'li admin o'chiradi | `delete` `/orders/ORD-TEST`, uid `CLAIM_ADMIN_UID`, claims `{"admin": true}` | ✅ **Allow** |
| 21 | Hujjatli admin o'chiradi | `delete` `/orders/ORD-TEST`, uid `DOC_ADMIN_UID`, claims bo'sh | ✅ **Allow** |

### Qolgan hamma narsa yopiq

| # | Stsenariy | Sozlama | Kutilgan |
|---|---|---|---|
| 22 | Boshqa kolleksiya yopiqmi | `get` `/products/1`, uid `CLAIM_ADMIN_UID`, claims `{"admin": true}` | ❌ **Deny** |

### Playground nimani tekshira olmaydi

Playground faqat **bitta hujjat** amallarini (`get`) simulyatsiya qiladi,
**`list`** (query) ni emas. Ya'ni "foydalanuvchi butun kolleksiyani so'rasa
rad etiladimi" degan savolni u yerda sinab bo'lmaydi.

Buni jonli tekshirish:

1. Oddiy foydalanuvchi bilan saytga kiring, `/dashboard` ni oching →
   faqat o'z buyurtmalari ko'rinishi kerak.
2. Brauzer konsolida quyidagini ishlating — **rad etilishi kerak**:
   ```js
   // filtrsiz so'rov: qoidalar buni to'sadi
   const { getFirestore, collection, getDocs } = await import('firebase/firestore')
   await getDocs(collection(getFirestore(), 'orders'))
   // kutilgan: FirebaseError: Missing or insufficient permissions.
   ```

---

## Bilib qo'yish kerak bo'lgan oqibatlar

1. **`exists()` bitta hujjat o'qishi hisoblanadi.** Claim'siz admin
   qilingan har bir so'rovda `admins/{uid}` o'qiladi. Blaze tarifida bu
   pul, Spark'da esa kunlik limitdan yeyiladi. Admin panel kuniga bir
   necha marta ochiladigan sayt uchun bu sezilmaydi. Trafik o'ssa —
   B-BO'LIM (claim) uni nolga tushiradi.

2. **Mehmon buyurtmalari (`userId: null`) foydalanuvchi panelida
   ko'rinmaydi.** Ular hech bir hisobga biriktirilmagan. Admin panelida
   va Telegram'da o'z joyida turadi.

3. **Avval email bo'yicha topilgan buyurtmalar ham ko'rinmaydi.** Eski
   kod `userId === uid || userEmail === email` deb filtrlardi; yangi
   so'rov faqat `userId` bo'yicha (qoidalar ham shunga tayanadi).
   Eski `userId: null` buyurtmalarni egasiga qaytarish uchun bir martalik
   migratsiya kerak bo'lardi — hozircha qilinmadi, buyurtmalarga
   tegilmadi.

4. **`checkIsAdmin` fail-closed.** Tarmoq yo'q yoki Firestore rad etsa,
   `isAdmin: false` bo'ladi — sayt oq ekran bermaydi, shunchaki admin
   paneli ochilmaydi. Bu ataylab: shubha bo'lsa huquq berilmaydi.

---

## Ixtiyoriy: `create` ni qattiqlashtirish

`allow create: if true` ataylab o'zgarishsiz qoldirildi — mehmon buyurtma
bera olishi kerak. Lekin buning bir kamchiligi bor: kirgan foydalanuvchi
qo'lda boshqa `userId` yozib, buyurtmani **boshqa odamning kabinetiga**
tashlab qo'ya oladi.

Buni to'sish uchun `firestore.rules` dagi `allow create` qatorini shunga
almashtiring:

```
      // Mehmon — ixtiyoriy; kirgan foydalanuvchi esa faqat o'z nomidan
      // (yoki umuman nomsiz) buyurtma yarata oladi.
      allow create: if request.auth == null
                    || request.resource.data.userId == null
                    || request.resource.data.userId == request.auth.uid;
```

Bu **toraytirish**, kengaytirish emas, va hozirgi checkout oqimini
sindirmaydi: `Checkout.tsx` `userId` ga `user?.uid || null` yozadi.

Shunga qaramay bu qator **kiritilmadi** — u to'g'ridan-to'g'ri buyurtma
berish oqimiga tegadi. Avval Playground'da sinang, keyin Publish qiling:

| Stsenariy | Sozlama | Kutilgan |
|---|---|---|
| Mehmon buyurtma beradi | `create`, Auth **OFF**, `userId: null` | ✅ Allow |
| Kirgan foydalanuvchi o'z nomidan | `create`, uid `USER_A_UID`, `userId: "USER_A_UID"` | ✅ Allow |
| Kirgan foydalanuvchi nomsiz | `create`, uid `USER_A_UID`, `userId: null` | ✅ Allow |
| Kirgan foydalanuvchi **boshqa** nomdan | `create`, uid `USER_A_UID`, `userId: "USER_B_UID"` | ❌ Deny |
