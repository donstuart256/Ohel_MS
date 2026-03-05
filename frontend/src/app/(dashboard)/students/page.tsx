"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  UserPlus,
  MoreVertical,
  Download,
  Eye,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react'
import { fetchAPI } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch student enrollments which contain name, section, year, and status
        const data = await fetchAPI('academics/enrollments/')
        setEnrollments(data)
      } catch (err) {
        console.error("Failed to fetch students", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredStudents = enrollments.filter(e =>
    e.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.section_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.student.toString().includes(searchTerm)
  )

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Student Information System</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage admissions, profiles, and enrollment records.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 w-fit">
          <UserPlus className="w-5 h-5" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, ID, or class..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-800 dark:text-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
            <Download className="w-5 h-5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[400px]"
      >
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
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                    <p className="text-slate-500 mt-2">Loading student records...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No student records found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((enrollment, index) => (
                  <motion.tr
                    key={enrollment.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 1) }}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-sm text-primary">ADM-{enrollment.student.toString().padStart(4, '0')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                          {enrollment.student_name ? enrollment.student_name.charAt(0) : '?'}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{enrollment.student_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{enrollment.section_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{enrollment.academic_year_name}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-bold uppercase",
                        enrollment.status === 'ACTIVE' ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                          "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                      )}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-all" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 rounded-lg transition-all" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-all" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <button className="p-1.5 group-hover:hidden text-slate-400">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
