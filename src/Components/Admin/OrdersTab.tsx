import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { sendTelegram } from '../../utils/telegram'
import { updateOrderInFirestore } from '../../firebase/firestore'
import { getStatusStyle } from '../Checkout'
import { Order, OrderStatus } from '../../types'

interface OrdersTabProps {
  orders: Order[]
}

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending',    label: '🕐 Kutilmoqda' },
  { value: 'confirmed',  label: '✅ Tasdiqlandi' },
  { value: 'processing', label: '⚙️ Tayyorlanmoqda' },
  { value: 'shipped',    label: '🚚 Yuborildi' },
  { value: 'delivered',  label: '📦 Yetkazildi' },
  { value: 'cancelled',  label: '❌ Bekor qilindi' },
]

export const OrdersTab = ({ orders }: OrdersTabProps) => {
  const { t } = useTranslation()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [replyNote, setReplyNote] = useState('')
  const [replyStatus, setReplyStatus] = useState<OrderStatus>('confirmed')
  const [sendingReply, setSendingReply] = useState(false)
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'all'>('all')

  const filteredOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter)

  const handleSendReply = async (order: Order) => {
    if (!replyNote.trim()) return
    setSendingReply(true)
    await updateOrderInFirestore(order.id, replyStatus, replyNote)

    const st = ORDER_STATUS_OPTIONS.find(s => s.value === replyStatus)
    const text = [
      `↩️ <b>BUYURTMA #${order.id} YANGILANISHI</b>`,
      '',
      `${st?.label || replyStatus}`,
      `📝 Admin xabari: ${replyNote}`,
      '',
      `👤 Mijoz: ${order.customerName}`,
      order.customerTelegram ? `💬 Telegram: ${order.customerTelegram}` : '',
    ].filter(Boolean).join('\n')

    await sendTelegram(text, 'order')
    setSendingReply(false)
    setReplyNote('')
    setSelectedOrder(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-xl font-bold text-[#274C5B] dark:text-white">{t('admin.orders')} ({orders.length})</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={orderFilter}
            onChange={e => setOrderFilter(e.target.value as OrderStatus | 'all')}
            className="inpHover h-10 text-sm pr-8"
          >
            <option value="all">Barchasi ({orders.length})</option>
            {ORDER_STATUS_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>
                {s.label} ({orders.filter(o => o.status === s.value).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-16 text-center shadow-sm">
          <i className="fas fa-shopping-bag text-4xl text-gray-200 mb-4 block"></i>
          <p className="text-gray-400">{t('admin.noOrders')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredOrders.map(order => {
            const st = getStatusStyle(order.status)
            return (
              <div key={order.id} className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="flex items-center gap-4 p-5 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-[#274C5B] dark:text-white">{order.id}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${st.color}`}>{st.label}</span>
                      {order.status === 'pending' && (
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-semibold">🔴 Yangi</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                      <span>{order.customerName}</span>
                      <span>•</span>
                      <a href={`tel:${order.customerPhone}`} className="text-[#274C5B] dark:text-[#7EB693] hover:underline font-semibold">
                        <i className="fas fa-phone text-xs mr-1"></i>{order.customerPhone}
                      </a>
                      {order.customerTelegram && (
                        <>
                          <span>•</span>
                          <a href={`https://t.me/${order.customerTelegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                            className="text-[#2AABEE] hover:underline font-semibold">
                            <i className="fab fa-telegram text-xs mr-1"></i>{order.customerTelegram}
                          </a>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('ru-RU')}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-xl text-[#7EB693]">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{order.items.length} mahsulot</p>
                  </div>
                </div>

                {/* Items preview */}
                <div className="px-5 py-3 flex items-center gap-3 overflow-x-auto">
                  {order.items.map(item => (
                    <div key={item.productId} className="flex-shrink-0 flex items-center gap-2 bg-[#F9F8F8] dark:bg-gray-800 rounded-xl px-3 py-2">
                      <img
                        src={item.productImg}
                        alt=""
                        className="w-8 h-8 object-contain"
                        width={32}
                        height={32}
                        decoding="async"
                        loading="lazy"
                      />
                      <div>
                        <p className="text-xs font-semibold text-[#274C5B] dark:text-white whitespace-nowrap">{item.productName}</p>
                        <p className="text-xs text-gray-400">x{item.quantity} — ${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Address */}
                <div className="px-5 pb-3">
                  <p className="text-sm text-gray-500"><i className="fas fa-map-marker-alt mr-1 text-[#7EB693]"></i>{order.customerAddress}</p>
                </div>

                {/* Admin Note */}
                {order.adminNote && (
                  <div className="mx-5 mb-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1"><i className="fas fa-comment-alt mr-1"></i>Admin xabari:</p>
                    <p className="text-sm text-blue-600 dark:text-blue-300">{order.adminNote}</p>
                  </div>
                )}

                {/* Reply Form */}
                {selectedOrder?.id === order.id ? (
                  <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-sm text-[#274C5B] dark:text-white">Xabar yuborish</h4>
                      {order.customerTelegram && (
                        <a
                          href={`https://t.me/${order.customerTelegram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-[#2AABEE] text-white px-3 py-1.5 rounded-lg font-semibold text-xs hover:opacity-90"
                        >
                          <i className="fab fa-telegram"></i> {order.customerTelegram}
                        </a>
                      )}
                    </div>
                    <select
                      value={replyStatus}
                      onChange={e => setReplyStatus(e.target.value as OrderStatus)}
                      className="inpHover h-10 text-sm w-full mb-3"
                    >
                      {ORDER_STATUS_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <textarea
                      rows={3}
                      value={replyNote}
                      onChange={e => setReplyNote(e.target.value)}
                      className="inpHover w-full mb-3"
                      placeholder="Mijozga xabar yozing..."
                    />
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleSendReply(order)}
                        disabled={sendingReply || !replyNote.trim()}
                        className="flex items-center gap-2 bg-[#274C5B] text-white px-4 py-2 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50"
                      >
                        {sendingReply ? <><i className="fas fa-spinner fa-spin"></i> Yuborilmoqda...</> : <><i className="fab fa-telegram"></i> Saqlash + Telegram</>}
                      </button>
                      <button onClick={() => setSelectedOrder(null)}
                        className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Bekor
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-5 pb-4 flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setSelectedOrder(order)
                        setReplyNote(order.adminNote || '')
                        setReplyStatus(order.status)
                      }}
                      className="flex items-center gap-2 bg-[#274C5B] text-white px-4 py-2 rounded-xl font-semibold text-sm hover:opacity-90"
                    >
                      <i className="fas fa-reply"></i> Javob berish
                    </button>
                    {order.customerTelegram && (
                      <a
                        href={`https://t.me/${order.customerTelegram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-[#2AABEE] text-white px-4 py-2 rounded-xl font-semibold text-sm hover:opacity-90"
                      >
                        <i className="fab fa-telegram"></i> Telegramda yozing
                      </a>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
