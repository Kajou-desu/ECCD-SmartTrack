import AttendanceCard from "./AttendanceCard";
import AttendanceEmptyState from "./AttendanceEmptyState";

export default function AttendanceList({ filteredRecords, handleStatusChange, savingIds, searchQuery }) {
  if (!filteredRecords || filteredRecords.length === 0) {
    return <AttendanceEmptyState searchQuery={searchQuery} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredRecords.map((record) => (
        <AttendanceCard key={record.id} record={record} onMarkStatus={handleStatusChange} isSaving={savingIds.has(record.id)} />
      ))}
    </div>
  );
}
