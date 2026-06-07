import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
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

export const subscribeAllOrders = (callback: (orders: Order[]) => void) => {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snapshot => {
    callback(snapshot.docs.map(d => d.data() as Order))
  })
}

export const subscribeUserOrders = (
  userId: string,
  email: string,
  callback: (orders: Order[]) => void,
) => {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snapshot => {
    const orders = snapshot.docs
      .map(d => d.data() as Order)
      .filter(o => o.userId === userId || o.userEmail === email)
    callback(orders)
  })
}
