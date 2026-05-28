import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { DataState, Product, BlogPost } from "./types"

import img1 from "./assets/shop/CalabreseBroccoli.png"
import img2 from "./assets/shop/FreshBananaFruites.png"
import img3 from "./assets/shop/WhiteNuts.png"
import img4 from "./assets/shop/VeganRedTomato.png"
import img5 from "./assets/shop/MungBean.png"
import img6 from "./assets/shop/BrownHazelnut.png"
import img7 from "./assets/shop/Eggs.png"
import img8 from "./assets/shop/ZelcoSujiElaichiRusk.png"
import img9 from "./assets/shop/Cucumber.png"
import img10 from "./assets/shop/WhiteHazelnut.png"
import img11 from "./assets/shop/FreshCorn.png"
import img12 from "./assets/shop/OrganicAlmonds.png"
import img13 from "./assets/shop/Cauliflower.png"
import img14 from "./assets/shop/Cucumber.webp"
import img15 from "./assets/shop/Onion.png"
import img16 from "./assets/shop/Cabbace.png"
import img17 from "./assets/about/Food1.png"
import img18 from "./assets/about/Undefined.png"
import img19 from "./assets/about/Pomegranate.png"
import img20 from "./assets/about/Potato.png"
import team1 from "./assets/Team/team1.png"
import team2 from "./assets/Team/team2.png"
import team3 from "./assets/Team/team3.png"
import team4 from "./assets/Team/team4.png"
import team5 from "./assets/Team/team5.png"
import team6 from "./assets/Team/team6.png"
import portfoilo1 from "./assets/portfoilo/portfoilo1.png"
import portfoilo2 from "./assets/portfoilo/portfoilo2.png"
import portfoilo3 from "./assets/portfoilo/portfoilo3.png"
import portfoilo4 from "./assets/portfoilo/portfoilo4.png"
import portfoilo5 from "./assets/portfoilo/portfoilo5.png"
import portfoilo6 from "./assets/portfoilo/portfoilo6.png"
import blog1 from "./assets/blog/blog1.png"
import blog2 from "./assets/blog/blog2.png"
import blog3 from "./assets/blog/blog3.png"
import blog4 from "./assets/blog/blog4.png"
import blog5 from "./assets/blog/blog5.png"
import blog6 from "./assets/blog/blog6.png"

