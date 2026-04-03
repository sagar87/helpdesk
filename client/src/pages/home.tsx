import { Ticket, CircleDot, CheckCircle2, XCircle } from "lucide-react";

const stats = [
  { label: "Total Tickets", value: "—", icon: Ticket, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Open", value: "—", icon: CircleDot, color: "text-amber-500", bg: "bg-amber-50" },
  { label: "Resolved", value: "—", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "Closed", value: "—", icon: XCircle, color: "text-slate-400", bg: "bg-slate-100" },
];

export default function HomePage() {
  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your helpdesk activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4"
          >
            <div className={`${stat.bg} rounded-lg p-2.5`}>
              <stat.icon className={`size-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 leading-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Recent Tickets</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-slate-100 rounded-xl p-3 mb-3">
            <Ticket className="size-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No tickets yet. They'll show up here once created.</p>
        </div>
      </div>
    </div>
  );
}
