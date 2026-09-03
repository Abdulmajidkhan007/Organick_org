import { useEffect, useRef } from 'react'

/**
 * Sahifa yuqorisidagi o'qish progressi chizig'i.
 *
 * Ilgari `motion/react` ning `useScroll` + `motion.div` bilan yozilgan edi.
 * Bu yagona komponent uchun butun `motion` paketi (~468 KB raw) HAR bir
 * sahifa bundle'iga tortilardi. Endi bir xil natija sof DOM bilan:
 * passiv scroll listener + `requestAnimationFrame` throttle + CSS
 * `transform: scaleX()` (kompozitor ipida ishlaydi, layout qayta
 * hisoblanmaydi). Qo'shimcha bog'liqlik: 0 KB.
 */
export const ScrollIndicator = () => {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0

    const paint = () => {
      frame = 0
      const bar = barRef.current
      if (!bar) return
      const doc = document.documentElement
      // Aylantiriladigan masofa 0 bo'lsa (sahifa ekrandan kalta) — 0 ga bo'lish yo'q.
      const scrollable = doc.scrollHeight - doc.clientHeight
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0
      bar.style.transform = `scaleX(${progress})`
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(paint)
    }

    paint()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 100,
        backgroundColor: '#7EB693',
        transform: 'scaleX(0)',
        transformOrigin: '0 50%',
        willChange: 'transform',
        pointerEvents: 'none',
      }}
    />
  )
}
