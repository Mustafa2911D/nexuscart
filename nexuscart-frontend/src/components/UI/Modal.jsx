import { motion, AnimatePresence } from 'framer-motion'

export default function Modal({ open, onClose, title = 'Notice', children }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] grid place-items-center">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="relative mx-4 max-w-lg rounded-2xl bg-white p-6 shadow-elevated"
            role="dialog" aria-modal="true"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-dark">{title}</h3>
              <button onClick={onClose} className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100">✕</button>
            </div>
            <div className="text-sm text-gray-700">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
