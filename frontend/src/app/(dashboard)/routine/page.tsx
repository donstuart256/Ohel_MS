"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays, Filter, Plus, Clock, Loader2, Users, BookOpen, X, Trash2
} from 'lucide-react'
import { fetchAPI } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI']
const TIME_SLOTS = ['08:00', '08:45', '09:30', '10:30', '11:15', '14:00', '14:45']

const SUBJECTS = [
  { id: 1, name: 'Mathematics' }, { id: 2, name: 'English' }, { id: 3, name: 'Science' },
  { id: 4, name: 'Social Studies' }, { id: 5, name: 'Physics' }, { id: 6, name: 'Chemistry' },
  { id: 7, name: 'Biology' }, { id: 8, name: 'Geography' }, { id: 9, name: 'History' },
  { id: 10, name: 'CRE' }, { id: 11, name: 'Art' }, { id: 12, name: 'Music' },
]

const TEACHERS = [
  { id: 1, name: 'Mr. Okello Peter' }, { id: 2, name: 'Ms. Nakamya Grace' },
  { id: 3, name: 'Mr. Mugisha James' }, { id: 4, name: 'Ms. Atwine Mercy' },
  { id: 5, name: 'Mr. Nuwagaba David' }, { id: 6, name: 'Ms. Namugga Faith' },
  { id: 7, name: 'Mr. Kabuye Joseph' }, { id: 8, name: 'Ms. Namutebi Hope' },
  { id: 9, name: 'Ms. Ssemwanga Sarah' }, { id: 10, name: 'Fr. Byaruhanga Moses' },
]

const END_TIMES: Record<string, string> = {
  '08:00': '08:40:00', '08:45': '09:25:00', '09:30': '10:10:00',
  '10:30': '11:10:00', '11:15': '11:55:00', '14:00': '14:40:00', '14:45': '15:25:00',
}

