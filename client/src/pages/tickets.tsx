import { TicketTable } from "@/components/ticket-table";

export default function TicketsPage() {
  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage support tickets.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <TicketTable />
      </div>
    </div>
  );
}
