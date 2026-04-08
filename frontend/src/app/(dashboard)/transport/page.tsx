"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Bus,
  Search,
  MapPin,
  Users,
  Clock,
  Navigation2,
  Phone,
  Banknote,
  Plus,
  Loader2
} from 'lucide-react'
import { fetchAPI } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function TransportPage() {
  const [routes, setRoutes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchAPI('logistics/transport/')
        setRoutes(res.results || res || [])
      } catch (err) {
        console.error("Failed to load transport routes", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Fleet & Transport</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage school routes, buses, and designated pick-up zones.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 w-fit">
          <Plus className="w-5 h-5" />
          <span>New Route</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6 flex justify-between items-start">
           <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Routes</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : routes.length}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600">
              <Navigation2 className="w-6 h-6" />
            </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-premium p-6 flex justify-between items-start">
           <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">School Buses utilized</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : routes.length}
              </h3>
            </div>
            <div className="p-3 bg-purple-pastel rounded-xl text-primary">
              <Bus className="w-6 h-6" />
            </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-premium p-6 flex justify-between items-start">
           <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Designated Stops</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : routes.reduce((acc, r) => acc + (r.stops?.length || 0), 0)}
              </h3>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-xl text-orange-600">
              <MapPin className="w-6 h-6" />
            </div>
        </motion.div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
         <input
            type="text"
            placeholder="Search routes by name, driver, or vehicle number..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800 dark:text-slate-200"
         />
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
             <div className="col-span-full py-12 text-center text-slate-500">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" /> Loading transport routes...
             </div>
        ) : routes.length === 0 ? (
             <div className="col-span-full py-12 text-center text-slate-500 card-premium">
                No active routes found in the database.
             </div>
        ) : routes.map((route, i) => (
           <motion.div 
             initial={{ opacity: 0, scale: 0.98 }} 
             animate={{ opacity: 1, scale: 1 }} 
             transition={{ delay: i * 0.05 }}
             key={route.id} 
             className="card-premium flex flex-col overflow-hidden"
           >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50 dark:bg-slate-900/50">
                 <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <MapPin className="w-5 h-5 text-secondary" /> {route.name}
                    </h3>
                    <div className="flex gap-4 mt-2">
                      <span className="flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-400">
                         <Bus className="w-4 h-4" /> {route.vehicle_number}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-400">
                         <Banknote className="w-4 h-4" /> UGX {Number(route.monthly_fee).toLocaleString()}/mo
                      </span>
                    </div>
                 </div>
                 <div className="text-right">
                    <span className="bg-green-pastel text-green-700 font-bold px-3 py-1 rounded-full text-[10px] uppercase">Active</span>
                 </div>
              </div>

              <div className="p-6 flex-1">
                 <div className="flex items-center gap-3 mb-6 bg-purple-50 dark:bg-slate-800 p-3 rounded-lg border border-purple-100 dark:border-slate-700">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                       <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">Primary Driver</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                         {route.driver_name}
                         <span className="text-slate-400 font-normal">({route.driver_phone})</span>
                      </p>
                    </div>
                 </div>

                 <p className="text-xs font-bold text-slate-500 uppercase mb-3">Designated Stops ({route.stops?.length || 0})</p>
                 <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                    {route.stops?.map((stop: any, idx: number) => (
                       <div key={stop.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 bg-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center group-hover:border-primary/50 transition-colors">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{stop.stop_name}</span>
                            <span className="text-xs font-bold text-slate-500 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-sm">
                               <Clock className="w-3 h-3" /> {stop.pickup_time.substring(0, 5)}
                            </span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </motion.div>
        ))}
      </div>
    </div>
  )
}
