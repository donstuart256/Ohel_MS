"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserSquare2,
  BookOpen,
  UserCircle,
  Presentation,
  BookMarked,
  CalendarDays,
  ClipboardList,
  FileText,
  Bell,
  Bus,
  Home,
  GraduationCap,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wallet
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { clearTokens } from '@/lib/api'

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Students', icon: Users, href: '/students' },
  { name: 'Teachers', icon: UserSquare2, href: '/teachers' },
  { name: 'Finance', icon: Wallet, href: '/finance' },
  { name: 'Library', icon: BookOpen, href: '/library' },
  { name: 'Class', icon: Presentation, href: '/class' },
  { name: 'Subject', icon: BookMarked, href: '/subject' },
  { name: 'Routine', icon: CalendarDays, href: '/routine' },
  { name: 'Attendance', icon: ClipboardList, href: '/attendance' },
  { name: 'Exam', icon: FileText, href: '/exam' },
  { name: 'Notice', icon: Bell, href: '/communications' },
  { name: 'Transport', icon: Bus, href: '/transport' },
  { name: 'Hostel', icon: Home, href: '/hostel' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    clearTokens()
    router.push('/login')
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="h-screen bg-bg-secondary border-r border-border-color flex flex-col relative transition-all duration-300 z-50 shrink-0"
    >
      {/* Brand Header */}
      <div className="px-6 py-6 flex items-center gap-3 overflow-hidden">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-primary">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-bold text-lg tracking-tight text-slate-900 dark:text-white whitespace-nowrap"
          >
            EduPro SMS
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto invisible-scrollbar pb-6">
        <div>
          {!collapsed && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">Menu</p>}
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/dashboard')
              return (
                <Link key={item.name} href={item.href}>
                  <div className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                    isActive
                      ? "bg-purple-100 text-purple-700 font-bold shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary font-medium"
                  )}>
                    <item.icon className={cn("w-4 h-4 shrink-0 transition-transform", isActive ? "text-purple-700 scale-110" : "group-hover:scale-110")} />
                    {!collapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                    {isActive && (
                      <motion.div layoutId="active-pill" className="absolute -left-4 w-1 h-6 rounded-r-md bg-purple-600" />
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <div>
          {!collapsed && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">Other</p>}
          <div className="space-y-1">
            <Link href="/account">
              <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary font-medium transition-colors group">
                <UserCircle className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
                {!collapsed && <span>Profile</span>}
              </div>
            </Link>
            <Link href="/settings">
              <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary font-medium transition-colors group">
                <Settings className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
                {!collapsed && <span>Settings</span>}
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 font-medium transition-colors group mt-4"
            >
              <LogOut className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
              {!collapsed && <span>Log out</span>}
            </button>
          </div>
        </div>

        {/* Promo Card */}
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 mb-4 mx-2 rounded-2xl overflow-hidden relative shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 mix-blend-multiply opacity-90" />
            <img 
              src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=200&auto=format&fit=crop" 
              className="absolute inset-0 w-full h-full object-cover" 
              alt="Promo background"
            />
            <div className="relative p-5 z-10">
              <h4 className="text-white font-bold text-sm leading-tight mb-4">Let's Manage Your Data Better In Your Hand</h4>
              <button className="bg-white text-xs font-bold px-3 py-2 rounded-lg text-primary shadow-sm hover:bg-blue-50 transition-colors">
                Download the App
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-sm hover:bg-primary-light hover:text-primary transition-all z-[60] text-slate-400"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  )
}
