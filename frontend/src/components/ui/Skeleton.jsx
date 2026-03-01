export function Skeleton({ className = '', style }) {
  return (
    <div style={style} className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
  )
}

export default Skeleton

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
      <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse" />
      <div className="h-7 w-16 bg-gray-200 rounded animate-pulse" />
      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
    </div>
  )
}

export function SkeletonRow({ cols = 4 }) {
  const widths = ['w-40', 'w-20', 'w-24', 'w-16']
  return (
    <tr className="border-b border-gray-50">
      {Array(cols).fill(0).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className={`h-4 bg-gray-200 rounded animate-pulse ${widths[i % widths.length]}`} />
        </td>
      ))}
    </tr>
  )
}