export default function RoutinePage() {
  const { addToast } = useToast()
  const [timetable, setTimetable] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedClass, setSelectedClass] = useState<string>('ALL')
  const [slotForm, setSlotForm] = useState({ day: 'MON', start_time: '08:00', subject_id: 1, teacher_id: 1 })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetchAPI('academics/timetable/')
      setTimetable(res.results || res || [])
    } catch {
      addToast('error', 'Connection Failed', 'Could not load timetable data.')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (t: string) => t ? t.substring(0, 5) : ''

  const activeClasses = Array.from(new Set(timetable.map(t => t.section_name || 'Class').filter(Boolean)))

  const openAddModal = (day?: string, time?: string) => {
    setSlotForm({
      day: day || 'MON',
      start_time: time || '08:00',
      subject_id: 1,
      teacher_id: 1,
    })
    setIsAddModalOpen(true)
  }

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const subject = SUBJECTS.find(s => s.id === slotForm.subject_id)
    const teacher = TEACHERS.find(t => t.id === slotForm.teacher_id)
    try {
      const res = await fetchAPI('academics/timetable/', {
        method: 'POST',
        body: JSON.stringify({
          section: 1,
          section_name: 'P.7 Blue',
          subject: slotForm.subject_id,
          subject_name: subject?.name || '',
          teacher: slotForm.teacher_id,
          teacher_name: teacher?.name || '',
          day: slotForm.day,
          start_time: `${slotForm.start_time}:00`,
          end_time: END_TIMES[slotForm.start_time] || '08:40:00',
        })
      })
      if (res.error) {
        addToast('error', 'Conflict Detected', res.error)
      } else {
        addToast('success', 'Slot Created', `${subject?.name} scheduled for ${slotForm.day} at ${slotForm.start_time}.`)
        setIsAddModalOpen(false)
        loadData()
      }
    } catch (err: any) {
      addToast('error', 'Failed', err.message || 'Could not create the timetable slot.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSlot = async (slot: any) => {
    try {
      await fetchAPI(`academics/timetable/${slot.id}`, { method: 'DELETE' })
      addToast('success', 'Slot Removed', `${slot.subject_name} on ${slot.day} has been removed.`)
      loadData()
    } catch {
      addToast('error', 'Delete Failed', 'Could not remove the timetable slot.')
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Class Routine Matrix</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage school schedules, class timetables, and teacher assignments.</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-3 rounded-xl font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">All Classes</option>
            {activeClasses.map(c => <option key={String(c)} value={String(c)}>{String(c)}</option>)}
          </select>
          <button onClick={() => openAddModal()} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 w-fit">
            <Plus className="w-5 h-5" /><span>Add Timetable Slot</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Scheduled Slots</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : timetable.length}
            </h3>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600"><CalendarDays className="w-6 h-6" /></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-premium p-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Subjects Taught</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : new Set(timetable.map(t => t.subject)).size}
            </h3>
          </div>
          <div className="p-3 bg-purple-pastel rounded-xl text-primary"><BookOpen className="w-6 h-6" /></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-premium p-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Classes with Schedules</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : activeClasses.length}
            </h3>
          </div>
          <div className="p-3 bg-green-pastel rounded-xl text-green-600"><Users className="w-6 h-6" /></div>
        </motion.div>
      </div>

      {loading ? (
        <div className="card-premium py-24 text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-bold">Synchronizing timetable matrix with master schedule...</p>
        </div>
      ) : activeClasses.length === 0 ? (
        <div className="card-premium py-24 text-center text-slate-500">
          <CalendarDays className="w-10 h-10 mx-auto mb-4 opacity-50" />
          <p className="font-bold">No timetable data found. Click &quot;Add Timetable Slot&quot; to start!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {(selectedClass === 'ALL' ? activeClasses : activeClasses.filter(c => String(c) === selectedClass)).map((activeClass, idx) => {
            const clsSlots = timetable.filter(t => t.section_name === activeClass || t.section === activeClass)
            return (
              <motion.div key={String(activeClass)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="card-premium overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" /> {typeof activeClass === 'string' ? activeClass : `Class ID: ${activeClass}`} Timetable
                  </h3>
                </div>
                <div className="overflow-x-auto p-6">
                  <table className="w-full text-left border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800">
                        <th className="p-4 w-32 font-bold text-slate-500 uppercase text-xs border-r border-slate-200 dark:border-slate-700">Time / Day</th>
                        {DAYS.map(d => (
                          <th key={d} className="p-4 font-black text-slate-800 dark:text-slate-200 text-center uppercase tracking-wider w-40">{d}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {TIME_SLOTS.map(tSlot => (
                        <tr key={tSlot} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-4 font-mono font-bold text-slate-500 border-r border-slate-200 dark:border-slate-700 text-sm whitespace-nowrap">
                            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {tSlot}</div>
                          </td>
                          {DAYS.map(day => {
                            const slot = clsSlots.find(s => s.day === day && formatTime(s.start_time) === tSlot)
                            if (slot) {
                              return (
                                <td key={`${day}-${tSlot}`} className="p-2 align-top h-24">
                                  <div className="w-full h-full bg-purple-pastel border border-purple-200 dark:border-primary/20 rounded-lg p-2.5 shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative">
                                    <div className="font-bold text-primary dark:text-purple-300 text-sm w-full truncate mb-1" title={slot.subject_name}>{slot.subject_name}</div>
                                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase truncate" title={slot.teacher_name}>{slot.teacher_name}</div>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDeleteSlot(slot) }}
                                      className="absolute top-1 right-1 p-1 rounded-md bg-red-100 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                                      title="Remove slot"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                              )
                            } else if (['10:30'].includes(tSlot)) {
                              return (
                                <td key={`${day}-${tSlot}`} className="p-2 align-middle text-center bg-slate-50 dark:bg-slate-900/50">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Break</span>
                                </td>
                              )
                            }
                            return (
                              <td key={`${day}-${tSlot}`} className="p-2 align-top h-24 group">
                                <div
                                  onClick={() => openAddModal(day, tSlot)}
                                  className="w-full h-full border border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-primary/5 hover:border-primary/30"
                                >
                                  <Plus className="w-4 h-4 text-slate-400" />
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ═══ ADD TIMETABLE SLOT MODAL ═══ */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
              <div className="px-6 py-5 border-b bg-gradient-to-r from-primary to-indigo-700 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">Add Timetable Slot</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateSlot} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Day *</label>
                    <select value={slotForm.day} onChange={e => setSlotForm({...slotForm, day: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Time Slot *</label>
                    <select value={slotForm.start_time} onChange={e => setSlotForm({...slotForm, start_time: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subject *</label>
                  <select value={slotForm.subject_id} onChange={e => setSlotForm({...slotForm, subject_id: Number(e.target.value)})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Teacher *</label>
                  <select value={slotForm.teacher_id} onChange={e => setSlotForm({...slotForm, teacher_id: Number(e.target.value)})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    {TEACHERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="pt-5 border-t flex justify-end gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Slot
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
