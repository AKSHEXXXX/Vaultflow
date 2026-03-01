import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Clock, CheckCircle, XCircle, Plus, ArrowRight } from 'lucide-react'
import { documentsApi } from '../api/documents'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { SkeletonCard, SkeletonRow } from '../components/ui/Skeleton'

const STATUS_ACTIONS = {
  DRAFT:    'text-gray-500   bg-gray-50',
  PENDING:  'text-amber-600  bg-amber-50',
  APPROVED: 'text-green-600  bg-green-50',
  REJECTED: 'text-red-600    bg-red-50',
}

export default function DashboardPage() {
  usePageTitle('Dashboard')
  const { user }     = useAuth()
  const { addToast } = useToast()
  const [docs,    setDocs]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    documentsApi.list()
      .then(r => setDocs(r.data.data ?? []))
      .catch(() => addToast('Failed to load documents.', 'error'))
      .finally(() => setLoading(false))
  }, [])

  // KPI counts
  const total    = docs.length
  const pending  = docs.filter(d => d.status === 'PENDING').length
  const approved = docs.filter(d => d.status === 'APPROVED').length
  const rejected = docs.filter(d => d.status === 'REJECTED').length

  const recent = docs.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6)

  const KPIS = [
    { label: 'Total Documents', value: total,    icon: FileText,     color: 'bg-brand-50  text-brand-600'  },
    { label: 'Pending Review',  value: pending,  icon: Clock,        color: 'bg-amber-50  text-amber-600'  },
    { label: 'Approved',        value: approved, icon: CheckCircle,  color: 'bg-green-50  text-green-600'  },
    { label: 'Rejected',        value: rejected, icon: XCircle,      color: 'bg-red-50    text-red-600'    },
  ]

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Welcome back, <span className="font-medium">{user?.email}</span>
          </p>
        </div>
        {(user?.role === 'EMPLOYEE' || user?.role === 'ADMIN') && (
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-brand-200"
          >
            <Plus size={15} />
            Upload
          </Link>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : KPIS.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.3 }}
              >
                <Card>
                  <CardBody className="flex items-center gap-4 p-5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${kpi.color}`}>
                      <kpi.icon size={20} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-gray-900">{kpi.value}</p>
                      <p className="text-xs text-gray-500 leading-tight mt-0.5">{kpi.label}</p>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
      </div>

      {/* Recent documents */}
      <Card>
        <CardHeader className="flex items-center justify-between px-6 py-4">
          <h2 className="font-semibold text-gray-900">Recent documents</h2>
          <Link to="/documents" className="text-brand-600 hover:text-brand-700 text-sm flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Created</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array(4).fill(0).map((_, i) => <SkeletonRow key={i} cols={4} />)
                : recent.length === 0
                  ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">
                          No documents yet.{' '}
                          <Link to="/upload" className="text-brand-600 hover:underline">Upload one</Link>
                        </td>
                      </tr>
                    )
                  : recent.map(doc => (
                      <tr key={doc.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-6 py-3.5 font-medium text-gray-800 max-w-[200px] truncate">
                          {doc.title || doc.fileName}
                        </td>
                        <td className="px-6 py-3.5 hidden sm:table-cell">
                          <Badge variant={doc.status}>{doc.status}</Badge>
                        </td>
                        <td className="px-6 py-3.5 text-gray-400 hidden md:table-cell">
                          {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <Link
                            to={`/documents/${doc.id}`}
                            className="text-brand-600 hover:text-brand-700 text-xs font-medium"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
