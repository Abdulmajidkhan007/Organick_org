import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { compressImage, CompressImageError } from '../../utils/compressImage'
import { uploadCatalogImage } from '../../firebase/storage'

interface ImageUploadFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  kind: 'product' | 'blog'
}

type UploadState = { kind: 'idle' } | { kind: 'uploading' } | { kind: 'error'; message: string }

/**
 * Mahsulot/blog rasm maydoni: URL matn input QOLADI (qo'lda yozish ham
 * ishlayveradi) + "Rasm yuklash" tugmasi. Tanlangan fayl brauzerda
 * siqiladi (`compressImage`), Storage'ga yuklanadi
 * (`uploadCatalogImage`), qaytgan URL to'g'ridan-to'g'ri matn maydoniga
 * yoziladi. ProductsTab va BlogsTab bir xil oqimni ishlatadi, shuning
 * uchun bu yerda umumlashtirilgan.
 *
 * Xato JIM YUTILMAYDI — qizil matn bilan sabab ko'rsatiladi.
 * `CompressImageError` KOD bilan keladi (util komponent emas, u
 * tarjima qila olmaydi), shuning uchun kodni shu yerda `t()` ga
 * moslashtiramiz.
 */
export const ImageUploadField = ({ label, value, onChange, kind }: ImageUploadFieldProps) => {
  const { t } = useTranslation()
  const [state, setState] = useState<UploadState>({ kind: 'idle' })
  const inputRef = useRef<HTMLInputElement>(null)

  const messageFor = (e: unknown): string => {
    if (e instanceof CompressImageError) {
      if (e.code === 'too-large') return t('admin.uploadTooLarge')
      if (e.code === 'unsupported') return t('admin.uploadUnsupported')
      return t('admin.uploadUnreadable')
    }
    return t('admin.uploadFailed')
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setState({ kind: 'uploading' })
    try {
      const blob = await compressImage(file)
      const url = await uploadCatalogImage(blob, kind)
      onChange(url)
      setState({ kind: 'idle' })
    } catch (e) {
      console.error('[Admin] rasmni yuklab bo\'lmadi:', e)
      setState({ kind: 'error', message: messageFor(e) })
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const uploading = state.kind === 'uploading'

  return (
    <div className="sm:col-span-2">
      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{label}</label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input type="text" value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full inpHover h-10" placeholder="https://example.com/image.jpg" />
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          disabled={uploading}
          onChange={e => handleFile(e.target.files?.[0])} />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="flex items-center justify-center gap-2 min-w-[44px] min-h-[44px] px-4 bg-[#274C5B] text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-60 shrink-0">
          <i className={`fas ${uploading ? 'fa-spinner fa-spin' : 'fa-upload'}`}></i>
          {uploading ? t('admin.uploading') : t('admin.uploadImage')}
        </button>
      </div>
      {state.kind === 'error' && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          <i className="fas fa-triangle-exclamation mr-2"></i>{state.message}
        </p>
      )}
      {value && (
        <img src={value} alt={label}
          className="mt-2 w-20 h-20 object-contain rounded-lg bg-gray-50 border border-gray-200 dark:border-gray-700" />
      )}
    </div>
  )
}
