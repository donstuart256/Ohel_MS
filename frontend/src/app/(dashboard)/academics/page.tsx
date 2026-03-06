"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  BookOpen,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const timeSlots = ['8:00 AM', '9:30 AM', '11:00 AM', '1:00 PM', '2:30 PM']

const schedule = [
  { day: 'Mon', time: '8:00 AM', subject: 'Mathematics', code: 'MATH-101', teacher: 'Mr. Kato', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
  { day: 'Mon', time: '11:00 AM', subject: 'English', code: 'ENG-202', teacher: 'Ms. Namuli', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' },
  { day: 'Wed', time: '9:30 AM', subject: 'Physics', code: 'PHY-301', teacher: 'Dr. Mukasa', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' },
  { day: 'Fri', time: '1:00 PM', subject: 'History', code: 'HIST-105', teacher: 'Mr. Okello', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' },
]

export default function AcademicsPage() {
  const [view, setView] = useState('timetable') // timetable, assessments

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Academic Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Curriculum, timetabling, and academic performance tracking.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setView('timetable')}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", view === 'timetable' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500")}
          >
            Timetable
          </button>
          <button
            onClick={() => setView('assessments')}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", view === 'assessments' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500")}
          >
            Assessments
          </button>
        </div>
      </div>

      {view === 'timetable' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">Class: S.4 West</h2>
              <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <button className="p-2 hover:bg-slate-50"><ChevronLeft className="w-4 h-4" /></button>
                <span className="px-4 text-sm font-medium border-x border-slate-200 dark:border-slate-700">Term 1, 2024</span>
                <button className="p-2 hover:bg-slate-50"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            <button className="bg-primary text-white p-2.5 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Timetable Grid */}
          <div className="card-premium overflow-hidden border-none shadow-xl">
            <div className="grid grid-cols-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="p-4 border-r border-slate-100 dark:border-slate-800 flex items-center justify-center">
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              {days.map(day => (
                <div key={day} className="p-4 text-center font-bold text-xs text-slate-500 uppercase tracking-widest border-r border-slate-100 dark:border-slate-800">
                  {day}
                </div>
              ))}
            </div>
            {timeSlots.map(time => (
              <div key={time} className="grid grid-cols-6 border-b border-slate-100 dark:border-slate-800 last:border-0 min-h-[100px]">
                <div className="p-4 border-r border-slate-100 dark:border-slate-800 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-400">{time}</span>
                </div>
                {days.map(day => {
                  const entry = schedule.find(s => s.day === day && s.time === time)
                  return (
                    <div key={day} className="p-2 border-r border-slate-100 dark:border-slate-800 last:border-0 relative">
                      {entry && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={cn("h-full w-full rounded-xl p-3 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all", entry.color)}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-xs">{entry.code}</span>
                            <MoreHorizontal className="w-3 h-3 opacity-50" />
                          </div>
                          <div>
                            <p className="font-bold text-sm block mt-1">{entry.subject}</p>
                            <p className="text-[10px] opacity-70 mt-1">{entry.teacher}</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Assessments List */}
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-premium p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">End of Term {i} Exam</h4>
                    <p className="text-sm text-slate-500">Subject: Integrated Science | Date: June {i + 10}, 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase">Avg. Grade</p>
                    <p className="text-lg font-black text-primary">B+</p>
                  </div>
                  <button className="text-sm font-bold bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">
                    View Detailed Marks
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
