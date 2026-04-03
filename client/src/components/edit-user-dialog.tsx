import { useEffect, useState } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { updateUserSchema } from "core";
import { type Role } from "core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UpdateUserInput = z.infer<typeof updateUserSchema>;

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

interface EditUserDialogProps {
  user: User | null;
  onClose: () => void;
}

export function EditUserDialog({ user, onClose }: EditUserDialogProps) {
  const [serverError, setServerError] = useState("");
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  useEffect(() => {
    if (user) {
      reset({ name: user.name, email: user.email, password: "" });
      setServerError("");
    }
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (body: UpdateUserInput) =>
      axios.put<User>(`/api/users/${user!.id}`, body).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
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

  function onSubmit(data: UpdateUserInput) {
    setServerError("");
    mutation.mutate(data);
  }

  return (
    <Dialog open={!!user} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              placeholder="Jane Smith"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              placeholder="jane@example.com"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-password">Password</Label>
            <Input
              id="edit-password"
              type="password"
              placeholder="Leave blank to keep current"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
