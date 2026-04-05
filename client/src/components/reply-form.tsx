import { useRef, useState, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ReplyFormProps {
  ticketId: string;
  onSubmit: (body: string) => void;
  isPending: boolean;
  isError: boolean;
  resetKey?: number;
}

export function ReplyForm({ ticketId, onSubmit, isPending, isError, resetKey }: ReplyFormProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [validationError, setValidationError] = useState("");
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishError, setPolishError] = useState("");
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    if (ref.current) ref.current.value = "";
    setValidationError("");
    setHasContent(false);
  }, [resetKey]);

  async function handlePolish() {
    const body = ref.current?.value.trim();
    if (!body) return;

    setPolishError("");
    setIsPolishing(true);
    try {
      const res = await axios.post<{ polished: string }>(
        `/api/tickets/${ticketId}/polish`,
        { body }
      );
      if (ref.current) {
        ref.current.value = res.data.polished;
        setHasContent(!!res.data.polished.trim());
      }
    } catch {
      setPolishError("Failed to polish reply.");
    } finally {
      setIsPolishing(false);
    }
  }

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
            disabled={isPending || isPolishing}
            onChange={() => {
              setHasContent(!!ref.current?.value.trim());
              if (validationError) setValidationError("");
            }}
          />
          {validationError && (
            <p className="text-xs text-destructive mb-2">{validationError}</p>
          )}
          {!validationError && <div className="mb-2" />}
          <div className="flex items-center justify-between">
            <div>
              {isError && (
                <p className="text-xs text-destructive">
                  Failed to send reply. Please try again.
                </p>
              )}
              {polishError && (
                <p className="text-xs text-destructive">{polishError}</p>
              )}
            </div>
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isPending || isPolishing || !hasContent}
                onClick={handlePolish}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                {isPolishing ? "Polishing..." : "Polish"}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending || isPolishing || !hasContent}
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
