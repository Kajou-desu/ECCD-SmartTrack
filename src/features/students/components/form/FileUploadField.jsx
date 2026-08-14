export default function FileUploadField({ name, value = [], onChange }) {
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);

    onChange({
      target: {
        name,
        value: files,
      },
    });
  };

  return (
    <div>
      <label htmlFor={name} className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-[#C2570C]/50 hover:bg-orange-50/30">
        <input id={name} type="file" name={name} multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileChange} className="sr-only" />

        <svg className="mb-3 h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16V4m0 0-4 4m4-4 4 4M4 20h16" />
        </svg>

        <p className="text-sm font-semibold text-slate-700">Select documents to upload</p>
        <p className="mt-1 text-xs text-slate-500">PDF, DOC, DOCX, JPG, or PNG</p>
      </label>

      {value.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Selected Documents ({value.length})</p>

          <ul className="space-y-2">
            {value.map((file, index) => {
              const fileName = file?.name || file?.filename || file?.originalName || `Document ${index + 1}`;

              return (
                <li key={`${fileName}-${index}`} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600">
                  <span className="text-[#C2570C]">✓</span>
                  <span className="min-w-0 truncate">{fileName}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
