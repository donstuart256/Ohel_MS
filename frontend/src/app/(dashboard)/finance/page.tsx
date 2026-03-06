"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

const invoices = [
  { id: 'INV-001', student: 'Jordan Smith', amount: '2,500,000', status: 'PAID', date: '2024-03-01' },
  { id: 'INV-002', student: 'Sarah Jenkins', amount: '1,200,000', status: 'UNPAID', date: '2024-03-02' },
  { id: 'INV-003', student: 'Maria Garcia', amount: '4,500,000', status: 'PARTIAL', date: '2024-03-03' },
  { id: 'INV-004', student: 'Donald J. Tom', amount: '150,000', status: 'UNPAID', date: '2024-03-04' },
]

export default function FinancePage() {
  const [showPayModal, setShowPayModal] = useState(false)
  const [payStep, setPayStep] = useState('form') // form, pending, success

  const handlePayment = () => {
    setPayStep('pending')
    setTimeout(() => {
      setPayStep('success')
    }, 3000)
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Finance & Payments</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Fee collections, invoices, and institutional financial health.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-slate-900 dark:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-105">
            <CreditCard className="w-4 h-4" />
            Generate Invoices
          </button>
        </div>
      </div>

      {/* Revenue Mini-Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Target Revenue (Term)</p>
            <ArrowUpRight className="text-green-500 w-4 h-4" />
          </div>
          <h2 className="text-2xl font-bold mt-2">UGX 840M</h2>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-primary h-full w-[65%]" />
          </div>
          <p className="text-xs text-slate-400 mt-2">65% collected so far</p>
        </div>
        <div className="card-premium p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Collected Today</p>
            <ArrowDownLeft className="text-blue-500 w-4 h-4" />
          </div>
          <h2 className="text-2xl font-bold mt-2">UGX 12.4M</h2>
          <p className="text-xs text-green-500 mt-2">+4.2% from yesterday</p>
        </div>
        <div className="card-premium p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Outstanding Debt</p>
            <X className="text-red-500 w-4 h-4" />
          </div>
          <h2 className="text-2xl font-bold mt-2 uppercase text-red-500">UGX 294M</h2>
          <p className="text-xs text-slate-400 mt-2">120 pending invoices</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card-premium overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by student or ID..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
              <Filter className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-900/30">
              <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Amount (UGX)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="text-sm group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-primary">{inv.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">{inv.student}</td>
                  <td className="px-6 py-4 font-bold">{inv.amount}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                      inv.status === 'PAID' ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
                        inv.status === 'PARTIAL' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" :
                          "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    )}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{inv.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setShowPayModal(true)}
                      className="text-primary hover:underline font-bold"
                    >
                      Record Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal (MoMo Pattern) */}
      <AnimatePresence>
        {showPayModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl relative z-10 p-8"
            >
              {payStep === 'form' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold dark:text-white">Mobile Money Payment</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Initiate a direct collection from the parent's phone.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase">Phone Number</label>
                      <div className="flex gap-2">
                        <div className="px-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold">+256</div>
                        <input type="text" placeholder="770 000 000" className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase">Amount (UGX)</label>
                      <input type="text" defaultValue="1,200,000" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                  </div>
                  <button
                    onClick={handlePayment}
                    className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                  >
                    Send Payment Prompt
                  </button>
                </div>
              )}

              {payStep === 'pending' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <div>
                    <h3 className="text-xl font-bold dark:text-white">Request Sent</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">The parent is currently prompted for their PIN...</p>
                  </div>
                  <p className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full font-mono">TX-ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                </div>
              )}

              {payStep === 'success' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold dark:text-white">Payment Verified</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Funds have been cleared and the invoice is updated.</p>
                  </div>
                  <button
                    onClick={() => setShowPayModal(false)}
                    className="w-full bg-slate-900 dark:bg-slate-700 text-white py-4 rounded-xl font-bold"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
