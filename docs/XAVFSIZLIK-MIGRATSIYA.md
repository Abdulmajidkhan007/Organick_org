# Xavfsizlik migratsiyasi — orders qoidalari va admin claim

> Bu hujjat **qo'lda bajariladigan** qadamlarni yozadi. Kod tomoni allaqachon
> tayyor, lekin u to'g'ri ishlashi uchun quyidagi 4 qadam **shu tartibda**
> bajarilishi shart.
>
> Tartib muhim: har bir qadam o'zidan keyingisi uchun zamin tayyorlaydi va
> hech qaysi bosqichda sayt ishlamay qolmaydi.

`PROJECT_ID` — Firebase loyihangiz ID'si (`.env` dagi `VITE_FIREBASE_PROJECT_ID`).

---

## Nima o'zgardi (qisqacha)

| Muammo (avval) | Endi |
|---|---|
| `allow read: if true` — har kim barcha mijoz telefoni/manzilini o'qirdi | `read` faqat o'z buyurtmasi yoki admin |
| `allow update, delete: if request.auth != null` — kirgan **har kim** o'chira olardi | `update, delete` faqat admin |
| `ADMIN_EMAILS` — faqat UI to'sig'i, devtools'da aylanib o'tsa bo'lardi | Firebase custom claim `{ admin: true }`, qoidalar ham shunga tayanadi |
| `subscribeUserOrders` butun kolleksiyani yuklab brauzerda filtrlardi | Server tomonda `where('userId','==',uid)` |

---

## 1-QADAM. Composite index yaratish

Yangi so'rov `where('userId','==',uid)` + `orderBy('createdAt','desc')` — bu
Firestore'da **composite index** talab qiladi. Index'siz foydalanuvchi paneli
bo'sh ko'rinadi (va konsolda `failed-precondition` xatosi chiqadi).

Index bir necha daqiqada quriladi, shuning uchun uni **birinchi** qilamiz —
u eski kodga hech qanday ta'sir qilmaydi.

**Variant A — CLI (tavsiya etiladi).** Repo ichida `firestore.indexes.json`
allaqachon yozib qo'yilgan:

```bash
firebase deploy --only firestore:indexes --project PROJECT_ID
```

**Variant B — Konsol orqali qo'lda.**
https://console.firebase.google.com/project/PROJECT_ID/firestore/indexes
→ **Create index**:

| Maydon | Qiymat |
|---|---|
| Collection ID | `orders` |
| Field 1 | `userId` — **Ascending** |
| Field 2 | `createdAt` — **Descending** |
| Query scope | **Collection** |

**Tekshirish:** index holati `Building` dan `Enabled` ga o'tsin. Faqat
shundan keyin 3-qadamga o'ting.

---

## 2-QADAM. Admin custom claim o'rnatish

Bu qadam ham eski kodga zarar qilmaydi — claim shunchaki qo'shimcha
ma'lumot bo'lib turadi, uni hozircha hech kim tekshirmaydi.

**Muhim:** claim'ni faqat server (Admin SDK) qo'ya oladi. Firebase CLI'da
buning tayyor buyrug'i **yo'q**, shuning uchun kichik skript ishlatiladi.

### Variant A — Google Cloud Shell (tavsiya etiladi, kalit yuklab olinmaydi)

https://console.cloud.google.com/?cloudshell=true&project=PROJECT_ID

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

# PROJECT_ID o'rniga haqiqiy loyiha ID'sini qo'ying:
PROJECT_ID=sizning-project-id EMAIL=santexnika.atoyo@gmail.com node set-admin.mjs
```

Kutilgan natija:

```
✅ Claim o'rnatildi
   email : santexnika.atoyo@gmail.com
   uid   : xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   claims: {"admin":true}
