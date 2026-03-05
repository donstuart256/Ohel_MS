"use client"

import React from 'react'

export default function HRPage() {
   return (
      <div className="space-y-8 pb-12">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
               <h1 className="text-3xl font-bold text-slate-900 dark:text-white">HR & Payroll</h1>
               <p className="text-slate-500 dark:text-slate-400 mt-1">Manage staff, attendance, and payroll processing.</p>
            </div>
         </div>

         <div className="card-premium p-12 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
               <span className="text-2xl">👥</span>
            </div>
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">HR Module Active</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-center max-w-sm">
               Staff and payroll records are being tracked successfully. Full UI development scheduled for next sprint.
            </p>
         </div>
      </div>
   )
}
