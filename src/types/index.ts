export interface UserRating {
  userId: string
  rating: number
  date: string
}

export interface Product {
  id: number
  category: string
  img: string
  name: string
  oldPrice: number
  price: number
  rating: number
  userRatings?: UserRating[]
  description?: string
  stock?: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface TeamMember {
  team: string
  name: string
  job: string
  isInstagram: boolean
  isFacebook: boolean
  isTwitter: boolean
}

export interface PortfolioItem {
  id: number
  img: string
  name: string
  job: string
}

export interface BlogPost {
  id: number
  date: string
  img: string
  user: string
  title: string
  description: string
  content?: string
}

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  phoneNumber: string | null
  isAdmin?: boolean
}

export type Language = 'uz' | 'en' | 'ru'

export interface DataState {
  products: Product[]
  teams: TeamMember[]
  portfoilos: PortfolioItem[]
  blogs: BlogPost[]
  shopSingle: Product | null
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

export interface UIState {
  searchQuery: string
  darkMode: boolean
  language: Language
  isMobileMenuOpen: boolean
}

export interface RootState {
  data: DataState
  cart: CartState
  auth: AuthState
  ui: UIState
}
