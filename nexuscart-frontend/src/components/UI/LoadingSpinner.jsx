export default function LoadingSpinner() {
  return (
    <div className="grid place-items-center py-16">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary" role="status" aria-label="Loading"></div>
    </div>
  )
}
