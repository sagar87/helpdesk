function formatDate(date: string) {
  return new Date(date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface TicketHeaderProps {
  subject: string;
  senderName: string;
  senderEmail: string;
  createdAt: string;
}

export function TicketHeader({ subject, senderName, senderEmail, createdAt }: TicketHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{subject}</h1>
      <p className="text-sm text-muted-foreground mt-1">
        From {senderName} &lt;{senderEmail}&gt;
        {" "}&middot;{" "}
        {formatDate(createdAt)}
      </p>
    </div>
  );
}
