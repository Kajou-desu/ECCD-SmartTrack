// Triggers a client-side CSV download. No backend involved.
export function downloadCsv(filename, headers, rows) {
    const escapeCsvValue = (value) =>
        `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csvRows = rows.map((row) => row.map(escapeCsvValue).join(","));
    const csv = [headers.join(","), ...csvRows].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}