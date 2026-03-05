import Sidebar from "@/components/layout/Sidebar"
import DarkModeToggle from "@/components/layout/DarkModeToggle"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative bg-bg-primary dark:bg-slate-950 p-6">
        <div className="absolute top-4 right-6 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full border border-slate-200 dark:border-slate-800 p-1 shadow-sm">
          <DarkModeToggle />
        </div>
        <div className="max-w-7xl mx-auto space-y-6 pt-10">
          {children}
        </div>
      </main>
    </div>
  )
}
