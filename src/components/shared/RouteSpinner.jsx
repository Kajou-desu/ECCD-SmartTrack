export default function RouteSpinner() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4
                    border-orange-600 border-t-transparent"
        aria-label="Loading"
        role="status"
      />
    </div>
  );
}
