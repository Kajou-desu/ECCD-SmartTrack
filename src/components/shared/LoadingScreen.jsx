export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="min-h-[calc(100vh-70px)] flex items-center justify-center bg-[#f8f9ff] p-6 text-gray-600">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
        <p>{message}</p>
      </div>
    </div>
  );
}
