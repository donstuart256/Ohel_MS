"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Home,
  BedDouble,
  Users,
  Search,
  Plus,
  Filter,
  ShieldCheck,
  Building2,
  Loader2
} from 'lucide-react'
import { fetchAPI } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function HostelPage() {
  const [hostels, setHostels] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [hostelRes, roomRes] = await Promise.all([
          fetchAPI('logistics/hostels/'),
          fetchAPI('logistics/rooms/')
        ])
        setHostels(hostelRes.results || hostelRes || [])
        setRooms(roomRes.results || roomRes || [])
      } catch (err) {
        console.error("Failed to load hostel data", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const totalCapacity = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0)
  const currentOccupancy = rooms.reduce((acc, r) => acc + (r.occupancy || 0), 0)

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Hostel & Boarding</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage dormitory capacities, room assignments, and warden staff.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 w-fit">
          <Plus className="w-5 h-5" />
          <span>Add Hostel</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Hostels</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : hostels.length}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-premium p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Rooms</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : rooms.length}
              </h3>
            </div>
            <div className="p-3 bg-purple-pastel rounded-xl text-primary">
              <BedDouble className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-premium p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Overall Occupancy</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : `${currentOccupancy} / ${totalCapacity}`}
              </h3>
            </div>
            <div className="p-3 bg-green-pastel rounded-xl text-green-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
             <div 
               className="bg-green-500 h-full rounded-full transition-all duration-1000" 
               style={{ width: `${totalCapacity > 0 ? (currentOccupancy / totalCapacity) * 100 : 0}%` }} 
             />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hostels List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-4">
             <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search hostels..."
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800 dark:text-slate-200"
                />
             </div>
             <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all font-semibold">
                <Filter className="w-5 h-5" />
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
                <div className="col-span-full py-12 text-center text-slate-500 card-premium">
                   <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" /> Loading hostels...
                </div>
            ) : hostels.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 card-premium">
                   No hostels configured.
                </div>
            ) : hostels.map((hostel, i) => {
               const hostelRooms = rooms.filter(r => r.hostel === hostel.id)
               const hCap = hostelRooms.reduce((acc, r) => acc + (r.capacity || 0), 0)
               const hOcc = hostelRooms.reduce((acc, r) => acc + (r.occupancy || 0), 0)
               
               return (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.98 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   transition={{ delay: i * 0.05 }}
                   key={hostel.id} 
                   className="card-premium p-6 group cursor-pointer hover:border-primary/30 transition-all"
                 >
                   <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-slate-800 text-primary flex items-center justify-center shrink-0">
                         <Home className="w-6 h-6" />
                      </div>
                      <span className={cn(
                        "px-3 py-1 text-[10px] font-black uppercase rounded-full",
                        hostel.gender_served === 'GIRLS' ? "bg-pink-100 text-pink-700" :
                        hostel.gender_served === 'BOYS' ? "bg-blue-100 text-blue-700" :
                        "bg-green-pastel text-green-700"
                      )}>
                         {hostel.gender_served}
                      </span>
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{hostel.name}</h3>
                   
                   <div className="flex items-center gap-2 mb-6">
                      <ShieldCheck className="w-4 h-4 text-slate-400" />
                      <p className="text-sm text-slate-500">Warden: <span className="font-bold text-slate-700 dark:text-slate-300">{hostel.warden_name || 'Unassigned'}</span></p>
                   </div>

                   <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                         <span className="text-slate-500 font-bold">Occupancy</span>
                         <span className="text-slate-800 dark:text-slate-200 font-bold">{hOcc} / {hCap}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                         <div 
                           className={cn("h-full rounded-full transition-all duration-1000", hOcc >= hCap ? "bg-red-500" : "bg-primary")}
                           style={{ width: `${hCap > 0 ? (hOcc / hCap) * 100 : 0}%` }} 
                         />
                      </div>
                   </div>
                 </motion.div>
               )
            })}
          </div>
        </div>

        {/* Recent Rooms Sidebar */}
        <div className="lg:col-span-1">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card-premium border-none shadow-xl sticky top-6">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-secondary to-orange-500 rounded-t-xl text-white">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <BedDouble className="w-5 h-5" /> Recent Room Updates
              </h3>
            </div>
            <div className="p-0">
              {loading ? (
                 <div className="p-8 text-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
              ) : rooms.length === 0 ? (
                 <div className="p-8 text-center text-slate-500">No rooms generated.</div>
              ) : rooms.slice(0, 6).map((room, idx) => {
                 const isFull = room.occupancy >= room.capacity
                 return (
                 <div key={room.id} className="flex flex-col gap-2 p-5 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                   <div className="flex justify-between items-center">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        Room {room.room_number}
                        {isFull && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] uppercase font-black">Full</span>}
                      </h4>
                      <span className="text-xs font-bold text-slate-500">{room.occupancy}/{room.capacity} Beds</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 truncate max-w-[150px]">{room.hostel_name || 'Assigned Hostel'}</span>
                      <span className="font-mono text-primary font-bold">UGX {(Number(room.fee_per_term)/1000).toFixed(0)}k</span>
                   </div>
                 </div>
               )})}
            </div>
             <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl text-center">
                 <button className="text-sm font-bold text-secondary hover:text-secondary-hover">View Room Matrix</button>
              </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
