import { FileText, Upload } from "lucide-react";
import DocumentCard from "./DocumentCard";

export default function RequiredDocumentsCard({ documents, onUpload }) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">Required Documents</h2>
        <button
          type="button"
          onClick={onUpload}
          className="flex items-center gap-2 cursor-pointer text-[#C2570C] hover:text-orange-700 font-semibold text-sm transition-colors px-3 py-2 rounded-lg hover:bg-orange-50"
          aria-label="Upload documents"
        >
          <Upload size={18} />
          <span>Upload Documents</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {documents && documents.length > 0 ? (
          documents.map((doc) => <DocumentCard key={doc.id} document={doc} />)
        ) : (
          <div className="col-span-full p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <FileText size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">No documents uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
