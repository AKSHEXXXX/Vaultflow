import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { usersApi }  from '../api/users'
import { useAuth }   from '../context/AuthContext'
import { useToast }  from '../context/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'
import Card, { CardBody } from '../components/ui/Card'
import Badge          from '../components/ui/Badge'
import Button         from '../components/ui/Button'
import Modal          from '../components/ui/Modal'
import Input          from '../components/ui/Input'
import { SkeletonRow } from '../components/ui/Skeleton'

const ROLES = ['EMPLOYEE', 'MANAGER', 'ADMIN']

export default function UsersPage() {
  usePageTitle('Users')
  const { user }     = useAuth()
  const { addToast } = useToast()

  const [users,     setUsers]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [actingId,  setActingId]  = useState(null)

  // Invite modal state
  const [inviteOpen, setInviteOpen] = useState(false)
  const [invite,     setInvite]     = useState({ email: '', password: '', role: 'EMPLOYEE' })
  const [inviting,   setInviting]   = useState(false)
  const [inviteErr,  setInviteErr]  = useState('')

  // Edit role modal state
  const [editUser,   setEditUser]   = useState(null) // full user object
  const [newRole,    setNewRole]    = useState('')
  const [saving,     setSaving]     = useState(false)

  const load = () => {
    setLoading(true)
    usersApi.list()
      .then(r => setUsers(r.data.data ?? []))
      .catch(() => addToast('Failed to load users.', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  // ── Invite ──
  const handleInvite = async e => {
    e.preventDefault()
    if (!invite.email || !invite.password) { setInviteErr('Email and password are required.'); return }
    setInviting(true); setInviteErr('')
    try {
      await usersApi.invite(invite)
      addToast('User invited successfully.', 'success')
      setInviteOpen(false)
      setInvite({ email: '', password: '', role: 'EMPLOYEE' })
      load()
    } catch (err) {
      setInviteErr(err?.response?.data?.message || 'Failed to invite user.')
    } finally {
      setInviting(false)
    }
  }

  // ── Edit role ──
  const openEdit = u => { setEditUser(u); setNewRole(u.role) }
  const handleSaveRole = async () => {
    setSaving(true)
    try {
      await usersApi.updateRole(editUser.id, { role: newRole })
      addToast('Role updated.', 'success')
      setEditUser(null)
      load()
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to update role.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ──
  const handleDelete = async u => {
    if (!window.confirm(`Remove ${u.email} from the workspace? This cannot be undone.`)) return
    setActingId(u.id)
    try {
      await usersApi.delete(u.id)
      addToast('User removed.', 'success')
      load()
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to delete user.', 'error')
    } finally {
      setActingId(null)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage workspace members and roles.</p>
        </div>
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          <Plus size={14} />
          Invite user
        </Button>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Role</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array(4).fill(0).map((_, i) => <SkeletonRow key={i} cols={4} />)
                : users.length === 0
                  ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">
                          No users found.
                        </td>
                      </tr>
                    )
                  : users.map(u => (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-brand-700 text-xs font-semibold">
                                {u.email?.[0]?.toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-gray-800 truncate max-w-[160px]">{u.email}</span>
                            {u.id === user?.id && (
                              <span className="text-xs text-gray-400">(you)</span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-3.5 hidden sm:table-cell">
                          <Badge variant={u.role}>{u.role}</Badge>
                        </td>

                        <td className="px-6 py-3.5 text-gray-400 text-xs hidden md:table-cell">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                        </td>

                        <td className="px-6 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            {u.id !== user?.id && (
                              <>
                                <button
                                  onClick={() => openEdit(u)}
                                  className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
                                  title="Edit role"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => handleDelete(u)}
                                  disabled={actingId === u.id}
                                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                                  title="Remove user"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
            </tbody>
          </table>
        </div>
        {!loading && (
          <CardBody className="border-t border-gray-50 px-6 py-3 text-xs text-gray-400">
            {users.length} member{users.length !== 1 ? 's' : ''} in this workspace
          </CardBody>
        )}
      </Card>

      {/* ── Invite modal ─────────────────────────────────── */}
      <Modal
        isOpen={inviteOpen}
        onClose={() => { setInviteOpen(false); setInviteErr('') }}
        title="Invite a user"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite} loading={inviting}>Send invite</Button>
          </div>
        }
      >
        <form onSubmit={handleInvite} className="space-y-4" noValidate>
          {inviteErr && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              {inviteErr}
            </div>
          )}
          <Input
            label="Email"
            type="email"
            placeholder="colleague@company.com"
            value={invite.email}
            onChange={e => setInvite(v => ({ ...v, email: e.target.value }))}
          />
          <Input
            label="Temporary password"
            type="password"
            placeholder="Min 8 characters"
            value={invite.password}
            onChange={e => setInvite(v => ({ ...v, password: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
            <select
              value={invite.role}
              onChange={e => setInvite(v => ({ ...v, role: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </form>
      </Modal>

      {/* ── Edit role modal ───────────────────────────────── */}
      <Modal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        title="Change role"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={handleSaveRole} loading={saving}>Save</Button>
          </div>
        }
      >
        {editUser && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Update role for <strong>{editUser.email}</strong>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New role</label>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
