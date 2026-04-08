"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Presentation, Plus, X, Loader2, Edit, Trash2, Search, Users } from 'lucide-react'
import { fetchAPI } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'

const LEVELS = ['PRIMARY', 'SECONDARY', 'TERTIARY']
const LEVEL_COLORS: Record<string, string> = {
  PRIMARY: 'bg-green-50 text-green-700 dark:bg-green-900/30',
  SECONDARY: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30',
  TERTIARY: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30',
}

export default function ClassPage() {
  const { addToast } = useToast()
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<any>(null)
  const [deletingSection, setDeletingSection] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', level: 'PRIMARY', class_teacher: '', capacity: '40' })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetchAPI('academics/sections/')
      setSections(res.results || res || [])
    } catch { addToast('error', 'Error', 'Could not load class data.') }
    finally { setLoading(false) }
  }

  const openAddModal = () => { setEditingSection(null); setForm({ name: '', level: 'PRIMARY', class_teacher: '', capacity: '40' }); setIsModalOpen(true) }
  const openEditModal = (s: any) => { setEditingSection(s); setForm({ name: s.name, level: s.level, class_teacher: s.class_teacher || '', capacity: String(s.capacity || 40) }); setIsModalOpen(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) { addToast('warning', 'Validation', 'Class name is required.'); return }
    setIsSubmitting(true)
    try {
      if (editingSection) {
        await fetchAPI(`academics/sections/${editingSection.id}`, { method: 'PUT', body: JSON.stringify({ ...form, capacity: Number(form.capacity) }) })
        addToast('success', 'Updated', `"${form.name}" has been updated.`)
      } else {
        await fetchAPI('academics/sections/', { method: 'POST', body: JSON.stringify({ ...form, capacity: Number(form.capacity) }) })
        addToast('success', 'Created', `"${form.name}" has been added.`)
      }
      setIsModalOpen(false); loadData()
    } catch { addToast('error', 'Failed', 'Could not save class.') }
    finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!deletingSection) return
    setIsSubmitting(true)
    try {
      await fetchAPI(`academics/sections/${deletingSection.id}`, { method: 'DELETE' })
      addToast('success', 'Deleted', `"${deletingSection.name}" has been removed.`)
      setIsDeleteModalOpen(false); setDeletingSection(null); loadData()
    } catch { addToast('error', 'Failed', 'Could not delete class.') }
    finally { setIsSubmitting(false) }
  }

  const filtered = sections.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.class_teacher?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.level?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalCapacity = sections.reduce((a, s) => a + (s.capacity || 0), 0)
  const totalEnrolled = sections.reduce((a, s) => a + (s.enrolled || 0), 0)

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Class Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Organize class groups, sections, and assign class teachers.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 w-fit">
          <Plus className="w-5 h-5" /><span>Add Class</span>
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-premium p-5"><p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Classes</p><p className="text-2xl font-black text-slate-800 dark:text-white">{sections.length}</p></div>
        <div className="card-premium p-5"><p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Capacity</p><p className="text-2xl font-black text-blue-600">{totalCapacity}</p></div>
        <div className="card-premium p-5"><p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Enrolled</p><p className="text-2xl font-black text-green-600">{totalEnrolled}</p></div>
        <div className="card-premium p-5"><p className="text-xs font-bold text-slate-500 uppercase mb-1">Utilization</p><p className="text-2xl font-black text-primary">{totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0}%</p></div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input type="text" placeholder="Search by class name, teacher, or level..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800 dark:text-slate-200" />
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Class Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Level</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Class Teacher</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Capacity</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Enrolled</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center"><Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" /><p className="text-slate-500 mt-2">Loading classes...</p></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No classes found.</td></tr>
              ) : filtered.map(section => {
                const utilization = section.capacity > 0 ? Math.round((section.enrolled / section.capacity) * 100) : 0
                return (
                  <tr key={section.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-pastel flex items-center justify-center"><Presentation className="w-5 h-5 text-primary" /></div>
                        <span className="font-bold text-slate-800 dark:text-white">{section.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase", LEVEL_COLORS[section.level] || 'bg-slate-100')}>{section.level}</span></td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{section.class_teacher || '—'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{section.capacity}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800 dark:text-white">{section.enrolled}</span>
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full max-w-[80px]">
                          <div className={cn("h-full rounded-full transition-all", utilization > 90 ? 'bg-red-500' : utilization > 70 ? 'bg-yellow-500' : 'bg-green-500')} style={{ width: `${Math.min(utilization, 100)}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{utilization}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(section)} className="p-2 hover:bg-orange-50 text-orange-600 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => { setDeletingSection(section); setIsDeleteModalOpen(true) }} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
              <div className="px-6 py-5 border-b bg-gradient-to-r from-primary to-indigo-700 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">{editingSection ? 'Edit Class' : 'Add New Class'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Class Name <span className="text-red-500">*</span></label>
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. S.1 East" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Level</label>
                    <select value={form.level} onChange={e => setForm({...form, level: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Class Teacher</label>
                    <input value={form.class_teacher} onChange={e => setForm({...form, class_teacher: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Mr. Okello Peter" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Capacity</label>
                    <input type="number" min="1" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="40" />
                  </div>
                </div>
                <div className="pt-5 border-t flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Presentation className="w-4 h-4" />} {editingSection ? 'Update' : 'Add Class'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && deletingSection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6 text-center">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-500" /></div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Delete Class?</h3>
              <p className="text-sm text-slate-500 mb-6">Remove "{deletingSection.name}" ({deletingSection.enrolled} students enrolled)?</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button onClick={handleDelete} disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center gap-2">
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
