export default function DashboardContentGrid({ stats, cards }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {stats}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:min-h-0 lg:grid-cols-4">
        {cards}
      </div>
    </>
  );
}
