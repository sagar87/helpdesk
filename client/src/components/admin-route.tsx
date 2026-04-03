import { Navigate, Outlet } from "react-router-dom";
import { Role } from "core";
import { authClient } from "@/lib/auth-client";

export default function AdminRoute() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return null;

  if ((session?.user as { role?: string })?.role !== Role.ADMIN) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
