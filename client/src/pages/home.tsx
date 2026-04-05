import { Link } from "react-router-dom";
import { Ticket, CircleDot, CheckCircle2, XCircle, Sparkles, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { TicketStatus } from "core";
import type { LucideIcon } from "lucide-react";
import type { TicketSummary } from "@/types";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

interface TicketStats {
  total: number;
  open: number;
  resolved: number;
  closed: number;
  autoResolved: number;
}

interface StatCard {
  label: string;
  key: keyof TicketStats;
  icon: LucideIcon;
  color: string;
  bg: string;
}

const statusStyles: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  [TicketStatus.RESOLVED]: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  [TicketStatus.CLOSED]: "bg-secondary text-secondary-foreground",
};

const statCards: StatCard[] = [
  { label: "Total Tickets", key: "total", icon: Ticket, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Open", key: "open", icon: CircleDot, color: "text-amber-500", bg: "bg-amber-50" },
  { label: "Resolved", key: "resolved", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "Closed", key: "closed", icon: XCircle, color: "text-slate-400", bg: "bg-slate-100" },
  { label: "Auto-Resolved", key: "autoResolved", icon: Sparkles, color: "text-violet-500", bg: "bg-violet-50" },
];

interface DailyCount {
  date: string;
  count: number;
}

const chartConfig = {
  count: { label: "Tickets", color: "var(--color-primary)" },
} satisfies ChartConfig;

export default function HomePage() {
  const { data: stats } = useQuery({
    queryKey: ["ticket-stats"],
    queryFn: () => axios.get<TicketStats>("/api/tickets/stats").then((res) => res.data),
  });

  const { data: tickets } = useQuery({
    queryKey: ["tickets"],
    queryFn: () => axios.get<TicketSummary[]>("/api/tickets").then((res) => res.data),
  });

  const { data: dailyCounts } = useQuery({
    queryKey: ["ticket-stats-daily"],
    queryFn: () => axios.get<DailyCount[]>("/api/tickets/stats/daily").then((res) => res.data),
  });

  const recentTickets = tickets?.slice(0, 5) ?? [];

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your helpdesk activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-xl border shadow-sm p-5 flex items-center gap-4"
          >
            <div className={`${stat.bg} rounded-lg p-2.5`}>
              <stat.icon className={`size-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground leading-tight">
                {stats ? stats[stat.key] : "—"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {dailyCounts && (
        <div className="bg-card rounded-xl border shadow-sm">
          <div className="px-5 py-4 border-b">
            <h2 className="text-sm font-semibold text-foreground">Incoming Tickets — Last 30 Days</h2>
          </div>
          <div className="p-5">
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <BarChart data={dailyCounts}>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: string) => {
                    const d = new Date(v + "T00:00:00");
                    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                  }}
                  interval={4}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={30}
                  fontSize={12}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(v: string) => {
                        const d = new Date(v + "T00:00:00");
                        return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
                      }}
                    />
                  }
                />
                <Bar dataKey="count" fill="var(--color-count)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border shadow-sm">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Recent Tickets</h2>
          <Link to="/tickets" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {recentTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-secondary rounded-xl p-3 mb-3">
              <Ticket className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No tickets yet. They'll show up here once created.</p>
          </div>
        ) : (
          <div className="divide-y">
            {recentTickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ticket.senderName} &middot; {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`ml-3 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${statusStyles[ticket.status]}`}>
                  {ticket.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
