"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  UserCheck,
  CreditCard,
  TrendingUp,
  Megaphone,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { getDashboardSummary, DashboardSummary } from '@/lib/api'

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getDashboardSummary()
        setData(res)
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <p>{error || 'Failed to load data'}</p>
      </div>
    )
  }

  const kpis = [
    {
      name: 'Total Students',
      value: data.students.total.toLocaleString(),
      change: `${data.students.enrolled} Enrolled`,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Staff / Teachers',
      value: `${data.staff.teachers} / ${data.staff.total}`,
      change: 'Active',
      icon: UserCheck,
      color: 'bg-green-500'
    },
    {
      name: 'Fees Collected',
      value: `UGX ${(parseInt(data.finance.total_collected || '0') / 1000000).toFixed(1)}M`,
      change: `${data.finance.collection_rate}% Rate`,
      icon: CreditCard,
      color: 'bg-orange-500'
    },
    {
      name: 'Today\'s Attendance',
      value: `${data.attendance.today_rate}%`,
      change: `${data.attendance.today_present}/${data.attendance.today_total} Present`,
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-slate-900 dark:text-white"
        >
          Institutional Overview
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 dark:text-slate-400 mt-1"
        >
          Welcome back. Here's what's happening today.
        </motion.p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="card-premium p-6 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className={`w-12 h-12 ${kpi.color} rounded-xl flex items-center justify-center text-white shadow-lg shadow-current/20`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
                {kpi.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.name}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{kpi.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Announcements */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1 card-premium p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Megaphone className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Announcements</h2>
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto invisible-scrollbar">
            {data.announcements.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No recent announcements</p>
            ) : data.announcements.map((ann) => (
              <div key={ann.id} className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{ann.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{ann.content}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Weekly Attendance Chart (CSS Only) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 card-premium p-6 flex flex-col min-h-[300px]"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Weekly Attendance Rate</h2>
          <div className="flex-1 w-full flex items-end justify-between gap-2 px-2 pb-4 pt-12 border-b-2 border-slate-100 dark:border-slate-800 relative">
            {/* Guide lines */}
            <div className="absolute top-0 w-full flex items-center gap-2">
              <span className="text-xs text-slate-400 w-8">100%</span>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="absolute top-1/2 w-full flex items-center gap-2">
              <span className="text-xs text-slate-400 w-8">50%</span>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            </div>

            <div className="w-10 shrink-0" /> {/* Spacer for Y-axis labels */}

            {data.attendance.weekly.map((day) => (
              <div key={day.date} className="flex flex-col items-center flex-1 z-10 group h-full justify-end">
                <div className="w-full flex justify-center mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded shadow-sm">
                    {day.rate}%
                  </span>
                </div>
                <div
                  className="w-full max-w-[64px] bg-primary dark:bg-primary rounded-t-lg transition-all duration-500 ease-out hover:bg-primary-hover"
                  style={{ height: `${day.rate}%`, minHeight: '4px' }}
                />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-3 absolute -bottom-6">{day.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
