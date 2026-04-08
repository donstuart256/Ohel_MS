"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Filter, CalendarDays, Tag, X, Loader2, Send } from 'lucide-react'
import { fetchAPI } from '@/lib/api'
import { useToast } from '@/components/ui/ToastProvider'

export default function NoticeBoardPage() {
  const { addToast } = useToast()
  const [notices, setNotices] = useState<any[]>([])
  const [activeNotice, setActiveNotice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFullView, setIsFullView] = useState(false)
  const [tagFilter, setTagFilter] = useState('ALL')
  const [form, setForm] = useState({ title: '', author: '', content: '', tags: '' })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetchAPI('communications/notices/')
      const data = res.results || res || []
      setNotices(data)
      if (data.length > 0 && !activeNotice) setActiveNotice(data[0])
    } catch {
      addToast('error', 'Connection Failed', 'Could not load notices.')
    } finally {
      setLoading(false)
    }
  }

  const allTags = Array.from(new Set(notices.flatMap(n => n.tags || []))).filter(Boolean)

  const filteredNotices = notices.filter(n => {
    const matchesSearch = n.title?.toLowerCase().includes(search.toLowerCase()) || n.author?.toLowerCase().includes(search.toLowerCase())
    const matchesTag = tagFilter === 'ALL' || (n.tags || []).includes(tagFilter)
    return matchesSearch && matchesTag
  })

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.content) {
      addToast('warning', 'Validation', 'Title and content are required.')
      return
    }
    setIsSubmitting(true)
    try {
      const newNotice = await fetchAPI('communications/notices/', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          author: form.author || 'System Administrator',
          content: form.content,
          tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()) : ['General'],
        })
      })
      addToast('success', 'Notice Published', `"${form.title}" has been posted to the notice board.`)
      setIsCreateModalOpen(false)
      setForm({ title: '', author: '', content: '', tags: '' })
      loadData()
    } catch {
      addToast('error', 'Failed', 'Could not create notice.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold text-slate-800 dark:text-white">Notice Board</motion.h1>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 text-sm">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by Title or Author" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-full focus:outline-none focus:border-primary/50 text-sm w-64 transition-all text-slate-800 dark:text-slate-200" />
          </div>
          <div className="relative group">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 hover:bg-yellow-100 transition-colors shadow-sm">
              <Filter className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 hidden group-hover:block z-10 min-w-[140px]">
              <button onClick={() => setTagFilter('ALL')} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${tagFilter === 'ALL' ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-600'}`}>All Tags</button>
              {allTags.map(tag => (
                <button key={tag} onClick={() => setTagFilter(tag)} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${tagFilter === tag ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-600'}`}>{tag}</button>
              ))}
            </div>
          </div>
          <button onClick={() => setIsCreateModalOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary-hover transition-colors shadow-sm shadow-primary/30">
            <Plus className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
        {/* Notice List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full lg:w-1/2 flex flex-col gap-4 overflow-y-auto invisible-scrollbar pr-2">
          {filteredNotices.length === 0 ? (
            <div className="card-premium p-12 text-center text-slate-400">
              <p className="font-bold">No notices match your search.</p>
            </div>
          ) : filteredNotices.map((notice) => (
            <div key={notice.id} onClick={() => { setActiveNotice(notice); setIsFullView(false) }} className={`card-premium rounded-[20px] p-5 cursor-pointer transition-all duration-300 ${activeNotice?.id === notice.id ? 'border-primary/50 shadow-md bg-blue-50/30 dark:bg-blue-900/10' : 'hover:border-slate-300 border-transparent bg-white dark:bg-slate-800'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <img src={notice.avatar} alt={notice.author} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700" />
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white leading-tight">{notice.title}</h3>
                    <p className="text-xs font-medium text-slate-500 line-clamp-1">By {notice.author}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-full whitespace-nowrap">
                  <CalendarDays className="w-3 h-3" /> {notice.date}
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{notice.preview}</p>
            </div>
          ))}
        </motion.div>

        {/* Notice Detail */}
        {activeNotice && (
          <motion.div key={activeNotice.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-1/2 card-premium rounded-[24px] bg-white dark:bg-slate-800 border-none shadow-sm flex flex-col overflow-hidden">
            <div className="h-64 w-full relative shrink-0">
              <img src={activeNotice.image} alt="Notice cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-2 mb-2">
                  {(activeNotice.tags || []).map((tag: string) => (
                    <span key={tag} className="px-2 py-1 rounded w-max text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20">{tag}</span>
                  ))}
                </div>
                <h2 className="text-3xl font-bold text-white shadow-sm leading-tight">{activeNotice.title}</h2>
              </div>
            </div>
            <div className="p-6 overflow-y-auto invisible-scrollbar flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <img src={activeNotice.avatar} alt="Author" className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Published by</p>
                    <p className="font-bold text-slate-800 dark:text-white">{activeNotice.author}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-medium">Date</p>
                  <p className="font-bold text-slate-800 dark:text-white">{activeNotice.date}</p>
                </div>
              </div>
              <div className={`prose prose-sm prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 flex-1 ${!isFullView ? 'line-clamp-6' : ''}`}>
                {(activeNotice.fullText || activeNotice.preview || '').split('\n\n').map((paragraph: string, i: number) => (
                  <p key={i} className="mb-4 leading-relaxed">{paragraph}</p>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-400" />
                  <div className="flex gap-2">
                    {(activeNotice.tags || []).map((tag: string, i: number) => (
                      <span key={tag} className={`px-3 py-1 rounded-full text-xs font-bold ${i === 0 ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : i === 1 ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30' : 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30'}`}>{tag}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => setIsFullView(!isFullView)} className="px-6 py-2 bg-primary text-white font-bold rounded-xl text-sm shadow-sm hover:bg-primary-hover transition-colors">
                  {isFullView ? 'Collapse' : 'Read Full Page'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ═══ CREATE NOTICE MODAL ═══ */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
              <div className="px-6 py-5 border-b bg-gradient-to-r from-primary to-indigo-700 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">Post New Notice</h2>
                <button onClick={() => setIsCreateModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateNotice} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Notice Title <span className="text-red-500">*</span></label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Term 2 Registration Opens" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Author</label>
                    <input value={form.author} onChange={e => setForm({...form, author: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Principal Okello" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tags (comma-separated)</label>
                    <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Academic, Important" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Notice Content <span className="text-red-500">*</span></label>
                  <textarea required rows={5} value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" placeholder="Write your notice content here..." />
                </div>
                <div className="pt-5 border-t flex justify-end gap-3">
                  <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Publish Notice
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
