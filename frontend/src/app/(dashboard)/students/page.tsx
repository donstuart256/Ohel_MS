"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, UserPlus, MoreVertical, Download, Upload,
  Eye, Edit, Trash2, Loader2, X, AlertTriangle, FileSpreadsheet
} from 'lucide-react'
import { fetchAPI } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'

const EMPTY_FORM = { first_name: '', last_name: '', username: '', email: '', password: '', section_id: 1, academic_year_id: 1 }

export default function StudentsPage() {
  const { addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<any>(null)
  const [deletingStudent, setDeletingStudent] = useState<any>(null)
  const [viewingStudent, setViewingStudent] = useState<any>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const data = await fetchAPI('academics/enrollments/')
      setEnrollments(data.results || data || [])
    } catch (err) {
      addToast('error', 'Connection Failed', 'Could not load student records from the server.')
    } finally {
      setLoading(false)
    }
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {}
    if (!formData.first_name.trim()) errors.first_name = 'First name is required'
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required'
    if (!formData.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format'
    if (!formData.username.trim()) errors.username = 'Username is required'
    else if (formData.username.length < 3) errors.username = 'Must be at least 3 characters'
    if (!editingStudent) {
      if (!formData.password) errors.password = 'Password is required'
      else if (formData.password.length < 8) errors.password = 'Must be at least 8 characters'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  function openAddModal() {
    setEditingStudent(null)
    setFormData(EMPTY_FORM)
    setFormErrors({})
    setIsAddModalOpen(true)
  }

  function openEditModal(enrollment: any) {
    setEditingStudent(enrollment)
    setFormData({
      first_name: enrollment.student_name?.split(' ')[0] || '',
      last_name: enrollment.student_name?.split(' ').slice(1).join(' ') || '',
      username: `student_${enrollment.student}`,
      email: '',
      password: '',
      section_id: enrollment.section || 1,
      academic_year_id: 1
    })
    setFormErrors({})
    setIsAddModalOpen(true)
  }

  function openDeleteModal(enrollment: any) {
    setDeletingStudent(enrollment)
    setIsDeleteModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      if (editingStudent) {
        await fetchAPI(`academics/enrollments/${editingStudent.id}/`, {
          method: 'PUT',
          body: JSON.stringify({
            student: editingStudent.student,
            section: formData.section_id,
            academic_year: formData.academic_year_id,
            status: 'ACTIVE'
          })
        })
        addToast('success', 'Student Updated', `${formData.first_name} ${formData.last_name}'s record has been updated.`)
      } else {
        const userPayload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: 'STUDENT',
          phone_number: ''
        }
        const newUser = await fetchAPI('users/', { method: 'POST', body: JSON.stringify(userPayload) })
        if (newUser?.id) {
          await fetchAPI('academics/enrollments/', {
            method: 'POST',
            body: JSON.stringify({ student: newUser.id, section: formData.section_id, academic_year: formData.academic_year_id, status: 'ACTIVE' })
          })
        }
        addToast('success', 'Student Enrolled', `${formData.first_name} ${formData.last_name} has been successfully registered.`)
      }
      setIsAddModalOpen(false)
      setFormData(EMPTY_FORM)
      loadData()
    } catch (err: any) {
      addToast('error', 'Operation Failed', err.message || 'Please ensure all fields are valid and username/email is unique.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingStudent) return
    setIsSubmitting(true)
    try {
      await fetchAPI(`academics/enrollments/${deletingStudent.id}/`, { method: 'DELETE' })
      addToast('success', 'Student Removed', `${deletingStudent.student_name} has been removed from the enrollment list.`)
      setIsDeleteModalOpen(false)
      setDeletingStudent(null)
      loadData()
    } catch (err) {
      addToast('error', 'Delete Failed', 'Could not remove the student record.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImport = () => setIsImportModalOpen(true)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    addToast('info', 'Importing', `Processing "${file.name}"...`)
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(l => l.trim())
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const firstNameIdx = headers.findIndex(h => h.includes('first'))
      const lastNameIdx = headers.findIndex(h => h.includes('last'))
      let imported = 0
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',')
        const firstName = cols[firstNameIdx >= 0 ? firstNameIdx : 0]?.trim()
        const lastName = cols[lastNameIdx >= 0 ? lastNameIdx : 1]?.trim()
        if (firstName && lastName) {
          await fetchAPI('users/', {
            method: 'POST',
            body: JSON.stringify({ first_name: firstName, last_name: lastName, role: 'STUDENT', email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@school.ac.ug` })
          })
          await fetchAPI('academics/enrollments/', {
            method: 'POST',
            body: JSON.stringify({ student_name: `${firstName} ${lastName}`, section_name: 'P.7 Blue', section: 1, academic_year: 1, academic_year_name: '2026', status: 'ACTIVE' })
          })
          imported++
        }
      }
      addToast('success', 'Import Complete', `${imported} student records imported from "${file.name}".`)
      setIsImportModalOpen(false)
      loadData()
    } catch (err) {
      addToast('error', 'Import Failed', 'Could not process the CSV file. Please check the format.')
    }
  }

  const handleExport = () => {
    const headers = ['Student ID', 'Full Name', 'Class/Section', 'Academic Year', 'Status']
    const rows = enrollments.map(e => [
      `ADM-${e.student?.toString().padStart(4, '0')}`,
      e.student_name,
      e.section_name,
      e.academic_year_name,
      e.status,
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    addToast('success', 'Export Ready', `${enrollments.length} student records downloaded as CSV.`)
  }

  const filteredStudents = enrollments.filter(e =>
    e.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.section_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.student?.toString().includes(searchTerm)
  )

  const InputField = ({ label, name, type = 'text', required = true, placeholder = '', minLength }: any) => (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{label} {required && <span className="text-red-500">*</span>}</label>
      <input
        required={required}
        type={type}
        minLength={minLength}
        value={(formData as any)[name]}
        onChange={(e) => { setFormData({...formData, [name]: e.target.value }); setFormErrors({...formErrors, [name]: '' }) }}
        className={cn(
          "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm",
          formErrors[name] ? "border-red-300 focus:ring-red-200" : "border-slate-200 dark:border-slate-700 focus:ring-primary/20"
        )}
        placeholder={placeholder}
      />
      {formErrors[name] && <p className="text-xs text-red-500 font-medium">{formErrors[name]}</p>}
    </div>
  )

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Student Information System</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage admissions, profiles, and enrollment records.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 w-fit">
          <UserPlus className="w-5 h-5" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input type="text" placeholder="Search by name, ID, or class..." className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-800 dark:text-slate-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
          <button onClick={handleImport} className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">Import Excel/CSV</span>
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Class/Section</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Year</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center"><Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" /><p className="text-slate-500 mt-2 font-medium">Loading student records...</p></td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">No student records found{searchTerm && ` matching "${searchTerm}"`}.</td></tr>
              ) : filteredStudents.map((enrollment, index) => (
                <motion.tr key={enrollment.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(index * 0.03, 0.5) }} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-sm font-bold text-primary">ADM-{enrollment.student?.toString().padStart(4, '0')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-pastel flex items-center justify-center text-xs font-bold text-primary">{enrollment.student_name ? enrollment.student_name.charAt(0) : '?'}</div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{enrollment.student_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">{enrollment.section_name}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{enrollment.academic_year_name}</td>
                  <td className="px-6 py-4">
                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase", enrollment.status === 'ACTIVE' ? "bg-green-pastel text-green-700" : "bg-yellow-pastel text-yellow-700")}>{enrollment.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setViewingStudent(enrollment); setIsViewModalOpen(true); }} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-all" title="View"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => openEditModal(enrollment)} className="p-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 rounded-lg transition-all" title="Edit"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => openDeleteModal(enrollment)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredStudents.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm text-slate-500">
            <span>Showing {filteredStudents.length} of {enrollments.length} students</span>
          </div>
        )}
      </motion.div>

      {/* ═══ ADD/EDIT STUDENT MODAL ═══ */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-gradient-to-r from-primary to-indigo-700 text-white">
                <h2 className="text-xl font-bold">{editingStudent ? 'Edit Student Record' : 'Register New Student'}</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="First Name" name="first_name" placeholder="e.g. Grace" />
                  <InputField label="Last Name" name="last_name" placeholder="e.g. Nakamya" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Email Address" name="email" type="email" placeholder="student@school.ug" />
                  <InputField label="Username" name="username" placeholder="grace.nakamya" minLength={3} />
                </div>
                {!editingStudent && <InputField label="Temporary Password" name="password" type="password" placeholder="Minimum 8 characters" minLength={8} />}
                <div className="pt-5 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    {editingStudent ? 'Save Changes' : 'Enroll Student'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ DELETE CONFIRMATION MODAL ═══ */}
      <AnimatePresence>
        {isDeleteModalOpen && deletingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md relative z-10 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Confirm Deletion</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Are you sure you want to remove <strong className="text-slate-800 dark:text-white">{deletingStudent.student_name}</strong> from the enrollment? This action cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                <button onClick={handleDelete} disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete Student
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ IMPORT DATA MODAL ═══ */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsImportModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Import Student Data</h2>
                <button onClick={() => setIsImportModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">Upload an Excel (.xlsx) or CSV file containing student records. The file should have columns: First Name, Last Name, Email, Class.</p>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Drop your file here or click to browse</p>
                  <p className="text-xs text-slate-400">Supports .xlsx, .csv, .xls (max 5MB)</p>
                  <input ref={fileInputRef} type="file" accept=".xlsx,.csv,.xls" onChange={handleFileSelect} className="hidden" />
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setIsImportModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ VIEW STUDENT MODAL ═══ */}
      <AnimatePresence>
        {isViewModalOpen && viewingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Student Profile</h2>
                <button onClick={() => setIsViewModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto text-4xl font-bold text-primary">
                  {viewingStudent.student_name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{viewingStudent.student_name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-mono mt-1">ADM-{viewingStudent.student?.toString().padStart(4, '0')}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-left mt-6">
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Class/Section</p>
                    <p className="font-semibold text-slate-800 dark:text-white">{viewingStudent.section_name}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Academic Year</p>
                    <p className="font-semibold text-slate-800 dark:text-white">{viewingStudent.academic_year_name}</p>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 text-left">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Status</p>
                  <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase mt-1 inline-block", viewingStudent.status === 'ACTIVE' ? "bg-green-pastel text-green-700" : "bg-yellow-pastel text-yellow-700")}>{viewingStudent.status}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
