"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, TrendingDown, TrendingUp, CreditCard, Download, Filter, Search,
  CheckCircle2, Clock, AlertCircle, Loader2, Plus, X, Receipt, Banknote, Printer
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts'
import { fetchAPI } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'

export default function FinancePage() {
  const { addToast } = useToast()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [invoiceForm, setInvoiceForm] = useState({ student_name: '', total_amount: '', due_date: '' })
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'MOBILE_MONEY', reference: '' })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const data = await fetchAPI('finance/invoices/')
      setInvoices(data.results || data || [])
    } catch (err) {
      addToast('error', 'Connection Failed', 'Could not load financial data.')
    } finally {
      setLoading(false)
    }
  }

  const totalBilled = invoices.reduce((acc, i) => acc + Number(i.total_amount || 0), 0)
  const totalCollected = invoices.reduce((acc, i) => acc + Number(i.amount_paid || 0), 0)
  const outstanding = totalBilled - totalCollected
  const collectionRate = totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : '0'

  const chartData = [
    { month: 'Jan', collected: 4200000, billed: 5000000 },
    { month: 'Feb', collected: 3800000, billed: 5000000 },
    { month: 'Mar', collected: totalCollected || 4500000, billed: totalBilled || 5200000 },
  ]

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invoiceForm.student_name || !invoiceForm.total_amount || !invoiceForm.due_date) {
      addToast('warning', 'Validation Error', 'Please fill in all required fields.')
      return
    }
    setIsSubmitting(true)
    try {
      await fetchAPI('finance/invoices/', {
        method: 'POST',
        body: JSON.stringify({
          student_name: invoiceForm.student_name,
          total_amount: invoiceForm.total_amount,
          amount_paid: '0',
          balance: invoiceForm.total_amount,
          status: 'UNPAID',
          due_date: invoiceForm.due_date,
        })
      })
      addToast('success', 'Invoice Created', `Invoice for ${invoiceForm.student_name} of UGX ${Number(invoiceForm.total_amount).toLocaleString()} has been generated.`)
      setIsInvoiceModalOpen(false)
      setInvoiceForm({ student_name: '', total_amount: '', due_date: '' })
      loadData()
    } catch (err) {
      addToast('error', 'Failed', 'Could not create the invoice.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      addToast('warning', 'Invalid Amount', 'Please enter a valid payment amount.')
      return
    }
    setIsSubmitting(true)
    try {
      await fetchAPI(`finance/invoices/${selectedInvoice.id}/payments`, {
        method: 'POST',
        body: JSON.stringify({
          amount: paymentForm.amount,
          method: paymentForm.method,
          reference: paymentForm.reference,
        })
      })
      addToast('success', 'Payment Recorded', `UGX ${Number(paymentForm.amount).toLocaleString()} received via ${paymentForm.method.replace(/_/g, ' ')}.`)
      setIsPaymentModalOpen(false)
      setPaymentForm({ amount: '', method: 'MOBILE_MONEY', reference: '' })
      loadData()
    } catch (err) {
      addToast('error', 'Failed', 'Could not record the payment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openPaymentModal = (invoice: any) => {
    setSelectedInvoice(invoice)
    setPaymentForm({ amount: '', method: 'MOBILE_MONEY', reference: '' })
    setIsPaymentModalOpen(true)
  }

  const openReceiptModal = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsReceiptModalOpen(true)
  }

  const handleExportCSV = () => {
    const headers = ['Invoice#', 'Student', 'Total', 'Paid', 'Balance', 'Status', 'Due Date']
    const rows = invoices.map(inv => [
      `INV-${inv.id.toString().padStart(4, '0')}`,
      inv.student_name,
      inv.total_amount,
      inv.amount_paid,
      String(Number(inv.total_amount) - Number(inv.amount_paid)),
      inv.status,
      inv.due_date,
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finance_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    addToast('success', 'Export Complete', 'Financial report has been downloaded as CSV.')
  }

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow || !selectedInvoice) return
    printWindow.document.write(`
      <html><head><title>Receipt - INV-${selectedInvoice.id.toString().padStart(4, '0')}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;max-width:500px;margin:auto}h1{color:#2D0F5B;border-bottom:2px solid #2D0F5B;padding-bottom:10px}table{width:100%;border-collapse:collapse;margin:20px 0}td{padding:8px;border-bottom:1px solid #eee}.label{font-weight:bold;color:#555;width:40%}.amount{font-size:1.2em;font-weight:bold;color:#2D0F5B}</style>
      </head><body>
      <h1>EduPro SMS — Payment Receipt</h1>
      <p style="color:#888">Receipt Date: ${new Date().toLocaleDateString()}</p>
      <table>
        <tr><td class="label">Invoice #</td><td>INV-${selectedInvoice.id.toString().padStart(4, '0')}</td></tr>
        <tr><td class="label">Student</td><td>${selectedInvoice.student_name}</td></tr>
        <tr><td class="label">Total Amount</td><td>UGX ${Number(selectedInvoice.total_amount).toLocaleString()}</td></tr>
        <tr><td class="label">Amount Paid</td><td style="color:green">UGX ${Number(selectedInvoice.amount_paid).toLocaleString()}</td></tr>
        <tr><td class="label">Balance</td><td style="color:${Number(selectedInvoice.total_amount) - Number(selectedInvoice.amount_paid) > 0 ? 'red' : 'green'}">UGX ${(Number(selectedInvoice.total_amount) - Number(selectedInvoice.amount_paid)).toLocaleString()}</td></tr>
        <tr><td class="label">Status</td><td class="amount">${selectedInvoice.status}</td></tr>
        <tr><td class="label">Due Date</td><td>${selectedInvoice.due_date}</td></tr>
      </table>
      <p style="text-align:center;margin-top:40px;color:#aaa;font-size:12px">This is a computer-generated receipt. No signature required.</p>
      </body></html>
    `)
    printWindow.document.close()
    printWindow.print()
    addToast('success', 'Receipt Generated', 'Receipt has been sent to the printer.')
  }

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.status?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusConfig: Record<string, { color: string; icon: any }> = {
    PAID: { color: 'bg-green-pastel text-green-700', icon: CheckCircle2 },
    PARTIAL: { color: 'bg-yellow-pastel text-yellow-700', icon: Clock },
    UNPAID: { color: 'bg-red-100 text-red-700', icon: AlertCircle },
    OVERDUE: { color: 'bg-red-100 text-red-700', icon: AlertCircle },
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Finance & Fee Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track invoices, payments, and school financial health.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-5 py-3 rounded-xl font-semibold shadow-sm transition-all active:scale-95 hover:bg-slate-50">
            <Download className="w-5 h-5" /><span>Export Report</span>
          </button>
          <button onClick={() => setIsInvoiceModalOpen(true)} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 w-fit">
            <Plus className="w-5 h-5" /><span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-green-pastel rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="relative">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Collected</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-2">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : `UGX ${(totalCollected / 1000).toLocaleString()}k`}</h3>
            <div className="flex items-center gap-2 text-sm font-bold text-green-600 bg-green-pastel px-3 py-1 rounded-full w-fit">
              <TrendingUp className="w-4 h-4" /><span>{collectionRate}% Collection Rate</span>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-premium p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-red-100 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="relative">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Outstanding Arrears</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-2">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : `UGX ${(outstanding / 1000).toLocaleString()}k`}</h3>
            <div className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full w-fit">
              <AlertCircle className="w-4 h-4" /><span>Pending from {invoices.filter(i => Number(i.amount_paid) < Number(i.total_amount)).length} students</span>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-premium p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-purple-pastel rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="relative">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Expected Revenue</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-2">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : `UGX ${(totalBilled / 1000).toLocaleString()}k`}</h3>
            <div className="flex items-center gap-2 text-sm font-bold text-primary bg-purple-pastel px-3 py-1 rounded-full w-fit">
              <Wallet className="w-4 h-4" /><span>{invoices.length} invoices generated</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Revenue Trend</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="collected" stroke="#10B981" fill="#10B98120" strokeWidth={2} />
              <Area type="monotone" dataKey="billed" stroke="#2D0F5B" fill="#2D0F5B10" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input type="text" placeholder="Search invoices by student or status..." className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800 dark:text-slate-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['ALL', 'PAID', 'PARTIAL', 'UNPAID'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn(
              "px-4 py-3 rounded-xl text-sm font-bold transition-all",
              statusFilter === s ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50"
            )}>
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Invoice#</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Paid</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Balance</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Due Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center"><Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" /><p className="text-slate-500 mt-2">Loading invoices...</p></td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-500">No invoices found.</td></tr>
              ) : filteredInvoices.map(inv => {
                const sc = statusConfig[inv.status] || statusConfig.UNPAID
                const Icon = sc.icon
                const balance = Number(inv.total_amount) - Number(inv.amount_paid)
                return (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-sm font-bold text-primary">INV-{inv.id.toString().padStart(4, '0')}</td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{inv.student_name}</td>
                    <td className="px-6 py-4 text-sm font-medium">UGX {Number(inv.total_amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600">UGX {Number(inv.amount_paid).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-red-600">UGX {balance.toLocaleString()}</td>
                    <td className="px-6 py-4"><span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit", sc.color)}><Icon className="w-3 h-3" /> {inv.status}</span></td>
                    <td className="px-6 py-4 text-sm text-slate-500">{inv.due_date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        {inv.status !== 'PAID' && (
                          <button onClick={() => openPaymentModal(inv)} className="px-3 py-1.5 text-xs font-bold bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center gap-1">
                            <Banknote className="w-3 h-3" /> Receive Payment
                          </button>
                        )}
                        <button onClick={() => openReceiptModal(inv)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-all" title="Receipt">
                          <Receipt className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredInvoices.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm text-slate-500">
            <span>Showing {filteredInvoices.length} of {invoices.length} invoices</span>
          </div>
        )}
      </motion.div>

      {/* ═══ CREATE INVOICE MODAL ═══ */}
      <AnimatePresence>
        {isInvoiceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsInvoiceModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-primary to-indigo-700 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">Generate New Invoice</h2>
                <button onClick={() => setIsInvoiceModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateInvoice} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Student Name <span className="text-red-500">*</span></label>
                  <input required type="text" value={invoiceForm.student_name} onChange={(e) => setInvoiceForm({...invoiceForm, student_name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" placeholder="e.g. Grace Nakamya" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Amount (UGX) <span className="text-red-500">*</span></label>
                    <input required type="number" min="1000" value={invoiceForm.total_amount} onChange={(e) => setInvoiceForm({...invoiceForm, total_amount: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" placeholder="2500000" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Due Date <span className="text-red-500">*</span></label>
                    <input required type="date" value={invoiceForm.due_date} onChange={(e) => setInvoiceForm({...invoiceForm, due_date: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                  </div>
                </div>
                <div className="pt-5 border-t flex justify-end gap-3">
                  <button type="button" onClick={() => setIsInvoiceModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />} Generate Invoice
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ RECORD PAYMENT MODAL ═══ */}
      <AnimatePresence>
        {isPaymentModalOpen && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsPaymentModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden">
              <div className="px-6 py-5 border-b bg-gradient-to-r from-green-600 to-emerald-600 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">Record Payment</h2>
                <button onClick={() => setIsPaymentModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleRecordPayment} className="p-6 space-y-5">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Invoice For</p>
                  <p className="font-bold text-slate-800 dark:text-white">{selectedInvoice.student_name}</p>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-slate-500">Balance Due:</span>
                    <span className="font-bold text-red-600">UGX {(Number(selectedInvoice.total_amount) - Number(selectedInvoice.amount_paid)).toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Amount Received (UGX) <span className="text-red-500">*</span></label>
                  <input required type="number" min="1" max={Number(selectedInvoice.total_amount) - Number(selectedInvoice.amount_paid)} value={paymentForm.amount} onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-200 text-sm" placeholder="Enter amount" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Payment Method</label>
                  <select value={paymentForm.method} onChange={(e) => setPaymentForm({...paymentForm, method: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-200 text-sm">
                    <option value="MOBILE_MONEY">MTN Mobile Money</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                    <option value="AIRTEL_MONEY">Airtel Money</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Reference / Transaction ID</label>
                  <input type="text" value={paymentForm.reference} onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-200 text-sm" placeholder="e.g. MP240328.1234.A01" />
                </div>
                <div className="pt-5 border-t flex justify-end gap-3">
                  <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />} Record Payment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ RECEIPT MODAL ═══ */}
      <AnimatePresence>
        {isReceiptModalOpen && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsReceiptModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
              <div className="px-6 py-5 border-b bg-gradient-to-r from-primary to-indigo-700 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">Receipt Preview</h2>
                <button onClick={() => setIsReceiptModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="text-center border-b border-slate-100 dark:border-slate-700 pb-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">EduPro SMS</h3>
                  <p className="text-xs text-slate-500">Invoice INV-{selectedInvoice.id.toString().padStart(4, '0')}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-sm text-slate-500">Student</span><span className="text-sm font-bold text-slate-800 dark:text-white">{selectedInvoice.student_name}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-slate-500">Total Amount</span><span className="text-sm font-bold">UGX {Number(selectedInvoice.total_amount).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-slate-500">Amount Paid</span><span className="text-sm font-bold text-green-600">UGX {Number(selectedInvoice.amount_paid).toLocaleString()}</span></div>
                  <div className="flex justify-between border-t pt-3"><span className="text-sm font-bold text-slate-500">Balance</span><span className="text-sm font-black text-red-600">UGX {(Number(selectedInvoice.total_amount) - Number(selectedInvoice.amount_paid)).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-slate-500">Status</span><span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase", statusConfig[selectedInvoice.status]?.color || 'bg-slate-100')}>{selectedInvoice.status}</span></div>
                </div>
                <div className="pt-4 border-t flex justify-end gap-3">
                  <button onClick={() => setIsReceiptModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Close</button>
                  <button onClick={handlePrintReceipt} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95">
                    <Printer className="w-4 h-4" /> Print Receipt
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
