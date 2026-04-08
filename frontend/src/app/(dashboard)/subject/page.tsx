"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookMarked, Plus, X, Loader2, Edit, Trash2, Search } from 'lucide-react'
import { fetchAPI } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'

const CATEGORIES = ['CORE', 'SCIENCES', 'HUMANITIES', 'ELECTIVE']
const CAT_COLORS: Record<string, string> = {
  CORE: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30',
  SCIENCES: 'bg-green-50 text-green-700 dark:bg-green-900/30',
  HUMANITIES: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30',
  ELECTIVE: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30',
}

export default function SubjectPage() {
  const { addToast } = useToast()
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<any>(null)
  const [deletingSubject, setDeletingSubject] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', category: 'CORE', description: '' })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetchAPI('academics/subjects/')
      setSubjects(res.results || res || [])
    } catch { addToast('error', 'Error', 'Could not load subjects.') }
    finally { setLoading(false) }
  }

  const openAddModal = () => { setEditingSubject(null); setForm({ name: '', code: '', category: 'CORE', description: '' }); setIsModalOpen(true) }
  const openEditModal = (s: any) => { setEditingSubject(s); setForm({ name: s.name, code: s.code, category: s.category, description: s.description || '' }); setIsModalOpen(true) }
  const openDeleteModal = (s: any) => { setDeletingSubject(s); setIsDeleteModalOpen(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.code) { addToast('warning', 'Validation', 'Name and code are required.'); return }
    setIsSubmitting(true)
    try {
      if (editingSubject) {
        await fetchAPI(`academics/subjects/${editingSubject.id}`, { method: 'PUT', body: JSON.stringify(form) })
        addToast('success', 'Updated', `"${form.name}" has been updated.`)
      } else {
        await fetchAPI('academics/subjects/', { method: 'POST', body: JSON.stringify(form) })
        addToast('success', 'Created', `"${form.name}" has been added to the curriculum.`)
      }
      setIsModalOpen(false); loadData()
    } catch { addToast('error', 'Failed', 'Could not save subject.') }
    finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!deletingSubject) return
    setIsSubmitting(true)
    try {
      await fetchAPI(`academics/subjects/${deletingSubject.id}`, { method: 'DELETE' })
      addToast('success', 'Deleted', `"${deletingSubject.name}" removed from curriculum.`)
      setIsDeleteModalOpen(false); setDeletingSubject(null); loadData()
    } catch { addToast('error', 'Failed', 'Could not delete subject.') }
    finally { setIsSubmitting(false) }
  }

  const filtered = subjects.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Subjects & Curriculum</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Define academic subjects, codes, and categories.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 w-fit">
          <Plus className="w-5 h-5" /><span>Add Subject</span>
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CATEGORIES.map(cat => (
          <div key={cat} className="card-premium p-5">
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">{cat}</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{subjects.filter(s => s.category === cat).length}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input type="text" placeholder="Search by name, code, or category..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800 dark:text-slate-200" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">No subjects found.</div>
        ) : filtered.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="card-premium p-5 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-pastel flex items-center justify-center"><BookMarked className="w-5 h-5 text-primary" /></div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">{s.name}</h3>
                  <span className="text-xs font-mono text-slate-500">{s.code}</span>
                </div>
              </div>
              <span className={cn("px-2 py-1 rounded-full text-[10px] font-black uppercase", CAT_COLORS[s.category] || 'bg-slate-100')}>{s.category}</span>
            </div>
            <p className="text-sm text-slate-500 line-clamp-2 mb-4">{s.description || 'No description provided.'}</p>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEditModal(s)} className="p-2 hover:bg-orange-50 text-orange-600 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
              <button onClick={() => openDeleteModal(s)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
              <div className="px-6 py-5 border-b bg-gradient-to-r from-primary to-indigo-700 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subject Name <span className="text-red-500">*</span></label>
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Mathematics" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Code <span className="text-red-500">*</span></label>
                    <input required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 uppercase" placeholder="MATH" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" placeholder="Brief description of the subject..." />
                </div>
                <div className="pt-5 border-t flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookMarked className="w-4 h-4" />} {editingSubject ? 'Update' : 'Add Subject'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && deletingSubject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6 text-center">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-500" /></div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Delete Subject?</h3>
              <p className="text-sm text-slate-500 mb-6">Are you sure you want to remove "{deletingSubject.name}" from the curriculum?</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button onClick={handleDelete} disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center gap-2 transition-all">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
