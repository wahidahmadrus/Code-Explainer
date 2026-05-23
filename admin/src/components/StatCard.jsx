export default function StatCard({ label, value, icon: Icon }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        {Icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-teal-50 text-teal-700">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
