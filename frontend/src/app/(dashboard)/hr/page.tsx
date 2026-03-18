"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, BookMarked, Loader2, AlertCircle, Plus, Search } from 'lucide-react'
import { fetchAPI } from '@/lib/api'
import { cn } from '@/lib/utils'

interface Staff {
   id: number
   user: number
   full_name: string
   employee_id: string
   designation: string
   salary_basis: string
   hire_date: string
}

interface PayrollRun {
   id: number
   month: string
   processed_at: string
}

export default function HRPage() {
   const [staff, setStaff] = useState<Staff[]>([])
   const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([])
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState('')
   const [search, setSearch] = useState('')
   const [view, setView] = useState<'staff' | 'payroll'>('staff')

   useEffect(() => {
      async function loadData() {
         try {
            const [staffData, payrollData] = await Promise.all([
               fetchAPI<Staff[]>('hr/staff/'),
               fetchAPI<PayrollRun[]>('hr/payroll/'),
            ])
            setStaff(staffData)
            setPayrollRuns(payrollData)
         } catch (err: any) {
            setError(err.message || 'Failed to load HR data')
         } finally {
            setLoading(false)
         }
      }
      loadData()
   }, [])

   const filteredStaff = staff.filter(s =>
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
      s.designation?.toLowerCase().includes(search.toLowerCase())
   )

   return (
      <div className="space-y-8 pb-12">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
               <h1 className="text-3xl font-bold text-slate-900 dark:text-white">HR &amp; Payroll</h1>
               <p className="text-slate-500 dark:text-slate-400 mt-1">Manage staff records, salaries, and payroll processing.</p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
               <button onClick={() => setView('staff')} className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", view === 'staff' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500")}>Staff</button>
               <button onClick={() => setView('payroll')} className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", view === 'payroll' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500")}>Payroll Runs</button>
            </div>
         </div>

         {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
               <AlertCircle className="w-5 h-5" /><p>{error}</p>
            </div>
         )}

         {view === 'staff' && (
            <>
               <div className="flex gap-4">
                  <div className="flex-1 relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input type="text" placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                     />
                  </div>
                  <button className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-primary/20">
                     <Plus className="w-4 h-4" /> Add Staff
                  </button>
               </div>

               <div className="card-premium overflow-hidden">
                  {loading ? (
                     <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                     </div>
                  ) : filteredStaff.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Users className="w-12 h-12 mb-4 opacity-30" />
                        <p className="font-semibold">No staff records found.</p>
                        <p className="text-sm mt-1">Add staff members to get started.</p>
                     </div>
                  ) : (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                              <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                 <th className="px-6 py-4">Employee ID</th>
                                 <th className="px-6 py-4">Full Name</th>
                                 <th className="px-6 py-4">Designation</th>
                                 <th className="px-6 py-4">Hire Date</th>
                                 <th className="px-6 py-4 text-right">Basic Salary (UGX)</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {filteredStaff.map(s => (
                                 <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors text-sm">
                                    <td className="px-6 py-4 font-mono text-primary">{s.employee_id}</td>
                                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">{s.full_name}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{s.designation}</td>
                                    <td className="px-6 py-4 text-slate-500">{s.hire_date}</td>
                                    <td className="px-6 py-4 text-right font-bold">{parseInt(s.salary_basis).toLocaleString()}</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  )}
               </div>
            </>
         )}

         {view === 'payroll' && (
            <div className="card-premium overflow-hidden">
               {loading ? (
                  <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
               ) : payrollRuns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                     <BookMarked className="w-12 h-12 mb-4 opacity-30" />
                     <p className="font-semibold">No payroll runs yet.</p>
                  </div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                           <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              <th className="px-6 py-4">Month</th>
                              <th className="px-6 py-4 text-right">Processed At</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                           {payrollRuns.map(p => (
                              <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 text-sm">
                                 <td className="px-6 py-4 font-semibold">{new Date(p.month).toLocaleDateString('en-UG', { month: 'long', year: 'numeric' })}</td>
                                 <td className="px-6 py-4 text-right text-slate-500">{new Date(p.processed_at).toLocaleString()}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </div>
         )}
      </div>
   )
}