const loadProducts = (): Product[] => {
  try {
    const saved = localStorage.getItem('organick_products')
    if (saved) return JSON.parse(saved)
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

const defaultProducts: Product[] = [
  { id: 1, category: "Vegetable", img: img1, name: "Calabrese Broccoli", oldPrice: 20, price: 13, rating: 5, description: "Fresh organic calabrese broccoli, rich in vitamins and minerals. Perfect for healthy meals." },
  { id: 2, category: "Fresh", img: img2, name: "Fresh Banana Fruites", oldPrice: 20, price: 14, rating: 5, description: "Naturally ripened organic bananas, sweet and nutritious." },
  { id: 3, category: "Millets", img: img3, name: "White Nuts", oldPrice: 20, price: 15, rating: 5, description: "Premium quality white nuts, packed with healthy fats and proteins." },
  { id: 4, category: "Vegetable", img: img4, name: "Vegan Red Tomato", oldPrice: 20, price: 17, rating: 5, description: "Fresh organic red tomatoes, perfect for salads and cooking." },
  { id: 5, category: "Health", img: img5, name: "Mung Bean", oldPrice: 20, price: 11, rating: 5, description: "Organic mung beans, high in protein and fiber for a healthy diet." },
  { id: 6, category: "Nuts", img: img6, name: "Brown Hazelnut", oldPrice: 20, price: 12, rating: 5, description: "Premium organic brown hazelnuts, rich in vitamin E and healthy fats." },
  { id: 7, category: "Fresh", img: img7, name: "Eggs", oldPrice: 20, price: 17, rating: 5, description: "Farm-fresh organic eggs from free-range chickens." },
  { id: 8, category: "Fresh", img: img8, name: "Zelco Suji Elaichi Rusk", oldPrice: 20, price: 15, rating: 5, description: "Delicious organic rusk with cardamom flavor." },
  { id: 9, category: "Health", img: img9, name: "Cucumber", oldPrice: 20, price: 11, rating: 5, description: "Fresh organic cucumbers, hydrating and full of nutrients." },
  { id: 10, category: "Nuts", img: img10, name: "White Hazelnut", oldPrice: 20, price: 12, rating: 5, description: "Creamy white hazelnuts, perfect for snacking and baking." },
  { id: 11, category: "Fresh", img: img11, name: "Fresh Corn", oldPrice: 20, price: 17, rating: 5, description: "Sweet organic corn, harvested at peak freshness." },
  { id: 12, category: "Fresh", img: img12, name: "Organic Almonds", oldPrice: 20, price: 15, rating: 5, description: "Raw organic almonds, a powerhouse of nutrition." },
  { id: 13, category: "Vegetable", img: img13, name: "Cauliflower", oldPrice: 20, price: 11, rating: 5, description: "Fresh organic cauliflower, versatile and nutritious." },
  { id: 14, category: "Vegetable", img: img14, name: "Cucumber", oldPrice: 20, price: 12, rating: 5, description: "Crisp organic cucumbers, freshly harvested." },
  { id: 15, category: "Vegetable", img: img15, name: "Onion", oldPrice: 20, price: 17, rating: 5, description: "Organic onions, a kitchen staple full of antioxidants." },
  { id: 16, category: "Vegetable", img: img16, name: "Cabbage", oldPrice: 20, price: 17, rating: 5, description: "Fresh organic cabbage, packed with vitamins C and K." },
  { id: 17, category: "Spicy", img: img17, name: "Spicy Food Mix", oldPrice: 20, price: 15, rating: 5, description: "Organic spicy food mix for bold flavors." },
  { id: 18, category: "Nuts & Seeds", img: img18, name: "Mixed Seeds", oldPrice: 20, price: 15, rating: 5, description: "Organic mixed seeds blend, perfect for salads and smoothies." },
  { id: 19, category: "Fruits", img: img19, name: "Pomegranate", oldPrice: 20, price: 15, rating: 5, description: "Juicy organic pomegranates, rich in antioxidants." },
  { id: 20, category: "Vegetable", img: img20, name: "Potato", oldPrice: 20, price: 15, rating: 5, description: "Farm-fresh organic potatoes, versatile and filling." },
]

const defaultBlogs: BlogPost[] = [
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
    addProduct(state, action: PayloadAction<Product>) {
      state.products.push(action.payload)
      localStorage.setItem('organick_products', JSON.stringify(state.products))
    },
    updateProduct(state, action: PayloadAction<Product>) {
      const idx = state.products.findIndex(p => p.id === action.payload.id)
      if (idx !== -1) {
        state.products[idx] = action.payload
        localStorage.setItem('organick_products', JSON.stringify(state.products))
      }
    },
    deleteProduct(state, action: PayloadAction<number>) {
      state.products = state.products.filter(p => p.id !== action.payload)
      localStorage.setItem('organick_products', JSON.stringify(state.products))
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
        localStorage.setItem('organick_products', JSON.stringify(state.products))
      }
    },
    addBlog(state, action: PayloadAction<BlogPost>) {
      state.blogs.push(action.payload)
      localStorage.setItem('organick_blogs', JSON.stringify(state.blogs))
    },
    updateBlog(state, action: PayloadAction<BlogPost>) {
      const idx = state.blogs.findIndex(b => b.id === action.payload.id)
      if (idx !== -1) {
        state.blogs[idx] = action.payload
        localStorage.setItem('organick_blogs', JSON.stringify(state.blogs))
      }
    },
    deleteBlog(state, action: PayloadAction<number>) {
      state.blogs = state.blogs.filter(b => b.id !== action.payload)
      localStorage.setItem('organick_blogs', JSON.stringify(state.blogs))
    },
  },
})

export const {
  setShopSingle,
  addProduct,
  updateProduct,
  deleteProduct,
  updateProductRating,
  addBlog,
  updateBlog,
  deleteBlog,
} = Data.actions
