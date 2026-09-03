/**
 * `React.lazy` route chunk'i yuklanayotganda ko'rsatiladigan fallback.
 *
 * Uslub `index.html` dagi boot loader bilan bir xil (`src/style.css` ->
 * `.route-loader`), shuning uchun sahifa almashganda oq sakrash bo'lmaydi:
 * dark rejimda fon ham qorong'i qoladi.
 */
export const RouteLoader = () => (
  <div className="route-loader" role="status" aria-live="polite" aria-busy="true">
    <div className="route-loader-spinner" />
    <span className="sr-only">Yuklanmoqda…</span>
  </div>
)
