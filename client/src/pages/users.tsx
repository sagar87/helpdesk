import { CreateUserDialog } from "@/components/create-user-dialog";
import { UserTable } from "@/components/user-table";

export default function UsersPage() {
  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage team members and their roles.
          </p>
        </div>
        <CreateUserDialog />
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <UserTable />
      </div>
    </div>
  );
}
