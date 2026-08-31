import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  FirestoreError,
} from 'firebase/firestore'
import { db } from './config'
import { Order, OrderStatus } from '../types'

export const addOrderToFirestore = (order: Order) =>
  setDoc(doc(db, 'orders', order.id), order)

export const updateOrderInFirestore = (orderId: string, status: OrderStatus, adminNote?: string) => {
  const updates: Partial<Order> = { status }
  if (adminNote !== undefined) updates.adminNote = adminNote
  return updateDoc(doc(db, 'orders', orderId), updates as Record<string, unknown>)
}

// Admin uchun: butun kolleksiya. Qoidalar buni faqat `admin: true` claim'i
// bo'lgan foydalanuvchiga ochadi.
export const subscribeAllOrders = (
  callback: (orders: Order[]) => void,
  onError?: (error: FirestoreError) => void,
) => {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    snapshot => callback(snapshot.docs.map(d => d.data() as Order)),
    error => {
      console.error('[Firestore] subscribeAllOrders:', error)
      onError?.(error)
    },
  )
}

// Foydalanuvchi uchun: serverdan FAQAT o'z buyurtmalari keladi.
// Filtr brauzerda emas, so'rovning o'zida — qoidalar ham aynan shu
// `where` shartiga tayanadi (firestore.rules -> orders/read).
//
// Talab qilinadigan composite index: orders (userId ASC, createdAt DESC).
// Eslatma: userId == null bo'lgan mehmon buyurtmalari bu yerga tushmaydi.
export const subscribeUserOrders = (
  userId: string,
  callback: (orders: Order[]) => void,
  onError?: (error: FirestoreError) => void,
) => {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(
    q,
    snapshot => callback(snapshot.docs.map(d => d.data() as Order)),
    error => {
      console.error('[Firestore] subscribeUserOrders:', error)
      onError?.(error)
    },
  )
}
