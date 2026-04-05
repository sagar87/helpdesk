import { useRef, useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ReplyFormProps {
  onSubmit: (body: string) => void;
  isPending: boolean;
  isError: boolean;
  resetKey?: number;
}

export function ReplyForm({ onSubmit, isPending, isError, resetKey }: ReplyFormProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (ref.current) ref.current.value = "";
    setValidationError("");
  }, [resetKey]);

  return (
    <Card>
      <CardContent className="p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const body = ref.current?.value.trim();
            if (!body) {
              setValidationError("Reply cannot be empty.");
              return;
            }
            setValidationError("");
            onSubmit(body);
          }}
        >
          <Textarea
            ref={ref}
            placeholder="Write a reply..."
            rows={3}
            className={`mb-1 resize-none ${validationError ? "border-destructive" : ""}`}
            disabled={isPending}
            onChange={() => { if (validationError) setValidationError(""); }}
          />
          {validationError && (
            <p className="text-xs text-destructive mb-2">{validationError}</p>
          )}
          {!validationError && <div className="mb-2" />}
          <div className="flex items-center justify-between">
            {isError && (
              <p className="text-xs text-destructive">
                Failed to send reply. Please try again.
              </p>
            )}
            <div className="ml-auto">
              <Button
                type="submit"
                size="sm"
                disabled={isPending}
              >
                <Send className="h-4 w-4 mr-1" />
                {isPending ? "Sending..." : "Send Reply"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
