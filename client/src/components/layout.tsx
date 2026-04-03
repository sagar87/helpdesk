import { Navigate, Outlet, NavLink } from "react-router-dom";
import { LogOut, Headset } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function Layout() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Headset className="size-5 text-slate-700" />
              <span className="text-base font-semibold tracking-tight text-slate-900">
                Helpdesk
              </span>
            </div>
            {(session.user as { role?: string }).role === "ADMIN" && (
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `text-sm font-medium transition ${isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"}`
                }
              >
                Users
              </NavLink>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                {session.user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700">
                {session.user.name}
              </span>
            </div>
            <button
              onClick={async () => {
                await authClient.signOut();
                window.location.href = "/login";
              }}
              className="flex items-center justify-center size-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <LogOut className="size-4" />
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
