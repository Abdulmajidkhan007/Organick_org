import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { addBlog, updateBlog, deleteBlog } from '../../Data'
import { BlogPost } from '../../types'

const emptyBlog: Omit<BlogPost, 'id'> = {
  date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
  img: '',
  user: 'By Admin',
  title: '',
  description: '',
  content: '',
}

interface BlogsTabProps {
  showBlogForm: boolean
  setShowBlogForm: (v: boolean) => void
}

export const BlogsTab = ({ showBlogForm, setShowBlogForm }: BlogsTabProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const blogs = useAppSelector(s => s.data.blogs)

  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null)
  const [newBlog, setNewBlog] = useState<Omit<BlogPost, 'id'>>(emptyBlog)
  const [deleteBlogConfirm, setDeleteBlogConfirm] = useState<number | null>(null)

  const handleSaveBlog = () => {
    if (!newBlog.title) return
    if (editingBlog) {
      dispatch(updateBlog({ ...newBlog, id: editingBlog.id }))
    } else {
      const maxId = blogs.reduce((max, b) => Math.max(max, b.id), 0)
      dispatch(addBlog({ ...newBlog, id: maxId + 1 }))
    }
    setShowBlogForm(false)
    setEditingBlog(null)
    setNewBlog(emptyBlog)
  }

  const handleEditBlog = (b: BlogPost) => {
    setEditingBlog(b)
    setNewBlog({ ...b })
    setShowBlogForm(true)
  }

  const handleDeleteBlog = (id: number) => {
    dispatch(deleteBlog(id))
    setDeleteBlogConfirm(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#274C5B] dark:text-white">{t('admin.blogs')} ({blogs.length})</h2>
        <button
          onClick={() => { setShowBlogForm(!showBlogForm); setEditingBlog(null); setNewBlog(emptyBlog) }}
          className="flex items-center gap-2 bg-[#7EB693] text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 text-sm"
        >
          <i className={`fas fa-${showBlogForm ? 'times' : 'plus'}`}></i>
          {showBlogForm ? t('admin.cancel') : t('admin.addBlog')}
        </button>
      </div>

      {showBlogForm && (
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm mb-6 fade-in">
          <h3 className="font-bold text-[#274C5B] dark:text-white mb-4">
            {editingBlog ? t('admin.editBlog') : t('admin.addBlog')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.blogTitle')}</label>
              <input type="text" value={newBlog.title}
                onChange={e => setNewBlog(b => ({ ...b, title: e.target.value }))}
                className="w-full inpHover h-10" placeholder="Blog title..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.blogAuthor')}</label>
              <input type="text" value={newBlog.user}
                onChange={e => setNewBlog(b => ({ ...b, user: e.target.value }))}
                className="w-full inpHover h-10" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.blogDate')}</label>
              <input type="text" value={newBlog.date}
                onChange={e => setNewBlog(b => ({ ...b, date: e.target.value }))}
                className="w-full inpHover h-10" placeholder="25 Nov" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.blogImage')}</label>
              <input type="text" value={newBlog.img}
                onChange={e => setNewBlog(b => ({ ...b, img: e.target.value }))}
                className="w-full inpHover h-10" placeholder="https://example.com/image.jpg" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('admin.blogContent')}</label>
              <textarea
                value={newBlog.content || ''}
                onChange={e => setNewBlog(b => ({ ...b, description: e.target.value.slice(0, 100), content: e.target.value }))}
                className="w-full inpHover" rows={5} placeholder="Write your blog post content here..." />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSaveBlog}
              className="bg-[#7EB693] text-white px-6 py-2 rounded-xl font-semibold hover:opacity-90">{t('admin.save')}</button>
            <button onClick={() => { setShowBlogForm(false); setEditingBlog(null) }}
              className="border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-xl font-semibold text-gray-600 dark:text-gray-300">{t('admin.cancel')}</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {blogs.map(b => (
          <div key={b.id} className="bg-white dark:bg-[#1e293b] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {b.img && <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${b.img})` }} />}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-[#7EB693]/10 text-[#7EB693] px-2 py-1 rounded-lg">{b.date}</span>
                <span className="text-xs text-gray-400">{b.user}</span>
              </div>
              <h4 className="font-bold text-[#274C5B] dark:text-white text-sm mb-3 line-clamp-2">{b.title}</h4>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEditBlog(b)}
                  className="flex-1 text-center text-sm text-blue-500 hover:text-blue-700 border border-blue-200 dark:border-blue-800 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <i className="fas fa-edit mr-1"></i>{t('admin.edit')}
                </button>
                {deleteBlogConfirm === b.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDeleteBlog(b.id)} className="text-white bg-red-500 text-xs px-2 py-1 rounded-lg">{t('admin.yes')}</button>
                    <button onClick={() => setDeleteBlogConfirm(null)} className="text-gray-500 border text-xs px-2 py-1 rounded-lg">{t('admin.no')}</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteBlogConfirm(b.id)}
                    className="text-red-400 hover:text-red-600 border border-red-200 dark:border-red-800 py-1 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm">
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
