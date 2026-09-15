import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { DataState, Product, BlogPost } from "./types"

// Jamoa va portfolio rasmlari katalogga KIRMAYDI (ular Firestore'ga
// yozilmaydi, faqat kod ichida) — shuning uchun ular avvalgidek Vite
// importi bilan, hash va uzoq kesh bilan qoladi.
import team1 from "./assets/Team/team1.webp"
import team2 from "./assets/Team/team2.webp"
import team3 from "./assets/Team/team3.webp"
import team4 from "./assets/Team/team4.webp"
import team5 from "./assets/Team/team5.webp"
import team6 from "./assets/Team/team6.webp"
import portfoilo1 from "./assets/portfoilo/portfoilo1.webp"
import portfoilo2 from "./assets/portfoilo/portfoilo2.webp"
import portfoilo3 from "./assets/portfoilo/portfoilo3.webp"
import portfoilo4 from "./assets/portfoilo/portfoilo4.webp"
import portfoilo5 from "./assets/portfoilo/portfoilo5.webp"
import portfoilo6 from "./assets/portfoilo/portfoilo6.webp"

// SEED RASMLAR — `public/` dan, BARQAROR yo'l bilan.
//
// Ilgari bu yerda `import img1 from "./assets/shop/..."` turardi. Vite
// bunday importni build paytida HASH'li URL'ga aylantiradi
// (`/assets/CalabreseBroccoli-Ab12Cd34.webp`) va hash HAR BUILD'DA
// o'zgaradi. Endi katalog Firestore'da yashaydi, ya'ni rasm yo'li
// ma'lumot bazasiga YOZILADI — hash'li URL yozilsa keyingi deploy'da
// u 404 bo'lardi (buyurtma rasmlari bilan aynan shu xato bo'lgan).
//
// Shuning uchun fayllar `public/shop/` va `public/blog/` ga ko'chirildi:
// ular `dist/` ga o'zgarishsiz nomi bilan nusxalanadi, URL abadiy bir xil.
// Kesh sarlavhasi `firebase.json` da (`max-age=604800`, `immutable` EMAS —
// hash yo'q, ya'ni fayl o'zgarishi mumkin).
const img1  = "/shop/CalabreseBroccoli.webp"
const img2  = "/shop/FreshBananaFruites.webp"
const img3  = "/shop/WhiteNuts.webp"
const img4  = "/shop/VeganRedTomato.webp"
const img5  = "/shop/MungBean.webp"
const img6  = "/shop/BrownHazelnut.webp"
const img7  = "/shop/Eggs.webp"
const img8  = "/shop/ZelcoSujiElaichiRusk.webp"
const img9  = "/shop/Cucumber.webp"
const img10 = "/shop/WhiteHazelnut.webp"
const img11 = "/shop/FreshCorn.webp"
const img12 = "/shop/OrganicAlmonds.webp"
const img13 = "/shop/Cauliflower.webp"
const img14 = "/shop/Cucumber.webp"
const img15 = "/shop/Onion.webp"
const img16 = "/shop/Cabbace.webp"
const img17 = "/shop/Food1.webp"
const img18 = "/shop/Undefined.webp"
const img19 = "/shop/Pomegranate.webp"
const img20 = "/shop/Potato.webp"
const blog1 = "/blog/blog1.webp"
const blog2 = "/blog/blog2.webp"
const blog3 = "/blog/blog3.webp"
const blog4 = "/blog/blog4.webp"
const blog5 = "/blog/blog5.webp"
const blog6 = "/blog/blog6.webp"


