"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Send, 
  MessageSquare, 
  Mail, 
  Search, 
  Users, 
  History,
  CheckCircle2,
  AlertTriangle,
  Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'

const recentLogs = [
  { id: 1, recipient: 'Secondary Parents', channel: 'SMS', status: 'Delivered', time: '10 mins ago' },
  { id: 2, recipient: 'All Staff', channel: 'Email', status: 'In Progress', time: '1 hour ago' },
  { id: 3, recipient: 'Kato Isaac', channel: 'SMS', status: 'Failed', time: 'Yesterday' },
]

export default function CommunicationsPage() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Communications Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Institutional-wide announcements, bulk messaging, and notification logs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Compose Section */}
         <div className="lg:col-span-2 space-y-6">
            <div className="card-premium p-8">
               <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" /> New Announcement
               </h2>
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-400 uppercase">Target Audience</label>
                     <div className="flex flex-wrap gap-2">
                        {['All Staff', 'All Parents', 'S.1 - S.4', 'Candidates'].map(group => (
                           <button key={group} className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-primary hover:text-white hover:border-primary transition-all">
                              {group}
                           </button>
                        ))}
                        <button className="px-4 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-400">
                           + Custom Group
                        </button>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-400 uppercase">Message Channel</label>
                     <div className="grid grid-cols-3 gap-4">
                        <button className="p-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-primary rounded-2xl flex flex-col items-center gap-2">
                           <MessageSquare className="w-5 h-5 text-primary" />
                           <span className="text-[10px] font-bold uppercase tracking-widest text-primary">In-App</span>
                        </button>
                        <button className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center gap-2">
                           <Bell className="w-5 h-5 text-slate-400" />
                           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">SMS</span>
                        </button>
                        <button className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center gap-2">
                           <Mail className="w-5 h-5 text-slate-400" />
                           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email</span>
                        </button>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-400 uppercase">Message Content</label>
                     <textarea rows={4} className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Type your message here..."></textarea>
                  </div>
                  <button className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                     Blast Message
                  </button>
               </div>
            </div>
         </div>

         {/* History Section */}
         <div className="space-y-6">
            <div className="card-premium p-6">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">Recent History</h2>
                  <History className="w-4 h-4 text-slate-300" />
               </div>
               <div className="space-y-4">
                  {recentLogs.map((log) => (
                     <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-1">
                           <p className="font-bold text-sm text-slate-700 dark:text-slate-200">{log.recipient}</p>
                           <span className={cn(
                             "text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
                             log.status === 'Delivered' ? "bg-green-100 text-green-700 dark:bg-green-900/20" :
                             log.status === 'Failed' ? "bg-red-100 text-red-700 dark:bg-red-900/20" :
                             "bg-blue-100 text-blue-700 dark:bg-blue-900/20"
                           )}>
                             {log.status}
                           </span>
                        </div>
                        <div className="flex items-center gap-2">
                           <p className="text-[10px] text-slate-400 font-bold">{log.channel} • {log.time}</p>
                           {log.status === 'Failed' && <AlertTriangle className="w-3 h-3 text-red-400" />}
                        </div>
                     </div>
                  ))}
               </div>
               <button className="w-full mt-6 text-xs font-bold text-primary hover:underline">View Full Logs</button>
            </div>

            <div className="card-premium p-6 bg-slate-900 text-white border-none">
               <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Delivery Stats
               </h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-xs text-slate-400">Monthly SMS Quota</span>
                     <span className="text-xs font-bold">12,400 / 15,000</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full">
                     <div className="h-full bg-primary w-[82%]" />
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
