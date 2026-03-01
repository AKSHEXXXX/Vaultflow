import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus } from 'lucide-react'
import { documentsApi } from '../api/documents'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'
import Card, { CardBody } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SkeletonRow } from '../components/ui/Skeleton'

const FILTERS = ['ALL', 'DRAFT', 'PENDING', 'APPROVED', 'REJECTED']

export default function DocumentsPage() {
  usePageTitle('Documents')
  const { user }     = useAuth()
  const { addToast } = useToast()

  const [docs,    setDocs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('ALL')
  const [query,   setQuery]   = useState('')
  const [actingId, setActingId] = useState(null)

  const load = () => {
    setLoading(true)
    documentsApi.list()
      .then(r => setDocs(r.data.data ?? []))
      .catch(() => addToast('Failed to load documents.', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = docs
    .filter(d => filter === 'ALL' || d.status === filter)
    .filter(d => {
      const q = query.toLowerCase()
      return !q || (d.title || d.fileName || '').toLowerCase().includes(q)
    })

  const handleAction = async (action, id, label) => {
    setActingId(id)
    try {
      await documentsApi[action](id)
      addToast(`Document ${label.toLowerCase()}d successfully.`, 'success')
      load()
    } catch (err) {
      addToast(err?.response?.data?.message || `Failed to ${label.toLowerCase()}.`, 'error')
    } finally {
      setActingId(null)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Documents</h1>
        {(user?.role === 'EMPLOYEE' || user?.role === 'ADMIN') && (
          <Link to="/upload">
            <Button size="sm">
              <Plus size={14} />
              Upload
            </Button>
          </Link>
        )}
      </div>

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Status tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto flex-shrink-0">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                filter === f
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search documents…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Uploaded</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array(5).fill(0).map((_, i) => <SkeletonRow key={i} cols={4} />)
                : filtered.length === 0
                  ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">
                          No documents found.
                        </td>
                      </tr>
                    )
                  : filtered.map(doc => (
                      <DocRow
                        key={doc.id}
                        doc={doc}
                        role={user?.role}
                        actingId={actingId}
                        onAction={handleAction}
                      />
                    ))}
            </tbody>
          </table>
        </div>
        {!loading && (
          <CardBody className="border-t border-gray-50 px-6 py-3 text-xs text-gray-400">
            {filtered.length} document{filtered.length !== 1 ? 's' : ''}
          </CardBody>
        )}
      </Card>
    </div>
  )
}

// ─── DocRow ───────────────────────────────────────────────────────────────────
function DocRow({ doc, role, actingId, onAction }) {
  const busy = actingId === doc.id

  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      <td className="px-6 py-3.5">
        <Link
          to={`/documents/${doc.id}`}
          className="font-medium text-gray-800 hover:text-brand-600 transition-colors max-w-[180px] truncate block"
        >
          {doc.title || doc.fileName}
        </Link>
      </td>

      <td className="px-6 py-3.5 hidden sm:table-cell">
        <Badge variant={doc.status}>{doc.status}</Badge>
      </td>

      <td className="px-6 py-3.5 text-gray-400 hidden md:table-cell text-xs">
        {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '—'}
      </td>

      <td className="px-6 py-3.5">
        <div className="flex items-center justify-end gap-2">
          {/* EMPLOYEE or ADMIN: can submit DRAFT */}
          {(role === 'EMPLOYEE' || role === 'ADMIN') && doc.status === 'DRAFT' && (
            <Button
              size="sm"
              variant="outline"
              loading={busy}
              onClick={() => onAction('submit', doc.id, 'Submit')}
            >
              Submit
            </Button>
          )}

          {/* MANAGER or ADMIN: can approve/reject PENDING */}
          {(role === 'MANAGER' || role === 'ADMIN') && doc.status === 'PENDING' && (
            <>
              <Button
                size="sm"
                variant="primary"
                loading={busy}
                onClick={() => onAction('approve', doc.id, 'Approve')}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="danger"
                loading={busy}
                onClick={() => onAction('reject', doc.id, 'Reject')}
              >
                Reject
              </Button>
            </>
          )}

          {/* ADMIN: can delete any */}
          {role === 'ADMIN' && (
            <Button
              size="sm"
              variant="ghost"
              loading={busy}
              onClick={() => onAction('delete', doc.id, 'Delete')}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </Button>
          )}

          <Link to={`/documents/${doc.id}`} className="text-xs text-brand-600 hover:text-brand-700 font-medium ml-1">
            View
          </Link>
        </div>
      </td>
    </tr>
  )
}
