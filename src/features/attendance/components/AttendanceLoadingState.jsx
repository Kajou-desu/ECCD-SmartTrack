export default function AttendanceLoadingState() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center bg-[#f8f9ff] p-6">
      <div className="text-center">
        <div className="mb-4 inline-flex h-12 w-12 animate-spin rounded-full border-4 border-[#C2570C] border-t-transparent" />
        <p className="text-gray-600">Loading attendance records...</p>
      </div>
    </div>
  );
}
