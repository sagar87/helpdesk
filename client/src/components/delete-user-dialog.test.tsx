import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { renderWithQuery } from "@/test/render";
import { DeleteUserDialog } from "./delete-user-dialog";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const mockAgent = {
  id: "2",
  name: "Agent User",
  email: "agent@example.com",
  role: "AGENT" as const,
  active: true,
  createdAt: "2026-02-20T00:00:00.000Z",
};

describe("DeleteUserDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when user is null", () => {
    renderWithQuery(<DeleteUserDialog user={null} onClose={() => {}} />);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("renders confirmation dialog with user name", () => {
    renderWithQuery(<DeleteUserDialog user={mockAgent} onClose={() => {}} />);

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("Deactivate User")).toBeInTheDocument();
    expect(screen.getByText("Agent User")).toBeInTheDocument();
  });

  it("renders Cancel and Deactivate buttons", () => {
    renderWithQuery(<DeleteUserDialog user={mockAgent} onClose={() => {}} />);

    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Deactivate" })).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithQuery(<DeleteUserDialog user={mockAgent} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalled();
    expect(mockedAxios.delete).not.toHaveBeenCalled();
  });

  it("calls DELETE /api/users/:id on confirm", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { success: true } });
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithQuery(<DeleteUserDialog user={mockAgent} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Deactivate" }));

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith("/api/users/2");
    });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("shows server error in the dialog", async () => {
    mockedAxios.delete.mockRejectedValue({
      isAxiosError: true,
      response: { data: { error: "Admin users cannot be deleted" } },
    });
    mockedAxios.isAxiosError.mockReturnValue(true);

    const user = userEvent.setup();
    renderWithQuery(<DeleteUserDialog user={mockAgent} onClose={() => {}} />);

    await user.click(screen.getByRole("button", { name: "Deactivate" }));

    await waitFor(() => {
      expect(screen.getByText("Admin users cannot be deleted")).toBeInTheDocument();
    });

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });
});
