import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminHeader } from '../components/admin/AdminHeader'
import { AdminSidebar } from '../components/admin/AdminSidebar'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar'

type DashboardLayoutProps = {
  variant?: 'voter' | 'admin'
}

export function DashboardLayout({ variant = 'voter' }: DashboardLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isAdmin = variant === 'admin'

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop Persistent Fixed Sidebar */}
      <aside className="hidden w-64 md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:flex-col border-r border-white/10 bg-navy shadow-xl">
        {isAdmin ? <AdminSidebar /> : <DashboardSidebar />}
      </aside>

      {/* Mobile Drawer */}
      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <button
            type="button"
            className="fixed inset-0 bg-navy/60 backdrop-blur-sm transition-opacity"
            aria-label={isAdmin ? 'Close admin menu' : 'Close dashboard menu'}
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative z-10 h-full w-72 max-w-[85vw] shadow-2xl bg-navy">
            {isAdmin ? (
              <AdminSidebar onNavigate={() => setMenuOpen(false)} />
            ) : (
              <DashboardSidebar onNavigate={() => setMenuOpen(false)} />
            )}
          </div>
        </div>
      ) : null}

      {/* Main Content Scroll Container */}
      <div className="flex min-h-screen flex-col md:pl-64">
        <header className="sticky top-0 z-20">
          {isAdmin ? (
            <AdminHeader onMenuClick={() => setMenuOpen(true)} />
          ) : (
            <DashboardHeader onMenuClick={() => setMenuOpen(true)} />
          )}
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
