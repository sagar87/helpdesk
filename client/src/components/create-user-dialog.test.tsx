import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { renderWithQuery } from "@/test/render";
import { CreateUserDialog } from "./create-user-dialog";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Create User" }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
}

describe("CreateUserDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the trigger button", () => {
    renderWithQuery(<CreateUserDialog />);
    expect(screen.getByRole("button", { name: "Create User" })).toBeInTheDocument();
  });

  it("opens the dialog with title and description", async () => {
    const user = userEvent.setup();
    renderWithQuery(<CreateUserDialog />);

    await openDialog(user);

    expect(screen.getByRole("heading", { name: "Create User" })).toBeInTheDocument();
    expect(screen.getByText("Add a new team member.")).toBeInTheDocument();
  });

  it("renders name, email, and password fields", async () => {
    const user = userEvent.setup();
    renderWithQuery(<CreateUserDialog />);

    await openDialog(user);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("shows all validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    renderWithQuery(<CreateUserDialog />);

    await openDialog(user);
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("shows error for password shorter than 12 characters", async () => {
    const user = userEvent.setup();
    renderWithQuery(<CreateUserDialog />);

    await openDialog(user);
    await user.type(screen.getByLabelText("Name"), "Test User");
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(screen.getByText("Password must be at least 12 characters")).toBeInTheDocument();
  });

  it("sets aria-invalid on fields with errors", async () => {
    const user = userEvent.setup();
    renderWithQuery(<CreateUserDialog />);

    await openDialog(user);
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Password")).toHaveAttribute("aria-invalid", "true");
  });

  it("does not set aria-invalid on valid fields", async () => {
    const user = userEvent.setup();
    renderWithQuery(<CreateUserDialog />);

    await openDialog(user);
    await user.type(screen.getByLabelText("Name"), "Test User");
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    // Leave password empty to trigger only its error
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "false");
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "false");
    expect(screen.getByLabelText("Password")).toHaveAttribute("aria-invalid", "true");
  });

  it("does not call API when form is invalid", async () => {
    const user = userEvent.setup();
    renderWithQuery(<CreateUserDialog />);

    await openDialog(user);
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it("calls POST /api/users with form data on valid submission", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { id: "1", name: "Jane Smith", email: "jane@example.com", role: "AGENT", active: true, createdAt: "2026-04-01T00:00:00.000Z" },
    });
    const user = userEvent.setup();
    renderWithQuery(<CreateUserDialog />);

    await openDialog(user);
    await user.type(screen.getByLabelText("Name"), "Jane Smith");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "securepassword123");
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith("/api/users", {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "securepassword123",
      });
    });
  });

  it("closes the dialog and resets fields on successful submission", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { id: "1", name: "Jane Smith", email: "jane@example.com", role: "AGENT", active: true, createdAt: "2026-04-01T00:00:00.000Z" },
    });
    const user = userEvent.setup();
    renderWithQuery(<CreateUserDialog />);

    await openDialog(user);
    await user.type(screen.getByLabelText("Name"), "Jane Smith");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "securepassword123");
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // Re-open dialog to verify fields are reset
    await openDialog(user);
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Email")).toHaveValue("");
    expect(screen.getByLabelText("Password")).toHaveValue("");
  });

  it("shows server error message on API failure", async () => {
    mockedAxios.post.mockRejectedValue({
      isAxiosError: true,
      response: { data: { error: "A user with this email already exists" } },
    });
    mockedAxios.isAxiosError.mockReturnValue(true);

    const user = userEvent.setup();
    renderWithQuery(<CreateUserDialog />);

    await openDialog(user);
    await user.type(screen.getByLabelText("Name"), "Jane Smith");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "securepassword123");
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(screen.getByText("A user with this email already exists")).toBeInTheDocument();
    });

    // Dialog should remain open
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows generic error when server error has no message", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Network Error"));
    mockedAxios.isAxiosError.mockReturnValue(false);

    const user = userEvent.setup();
    renderWithQuery(<CreateUserDialog />);

    await openDialog(user);
    await user.type(screen.getByLabelText("Name"), "Jane Smith");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "securepassword123");
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });

  it("clears server error when dialog is closed and reopened", async () => {
    mockedAxios.post.mockRejectedValue({
      isAxiosError: true,
      response: { data: { error: "A user with this email already exists" } },
    });
    mockedAxios.isAxiosError.mockReturnValue(true);

    const user = userEvent.setup();
    renderWithQuery(<CreateUserDialog />);

    await openDialog(user);
    await user.type(screen.getByLabelText("Name"), "Jane Smith");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "securepassword123");
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(screen.getByText("A user with this email already exists")).toBeInTheDocument();
    });

    // Close with Escape and reopen
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    await openDialog(user);
    expect(screen.queryByText("A user with this email already exists")).not.toBeInTheDocument();
  });
});
