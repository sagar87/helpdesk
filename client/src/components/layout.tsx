import { Navigate, Outlet, NavLink } from "react-router-dom";
import { LogOut, Headset } from "lucide-react";
import { Role } from "core";
import { authClient } from "@/lib/auth-client";

export default function Layout() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="size-1.5 rounded-full bg-primary animate-pulse" />
          <div className="size-1.5 rounded-full bg-primary animate-pulse [animation-delay:150ms]" />
          <div className="size-1.5 rounded-full bg-primary animate-pulse [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Headset className="size-4 text-primary" />
              </div>
              <span className="text-sm font-bold tracking-tight text-foreground">
                Helpdesk
              </span>
            </NavLink>
            <nav className="flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/tickets"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`
                }
              >
                Tickets
              </NavLink>
              {(session.user as { role?: string }).role === Role.ADMIN && (
                <NavLink
                  to="/users"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                      isActive
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`
                  }
                >
                  Users
                </NavLink>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 text-primary-foreground flex items-center justify-center text-xs font-bold ring-1 ring-white/10">
                {session.user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-[13px] font-medium text-muted-foreground">
                {session.user.name}
              </span>
            </div>
            <button
              onClick={async () => {
                await authClient.signOut();
                window.location.href = "/login";
              }}
              className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
