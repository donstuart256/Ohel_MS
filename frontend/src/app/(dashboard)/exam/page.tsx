"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Search, Filter, Plus, Loader2, TrendingUp, Award, BookOpen,
  X, Download, ClipboardList, Trophy
} from 'lucide-react'
import { fetchAPI } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'

export default function ExamPage() {
  const { addToast } = useToast()
  const [assessments, setAssessments] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false)
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [assessmentForm, setAssessmentForm] = useState({ title: '', type: 'QUIZ', subject_name: '', section_name: '', max_score: '30', date: '' })

  useEffect(() => {
    async function loadData() {
      try {
        const [assessRes, gradesRes] = await Promise.all([
          fetchAPI('academics/assessments/'),
          fetchAPI('academics/grades/')
        ])
        setAssessments(assessRes.results || assessRes || [])
        setGrades(gradesRes.results || gradesRes || [])
      } catch (err) {
        addToast('error', 'Connection Failed', 'Could not load exam data.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const typeColors: Record<string, string> = {
    QUIZ: 'bg-blue-100 text-blue-700',
    TEST: 'bg-purple-pastel text-primary',
    EXAM: 'bg-green-pastel text-green-700',
    ASSIGNMENT: 'bg-yellow-pastel text-yellow-700',
  }

  const topPerformers = [...grades]
    .sort((a, b) => Number(b.score) - Number(a.score))
    .slice(0, 5)

  const filteredAssessments = assessments.filter(a =>
    a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assessmentForm.title || !assessmentForm.date) {
      addToast('warning', 'Validation', 'Please fill in all required fields.')
      return
    }
    setIsSubmitting(true)
    try {
      const newAssessment = await fetchAPI('academics/assessments/', {
        method: 'POST',
        body: JSON.stringify({
          title: assessmentForm.title,
          type: assessmentForm.type,
          subject_name: assessmentForm.subject_name,
          section_name: assessmentForm.section_name,
          max_score: Number(assessmentForm.max_score),
          date: assessmentForm.date,
        })
      })
      setAssessments(prev => [newAssessment, ...prev])
      addToast('success', 'Assessment Created', `"${assessmentForm.title}" has been scheduled for ${assessmentForm.date}.`)
      setIsCreateModalOpen(false)
      setAssessmentForm({ title: '', type: 'QUIZ', subject_name: '', section_name: '', max_score: '30', date: '' })
    } catch (err) {
      addToast('error', 'Failed', 'Could not create the assessment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const [marksData, setMarksData] = useState<Record<number, string>>({})

  const markStudents = [
    { id: 10, name: 'Grace Nakamya' }, { id: 15, name: 'James Mugisha' },
    { id: 22, name: 'Mercy Atwine' }, { id: 8, name: 'Patrick Okello' },
    { id: 31, name: 'Faith Namugga' },
  ]

  const openMarksModal = (assessment: any) => {
    setSelectedAssessment(assessment)
    setMarksData({})
    setIsMarksModalOpen(true)
  }

  const handleSaveMarks = async () => {
    const entries = Object.entries(marksData).filter(([, v]) => v !== '' && Number(v) >= 0)
    if (entries.length === 0) {
      addToast('warning', 'No Marks', 'Please enter at least one mark.')
      return
    }
    setIsSubmitting(true)
    try {
      const payload = entries.map(([studentId, score]) => {
        const student = markStudents.find(s => s.id === Number(studentId))
        const pct = selectedAssessment.max_score > 0 ? ((Number(score) / selectedAssessment.max_score) * 100).toFixed(2) : score
        return {
          student: Number(studentId),
          student_name: student?.name || 'Unknown',
          assessment: selectedAssessment.id,
          assessment_title: selectedAssessment.title,
          score: pct,
        }
      })
      await fetchAPI('academics/grades/', { method: 'POST', body: JSON.stringify(payload) })
      // Reload grades
      const gradesRes = await fetchAPI('academics/grades/')
      setGrades(gradesRes.results || gradesRes || [])
      addToast('success', 'Marks Saved', `${entries.length} marks recorded for "${selectedAssessment.title}".`)
      setIsMarksModalOpen(false)
    } catch {
      addToast('error', 'Save Failed', 'Could not save the marks.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Exams & Assessment</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Create assessments, record marks, and track academic performance.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => {
            const headers = ['Rank','Student','Assessment','Score']
            const rows = [...grades].sort((a,b) => Number(b.score) - Number(a.score)).map((g, i) => [String(i+1), g.student_name, g.assessment_title, g.score])
            const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = `rankings_${new Date().toISOString().split('T')[0]}.csv`; a.click()
            URL.revokeObjectURL(url)
            addToast('success', 'Download Complete', 'Performance rankings exported as CSV.')
          }} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-5 py-3 rounded-xl font-semibold shadow-sm transition-all active:scale-95 hover:bg-slate-50">
            <Download className="w-5 h-5" /><span>Download Rankings</span>
          </button>
          <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 w-fit">
            <Plus className="w-5 h-5" /><span>New Assessment</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-5 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Total Assessments</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{loading ? '...' : assessments.length}</h3>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600"><FileText className="w-5 h-5" /></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-premium p-5 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Grades Recorded</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{loading ? '...' : grades.length}</h3>
          </div>
          <div className="p-3 bg-purple-pastel rounded-xl text-primary"><ClipboardList className="w-5 h-5" /></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-premium p-5 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Avg. Score</p>
            <h3 className="text-2xl font-black text-green-600 mt-1">
              {loading ? '...' : grades.length > 0 ? `${(grades.reduce((a, g) => a + Number(g.score), 0) / grades.length).toFixed(1)}%` : 'N/A'}
            </h3>
          </div>
          <div className="p-3 bg-green-pastel rounded-xl text-green-600"><TrendingUp className="w-5 h-5" /></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-premium p-5 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Top Scorer</p>
            <h3 className="text-lg font-black text-slate-800 dark:text-white mt-1 truncate">{loading ? '...' : topPerformers[0]?.student_name || 'N/A'}</h3>
          </div>
          <div className="p-3 bg-yellow-pastel rounded-xl text-yellow-600"><Trophy className="w-5 h-5" /></div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input type="text" placeholder="Search assessments..." className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800 dark:text-slate-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase">Assessment</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase">Type</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase">Class</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase">Max Score</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr><td colSpan={6} className="p-12 text-center"><Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" /></td></tr>
                  ) : filteredAssessments.length === 0 ? (
                    <tr><td colSpan={6} className="p-12 text-center text-slate-500">No assessments found.</td></tr>
                  ) : filteredAssessments.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-pastel flex items-center justify-center"><BookOpen className="w-4 h-4 text-primary" /></div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{a.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase", typeColors[a.type] || 'bg-slate-100 text-slate-600')}>{a.type}</span></td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{a.section_name}</td>
                      <td className="px-5 py-3.5 text-sm font-bold text-slate-800 dark:text-slate-200">{a.max_score}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{a.date}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button onClick={() => openMarksModal(a)} className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary-hover transition-all flex items-center gap-1 ml-auto">
                          <ClipboardList className="w-3 h-3" /> Enter Marks
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Top Performers Sidebar */}
        <div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card-premium overflow-hidden sticky top-6">
            <div className="p-5 border-b bg-gradient-to-r from-secondary to-orange-500 text-white">
              <h3 className="text-lg font-bold flex items-center gap-2"><Award className="w-5 h-5" /> Top Performers</h3>
            </div>
            <div className="p-0">
              {loading ? (
                <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
              ) : topPerformers.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No grades recorded yet.</div>
              ) : topPerformers.map((g, idx) => (
                <div key={g.id} className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-black text-sm",
                    idx === 0 ? "bg-yellow-100 text-yellow-700" : idx === 1 ? "bg-slate-200 text-slate-700" : idx === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-500"
                  )}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{g.student_name}</p>
                    <p className="text-xs text-slate-500 truncate">{g.assessment_title}</p>
                  </div>
                  <span className="font-black text-primary text-sm">{Number(g.score).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══ CREATE ASSESSMENT MODAL ═══ */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
              <div className="px-6 py-5 border-b bg-gradient-to-r from-primary to-indigo-700 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">Create New Assessment</h2>
                <button onClick={() => setIsCreateModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateAssessment} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Title <span className="text-red-500">*</span></label>
                  <input required type="text" value={assessmentForm.title} onChange={e => setAssessmentForm({...assessmentForm, title: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" placeholder="e.g. Mid-Term Mathematics Exam" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Type</label>
                    <select value={assessmentForm.type} onChange={e => setAssessmentForm({...assessmentForm, type: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm">
                      <option value="QUIZ">Quiz</option>
                      <option value="TEST">Test</option>
                      <option value="EXAM">Exam</option>
                      <option value="ASSIGNMENT">Assignment</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Max Score</label>
                    <input type="number" min="1" value={assessmentForm.max_score} onChange={e => setAssessmentForm({...assessmentForm, max_score: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subject</label>
                    <input type="text" value={assessmentForm.subject_name} onChange={e => setAssessmentForm({...assessmentForm, subject_name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" placeholder="e.g. Mathematics" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Class</label>
                    <input type="text" value={assessmentForm.section_name} onChange={e => setAssessmentForm({...assessmentForm, section_name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" placeholder="e.g. P.7 Blue" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Date <span className="text-red-500">*</span></label>
                  <input required type="date" value={assessmentForm.date} onChange={e => setAssessmentForm({...assessmentForm, date: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                </div>
                <div className="pt-5 border-t flex justify-end gap-3">
                  <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Create Assessment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ ENTER MARKS MODAL ═══ */}
      <AnimatePresence>
        {isMarksModalOpen && selectedAssessment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMarksModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden max-h-[85vh] flex flex-col">
              <div className="px-6 py-5 border-b bg-gradient-to-r from-primary to-indigo-700 text-white flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-xl font-bold">Enter Marks</h2>
                  <p className="text-sm text-white/70 mt-0.5">{selectedAssessment.title} — Max: {selectedAssessment.max_score}</p>
                </div>
                <button onClick={() => setIsMarksModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-3">
                  {markStudents.map((s) => (
                    <div key={s.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="w-8 h-8 rounded-full bg-purple-pastel flex items-center justify-center text-xs font-bold text-primary">{s.name.charAt(0)}</div>
                      <span className="flex-1 font-bold text-sm text-slate-800 dark:text-slate-200">{s.name}</span>
                      <input type="number" min="0" max={selectedAssessment.max_score} placeholder={`/ ${selectedAssessment.max_score}`} value={marksData[s.id] || ''} onChange={e => setMarksData(prev => ({...prev, [s.id]: e.target.value}))} className="w-24 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-6 py-4 border-t flex justify-end gap-3 shrink-0 bg-slate-50 dark:bg-slate-900/50">
                <button onClick={() => setIsMarksModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={handleSaveMarks} disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />} Save Marks
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
