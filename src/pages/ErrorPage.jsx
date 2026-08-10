import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-gray-100 text-center px-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
        404
      </p>
      <h1 className="text-2xl font-bold text-slate-800">Page not found</h1>
      <p className="max-w-sm text-sm text-slate-500">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link
        to="/dashboard"
        className="mt-2 rounded-xl bg-orange-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-800"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
