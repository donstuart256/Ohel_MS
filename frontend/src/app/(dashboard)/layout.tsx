"use client"

import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import { ToastProvider } from "@/components/ui/ToastProvider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <div className="flex h-screen bg-bg-tertiary overflow-hidden font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-transparent">
          <Header />
          <main className="flex-1 overflow-y-auto p-8 lg:p-10 relative">
            <div className="w-full max-w-7xl mx-auto space-y-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
