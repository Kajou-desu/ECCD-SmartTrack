import { FileText, CheckCircle2 } from "lucide-react";

export default function DocumentCard({ document }) {
  return (
    <button
      type="button"
      className="group rounded-xl bg-gray-50 border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 p-4 flex items-center gap-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      aria-label={`Document: ${document.name}${document.verified ? " (verified)" : ""}`}
    >
      <div className="shrink-0">
        <FileText
          size={24}
          className="text-orange-600 group-hover:scale-110 transition-transform"
        />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="truncate font-medium text-gray-800 text-sm group-hover:text-orange-700 transition-colors">
          {document.name}
        </p>
      </div>
      {document.verified && (
        <div className="shrink-0">
          <CheckCircle2
            size={20}
            className="text-green-600"
            aria-label="Document verified"
          />
        </div>
      )}
    </button>
  );
}
