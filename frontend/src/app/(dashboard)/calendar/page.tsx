"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, MoreHorizontal, Clock, Plus } from 'lucide-react'

const agendaItems = [
  { id: 1, title: 'Big Day and Celebration Day', subtitle: '', time: 'All Day', type: 'purple', date: '8' },
  { id: 2, title: 'Subject Presentation & Exam', subtitle: '', time: '09:00 AM', type: 'blue', date: '8' },
  { id: 3, title: 'Fair, Exhibition & Performance', subtitle: '', time: '01:00 PM', type: 'green', date: '8' },
  { id: 4, title: 'Official Meeting', subtitle: '', time: '03:00 PM', type: 'yellow', date: '8' },

  { id: 5, title: 'Science Fair Setup', subtitle: 'Science Club', time: '08:00 AM', type: 'blue', date: '9' },
  { id: 6, title: 'Teacher Meeting', subtitle: 'All Teacher', time: '10:00 AM', type: 'yellow', date: '9' },
  { id: 7, title: 'Varsity Track Meet', subtitle: 'Track Team', time: '02:00 PM', type: 'purple', date: '9' },
  { id: 8, title: 'Parents Meeting', subtitle: 'Teacher and Parents', time: '05:00 PM', type: 'green', date: '9' },
]

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState('8')

  // Generate calendar mock matrix (May 2030 starts on Wed)
  // 1-31
  const days = []
  for (let i = 0; i < 3; i++) days.push(null) // Empty elements before Wed
  for (let i = 1; i <= 31; i++) days.push(i.toString())

  const getDayEvents = (d: string) => agendaItems.filter(item => item.date === d)

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">School Calendar</h1>
        <button className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-sm hover:bg-primary-hover transition-colors flex items-center gap-2">
           <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Calendar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 card-premium rounded-[24px] bg-white border-none shadow-sm p-8"
        >
          <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-4">
                <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100"><ChevronLeft className="w-4 h-4"/></button>
                <h2 className="text-xl font-bold text-slate-800">May 2030</h2>
                <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100"><ChevronRight className="w-4 h-4"/></button>
             </div>
             <button className="px-4 py-1.5 rounded-full border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Today</button>
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-xl overflow-hidden border border-slate-100">
             {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="bg-white p-3 text-xs font-bold text-slate-400 text-center tracking-wider">{day}</div>
             ))}
             {days.map((d, index) => {
               const isSelected = d === selectedDate
               const dayEvents = d ? getDayEvents(d) : []
               return (
                 <div 
                   key={index} 
                   onClick={() => d && setSelectedDate(d)}
                   className={`bg-white min-h-[100px] p-2 border-t border-slate-100 transition-colors ${d ? 'cursor-pointer hover:bg-slate-50/50' : ''} ${isSelected ? 'bg-blue-50/30' : ''}`}
                 >
                   {d && (
                     <>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${isSelected ? 'bg-primary text-white shadow-md' : 'text-slate-700'}`}>
                          {d}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.map(ev => (
                            <div key={ev.id} className={`text-[9px] font-bold px-2 py-1 rounded truncate shadow-sm 
                              ${ev.type === 'purple' ? 'bg-purple-100 text-purple-700' : 
                                ev.type === 'blue' ? 'bg-blue-100 text-blue-700' : 
                                ev.type === 'green' ? 'bg-green-100 text-green-700' : 
                                'bg-yellow-100 text-yellow-700'}
                            `}>
                              {ev.title}
                            </div>
                          ))}
                        </div>
                     </>
                   )}
                 </div>
               )
             })}
          </div>
        </motion.div>

        {/* Right Agenda */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-[350px] shrink-0 card-premium rounded-[24px] bg-white border-none shadow-sm p-6"
        >
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-lg font-bold text-slate-800">Agenda</h3>
             <button className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400">
                <MoreHorizontal className="w-5 h-5" />
             </button>
          </div>

          <div className="space-y-8">
            <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">May {selectedDate}, 2030</h4>
            
            <div className="space-y-6">
              {getDayEvents(selectedDate).length === 0 ? (
                <p className="text-sm text-slate-500 italic">No events scheduled for this day.</p>
              ) : getDayEvents(selectedDate).map(ev => (
                <div key={ev.id} className="relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-[-24px] before:w-px before:bg-slate-100 last:before:hidden">
                  <div className={`absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full border-4 border-white shadow-sm flex items-center justify-center
                    ${ev.type === 'purple' ? 'bg-purple-500' : 
                      ev.type === 'blue' ? 'bg-blue-500' : 
                      ev.type === 'green' ? 'bg-green-500' : 
                      'bg-yellow-500'}
                  `}/>
                  
                  <div className={`rounded-xl p-4 transition-all
                    ${ev.type === 'purple' ? 'bg-purple-50/50 hover:bg-purple-50' : 
                      ev.type === 'blue' ? 'bg-blue-50/50 hover:bg-blue-50' : 
                      ev.type === 'green' ? 'bg-green-50/50 hover:bg-green-50' : 
                      'bg-yellow-50/50 hover:bg-yellow-50'}
                  `}>
                    <p className="font-bold text-slate-800 text-sm leading-tight mb-1">{ev.title}</p>
                    {ev.subtitle && <p className="text-xs font-semibold text-slate-500 mb-2">{ev.subtitle}</p>}
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mt-2">
                       <Clock className="w-3.5 h-3.5" />
                       {ev.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
