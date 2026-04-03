import { Ticket, CircleDot, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Total Tickets", value: "—", icon: Ticket, color: "text-blue-500" },
  { label: "Open", value: "—", icon: CircleDot, color: "text-amber-500" },
  { label: "Resolved", value: "—", icon: CheckCircle2, color: "text-emerald-500" },
  { label: "Closed", value: "—", icon: XCircle, color: "text-muted-foreground" },
];

export default function HomePage() {
  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your helpdesk activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`size-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Recent Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Ticket className="size-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              No tickets yet. They'll show up here once created.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
