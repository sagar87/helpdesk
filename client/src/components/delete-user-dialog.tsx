import { useState } from "react";
import axios from "axios";
import { type Role } from "core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

interface DeleteUserDialogProps {
  user: User | null;
  onClose: () => void;
}

export function DeleteUserDialog({ user, onClose }: DeleteUserDialogProps) {
  const [serverError, setServerError] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) =>
      axios.delete(`/api/users/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setServerError("");
      onClose();
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setServerError(err.response.data.error);
      } else {
        setServerError("Something went wrong");
      }
    },
  });

  function handleClose() {
    setServerError("");
    onClose();
  }

  return (
    <AlertDialog open={!!user} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to deactivate <strong>{user?.name}</strong>?
            They will no longer be able to sign in.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            onClick={(e) => {
              e.preventDefault();
              if (user) mutation.mutate(user.id);
            }}
          >
            {mutation.isPending ? "Deactivating…" : "Deactivate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
