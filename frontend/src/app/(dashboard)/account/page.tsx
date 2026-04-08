"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { UserCircle, Mail, Phone, Shield, Key, Save, Loader2, GraduationCap, Camera } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'

export default function AccountPage() {
  const { addToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')
  const [profile, setProfile] = useState({
    first_name: 'System',
    last_name: 'Administrator',
    username: 'admin@edupro.ug',
    email: 'admin@edupro.ug',
    phone: '+256770000001',
    role: 'ADMIN',
    bio: 'School system administrator managing all modules and user accounts.',
  })
  const [security, setSecurity] = useState({ current_password: '', new_password: '', confirm_password: '' })

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile.first_name || !profile.last_name || !profile.email) {
      addToast('warning', 'Validation', 'Name and email are required.')
      return
    }
    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 800))
    addToast('success', 'Profile Updated', 'Your profile information has been saved successfully.')
    setIsSubmitting(false)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!security.current_password || !security.new_password) {
      addToast('warning', 'Validation', 'Please fill in all password fields.')
      return
    }
    if (security.new_password !== security.confirm_password) {
      addToast('error', 'Mismatch', 'New password and confirmation do not match.')
      return
    }
    if (security.new_password.length < 8) {
      addToast('warning', 'Weak Password', 'Password must be at least 8 characters long.')
      return
    }
    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 800))
    addToast('success', 'Password Changed', 'Your password has been updated successfully.')
    setSecurity({ current_password: '', new_password: '', confirm_password: '' })
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Account</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your personal details and security settings.</p>
      </div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-primary/20">
            {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-slate-700 rounded-full shadow-lg flex items-center justify-center border border-slate-200 dark:border-slate-600 hover:bg-slate-50 transition-colors">
            <Camera className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{profile.first_name} {profile.last_name}</h2>
          <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2 mt-1">
            <Mail className="w-4 h-4" /> {profile.email}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-purple-pastel text-primary flex items-center gap-1">
              <Shield className="w-3 h-3" /> {profile.role}
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-green-pastel text-green-700 flex items-center gap-1">
              <GraduationCap className="w-3 h-3" /> Active
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('profile')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'}`}>
          <UserCircle className="w-4 h-4 inline mr-2" />Profile
        </button>
        <button onClick={() => setActiveTab('security')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'}`}>
          <Key className="w-4 h-4 inline mr-2" />Security
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6">
          <form onSubmit={handleProfileSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">First Name <span className="text-red-500">*</span></label>
                <input required value={profile.first_name} onChange={e => setProfile({...profile, first_name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Last Name <span className="text-red-500">*</span></label>
                <input required value={profile.last_name} onChange={e => setProfile({...profile, last_name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input required type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Bio</label>
              <textarea rows={3} value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>
            <div className="pt-4 border-t flex justify-end">
              <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Current Password <span className="text-red-500">*</span></label>
              <input required type="password" value={security.current_password} onChange={e => setSecurity({...security, current_password: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">New Password <span className="text-red-500">*</span></label>
                <input required type="password" minLength={8} value={security.new_password} onChange={e => setSecurity({...security, new_password: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Min 8 characters" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Confirm Password <span className="text-red-500">*</span></label>
                <input required type="password" value={security.confirm_password} onChange={e => setSecurity({...security, confirm_password: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Re-enter password" />
              </div>
            </div>
            <div className="pt-4 border-t flex justify-end">
              <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />} Update Password
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  )
}
