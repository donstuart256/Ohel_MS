"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bus, 
  Home, 
  MapPin, 
  Users, 
  AlertCircle,
  Plus,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

const routes = [
  { name: 'Kla-North (Kasubi)', vehicle: 'UAY 827P', seats: '28/30', fee: '150,000' },
  { name: 'Entebbe Road', vehicle: 'UBE 102M', seats: '12/14', fee: '250,000' },
]

const hostels = [
  { name: 'Nightingale Hall', type: 'GIRLS', rooms: 40, taken: 38 },
  { name: 'Mandela Wing', type: 'BOYS', rooms: 50, taken: 42 },
]

export default function LogisticsPage() {
  const [activeTab, setActiveTab] = useState('transport')

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Logistics & Facilities</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Transport routes, fleet management, and hostel allocations.</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20">
             <Plus className="w-4 h-4" />
             New Entry
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('transport')}
          className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2", activeTab === 'transport' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500")}
        >
          <Bus className="w-4 h-4" /> Transport
        </button>
        <button 
          onClick={() => setActiveTab('hostel')}
          className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2", activeTab === 'hostel' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500")}
        >
          <Home className="w-4 h-4" /> Hostel
        </button>
      </div>

      {activeTab === 'transport' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {routes.map((route, i) => (
             <motion.div 
               key={route.name}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               className="card-premium p-6"
             >
                <div className="flex justify-between items-start mb-6">
                   <div className="flex gap-4">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
                         <Bus className="w-6 h-6" />
                      </div>
                      <div>
                         <h3 className="font-bold text-lg">{route.name}</h3>
                         <p className="text-xs text-slate-500">{route.vehicle} • Van Service</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-bold">UGX {route.fee}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Per Month</p>
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>Occupancy</span>
                      <span className="text-slate-900 dark:text-white">{route.seats} Students</span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[90%]" />
                   </div>
                </div>
                <button className="w-full mt-6 py-3 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2">
                   View Stops & Tracking <MapPin className="w-3 h-3" />
                </button>
             </motion.div>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {hostels.map((hostel, i) => (
             <motion.div 
               key={hostel.name}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="card-premium p-6 flex flex-col justify-between"
             >
                <div className="flex justify-between items-start">
                   <div className="flex gap-4">
                      <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600">
                         <Home className="w-6 h-6" />
                      </div>
                      <div>
                         <h3 className="font-bold text-lg">{hostel.name}</h3>
                         <p className="text-xs text-slate-500">{hostel.type} HOSTEL • Warden: Ms. Namutoke</p>
                      </div>
                   </div>
                   <button className="p-2 border border-slate-100 dark:border-slate-800 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-slate-400" />
                   </button>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Rooms</p>
                      <p className="text-2xl font-black">{hostel.rooms}</p>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Available</p>
                      <p className="text-2xl font-black text-primary">{hostel.rooms - hostel.taken}</p>
                   </div>
                </div>
                <button className="w-full mt-6 bg-slate-900 dark:bg-slate-700 text-white py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                   Manage Allocations <Users className="w-4 h-4" />
                </button>
             </motion.div>
           ))}
        </div>
      )}
    </div>
  )
}
