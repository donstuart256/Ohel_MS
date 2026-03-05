"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Library, 
  Search, 
  Filter, 
  BookOpen, 
  History, 
  Plus,
  BookMarked,
  Tag
} from 'lucide-react'
import { cn } from '@/lib/utils'

const books = [
  { id: 1, title: 'Introduction to Physics', author: 'Dr. James Okot', category: 'Science', status: 'Available', shelf: 'SC-01' },
  { id: 2, title: 'Modern Ugandan History', author: 'Prof. Sarah Namuli', category: 'History', status: 'Borrowed', shelf: 'HS-05' },
  { id: 3, title: 'Advanced Calculus', author: 'Jane Doe', category: 'Mathematics', status: 'Available', shelf: 'MA-09' },
  { id: 4, title: 'Literature: The Pearl', author: 'John Steinbeck', category: 'English', status: 'Available', shelf: 'EN-12' },
]

export default function LibraryPage() {
  const [activeView, setActiveView] = useState('catalog') # catalog, circulation

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Library Catalog</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Institutional resource management and circulation tracking.</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20">
             <Plus className="w-4 h-4" />
             Add Volume
           </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
         <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by title, author, or ISBN..." className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl" />
         </div>
         <div className="flex gap-2 w-full lg:w-fit">
            <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs">
               <Tag className="w-4 h-4" /> Categories
            </button>
            <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs">
               <Filter className="w-4 h-4" /> Filter
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {books.map((book, i) => (
           <motion.div 
             key={book.id}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.05 }}
             className="card-premium p-6 flex flex-col justify-between group cursor-pointer hover:border-primary/20 transition-all shadow-sm"
           >
              <div>
                 <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                       <BookMarked className="w-5 h-5 group-hover:text-primary transition-colors" />
                    </div>
                    <span className={cn(
                      "text-[9px] font-black uppercase px-2 py-1 rounded-full",
                      book.status === 'Available' ? "bg-green-100 text-green-700 dark:bg-green-900/20" : "bg-red-100 text-red-700 dark:bg-red-900/20"
                    )}>
                      {book.status}
                    </span>
                 </div>
                 <h3 className="font-bold text-slate-800 dark:text-white line-clamp-2 leading-tight">{book.title}</h3>
                 <p className="text-xs text-slate-500 mt-2">{book.author}</p>
                 <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">{book.category}</p>
              </div>
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                 <span className="text-[10px] font-bold text-slate-400">Shelf: {book.shelf}</span>
                 <button className="text-[10px] font-black text-primary uppercase">Reserve</button>
              </div>
           </motion.div>
         ))}
      </div>
    </div>
  )
}
