"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Download, CheckCircle2, XCircle, Clock, AlertTriangle, Filter } from 'lucide-react'
import { fetchAPI } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'

type AttendanceRecord = { id: number; student: number; student_name: string; section: number; section_name: string; date: string; status: string; marked_by: number; remarks: string }

const STATUS_OPTIONS = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']
const STATUS_ICONS: Record<string, any> = {
  PRESENT: { icon: CheckCircle2, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
  ABSENT: { icon: XCircle, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
  LATE: { icon: Clock, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
  EXCUSED: { icon: AlertTriangle, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
}

export default function AttendancePage() {
  const { addToast } = useToast()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [sectionFilter, setSectionFilter] = useState('ALL')
  const [markingMode, setMarkingMode] = useState(false)
  const [markingData, setMarkingData] = useState<{ student: number; student_name: string; status: string }[]>([])

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [attData, enrData] = await Promise.all([
        fetchAPI('academics/attendance/'),
        fetchAPI('academics/enrollments/'),
      ])
      setRecords(attData.results || attData || [])
      setEnrollments(enrData.results || enrData || [])
    } catch (err) {
      addToast('error', 'Connection Failed', 'Could not load attendance data.')
    } finally {
      setLoading(false)
    }
  }

  const sections = Array.from(new Set(enrollments.map(e => e.section_name))).filter(Boolean)

  const filteredRecords = records.filter(r => {
    const dateMatch = r.date === selectedDate
    const sectionMatch = sectionFilter === 'ALL' || r.section_name === sectionFilter
    return dateMatch && sectionMatch
  })

  const startMarking = () => {
    const studentsForSection = enrollments.filter(e =>
      sectionFilter === 'ALL' || e.section_name === sectionFilter
    )
    setMarkingData(studentsForSection.map(e => ({
      student: e.student,
      student_name: e.student_name,
      status: 'PRESENT',
    })))
    setMarkingMode(true)
  }

  const updateMarkStatus = (index: number, status: string) => {
    setMarkingData(prev => prev.map((m, i) => i === index ? { ...m, status } : m))
  }

  const submitAttendance = async () => {
    setIsSubmitting(true)
    try {
      const payload = markingData.map(m => ({
        student: m.student,
        student_name: m.student_name,
        section: enrollments.find(e => e.student === m.student)?.section || 1,
        section_name: enrollments.find(e => e.student === m.student)?.section_name || sectionFilter,
        date: selectedDate,
        status: m.status,
        marked_by: 1,
        remarks: '',
      }))
      await fetchAPI('academics/attendance/', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      const present = markingData.filter(m => m.status === 'PRESENT').length
      addToast('success', 'Attendance Submitted', `${present}/${markingData.length} students marked present for ${selectedDate}.`)
      setMarkingMode(false)
      loadData()
    } catch (err) {
      addToast('error', 'Submission Failed', 'Could not save attendance records.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ['Date', 'Student', 'Section', 'Status', 'Remarks']
    const dataToExport = sectionFilter === 'ALL' ? records : records.filter(r => r.section_name === sectionFilter)
    const rows = dataToExport.map(r => [r.date, r.student_name, r.section_name, r.status, r.remarks || ''])
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_${selectedDate}_${sectionFilter}.csv`
    a.click()
    URL.revokeObjectURL(url)
    addToast('success', 'Export Complete', `Attendance report downloaded as CSV.`)
  }

  const presentCount = filteredRecords.filter(r => r.status === 'PRESENT').length
  const absentCount = filteredRecords.filter(r => r.status === 'ABSENT').length
  const lateCount = filteredRecords.filter(r => r.status === 'LATE').length
  const rate = filteredRecords.length > 0 ? Math.round((presentCount / filteredRecords.length) * 100) : 0

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Attendance Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Record daily attendance and track student presence.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-5 py-3 rounded-xl font-semibold shadow-sm transition-all active:scale-95 hover:bg-slate-50">
            <Download className="w-5 h-5" /><span>Export Report</span>
          </button>
          {!markingMode && (
            <button onClick={startMarking} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95">
              <CheckCircle2 className="w-5 h-5" /><span>Mark Attendance</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-premium p-5">
          <p className="text-sm font-bold text-slate-500 uppercase mb-1">Present</p>
          <p className="text-3xl font-black text-green-600">{presentCount}</p>
        </div>
        <div className="card-premium p-5">
          <p className="text-sm font-bold text-slate-500 uppercase mb-1">Absent</p>
          <p className="text-3xl font-black text-red-600">{absentCount}</p>
        </div>
        <div className="card-premium p-5">
          <p className="text-sm font-bold text-slate-500 uppercase mb-1">Late</p>
          <p className="text-3xl font-black text-yellow-600">{lateCount}</p>
        </div>
        <div className="card-premium p-5">
          <p className="text-sm font-bold text-slate-500 uppercase mb-1">Attendance Rate</p>
          <p className="text-3xl font-black text-primary">{rate}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800 dark:text-slate-200 font-medium" />
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setSectionFilter('ALL')} className={cn("px-4 py-3 rounded-xl text-sm font-bold transition-all", sectionFilter === 'ALL' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50")}>
            All Classes
          </button>
          {sections.map(sec => (
            <button key={sec} onClick={() => setSectionFilter(sec)} className={cn("px-4 py-3 rounded-xl text-sm font-bold transition-all", sectionFilter === sec ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50")}>
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Marking Mode */}
      {markingMode ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-primary to-indigo-700 text-white flex justify-between items-center">
            <h3 className="font-bold">Marking Attendance for {selectedDate}</h3>
            <div className="flex gap-2">
              <button onClick={() => setMarkingMode(false)} className="px-4 py-2 rounded-xl text-sm font-bold bg-white/20 hover:bg-white/30 transition-colors">Cancel</button>
              <button onClick={submitAttendance} disabled={isSubmitting} className="px-4 py-2 rounded-xl text-sm font-bold bg-white text-primary hover:bg-blue-50 transition-colors flex items-center gap-2 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Save Records
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {markingData.map((m, idx) => (
              <div key={idx} className="px-6 py-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-pastel flex items-center justify-center text-xs font-bold text-primary">{m.student_name?.charAt(0)}</div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{m.student_name}</span>
                </div>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map(s => (
                    <button key={s} onClick={() => updateMarkStatus(idx, s)} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all", m.status === s ? (s === 'PRESENT' ? 'bg-green-500 text-white' : s === 'ABSENT' ? 'bg-red-500 text-white' : s === 'LATE' ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white') : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200')}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        /* Records Table */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Student</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Section</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center"><Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" /><p className="text-slate-500 mt-2">Loading records...</p></td></tr>
                ) : filteredRecords.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No attendance records for {selectedDate}.{sectionFilter !== 'ALL' && ` (${sectionFilter})`} Click "Mark Attendance" to start.</td></tr>
                ) : filteredRecords.map(r => {
                  const cfg = STATUS_ICONS[r.status] || STATUS_ICONS.ABSENT
                  const Icon = cfg.icon
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-pastel flex items-center justify-center text-xs font-bold text-primary">{r.student_name?.charAt(0)}</div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{r.student_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{r.section_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{r.date}</td>
                      <td className="px-6 py-4">
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit", cfg.color)}>
                          <Icon className="w-3 h-3" /> {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 italic">{r.remarks || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filteredRecords.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500">
              Showing {filteredRecords.length} records for {selectedDate}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
