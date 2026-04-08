"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Send, Plus, X, Loader2, Search, Inbox, MailOpen, Clock, User } from 'lucide-react'
import { fetchAPI } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'

export default function MessagesPage() {
  const { addToast } = useToast()
  const [messages, setMessages] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filter, setFilter] = useState<'all' | 'inbox' | 'sent'>('all')
  const [composeForm, setComposeForm] = useState({ to: '', subject: '', body: '' })

  const currentUserId = 1 // System Admin

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [msgRes, userRes] = await Promise.all([
        fetchAPI('communications/messages/'),
        fetchAPI('users/'),
      ])
      setMessages(msgRes.results || msgRes || [])
      setUsers((userRes.results || userRes || []).filter((u: any) => u.id !== currentUserId))
    } catch {
      addToast('error', 'Error', 'Could not load messages.')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!composeForm.to || !composeForm.subject || !composeForm.body) {
      addToast('warning', 'Validation', 'All fields are required.')
      return
    }
    setIsSubmitting(true)
    try {
      const recipient = users.find(u => String(u.id) === composeForm.to)
      await fetchAPI('communications/messages/', {
        method: 'POST',
        body: JSON.stringify({
          from: currentUserId,
          from_name: 'System Administrator',
          to: Number(composeForm.to),
          to_name: recipient ? `${recipient.first_name} ${recipient.last_name}` : 'Unknown',
          subject: composeForm.subject,
          body: composeForm.body,
        })
      })
      addToast('success', 'Message Sent', `Your message has been sent to ${recipient?.first_name || 'the recipient'}.`)
      setIsComposeOpen(false)
      setComposeForm({ to: '', subject: '', body: '' })
      loadData()
    } catch {
      addToast('error', 'Failed', 'Could not send message.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredMessages = messages.filter(m => {
    const matchesSearch = m.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.from_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.to_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' ||
      (filter === 'inbox' && m.to === currentUserId) ||
      (filter === 'sent' && m.from === currentUserId)
    return matchesSearch && matchesFilter
  })

  const unreadCount = messages.filter(m => m.to === currentUserId && !m.read).length

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Internal Messages</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Communicate with staff and administrators.
            {unreadCount > 0 && <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">{unreadCount} unread</span>}
          </p>
        </div>
        <button onClick={() => setIsComposeOpen(true)} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 w-fit">
          <Plus className="w-5 h-5" /><span>Compose</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All', icon: Mail },
            { key: 'inbox', label: 'Inbox', icon: Inbox },
            { key: 'sent', label: 'Sent', icon: Send },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as any)} className={cn("flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all", filter === f.key ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50")}>
              <f.icon className="w-4 h-4" />{f.label}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input type="text" placeholder="Search messages..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800 dark:text-slate-200" />
        </div>
      </div>

      {/* Messages Layout */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
        {/* Message List */}
        <div className="w-full lg:w-1/2 space-y-2 overflow-y-auto max-h-[600px] invisible-scrollbar">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
          ) : filteredMessages.length === 0 ? (
            <div className="card-premium p-12 text-center text-slate-500">
              <Mail className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-bold">No messages found.</p>
            </div>
          ) : filteredMessages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelectedMessage(msg)}
              className={cn(
                "card-premium p-4 cursor-pointer transition-all hover:shadow-md",
                selectedMessage?.id === msg.id ? "border-primary/50 bg-blue-50/30 dark:bg-blue-900/10 shadow-md" : "",
                !msg.read && msg.to === currentUserId ? "border-l-4 border-l-primary" : ""
              )}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-pastel flex items-center justify-center text-xs font-bold text-primary">
                    {msg.from === currentUserId ? msg.to_name?.charAt(0) : msg.from_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                      {msg.from === currentUserId ? `To: ${msg.to_name}` : msg.from_name}
                    </p>
                    <p className="text-[10px] text-slate-400">{new Date(msg.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {!msg.read && msg.to === currentUserId && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 line-clamp-1">{msg.subject}</p>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{msg.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Message Detail */}
        <div className="w-full lg:w-1/2">
          {selectedMessage ? (
            <motion.div key={selectedMessage.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card-premium p-6 h-full flex flex-col">
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{selectedMessage.subject}</h2>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {selectedMessage.from_name}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(selectedMessage.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase",
                  selectedMessage.from === currentUserId ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
                )}>
                  {selectedMessage.from === currentUserId ? 'Sent' : 'Received'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedMessage.body}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 text-sm text-slate-400">
                {selectedMessage.from === currentUserId ? `Sent to ${selectedMessage.to_name}` : `From ${selectedMessage.from_name} to you`}
              </div>
            </motion.div>
          ) : (
            <div className="card-premium p-12 h-full flex flex-col items-center justify-center text-slate-400">
              <MailOpen className="w-16 h-16 mb-4 text-slate-300" />
              <p className="font-bold text-lg">Select a message</p>
              <p className="text-sm">Click a message from the list to view its contents.</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══ COMPOSE MODAL ═══ */}
      <AnimatePresence>
        {isComposeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsComposeOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
              <div className="px-6 py-5 border-b bg-gradient-to-r from-primary to-indigo-700 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">Compose Message</h2>
                <button onClick={() => setIsComposeOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSend} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">To <span className="text-red-500">*</span></label>
                  <select required value={composeForm.to} onChange={e => setComposeForm({...composeForm, to: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Select recipient...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subject <span className="text-red-500">*</span></label>
                  <input required value={composeForm.subject} onChange={e => setComposeForm({...composeForm, subject: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Message subject" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Message <span className="text-red-500">*</span></label>
                  <textarea required rows={5} value={composeForm.body} onChange={e => setComposeForm({...composeForm, body: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" placeholder="Write your message here..." />
                </div>
                <div className="pt-5 border-t flex justify-end gap-3">
                  <button type="button" onClick={() => setIsComposeOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send Message
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
