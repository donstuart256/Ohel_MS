"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, BookOpen, BookCopy, Plus, X, Loader2, BookOpenCheck, AlertCircle, Download
} from 'lucide-react'
import { fetchAPI } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'

export default function LibraryPage() {
  const { addToast } = useToast()
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ title: '', author: '', isbn: '', publisher: '', published_year: '', quantity: '' })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const data = await fetchAPI('library/books/')
      setBooks(data.results || data || [])
    } catch (err) {
      addToast('error', 'Connection Failed', 'Could not load library catalog.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.author) {
      addToast('warning', 'Validation', 'Title and author are required.')
      return
    }
    setIsSubmitting(true)
    try {
      await fetchAPI('library/books/', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          author: form.author,
          isbn: form.isbn,
          publisher: form.publisher,
          published_year: Number(form.published_year) || new Date().getFullYear(),
          quantity: Number(form.quantity) || 1,
          available_quantity: Number(form.quantity) || 1,
        })
      })
      addToast('success', 'Book Added', `"${form.title}" has been added to the library catalog.`)
      setIsAddModalOpen(false)
      setForm({ title: '', author: '', isbn: '', publisher: '', published_year: '', quantity: '' })
      loadData()
    } catch (err) {
      addToast('error', 'Failed', 'Could not add the book.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReserve = async (book: any) => {
    if (book.available_quantity <= 0) {
      addToast('warning', 'Unavailable', `"${book.title}" is currently out of stock.`)
      return
    }
    try {
      await fetchAPI(`library/books/${book.id}`, {
        method: 'PUT',
        body: JSON.stringify({ available_quantity: book.available_quantity - 1 })
      })
      addToast('success', 'Book Reserved', `You have reserved "${book.title}". ${book.available_quantity - 1} copies remaining.`)
      loadData()
    } catch (err) {
      addToast('error', 'Failed', 'Could not reserve the book.')
    }
  }

  const handleReturn = async (book: any) => {
    if (book.available_quantity >= book.quantity) {
      addToast('warning', 'All Returned', `All copies of "${book.title}" are already in the library.`)
      return
    }
    try {
      await fetchAPI(`library/books/${book.id}`, {
        method: 'PUT',
        body: JSON.stringify({ available_quantity: book.available_quantity + 1 })
      })
      addToast('success', 'Book Returned', `"${book.title}" has been returned. ${book.available_quantity + 1} copies now available.`)
      loadData()
    } catch (err) {
      addToast('error', 'Failed', 'Could not process the return.')
    }
  }

  const handleExport = () => {
    const headers = ['Title', 'Author', 'ISBN', 'Publisher', 'Year', 'Total', 'Available']
    const rows = books.map(b => [b.title, b.author, b.isbn, b.publisher, b.published_year, b.quantity, b.available_quantity])
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `library_catalog_${new Date().toISOString().split('T')[0]}.csv`; a.click()
    URL.revokeObjectURL(url)
    addToast('success', 'Export Complete', 'Library catalog downloaded as CSV.')
  }

  const filteredBooks = books.filter(b =>
    b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalBooks = books.reduce((acc, b) => acc + (b.quantity || 0), 0)
  const totalAvailable = books.reduce((acc, b) => acc + (b.available_quantity || 0), 0)
  const totalBorrowed = totalBooks - totalAvailable

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Library Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your book catalog, reservations, and returns.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-5 py-3 rounded-xl font-semibold shadow-sm transition-all active:scale-95 hover:bg-slate-50">
            <Download className="w-5 h-5" /><span>Export Catalog</span>
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95">
            <Plus className="w-5 h-5" /><span>Add Book</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-pastel flex items-center justify-center"><BookOpen className="w-5 h-5 text-primary" /></div>
            <p className="text-sm font-bold text-slate-500 uppercase">Total Books</p>
          </div>
          <p className="text-3xl font-black text-slate-800 dark:text-white">{totalBooks}</p>
        </div>
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-pastel flex items-center justify-center"><BookOpenCheck className="w-5 h-5 text-green-600" /></div>
            <p className="text-sm font-bold text-slate-500 uppercase">Available</p>
          </div>
          <p className="text-3xl font-black text-green-600">{totalAvailable}</p>
        </div>
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-pastel flex items-center justify-center"><BookCopy className="w-5 h-5 text-yellow-600" /></div>
            <p className="text-sm font-bold text-slate-500 uppercase">Borrowed</p>
          </div>
          <p className="text-3xl font-black text-yellow-600">{totalBorrowed}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input type="text" placeholder="Search by title, author, or ISBN..." className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800 dark:text-slate-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {/* Books Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Title</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Author</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">ISBN</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Year</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center"><Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" /><p className="text-slate-500 mt-2">Loading catalog...</p></td></tr>
              ) : filteredBooks.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No books found{searchTerm && ` matching "${searchTerm}"`}.</td></tr>
              ) : filteredBooks.map(book => (
                <tr key={book.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 rounded-lg bg-gradient-to-br from-primary/80 to-indigo-600 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{book.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{book.author}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">{book.isbn}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{book.published_year}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-bold text-sm", book.available_quantity > 0 ? "text-green-600" : "text-red-600")}>{book.available_quantity}</span>
                      <span className="text-slate-400 text-xs">/ {book.quantity}</span>
                    </div>
                    {book.available_quantity <= 3 && book.available_quantity > 0 && (
                      <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">Low stock</span>
                    )}
                    {book.available_quantity === 0 && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Out of stock</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleReserve(book)} disabled={book.available_quantity <= 0} className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary-hover transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        Reserve
                      </button>
                      <button onClick={() => handleReturn(book)} disabled={book.available_quantity >= book.quantity} className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        Return
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBooks.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500">
            Showing {filteredBooks.length} of {books.length} books
          </div>
        )}
      </motion.div>

      {/* ═══ ADD BOOK MODAL ═══ */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
              <div className="px-6 py-5 border-b bg-gradient-to-r from-primary to-indigo-700 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">Add New Book</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddBook} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Title <span className="text-red-500">*</span></label>
                  <input required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Primary Mathematics P.7" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Author <span className="text-red-500">*</span></label>
                    <input required value={form.author} onChange={(e) => setForm({...form, author: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="M. Nelkon" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">ISBN</label>
                    <input value={form.isbn} onChange={(e) => setForm({...form, isbn: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="978-XXX" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Publisher</label>
                    <input value={form.publisher} onChange={(e) => setForm({...form, publisher: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Longhorn" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Year</label>
                    <input type="number" value={form.published_year} onChange={(e) => setForm({...form, published_year: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="2024" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Quantity</label>
                    <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({...form, quantity: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="10" />
                  </div>
                </div>
                <div className="pt-5 border-t flex justify-end gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Book
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
