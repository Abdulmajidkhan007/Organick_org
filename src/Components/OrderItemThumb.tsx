import { useState } from 'react'
import { useAppSelector } from '../hooks'
import { OrderItem } from '../types'

interface OrderItemThumbProps {
  item: OrderItem
  className: string
  width: number
  height: number
}

/**
 * Buyurtma qatoridagi mahsulot rasmi.
 *
 * `item.productImg` build paytidagi hash'li Vite URL edi (masalan
 * `/assets/CalabreseBroccoli-Ch-JHt5w.webp`) — keyingi build'da hash
 * o'zgaradi va eski buyurtmalarda saqlangan havola o'lik bo'lib qoladi.
 * Shuning uchun avval joriy Redux `data.products` dan `productId` bo'yicha
 * QAYTA qidiramiz (joriy build'ning haqiqiy URL'i), `productImg` faqat
 * mahsulot o'chirilgan/topilmagan holatlar uchun zaxira. Ikkalasi ham
 * ishlamasa (masalan zaxira havola ham o'lik chiqsa, `onError`) — ikonka.
 */
export const OrderItemThumb = ({ item, className, width, height }: OrderItemThumbProps) => {
  const product = useAppSelector(s => s.data.products.find(p => p.id === item.productId))
  const src = product?.img || item.productImg
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gray-100 dark:bg-gray-700 flex-shrink-0`}
        style={{ width, height }}
      >
        <i className="fas fa-box text-gray-400" style={{ fontSize: height * 0.45 }}></i>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={item.productName}
      className={className}
      width={width}
      height={height}
      decoding="async"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
