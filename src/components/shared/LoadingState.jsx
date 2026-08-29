export default function LoadingState({ message = "Loading..." }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={message}
      className="flex min-h-64 w-full flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white p-8 text-center"
    >
      <div className="mb-4 inline-flex h-12 w-12 animate-spin rounded-full border-4 border-[#C2570C] border-t-transparent" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
}