// KATALOG QAYERDAN KELADI (12-sessiyadan beri):
//
//   1. Boshlang'ich holat — SINXRON: localStorage KESHI, u bo'lmasa kod
//      ichidagi seed. Sahifa DARHOL chiziladi, tarmoq kutilmaydi.
//   2. Keyin `App.tsx` bir marta Firestore'ni REST orqali o'qiydi
//      (`src/firebase/catalogRest.ts`) va natijani `setProducts`/
//      `setBlogs` bilan yozadi — HAQIQAT MANBAI shu.
//   3. REST yiqilsa (tarmoq yo'q, qoida rad etdi, loyiha ID xato) hech
//      narsa almashtirilmaydi: ekranda kesh, u ham bo'lmasa seed qoladi.
//      Sayt hech qachon bo'sh katalog ko'rsatmaydi.
//
// `organick_products` / `organick_blogs` kalitlari nomi O'ZGARMADI
// (CLAUDE.md — kalit nomini almashtirish mijoz savatini/adminning
// mahsulotlarini yo'qotadi), LEKIN ma'nosi o'zgardi: endi ular haqiqat
// manbai emas, shunchaki KESH.
const loadProducts = (): Product[] => {
  try {
    const saved = localStorage.getItem('organick_products')
    if (saved) {
      const products = JSON.parse(saved) as Product[]
      return products.map(p => ({ ...p, stock: p.stock ?? 50 }))
    }
  } catch { /* empty */ }
  return defaultProducts
}

const loadBlogs = (): BlogPost[] => {
  try {
    const saved = localStorage.getItem('organick_blogs')
    if (saved) return JSON.parse(saved)
  } catch { /* empty */ }
  return defaultBlogs
}

// localStorage to'lib ketgan (QuotaExceeded) yoki o'chirilgan brauzerda
// yozish xato tashlaydi — kesh yozilmagani ilovani yiqitmasligi kerak.
const cache = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { /* kesh ixtiyoriy */ }
}

export const defaultProducts: Product[] = [
  { id: 1, category: "Vegetable", img: img1, imgWidth: 209, imgHeight: 231, name: "Calabrese Broccoli", oldPrice: 20, price: 13, rating: 5, stock: 50, description: "Fresh organic calabrese broccoli, rich in vitamins and minerals. Perfect for healthy meals." },
  { id: 2, category: "Fresh", img: img2, imgWidth: 244, imgHeight: 359, name: "Fresh Banana Fruites", oldPrice: 20, price: 14, rating: 5, stock: 45, description: "Naturally ripened organic bananas, sweet and nutritious." },
  { id: 3, category: "Millets", img: img3, imgWidth: 407, imgHeight: 406, name: "White Nuts", oldPrice: 20, price: 15, rating: 5, stock: 60, description: "Premium quality white nuts, packed with healthy fats and proteins." },
  { id: 4, category: "Vegetable", img: img4, imgWidth: 439, imgHeight: 293, name: "Vegan Red Tomato", oldPrice: 20, price: 17, rating: 5, stock: 40, description: "Fresh organic red tomatoes, perfect for salads and cooking." },
  { id: 5, category: "Health", img: img5, imgWidth: 384, imgHeight: 384, name: "Mung Bean", oldPrice: 20, price: 11, rating: 5, stock: 80, description: "Organic mung beans, high in protein and fiber for a healthy diet." },
  { id: 6, category: "Nuts", img: img6, imgWidth: 595, imgHeight: 436, name: "Brown Hazelnut", oldPrice: 20, price: 12, rating: 5, stock: 55, description: "Premium organic brown hazelnuts, rich in vitamin E and healthy fats." },
  { id: 7, category: "Fresh", img: img7, imgWidth: 332, imgHeight: 283, name: "Eggs", oldPrice: 20, price: 17, rating: 5, stock: 30, description: "Farm-fresh organic eggs from free-range chickens." },
  { id: 8, category: "Fresh", img: img8, imgWidth: 382, imgHeight: 378, name: "Zelco Suji Elaichi Rusk", oldPrice: 20, price: 15, rating: 5, stock: 70, description: "Delicious organic rusk with cardamom flavor." },
  { id: 9, category: "Health", img: img9, imgWidth: 446, imgHeight: 285, name: "Cucumber", oldPrice: 20, price: 11, rating: 5, stock: 90, description: "Fresh organic cucumbers, hydrating and full of nutrients." },
  { id: 10, category: "Nuts", img: img10, imgWidth: 383, imgHeight: 383, name: "White Hazelnut", oldPrice: 20, price: 12, rating: 5, stock: 65, description: "Creamy white hazelnuts, perfect for snacking and baking." },
  { id: 11, category: "Fresh", img: img11, imgWidth: 281, imgHeight: 494, name: "Fresh Corn", oldPrice: 20, price: 17, rating: 5, stock: 35, description: "Sweet organic corn, harvested at peak freshness." },
  { id: 12, category: "Fresh", img: img12, imgWidth: 252, imgHeight: 420, name: "Organic Almonds", oldPrice: 20, price: 15, rating: 5, stock: 75, description: "Raw organic almonds, a powerhouse of nutrition." },
  { id: 13, category: "Vegetable", img: img13, imgWidth: 732, imgHeight: 542, name: "Cauliflower", oldPrice: 20, price: 11, rating: 5, stock: 42, description: "Fresh organic cauliflower, versatile and nutritious." },
  { id: 14, category: "Vegetable", img: img14, imgWidth: 446, imgHeight: 285, name: "Cucumber", oldPrice: 20, price: 12, rating: 5, stock: 88, description: "Crisp organic cucumbers, freshly harvested." },
  { id: 15, category: "Vegetable", img: img15, imgWidth: 397, imgHeight: 324, name: "Onion", oldPrice: 20, price: 17, rating: 5, stock: 100, description: "Organic onions, a kitchen staple full of antioxidants." },
  { id: 16, category: "Vegetable", img: img16, imgWidth: 273, imgHeight: 394, name: "Cabbage", oldPrice: 20, price: 17, rating: 5, stock: 38, description: "Fresh organic cabbage, packed with vitamins C and K." },
  { id: 17, category: "Spicy", img: img17, imgWidth: 335, imgHeight: 314, name: "Spicy Food Mix", oldPrice: 20, price: 15, rating: 5, stock: 25, description: "Organic spicy food mix for bold flavors." },
  { id: 18, category: "Nuts & Seeds", img: img18, imgWidth: 335, imgHeight: 314, name: "Mixed Seeds", oldPrice: 20, price: 15, rating: 5, stock: 60, description: "Organic mixed seeds blend, perfect for salads and smoothies." },
  { id: 19, category: "Fruits", img: img19, imgWidth: 314, imgHeight: 314, name: "Pomegranate", oldPrice: 20, price: 15, rating: 5, stock: 20, description: "Juicy organic pomegranates, rich in antioxidants." },
  { id: 20, category: "Vegetable", img: img20, imgWidth: 243, imgHeight: 314, name: "Potato", oldPrice: 20, price: 15, rating: 5, stock: 110, description: "Farm-fresh organic potatoes, versatile and filling." },
]

