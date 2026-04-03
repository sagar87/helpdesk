import { Navigate, Outlet } from "react-router-dom";
import { LogOut, Headset } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function Layout() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Headset className="size-5 text-primary" />
            <span className="text-lg font-semibold tracking-tight">
              Helpdesk
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                {session.user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium">
                {session.user.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={async () => {
                await authClient.signOut();
                window.location.href = "/login";
              }}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