```

> `admin@organick.com` hisobi ham kerak bo'lsa, `EMAIL=` ni o'zgartirib
> buyruqni yana bir marta ishlating. **Har bir admin uchun alohida.**
>
> Agar `getUserByEmail` `auth/user-not-found` qaytarsa — bu hisob hali
> Firebase Auth'da ro'yxatdan o'tmagan. Avval o'sha email bilan saytga
> kiring, keyin skriptni qayta ishlating.

### Variant B — O'z kompyuteringizda (service account kaliti bilan)

1. Konsol → **Project settings → Service accounts → Generate new private key**
2. Yuklab olingan JSON'ni `serviceAccount.json` deb saqlang.
   **Bu faylni repoga qo'shmang** (`.gitignore` ga kiritilgan emas — ehtiyot bo'ling,
   uni loyiha papkasidan tashqarida saqlang).
3. Yuqoridagi `set-admin.mjs` ni oling va `initializeApp` ni almashtiring:
   ```js
   credential: admin.credential.cert('/mutlaq/yo\'l/serviceAccount.json'),
   ```
4. Ishlating: `EMAIL=santexnika.atoyo@gmail.com node set-admin.mjs`
5. **Ish tugagach kalitni o'chiring** (Console → Service accounts → kalitni bekor qiling).

### Claim qachon kuchga kiradi

Claim ID token ichiga yoziladi, token esa brauzerda keshda turadi.
Shuning uchun claim o'rnatilgandan keyin admin hisobida:

**saytdan chiqib, qaytadan kiring** (yoki 1 soatgacha kuting — token
avtomatik yangilanadi).

### Admin huquqini olib tashlash

```bash
# set-admin.mjs ichida:
await admin.auth().setCustomUserClaims(user.uid, { admin: false })
# yoki butunlay tozalash:
await admin.auth().setCustomUserClaims(user.uid, null)
```

---

## 3-QADAM. Frontend kodni deploy qilish

Bu branch'ni `master` ga qo'shib, Netlify build'ini kuting.

Bu qadamda **eski qoidalar hali kuchda** — ular yangi koddan kengroq,
shuning uchun hech narsa sinmaydi. Yangi kod yangi so'rovni yuboradi,
eski qoida esa unga ruxsat beradi.

**Deploy'dan keyin tekshiring:**

1. Admin hisobi bilan kiring (chiqib-kirganingizga ishonch hosil qiling) →
   `/admin` ochilsinmi? **Ochilishi kerak.** Ochilmasa → 2-qadam claim
   o'rnatilmagan yoki token yangilanmagan.
2. Oddiy foydalanuvchi bilan kiring → `/dashboard` da **faqat o'z**
   buyurtmalari ko'rinsinmi? Ro'yxat bo'sh bo'lsa va qizil "Buyurtmalar
   yuklanmadi" chiqsa → 1-qadam index hali `Enabled` emas.
3. Mehmon (kirmagan holda) buyurtma bera olsinmi? **Bera olishi kerak.**

Uchalasi ham to'g'ri ishlagandan keyingina 4-qadamga o'ting.

---

## 4-QADAM. Qoidalarni deploy qilish (ENG OXIRIDA)

> Bu qadam **ortga qaytarilmaydigan** o'zgarish emas, lekin oldingi
> qoidalarni saqlab qo'ying: Konsol → Firestore → Rules → **History**
> bo'limida eski versiya turadi, kerak bo'lsa bir tugma bilan qaytariladi.

```bash
firebase deploy --only firestore:rules --project PROJECT_ID
```

`firebase.json` repoda bor, shuning uchun buyruq `firestore.rules` ni
o'zi topadi.

**Deploy'dan keyin darhol tekshiring** (3-qadamdagi 3 ta tekshiruvni
qaytadan bajaring). Agar biror narsa sinsa — Konsol → Rules → History →
oldingi versiyani tiklang, keyin muammoni hal qiling.

---

## Rules Playground test stsenariylari

Konsol → **Firestore Database → Rules → Rules Playground**.

Playground'da `Authenticated` yoqilganda **Custom claims** (auth token
payload) maydoniga JSON qo'shish mumkin — admin testlari uchun aynan
shu kerak.

Test uchun bazada bitta hujjat bo'lsin, masalan `orders/ORD-TEST`:

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

| # | Stsenariy | Sozlama | Kutilgan |
|---|---|---|---|
| 1 | **Mehmon buyurtma yaratadi** | Type: `create`, Path: `/orders/ORD-NEW`, Authenticated: **OFF**. Document: yuqoridagi JSON, `userId: null` | ✅ **Allow** |
| 2 | **A foydalanuvchi B ning buyurtmasini o'qiydi** | Type: `get`, Path: `/orders/ORD-TEST`, Authenticated: **ON**, uid: `USER_B_UID` | ❌ **Deny** |
| 3 | **A o'z buyurtmasini o'qiydi** | Type: `get`, Path: `/orders/ORD-TEST`, Authenticated: **ON**, uid: `USER_A_UID` | ✅ **Allow** |
| 4 | **Oddiy foydalanuvchi buyurtmani o'chiradi** | Type: `delete`, Path: `/orders/ORD-TEST`, Authenticated: **ON**, uid: `USER_A_UID` (o'z buyurtmasi bo'lsa ham!) | ❌ **Deny** |
| 5 | **Oddiy foydalanuvchi holatni o'zgartiradi** | Type: `update`, Path: `/orders/ORD-TEST`, Authenticated: **ON**, uid: `USER_A_UID`, Document: `{"status":"delivered"}` | ❌ **Deny** |
| 6 | **Admin o'qiydi** | Type: `get`, Path: `/orders/ORD-TEST`, Authenticated: **ON**, uid: `ADMIN_UID`, Custom claims: `{"admin": true}` | ✅ **Allow** |
| 7 | **Admin holatni yangilaydi** | Type: `update`, Path: `/orders/ORD-TEST`, Authenticated: **ON**, uid: `ADMIN_UID`, Custom claims: `{"admin": true}`, Document: `{"status":"confirmed"}` | ✅ **Allow** |
| 8 | **Admin o'chiradi** | Type: `delete`, Path: `/orders/ORD-TEST`, uid: `ADMIN_UID`, Custom claims: `{"admin": true}` | ✅ **Allow** |
| 9 | **Mehmon buyurtma o'qiydi** | Type: `get`, Path: `/orders/ORD-TEST`, Authenticated: **OFF** | ❌ **Deny** |
| 10 | **Boshqa kolleksiya yopiqmi** | Type: `get`, Path: `/products/1`, Authenticated: **ON**, uid: `ADMIN_UID`, claims `{"admin": true}` | ❌ **Deny** |

### Playground nimani tekshira olmaydi

Playground faqat **bitta hujjat** amallarini (`get`) simulyatsiya qiladi,
**`list`** (query) ni emas. Ya'ni "foydalanuvchi butun kolleksiyani so'rasa
rad etiladimi" degan savolni u yerda sinab bo'lmaydi.

Buni jonli tekshirish:

1. Oddiy foydalanuvchi bilan saytga kiring, `/dashboard` ni oching →
   faqat o'z buyurtmalari ko'rinishi kerak.
2. Brauzer konsolida (DevTools) quyidagini ishlating — **rad etilishi kerak**:
   ```js
   // filtrsiz so'rov: yangi qoidalar buni to'sadi
   const { getFirestore, collection, getDocs } = await import('firebase/firestore')
   await getDocs(collection(getFirestore(), 'orders'))
   // kutilgan: FirebaseError: Missing or insufficient permissions.
   ```

---

## Bilib qo'yish kerak bo'lgan oqibatlar

1. **Mehmon buyurtmalari (`userId: null`) endi foydalanuvchi panelida
   ko'rinmaydi.** Bu kutilgan holat: ular hech bir hisobga biriktirilmagan,
   shuning uchun "kimning buyurtmasi" degan savolga javob yo'q. Ular
   admin panelida va Telegram'da o'z joyida turadi.

2. **Avval email bo'yicha topilgan buyurtmalar ham ko'rinmay qoladi.**
   Eski kod `userId === uid || userEmail === email` deb filtrlardi. Yangi
   so'rov faqat `userId` bo'yicha ishlaydi (qoidalar ham shunga tayanadi —
   email bo'yicha ruxsat berish uni yana ochib yuborardi).
   Agar bazada `userId: null`, lekin `userEmail` to'ldirilgan eski
   buyurtmalar bo'lsa, ularni egasiga qaytarish uchun bir martalik
   migratsiya kerak bo'ladi (Admin SDK bilan `userEmail` → `uid` moslab
   `userId` ni to'ldirish). Hozircha bu qilinmadi — buyurtmalarga
   tegilmadi.

3. **Admin claim o'rnatilmasa `/admin` ochilmaydi.** Shuning uchun
   2-qadam 3-qadamdan **oldin** turadi.

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
sindirmaydi: `Checkout.tsx` `userId` ga `user?.uid || null` yozadi, ya'ni
uchala shartdan biri doim bajariladi.

Shunga qaramay bu qator **kiritilmadi** — u to'g'ridan-to'g'ri buyurtma
berish oqimiga tegadi, shuning uchun avval Rules Playground'da quyidagilarni
sinab ko'ring, keyin deploy qiling:

| Stsenariy | Sozlama | Kutilgan |
|---|---|---|
| Mehmon buyurtma beradi | `create`, Authenticated **OFF**, `userId: null` | ✅ Allow |
| Kirgan foydalanuvchi o'z nomidan | `create`, uid `USER_A_UID`, `userId: "USER_A_UID"` | ✅ Allow |
| Kirgan foydalanuvchi nomsiz | `create`, uid `USER_A_UID`, `userId: null` | ✅ Allow |
| Kirgan foydalanuvchi **boshqa** nomdan | `create`, uid `USER_A_UID`, `userId: "USER_B_UID"` | ❌ Deny |
