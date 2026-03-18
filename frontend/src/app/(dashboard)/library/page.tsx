"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, BookMarked, Loader2, AlertCircle } from 'lucide-react'
import { fetchAPI } from '@/lib/api'
import { cn } from '@/lib/utils'

interface Book {
  id: number
  title: string
  author: string
  isbn?: string
  publisher?: string
  published_year?: number
  quantity: number
  available_quantity: number
}

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadBooks() {
      try {
        const query = search ? `?search=${encodeURIComponent(search)}` : ''
        const data = await fetchAPI<Book[]>(`library/books/${query}`)
        setBooks(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load library catalog')
      } finally {
        setLoading(false)
      }
    }
    loadBooks()
  }, [search])

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Library Catalog</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Institutional resource management and circulation tracking.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" /> Add Volume
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /><p>{error}</p>
        </div>
      )}

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by title, author, or ISBN..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : books.length === 0 ? (
        <div className="card-premium flex flex-col items-center justify-center py-24 text-slate-400">
          <BookMarked className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-semibold">No books found.</p>
          <p className="text-sm mt-1">Try a different search term or add new volumes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {books.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.8) }}
              className="card-premium p-6 flex flex-col justify-between group cursor-pointer hover:border-primary/20 transition-all shadow-sm"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                    <BookMarked className="w-5 h-5 group-hover:text-primary transition-colors" />
                  </div>
                  <span className={cn(
                    "text-[9px] font-black uppercase px-2 py-1 rounded-full",
                    book.available_quantity > 0 ? "bg-green-100 text-green-700 dark:bg-green-900/20" : "bg-red-100 text-red-700 dark:bg-red-900/20"
                  )}>
                    {book.available_quantity > 0 ? 'Available' : 'Out of Stock'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white line-clamp-2 leading-tight">{book.title}</h3>
                <p className="text-xs text-slate-500 mt-2">{book.author}</p>
                {book.isbn && <p className="text-[10px] text-slate-400 mt-1 font-mono">ISBN: {book.isbn}</p>}
              </div>
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400">{book.available_quantity}/{book.quantity} available</span>
                {book.available_quantity > 0 && (
                  <button className="text-[10px] font-black text-primary uppercase">Reserve</button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
