import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { markMessageRead } from '../../firebase/messages'
import { ContactMessagePayload, Message, MessageKind } from '../../types'

interface MessagesTabProps {
  messages: Message[]
}

const isContact = (m: Message): m is Message & { payload: ContactMessagePayload } => m.kind === 'contact'

export const MessagesTab = ({ messages }: MessagesTabProps) => {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<MessageKind | 'all'>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const filtered = filter === 'all' ? messages : messages.filter(m => m.kind === filter)

  const toggleRead = async (msg: Message) => {
    setUpdatingId(msg.id)
    try {
      await markMessageRead(msg.id, !msg.read)
    } catch (e) {
      console.error('[Admin] Xabar holatini yangilab bo\'lmadi:', e)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-xl font-bold text-[#274C5B] dark:text-white">{t('admin.messages.title')} ({messages.length})</h2>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as MessageKind | 'all')}
          className="inpHover h-10 text-sm pr-8"
        >
          <option value="all">{t('admin.allStatuses')} ({messages.length})</option>
          <option value="contact">{t('admin.messages.kindContact')} ({messages.filter(m => m.kind === 'contact').length})</option>
          <option value="newsletter">{t('admin.messages.kindNewsletter')} ({messages.filter(m => m.kind === 'newsletter').length})</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-16 text-center shadow-sm">
          <i className="fas fa-inbox text-4xl text-gray-200 mb-4 block"></i>
          <p className="text-gray-400">{t('admin.messages.noMessages')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(msg => (
            <div key={msg.id} className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                    msg.kind === 'contact' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                  }`}>
                    <i className={`fas ${msg.kind === 'contact' ? 'fa-envelope' : 'fa-bullhorn'}`}></i>
                  </span>
                  <div>
                    <p className="font-bold text-sm text-[#274C5B] dark:text-white">
                      {msg.kind === 'contact' ? t('admin.messages.kindContact') : t('admin.messages.kindNewsletter')}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString('ru-RU')}</p>
                  </div>
                </div>
                {!msg.read && (
                  <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-semibold">
                    {t('admin.messages.unread')}
                  </span>
                )}
              </div>

              {isContact(msg) ? (
                <div className="text-sm text-[#274C5B] dark:text-gray-200 space-y-1">
                  <p><span className="font-semibold">{t('contact.form.fullName')}:</span> {msg.payload.fullName}</p>
                  <p>
                    <span className="font-semibold">{t('contact.form.email')}:</span>{' '}
                    <a href={`mailto:${msg.payload.email}`} className="text-[#274C5B] dark:text-[#7EB693] hover:underline">
                      {msg.payload.email}
                    </a>
                  </p>
                  {msg.payload.company && <p><span className="font-semibold">{t('contact.form.company')}:</span> {msg.payload.company}</p>}
                  {msg.payload.subject && <p><span className="font-semibold">{t('contact.form.subject')}:</span> {msg.payload.subject}</p>}
                  <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-300">{msg.payload.message}</p>
                </div>
              ) : (
                <p className="text-sm text-[#274C5B] dark:text-gray-200">
                  <a href={`mailto:${msg.payload.email}`} className="hover:underline">{msg.payload.email}</a>
                </p>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => toggleRead(msg)}
                  disabled={updatingId === msg.id}
                  className="min-w-[44px] min-h-[44px] px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-semibold text-[#274C5B] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <i className={`fas ${updatingId === msg.id ? 'fa-spinner fa-spin' : msg.read ? 'fa-envelope' : 'fa-envelope-open'}`}></i>
                  {msg.read ? t('admin.messages.markUnread') : t('admin.messages.markRead')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
