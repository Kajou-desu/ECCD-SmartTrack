import { FileText, Trash2 } from "lucide-react";

export default function DocumentCard({ document, onView, onRemove }) {
  return (
    <div className="group relative rounded-xl bg-gray-50 border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200">
      <button
        type="button"
        onClick={() => onView(document)}
        className="w-full p-4 pr-11 flex items-center gap-3 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-xl"
        aria-label={`View document: ${document.name}`}
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
      </button>

      {onRemove ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRemove(document);
          }}
          aria-label={`Remove document: ${document.name}`}
          className="absolute top-1/2 right-2 -translate-y-1/2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <Trash2 size={16} />
        </button>
      ) : null}
    </div>
  );
}