export const defaultBlogs: BlogPost[] = [
  { id: 1, date: "25 Nov", img: blog1, user: "By Rachi Card", title: "The Benefits of Vitamin D & How to Get It", description: "Simply dummy text of the printing and typesetting industry. Lorem Ipsum" },
  { id: 2, date: "25 Nov", img: blog2, user: "By Rachi Card", title: "Our Favorite Summertime Tomato", description: "Simply dummy text of the printing and typesetting industry. Lorem Ipsum" },
  { id: 3, date: "25 Nov", img: blog3, user: "By Rachi Card", title: "Benefits of Vitamin C & How to Get It", description: "Simply dummy text of the printing and typesetting industry. Lorem Ipsum" },
  { id: 4, date: "25 Nov", img: blog4, user: "By Rachi Card", title: "Research More Organic Foods", description: "Simply dummy text of the printing and typesetting industry. Lorem Ipsum" },
  { id: 5, date: "25 Nov", img: blog5, user: "By Rachi Card", title: "Everyday Fresh Fruits", description: "Simply dummy text of the printing and typesetting industry. Lorem Ipsum" },
  { id: 6, date: "25 Nov", img: blog6, user: "By Rachi Card", title: "Don't Use Plastic Products! It Kills Nature", description: "Simply dummy text of the printing and typesetting industry. Lorem Ipsum" },
]

