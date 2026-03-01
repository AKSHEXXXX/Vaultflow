import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Shield, Building2, Pencil, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { usersApi }   from '../api/users'
import { tenantsApi } from '../api/tenants'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth }    from '../context/AuthContext'
import { useToast }   from '../context/ToastContext'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Badge    from '../components/ui/Badge'
import Button   from '../components/ui/Button'
import Input    from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'

export default function SettingsPage() {
  usePageTitle('Settings')
  const { user, logout } = useAuth()
  const { addToast }     = useToast()
  const navigate         = useNavigate()

  const [profile,    setProfile]    = useState(null)
  const [tenant,     setTenant]     = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  // Inline edit state for tenant name
  const [editingName, setEditingName] = useState(false)
  const [newName,     setNewName]     = useState('')
  const [savingName,  setSavingName]  = useState(false)

  useEffect(() => {
    Promise.all([
      usersApi.me().then(r => r.data.data).catch(() => null),
      tenantsApi.me().then(r => r.data.data).catch(() => null),
    ]).then(([prof, ten]) => {
      setProfile(prof ?? { email: user?.email, role: user?.role })
      setTenant(ten)
    }).finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    navigate('/login')
  }

  const startEditName = () => {
    setNewName(tenant?.name ?? '')
    setEditingName(true)
  }

  const handleSaveName = async () => {
    if (!newName.trim() || newName === tenant?.name) { setEditingName(false); return }
    setSavingName(true)
    try {
      const res = await tenantsApi.update({ name: newName.trim() })
      setTenant(res.data.data)
      addToast('Workspace name updated.', 'success')
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to update workspace name.', 'error')
    } finally {
      setSavingName(false)
      setEditingName(false)
    }
  }

  const info = profile || user

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Settings</h1>

      {/* ── Profile card ─────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card>
          <CardHeader className="px-6 py-4">
            <h2 className="font-semibold text-gray-900">Your profile</h2>
          </CardHeader>
          <CardBody className="px-6 pb-6 space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                <span className="text-brand-700 text-xl font-black">
                  {loading ? '?' : info?.email?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
              <div className="min-w-0">
                {loading
                  ? <><Skeleton className="h-4 w-48 mb-2" /><Skeleton className="h-3 w-24" /></>
                  : <>
                      <p className="font-semibold text-gray-900 truncate">{info?.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Account email · cannot be changed</p>
                    </>}
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProfileItem icon={User}      label="Email" value={loading ? null : info?.email} />
              <ProfileItem icon={Shield}    label="Role"  value={loading ? null : <Badge variant={info?.role}>{info?.role}</Badge>} />
              <ProfileItem
                icon={Building2}
                label="Tenant ID"
                value={loading ? null : (
                  <span className="font-mono text-xs text-gray-500 break-all">
                    {info?.tenantId || user?.tenantId || '—'}
                  </span>
                )}
              />
              {profile?.createdAt && (
                <ProfileItem
                  icon={User}
                  label="Member since"
                  value={new Date(profile.createdAt).toLocaleDateString()}
                />
              )}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* ── Workspace card ───────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07, duration: 0.3 }}>
        <Card>
          <CardHeader className="px-6 py-4">
            <h2 className="font-semibold text-gray-900">Workspace</h2>
          </CardHeader>
          <CardBody className="px-6 pb-6 space-y-4">
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workspace name
                </label>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false) }}
                      autoFocus
                      className="flex-1"
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={savingName}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                      title="Save"
                    >
                      {savingName
                        ? <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                        : <Check size={16} />}
                    </button>
                    <button
                      onClick={() => setEditingName(false)}
                      className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
                      title="Cancel"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-sm text-gray-800 font-medium">
                      {tenant?.name ?? '—'}
                    </span>
                    {user?.role === 'ADMIN' && (
                      <button
                        onClick={startEditName}
                        className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-white transition-colors"
                        title="Edit name"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                  </div>
                )}
                {user?.role !== 'ADMIN' && (
                  <p className="text-xs text-gray-400 mt-1.5">Only admins can rename the workspace.</p>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* ── Danger zone ──────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.3 }}>
        <Card>
          <CardHeader className="px-6 py-4">
            <h2 className="font-semibold text-gray-900">Session</h2>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Sign out</p>
                <p className="text-xs text-gray-400 mt-0.5">You will be redirected to the login page.</p>
              </div>
              <Button variant="danger" size="sm" loading={loggingOut} onClick={handleLogout}>
                <LogOut size={14} />
                Sign out
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
}

function ProfileItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-gray-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        {value === null
          ? <Skeleton className="h-4 w-32" />
          : typeof value === 'string'
            ? <p className="text-sm text-gray-700 truncate">{value}</p>
            : value}
      </div>
    </div>
  )
}
