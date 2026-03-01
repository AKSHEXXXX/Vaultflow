const styles = {
  // Document statuses
  DRAFT:    'bg-gray-100 text-gray-600',
  PENDING:  'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  // User roles
  ADMIN:    'bg-purple-100 text-purple-700',
  MANAGER:  'bg-blue-100 text-blue-700',
  EMPLOYEE: 'bg-gray-100 text-gray-600',
  // Generic
  success:  'bg-green-100 text-green-700',
  warning:  'bg-amber-100 text-amber-700',
  danger:   'bg-red-100 text-red-700',
  info:     'bg-blue-100 text-blue-700',
  gray:     'bg-gray-100 text-gray-600',
}

export default function Badge({ children, variant = 'gray', className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${styles[variant] || styles.gray} ${className}`}
    >
      {children}
    </span>
  )
}
