import { useState, useEffect } from 'react'
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Upload, Users,
  Settings, LogOut, ChevronLeft, Menu
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/documents',  icon: FileText,         label: 'Documents' },
  { to: '/upload',     icon: Upload,            label: 'Upload' },
]

const ADMIN_ITEMS = [
  { to: '/users', icon: Users, label: 'Users' },
]

const BOTTOM_ITEMS = [
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function AppLayout() {
  const { user, loading, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile nav on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Mobile overlay ───────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={`
          flex-shrink-0 bg-white border-r border-gray-100 flex flex-col
          fixed inset-y-0 left-0 z-30 shadow-xl lg:shadow-none
          lg:relative lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform lg:transition-none
        `}
        style={{ width: collapsed ? 64 : 240 }}
      >
        {/* Logo row */}
        <div className="flex items-center h-16 px-4 border-b border-gray-100 gap-3 flex-shrink-0 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          {!collapsed && (
            <span className="font-bold text-gray-900 text-base truncate flex-1">VaultFlow</span>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="ml-auto text-gray-400 hover:text-gray-600 hidden lg:flex flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft
              size={16}
              className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 px-2 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map(item => (
            <SidebarLink key={item.to} {...item} collapsed={collapsed} />
          ))}

          {user.role === 'ADMIN' && (
            <>
              <div className="my-2">
                {!collapsed && (
                  <p className="px-3 pt-1 pb-1 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Admin
                  </p>
                )}
                {collapsed && <div className="border-t border-gray-100 mx-2" />}
              </div>
              {ADMIN_ITEMS.map(item => (
                <SidebarLink key={item.to} {...item} collapsed={collapsed} />
              ))}
            </>
          )}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-gray-100 py-3 px-2 flex flex-col gap-0.5">
          {BOTTOM_ITEMS.map(item => (
            <SidebarLink key={item.to} {...item} collapsed={collapsed} />
          ))}

          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg text-sm
              text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut size={18} />
            {!collapsed && 'Logout'}
          </button>

          {/* User info chip */}
          {!collapsed && (
            <div className="px-3 py-2 mt-1">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
                  <span className="text-brand-700 text-xs font-semibold">
                    {user.email?.[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{user.email}</p>
                  <p className="text-xs text-gray-400">{user.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center h-14 px-4 bg-white border-b border-gray-100 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-gray-500 hover:text-gray-900 mr-3"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="font-bold text-gray-900">VaultFlow</span>
          </div>
        </div>

        {/* Page area */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

// ─── SidebarLink ──────────────────────────────────────────────────────────────
function SidebarLink({ to, icon: Icon, label, collapsed }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
        ${collapsed ? 'justify-center' : ''}
        ${isActive
          ? 'bg-brand-50 text-brand-700 font-medium'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
      `}
    >
      <Icon size={18} className="flex-shrink-0" />
      {!collapsed && label}
    </NavLink>
  )
}
