import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, FileText, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'
import { motion } from 'framer-motion'
import { documentsApi } from '../api/documents'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'

const TIMELINE = [
  { status: 'DRAFT',    icon: FileText,    label: 'Created as draft',      color: 'bg-gray-100    text-gray-500'  },
  { status: 'PENDING',  icon: Clock,       label: 'Submitted for review',  color: 'bg-amber-100   text-amber-600' },
  { status: 'APPROVED', icon: CheckCircle, label: 'Approved',              color: 'bg-green-100   text-green-600' },
  { status: 'REJECTED', icon: XCircle,     label: 'Rejected',              color: 'bg-red-100     text-red-600'   },
]

function getTimelineItems(status) {
  if (status === 'REJECTED') {
    return [TIMELINE[0], TIMELINE[1], TIMELINE[3]]
  }
  return TIMELINE
}

export default function DocumentDetailPage() {
  usePageTitle('Document')
  const { id }       = useParams()
  const { user }     = useAuth()
  const { addToast } = useToast()
  const navigate     = useNavigate()

  const [doc,     setDoc]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [acting,  setActing]  = useState(false)

  useEffect(() => {
    documentsApi.get(id)
      .then(r => setDoc(r.data.data))
      .catch(() => { addToast('Document not found.', 'error'); navigate('/documents') })
      .finally(() => setLoading(false))
  }, [id])

  const handleAction = async (action, label) => {
    setActing(true)
    try {
      await documentsApi[action](id)
      addToast(`Document ${label.toLowerCase()}d.`, 'success')
      const updated = await documentsApi.get(id)
      setDoc(updated.data.data)
    } catch (err) {
      addToast(err?.response?.data?.message || `Failed to ${label.toLowerCase()}.`, 'error')
    } finally {
      setActing(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this document? This cannot be undone.')) return
    setActing(true)
    try {
      await documentsApi.delete(id)
      addToast('Document deleted.', 'success')
      navigate('/documents')
    } catch (err) {
      addToast(err?.response?.data?.message || 'Delete failed.', 'error')
      setActing(false)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">

      {/* Back */}
      <Link to="/documents" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft size={15} />
        Back to Documents
      </Link>

      {loading ? (
        <Card>
          <CardBody className="space-y-4 p-6">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-5" style={{ width: `${60 + (i % 3) * 15}%` }} />)}
          </CardBody>
        </Card>
      ) : !doc ? null : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Main card */}
          <Card>
            <CardHeader className="flex items-start justify-between px-6 py-5 gap-4">
              <div className="min-w-0">
                <h1 className="text-xl font-black text-gray-900 truncate">
                  {doc.title || doc.fileName}
                </h1>
                {doc.fileName && doc.title && (
                  <p className="text-sm text-gray-400 mt-0.5">{doc.fileName}</p>
                )}
              </div>
              <Badge variant={doc.status} className="flex-shrink-0">{doc.status}</Badge>
            </CardHeader>

            <CardBody className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <Detail label="Uploaded by"  value={doc.createdByEmail || '—'} />
              <Detail label="Tenant"       value={doc.tenantId || '—'} />
              <Detail label="Created"      value={doc.createdAt ? new Date(doc.createdAt).toLocaleString() : '—'} />
              <Detail label="Last updated" value={doc.updatedAt ? new Date(doc.updatedAt).toLocaleString() : '—'} />
            </CardBody>

            {/* Actions */}
            <div className="border-t border-gray-100 px-6 py-4 flex items-center gap-3 flex-wrap">
              {(user?.role === 'EMPLOYEE' || user?.role === 'ADMIN') && doc.status === 'DRAFT' && (
                <Button size="sm" onClick={() => handleAction('submit', 'Submit')} loading={acting}>
                  Submit for review
                </Button>
              )}
              {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && doc.status === 'PENDING' && (
                <>
                  <Button size="sm" onClick={() => handleAction('approve', 'Approve')} loading={acting}>
                    Approve
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleAction('reject', 'Reject')} loading={acting}>
                    Reject
                  </Button>
                </>
              )}
              {user?.role === 'ADMIN' && (
                <Button size="sm" variant="ghost" onClick={handleDelete} loading={acting} className="text-red-500 hover:text-red-700">
                  Delete
                </Button>
              )}
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="px-6 py-4">
              <h2 className="font-semibold text-gray-900">Workflow timeline</h2>
            </CardHeader>
            <CardBody className="px-6 pb-6">
              <ol className="relative border-l border-gray-100 ml-4 space-y-6">
                {getTimelineItems(doc.status).map((step, i) => {
                  const reached = isReached(step.status, doc.status)
                  const Icon = step.icon
                  return (
                    <li key={step.status} className="ml-6">
                      <span className={`absolute -left-3.5 flex items-center justify-center w-7 h-7 rounded-full ring-2 ring-white ${reached ? step.color : 'bg-gray-100 text-gray-300'}`}>
                        <Icon size={13} />
                      </span>
                      <p className={`font-medium text-sm ${reached ? 'text-gray-800' : 'text-gray-300'}`}>
                        {step.label}
                      </p>
                      {reached && doc.updatedAt && i > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(doc.updatedAt).toLocaleString()}
                        </p>
                      )}
                    </li>
                  )
                })}
              </ol>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-gray-700 break-all">{value}</p>
    </div>
  )
}

const ORDER = ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED']
function isReached(step, currentStatus) {
  if (currentStatus === 'REJECTED') {
    return step === 'DRAFT' || step === 'PENDING' || step === 'REJECTED'
  }
  return ORDER.indexOf(step) <= ORDER.indexOf(currentStatus)
}
