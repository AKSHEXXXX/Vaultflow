import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, File, X, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { documentsApi } from '../api/documents'
import { useToast } from '../context/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']

const MAX_SIZE = 20 * 1024 * 1024 // 20 MB

export default function UploadPage() {
  usePageTitle('Upload document')
  const { addToast } = useToast()
  const navigate     = useNavigate()
  const inputRef     = useRef(null)

  const [file,      setFile]      = useState(null)
  const [title,     setTitle]     = useState('')
  const [dragging,  setDragging]  = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [uploading, setUploading] = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState('')

  const selectFile = f => {
    setError('')
    if (!ALLOWED_TYPES.includes(f.type) && f.type !== '') {
      setError('Unsupported file type. Please upload PDF, Word, Excel, or image files.')
      return
    }
    if (f.size > MAX_SIZE) {
      setError('File is too large. Maximum size is 20 MB.')
      return
    }
    setFile(f)
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''))
  }

  const handleDrop = e => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) selectFile(f)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!file) { setError('Please select a file.'); return }
    setUploading(true); setProgress(0); setError('')

    const fd = new FormData()
    fd.append('file', file)
    fd.append('title', title || file.name)

    try {
      await documentsApi.upload(fd, p => {
        setProgress(Math.round((p.loaded / p.total) * 100))
      })
      setDone(true)
      addToast('Document uploaded successfully.', 'success')
      setTimeout(() => navigate('/documents'), 1800)
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload failed. Please try again.')
      setUploading(false)
    }
  }

  const reset = () => {
    setFile(null); setTitle(''); setProgress(0); setDone(false); setError('')
    setUploading(false)
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Upload document</h1>

      <Card>
        <CardBody className="p-6 space-y-5">
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !file && inputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed
              transition-colors cursor-pointer py-12 px-6 text-center
              ${dragging ? 'border-brand-400 bg-brand-50' : file ? 'border-gray-200 bg-gray-50' : 'border-gray-200 hover:border-brand-300 hover:bg-brand-50/30'}
            `}
          >
            <input
              ref={inputRef}
              type="file"
              className="sr-only"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
              onChange={e => { const f = e.target.files?.[0]; if (f) selectFile(f) }}
            />

            <AnimatePresence mode="wait">
              {done ? (
                <motion.div key="done" initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-2">
                  <CheckCircle size={40} className="text-green-500" />
                  <p className="text-green-600 font-semibold text-sm">Upload complete!</p>
                </motion.div>
              ) : file ? (
                <motion.div key="file" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2 w-full max-w-xs">
                  <File size={32} className="text-brand-500" />
                  <p className="font-medium text-gray-800 text-sm truncate w-full text-center">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); reset() }}
                    className="mt-1 text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <X size={12} /> Remove
                  </button>
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center">
                    <Upload size={26} className="text-brand-500" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium text-sm">Drop your file here</p>
                    <p className="text-gray-400 text-xs mt-1">
                      or <span className="text-brand-600">click to browse</span> · PDF, Word, Excel, Images · Max 20 MB
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Title */}
          <Input
            label="Document title"
            placeholder="Enter a display name for this document"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={uploading || done}
          />

          {/* Progress bar */}
          {uploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-brand-600 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              loading={uploading}
              disabled={!file || done}
              className="flex-1"
            >
              <Upload size={15} />
              {uploading ? 'Uploading…' : 'Upload document'}
            </Button>
            <Button variant="secondary" onClick={reset} disabled={uploading}>
              Reset
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
