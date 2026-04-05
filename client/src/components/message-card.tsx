import { User, Bot } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface MessageCardProps {
  sender: string;
  body: string;
  isAi: boolean;
  createdAt: string;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function MessageCard({ sender, body, isAi, createdAt }: MessageCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            {isAi ? (
              <>
                <Bot className="h-4 w-4 text-violet-500" />
                <span>AI Assistant</span>
              </>
            ) : (
              <>
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{sender}</span>
              </>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDate(createdAt)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <p className="text-sm whitespace-pre-wrap">{body}</p>
      </CardContent>
    </Card>
  );
}
