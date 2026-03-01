import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, XCircle, X, ShieldOff } from 'lucide-react'

const ToastContext = createContext(null)

let _addToast       = null
let _setForbidden   = null
export const addToastGlobal     = (message, type = 'info') => _addToast?.(message, type)
export const showForbiddenModal = ()                        => _setForbidden?.(true)

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertCircle,
  info:    Info,
}

const STYLES = {
  success: 'bg-white border-l-4 border-green-500',
  error:   'bg-white border-l-4 border-red-500',
  warning: 'bg-white border-l-4 border-amber-500',
  info:    'bg-white border-l-4 border-brand-500',
}

const ICON_STYLES = {
  success: 'text-green-500',
  error:   'text-red-500',
  warning: 'text-amber-500',
  info:    'text-brand-500',
}

export function ToastProvider({ children }) {
  const [toasts,    setToasts]    = useState([])
  const [forbidden, setForbidden] = useState(false)
  const counter = useRef(0)

  const addToast = useCallback((message, type = 'info') => {
    const id = ++counter.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Expose globally so axios interceptor can call them
  _addToast     = addToast
  _setForbidden = setForbidden

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* 403 Forbidden modal */}
      <AnimatePresence>
        {forbidden && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldOff size={22} className="text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Access denied</h3>
              <p className="text-sm text-gray-500 mb-6">
                You don&apos;t have permission to perform that action. Contact your workspace admin if you think this is a mistake.
              </p>
              <button
                onClick={() => setForbidden(false)}
                className="w-full bg-gray-900 hover:bg-gray-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast container */}
      <div
        aria-live="assertive"
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onDismiss={remove} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

function Toast({ toast, onDismiss }) {
  const Icon = ICONS[toast.type] ?? Info

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`
        pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg
        ${STYLES[toast.type] ?? STYLES.info}
      `}
    >
      <Icon size={18} className={`mt-0.5 flex-shrink-0 ${ICON_STYLES[toast.type] ?? ICON_STYLES.info}`} />
      <p className="flex-1 text-sm text-gray-700">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        aria-label="Dismiss"
      >
        <X size={15} />
      </button>
    </motion.div>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
