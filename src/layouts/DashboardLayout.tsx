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
    <div className="flex min-h-dvh bg-surface">
      <aside className="hidden w-64 shrink-0 md:flex md:flex-col">
        {isAdmin ? <AdminSidebar /> : <DashboardSidebar />}
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-navy/40"
            aria-label={isAdmin ? 'Close admin menu' : 'Close dashboard menu'}
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative h-full w-72 max-w-[85vw] shadow-lg">
            {isAdmin ? (
              <AdminSidebar onNavigate={() => setMenuOpen(false)} />
            ) : (
              <DashboardSidebar onNavigate={() => setMenuOpen(false)} />
            )}
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {isAdmin ? (
          <AdminHeader onMenuClick={() => setMenuOpen(true)} />
        ) : (
          <DashboardHeader onMenuClick={() => setMenuOpen(true)} />
        )}
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
