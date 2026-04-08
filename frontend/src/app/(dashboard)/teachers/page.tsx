"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserSquare2, Search, Plus, Filter, Mail, Phone, Loader2,
  MoreVertical, Eye, Edit, X, Trash2
} from 'lucide-react'
import { fetchAPI } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'

export default function TeachersPage() {
  const { addToast } = useToast()
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone_number: '', username: '', password: '' })

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAPI('users/')
        const all = data.results || data || []
        setTeachers(all.filter((u: any) => u.role === 'TEACHER'))
      } catch { addToast('error', 'Connection Failed', 'Could not load staff directory.') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.first_name || !form.last_name || !form.email) {
      addToast('warning', 'Validation', 'Please fill in all required fields.')
      return
    }
    setIsSubmitting(true)
    try {
      const newTeacher = {
        id: Date.now(),
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone_number: form.phone_number,
        role: 'TEACHER'
      }
      await fetchAPI('users/', { method: 'POST', body: JSON.stringify({ ...form, role: 'TEACHER' }) })
      setTeachers(prev => [...prev, newTeacher])
      addToast('success', 'Teacher Added', `${form.first_name} ${form.last_name} has been registered as teaching staff.`)
      setIsAddModalOpen(false)
      setForm({ first_name: '', last_name: '', email: '', phone_number: '', username: '', password: '' })
    } catch { addToast('error', 'Failed', 'Could not add the teacher.') }
    finally { setIsSubmitting(false) }
  }

  const filtered = teachers.filter(t =>
    `${t.first_name} ${t.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Teachers Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage all teaching staff profiles.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 w-fit">
          <Plus className="w-5 h-5" /><span>Add Teacher</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6 flex justify-between items-start">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Teachers</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : filtered.length}</h3>
          </div>
          <div className="p-3 bg-purple-pastel rounded-xl text-primary"><UserSquare2 className="w-6 h-6" /></div>
        </motion.div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input type="text" placeholder="Search by name or email..." className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800 dark:text-slate-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-semibold">
          <Filter className="w-5 h-5" /><span>Filter</span>
        </button>
      </div>

      {loading ? (
        <div className="card-premium py-24 text-center"><Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" /><p className="text-slate-500 font-bold">Loading staff directory...</p></div>
      ) : filtered.length === 0 ? (
        <div className="card-premium py-24 text-center text-slate-500"><UserSquare2 className="w-10 h-10 mx-auto mb-4 opacity-50" /><p className="font-bold">No teachers found.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }} className="card-premium p-6 group hover:border-primary/30 transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md">{t.first_name?.charAt(0)}{t.last_name?.charAt(0)}</div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{t.first_name} {t.last_name}</h3>
                    <span className="text-xs font-bold text-primary bg-purple-pastel px-2 py-0.5 rounded-full uppercase">Teacher</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><Mail className="w-4 h-4 text-slate-400" /><span className="truncate">{t.email}</span></div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><Phone className="w-4 h-4 text-slate-400" /><span>{t.phone_number || 'Not set'}</span></div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => addToast('info', 'Profile', `Viewing ${t.first_name}'s full profile.`)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-purple-pastel text-primary font-bold text-xs rounded-lg hover:bg-primary hover:text-white transition-all"><Eye className="w-3.5 h-3.5" /> View</button>
                <button onClick={() => addToast('info', 'Edit', `Editing ${t.first_name}'s record.`)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-lg hover:bg-secondary hover:text-white transition-all"><Edit className="w-3.5 h-3.5" /> Edit</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ADD TEACHER MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
              <div className="px-6 py-5 border-b bg-gradient-to-r from-primary to-indigo-700 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">Register New Teacher</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">First Name *</label>
                    <input required value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Peter" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Last Name *</label>
                    <input required value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Okello" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="teacher@school.ac.ug" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone</label>
                    <input value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="+256770000000" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Username *</label>
                    <input required value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="t_peter.okello" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Temporary Password *</label>
                  <input required type="password" minLength={8} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Min 8 characters" />
                </div>
                <div className="pt-5 border-t flex justify-end gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Register Teacher
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
