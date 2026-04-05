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
  accent: string;
  iconColor: string;
}

const statusBadge: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  [TicketStatus.RESOLVED]: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  [TicketStatus.CLOSED]: "bg-secondary text-muted-foreground ring-border",
};

const statCards: StatCard[] = [
  { label: "Total Tickets", key: "total", icon: Ticket, accent: "from-blue-500/20 to-blue-500/5", iconColor: "text-blue-400" },
  { label: "Open", key: "open", icon: CircleDot, accent: "from-amber-500/20 to-amber-500/5", iconColor: "text-amber-400" },
  { label: "Resolved", key: "resolved", icon: CheckCircle2, accent: "from-emerald-500/20 to-emerald-500/5", iconColor: "text-emerald-400" },
  { label: "Closed", key: "closed", icon: XCircle, accent: "from-slate-400/15 to-slate-400/5", iconColor: "text-slate-400" },
  { label: "Auto-Resolved", key: "autoResolved", icon: Sparkles, accent: "from-primary/20 to-primary/5", iconColor: "text-primary" },
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
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">
      <div className="animate-fade-up">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Overview of your helpdesk activity</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat, i) => (
          <div
            key={stat.label}
            className="group relative rounded-xl border border-border/60 bg-card/80 p-4 flex items-center gap-3.5 hover:border-border transition-all animate-fade-up"
            style={{ animationDelay: `${(i + 1) * 60}ms` }}
          >
            <div className={`size-9 rounded-lg bg-gradient-to-b ${stat.accent} flex items-center justify-center shrink-0`}>
              <stat.icon className={`size-4 ${stat.iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground leading-tight tabular-nums">
                {stats ? stats[stat.key] : "—"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {dailyCounts && (
        <div
          className="rounded-xl border border-border/60 bg-card/80 animate-fade-up"
          style={{ animationDelay: "380ms" }}
        >
          <div className="px-5 py-3.5 border-b border-border/60">
            <h2 className="text-[13px] font-semibold text-foreground">Incoming Tickets — Last 30 Days</h2>
          </div>
          <div className="p-5">
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
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
                  fontSize={11}
                  tick={{ fill: "var(--color-muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={24}
                  fontSize={11}
                  tick={{ fill: "var(--color-muted-foreground)" }}
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

      <div
        className="rounded-xl border border-border/60 bg-card/80 animate-fade-up"
        style={{ animationDelay: "440ms" }}
      >
        <div className="px-5 py-3.5 border-b border-border/60 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-foreground">Recent Tickets</h2>
          <Link to="/tickets" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {recentTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-xl bg-secondary p-3 mb-3">
              <Ticket className="size-5 text-muted-foreground" />
            </div>
            <p className="text-[13px] text-muted-foreground">No tickets yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {recentTickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-accent/50 transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-foreground truncate group-hover:text-primary transition-colors">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ticket.senderName} &middot; {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`ml-3 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset shrink-0 ${statusBadge[ticket.status]}`}>
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