const initialState: DataState = {
  products: loadProducts(),
  teams: [
    { team: team1, name: "Giovani Bacardo", job: "Farmer", isInstagram: false, isFacebook: true, isTwitter: true },
    { team: team2, name: "Marianne Loreno", job: "Designer", isInstagram: true, isFacebook: true, isTwitter: true },
    { team: team3, name: "Riga Pelore", job: "Farmer", isInstagram: true, isFacebook: true, isTwitter: true },
    { team: team4, name: "Keira Knightley", job: "Farmer", isInstagram: false, isFacebook: true, isTwitter: true },
    { team: team5, name: "Scott Lawrence", job: "Designer", isInstagram: true, isFacebook: true, isTwitter: true },
    { team: team6, name: "Karen Allen", job: "Farmer", isInstagram: true, isFacebook: true, isTwitter: true },
  ],
  portfoilos: [
    { id: 1, img: portfoilo1, name: "Green & Tasty Lemon", job: "Fruits" },
    { id: 2, img: portfoilo2, name: "Organic Carrot", job: "Farmer" },
    { id: 3, img: portfoilo3, name: "Organic Betel Leaf", job: "Leaf" },
    { id: 4, img: portfoilo4, name: "Natural Tomato", job: "Fruits" },
    { id: 5, img: portfoilo5, name: "Black Raspberry", job: "Farmer" },
    { id: 6, img: portfoilo6, name: "Honey Orange", job: "Farmer" },
  ],
  blogs: loadBlogs(),
  shopSingle: null,
}

export const Data = createSlice({
  name: "Organick",
  initialState,
  reducers: {
    setShopSingle(state, action: PayloadAction<Product | null>) {
      state.shopSingle = action.payload
    },
    /**
     * Firestore'dan (REST) kelgan katalogni o'rnatadi va keshga yozadi.
     * Faqat `App.tsx` chaqiradi. Bo'sh ro'yxat BU YERGA KELMAYDI —
     * `catalogRest.ts` bo'sh kolleksiyani `null` qilib qaytaradi.
     */
    setProducts(state, action: PayloadAction<Product[]>) {
      state.products = action.payload
      cache('organick_products', state.products)
    },
    setBlogs(state, action: PayloadAction<BlogPost[]>) {
      state.blogs = action.payload
      cache('organick_blogs', state.blogs)
    },
    addProduct(state, action: PayloadAction<Product>) {
      state.products.push(action.payload)
      cache('organick_products', state.products)
    },
    updateProduct(state, action: PayloadAction<Product>) {
      const idx = state.products.findIndex(p => p.id === action.payload.id)
      if (idx !== -1) {
        state.products[idx] = action.payload
        cache('organick_products', state.products)
      }
    },
    deleteProduct(state, action: PayloadAction<number>) {
      state.products = state.products.filter(p => p.id !== action.payload)
      cache('organick_products', state.products)
    },
    updateProductRating(state, action: PayloadAction<{ productId: number; rating: number; userId: string }>) {
      const product = state.products.find(p => p.id === action.payload.productId)
      if (product) {
        if (!product.userRatings) product.userRatings = []
        const existing = product.userRatings.find(r => r.userId === action.payload.userId)
        if (existing) {
          existing.rating = action.payload.rating
          existing.date = new Date().toISOString()
        } else {
          product.userRatings.push({
            userId: action.payload.userId,
            rating: action.payload.rating,
            date: new Date().toISOString(),
          })
        }
        const total = product.userRatings.reduce((sum, r) => sum + r.rating, 0)
        product.rating = Math.round(total / product.userRatings.length)
        cache('organick_products', state.products)
      }
    },
    addBlog(state, action: PayloadAction<BlogPost>) {
      state.blogs.push(action.payload)
      cache('organick_blogs', state.blogs)
    },
    updateBlog(state, action: PayloadAction<BlogPost>) {
      const idx = state.blogs.findIndex(b => b.id === action.payload.id)
      if (idx !== -1) {
        state.blogs[idx] = action.payload
        cache('organick_blogs', state.blogs)
      }
    },
    deleteBlog(state, action: PayloadAction<number>) {
      state.blogs = state.blogs.filter(b => b.id !== action.payload)
      cache('organick_blogs', state.blogs)
    },
    decreaseStock(state, action: PayloadAction<{ productId: number; quantity: number }>) {
      const product = state.products.find(p => p.id === action.payload.productId)
      if (product) {
        product.stock = Math.max(0, (product.stock ?? 50) - action.payload.quantity)
        cache('organick_products', state.products)
      }
    },
  },
})

export const {
  setShopSingle,
  setProducts,
  setBlogs,
  addProduct,
  updateProduct,
  deleteProduct,
  updateProductRating,
  addBlog,
  updateBlog,
  deleteBlog,
  decreaseStock,
} = Data.actions
