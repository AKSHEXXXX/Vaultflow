import { motion, AnimatePresence } from 'framer-motion'

/**
 * Full-screen loading overlay.
 * Usage: <LoadingOverlay show={isLoading} />
 */
export default function LoadingOverlay({ show = false, message = 'Loading…' }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
          aria-live="assertive"
          aria-label={message}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
              <div className="absolute inset-0 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
            </div>
            <p className="text-sm text-gray-500 font-medium">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
