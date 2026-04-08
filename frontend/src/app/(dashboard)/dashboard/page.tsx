"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  MoreHorizontal, ChevronLeft, ChevronRight, UserCheck, Users, TrendingUp, GraduationCap, Wallet
} from 'lucide-react'
import { getDashboardSummary, DashboardSummary } from '@/lib/api'
import { useToast } from '@/components/ui/ToastProvider'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts'

function getCalendarData(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
  const todayDate = isCurrentMonth ? today.getDate() : -1
  const days: { day: number; isCurrentMonth: boolean; isToday: boolean }[] = []
  for (let i = firstDay - 1; i >= 0; i--) days.push({ day: daysInPrev - i, isCurrentMonth: false, isToday: false })
  for (let i = 1; i <= daysInMonth; i++) days.push({ day: i, isCurrentMonth: true, isToday: i === todayDate })
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) days.push({ day: i, isCurrentMonth: false, isToday: false })
  return days
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function DashboardPage() {
  const { addToast } = useToast()
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getDashboardSummary()
        setData(res)
      } catch { }
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading || !data) {
    return <div className="animate-pulse flex gap-6 p-6 h-full bg-bg-tertiary" />
  }

  const calDays = getCalendarData(calYear, calMonth)
  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) } else setCalMonth(m => m - 1) }
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) } else setCalMonth(m => m + 1) }

  const pieData = [
    { name: 'Boys', value: Math.round(data.students.total * 0.47), color: '#60A5FA' },
    { name: 'Girls', value: Math.round(data.students.total * 0.53), color: '#FCD34D' }
  ]

  const barData = data.attendance.weekly.map(w => ({
    name: w.day, present: w.rate, absent: 100 - w.rate
  }))

  const collectionRate = data.finance.collection_rate
  const lineData = [
    { name: 'Jan', income: 400, expense: 240 },
    { name: 'Feb', income: 300, expense: 139 },
    { name: 'Mar', income: Number(data.finance.total_collected) / 1000000 || 425, expense: (Number(data.finance.total_billed) - Number(data.finance.total_collected)) / 1000000 || 75 },
    { name: 'Apr', income: 278, expense: 190 },
    { name: 'May', income: 189, expense: 280 },
    { name: 'Jun', income: 239, expense: 180 },
  ]

  return (
    <div className="flex flex-col xl:flex-row gap-8 w-full">
      <div className="flex-1 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-purple-pastel rounded-[20px] p-5">
            <div className="flex justify-between items-start mb-2">
              <span className="text-3xl font-bold text-slate-800 tracking-tight">{data.students.total.toLocaleString()}</span>
              <button onClick={() => addToast('info', 'Students', `${data.students.enrolled} currently enrolled students.`)}><MoreHorizontal className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p className="text-sm text-slate-600 font-medium">Students</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-yellow-pastel rounded-[20px] p-5">
            <div className="flex justify-between items-start mb-2">
              <span className="text-3xl font-bold text-slate-800 tracking-tight">{data.staff.teachers.toLocaleString()}</span>
              <button onClick={() => addToast('info', 'Teachers', `${data.staff.teachers} active teaching staff across all departments.`)}><MoreHorizontal className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p className="text-sm text-slate-600 font-medium">Teachers</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-purple-pastel rounded-[20px] p-5">
            <div className="flex justify-between items-start mb-2">
              <span className="text-3xl font-bold text-slate-800 tracking-tight">{data.staff.total.toLocaleString()}</span>
              <button onClick={() => addToast('info', 'Staff', `Total staff includes ${data.staff.teachers} teachers and ${data.staff.total - data.staff.teachers} support staff.`)}><MoreHorizontal className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p className="text-sm text-slate-600 font-medium">Staffs</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-yellow-pastel rounded-[20px] p-5">
            <div className="flex justify-between items-start mb-2">
              <span className="text-3xl font-bold text-slate-800 tracking-tight">{collectionRate}%</span>
              <button onClick={() => addToast('info', 'Collection Rate', `UGX ${(Number(data.finance.total_collected) / 1000000).toFixed(1)}M collected of UGX ${(Number(data.finance.total_billed) / 1000000).toFixed(1)}M billed.`)}><MoreHorizontal className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p className="text-sm text-slate-600 font-medium">Fee Collection</p>
          </motion.div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-premium rounded-[24px] p-6 border-none shadow-sm md:col-span-1 flex flex-col items-center relative">
            <div className="w-full flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg dark:text-white">Students</h3>
              <button onClick={() => addToast('info', 'Students', `${pieData[0].value.toLocaleString()} boys and ${pieData[1].value.toLocaleString()} girls.`)}><MoreHorizontal className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="relative w-full h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between w-full mt-4">
              <div className="text-center">
                <p className="text-lg font-bold text-slate-800 dark:text-white">{pieData[0].value.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Boys (47%)</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-800 dark:text-white">{pieData[1].value.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Girls (53%)</p>
              </div>
            </div>
          </div>

          <div className="card-premium rounded-[24px] p-6 border-none shadow-sm md:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg dark:text-white">Attendance</h3>
              <div className="flex items-center gap-4 hidden sm:flex">
                <div className="flex items-center gap-2 text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-blue-400" /> Total Present</div>
                <div className="flex items-center gap-2 text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-yellow-400" /> Total Absent</div>
              </div>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="present" fill="#60A5FA" radius={[4, 4, 4, 4]} barSize={12} />
                  <Bar dataKey="absent" fill="#FBBF24" radius={[4, 4, 4, 4]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-premium rounded-[24px] p-6 border-none shadow-sm md:col-span-2">
            <div className="flex items-center gap-6 mb-6">
              <h3 className="font-bold text-lg dark:text-white">Earnings</h3>
              <div className="flex items-center gap-4 text-xs font-medium border border-border-color rounded-full px-3 py-1">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400"/>Income</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-400"/>Expense</div>
              </div>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="income" stroke="#60A5FA" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="expense" stroke="#A78BFA" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="card-premium rounded-[24px] p-5 border-none shadow-sm flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center"><UserCheck className="w-5 h-5 text-primary" /></div>
                <button onClick={() => addToast('info', 'Attendance', `Today's attendance rate: ${data.attendance.today_rate}%`)}><MoreHorizontal className="w-5 h-5 text-slate-400" /></button>
              </div>
              <p className="text-2xl font-bold mt-2 text-slate-800 dark:text-white">{data.attendance.today_present.toLocaleString()}</p>
              <p className="text-sm font-medium text-slate-500">Present Today</p>
              <div className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/20 w-max px-2 py-0.5 rounded mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {data.attendance.today_rate}%
              </div>
            </div>
            <div className="card-premium rounded-[24px] p-5 border-none shadow-sm flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center"><Wallet className="w-5 h-5 text-yellow-500" /></div>
                <button onClick={() => addToast('info', 'Revenue', `UGX ${(Number(data.finance.total_collected) / 1000000).toFixed(1)}M collected this term.`)}><MoreHorizontal className="w-5 h-5 text-slate-400" /></button>
              </div>
              <p className="text-2xl font-bold mt-2 text-slate-800 dark:text-white">UGX {(Number(data.finance.total_collected) / 1000000).toFixed(0)}M</p>
              <p className="text-sm font-medium text-slate-500">Revenue Collected</p>
              <div className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/20 w-max px-2 py-0.5 rounded mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {collectionRate}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full xl:w-[320px] shrink-0 space-y-6">
        {/* Calendar Widget — DYNAMIC */}
        <div className="card-premium rounded-[24px] p-6 border-none shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"><ChevronLeft className="w-4 h-4"/></button>
            <h4 className="font-bold text-slate-800 dark:text-white">{MONTHS[calMonth]} {calYear}</h4>
            <button onClick={nextMonth} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"><ChevronRight className="w-4 h-4"/></button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-400 mb-2">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          <div className="grid grid-cols-7 text-center text-sm font-bold gap-y-2">
            {calDays.map((d, i) => (
              <div key={i} className={
                d.isToday ? 'bg-primary text-white rounded-full w-7 h-7 mx-auto flex items-center justify-center' :
                d.isCurrentMonth ? 'text-slate-700 dark:text-slate-300 w-7 h-7 mx-auto flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors' :
                'text-slate-300 dark:text-slate-600 w-7 h-7 mx-auto flex items-center justify-center'
              }>{d.day}</div>
            ))}
          </div>
        </div>

        {/* Agenda Widget */}
        <div className="card-premium rounded-[24px] p-6 border-none shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-lg text-slate-800 dark:text-white">Agenda</h4>
            <button onClick={() => addToast('info', 'Agenda', 'Full agenda view coming soon.')} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {(data.announcements || []).slice(0, 3).map((a, i) => {
              const colors = ['bg-purple-pastel text-purple-600', 'bg-yellow-pastel text-yellow-600', 'bg-green-pastel text-green-600']
              return (
                <div key={a.id} className="flex gap-4">
                  <span className="text-xs font-bold text-slate-400 w-12 pt-1 shrink-0">{['08:00', '10:00', '10:30'][i]} am</span>
                  <div className={`flex-1 ${['bg-purple-pastel', 'bg-yellow-pastel border border-yellow-100', 'bg-green-pastel'][i]} rounded-xl p-3`}>
                    <p className={`text-[10px] font-bold uppercase mb-1 ${colors[i]?.split(' ')[1] || 'text-slate-600'}`}>Announcement</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-900">{a.title}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
