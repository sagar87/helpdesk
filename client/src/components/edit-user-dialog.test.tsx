import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { renderWithQuery } from "@/test/render";
import { EditUserDialog } from "./edit-user-dialog";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const mockUser = {
  id: "1",
  name: "Admin User",
  email: "admin@example.com",
  role: "ADMIN" as const,
  active: true,
  createdAt: "2026-01-15T00:00:00.000Z",
};

describe("EditUserDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render the dialog when user is null", () => {
    renderWithQuery(<EditUserDialog user={null} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens dialog with pre-populated name and email", () => {
    renderWithQuery(<EditUserDialog user={mockUser} onClose={() => {}} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("Admin User");
    expect(screen.getByLabelText("Email")).toHaveValue("admin@example.com");
  });

  it("has an empty password field by default", () => {
    renderWithQuery(<EditUserDialog user={mockUser} onClose={() => {}} />);
    expect(screen.getByLabelText("Password")).toHaveValue("");
  });

  it("shows validation error when name is cleared", async () => {
    const user = userEvent.setup();
    renderWithQuery(<EditUserDialog user={mockUser} onClose={() => {}} />);

    await user.clear(screen.getByLabelText("Name"));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Name is required")).toBeInTheDocument();
  });

  it("does not call API when form is invalid", async () => {
    const user = userEvent.setup();
    renderWithQuery(<EditUserDialog user={mockUser} onClose={() => {}} />);

    await user.clear(screen.getByLabelText("Name"));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(mockedAxios.put).not.toHaveBeenCalled();
  });

  it("shows validation error for short password", async () => {
    const user = userEvent.setup();
    renderWithQuery(<EditUserDialog user={mockUser} onClose={() => {}} />);

    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Password must be at least 12 characters")).toBeInTheDocument();
  });

  it("submits with empty password when password is not changed", async () => {
    mockedAxios.put.mockResolvedValue({ data: mockUser });
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithQuery(<EditUserDialog user={mockUser} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith("/api/users/1", {
        name: "Admin User",
        email: "admin@example.com",
        password: "",
      });
    });
  });

  it("submits with updated data and calls onClose on success", async () => {
    mockedAxios.put.mockResolvedValue({
      data: { ...mockUser, name: "Updated Name" },
    });
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithQuery(<EditUserDialog user={mockUser} onClose={onClose} />);

    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Updated Name");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith("/api/users/1", {
        name: "Updated Name",
        email: "admin@example.com",
        password: "",
      });
    });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("submits with new password when provided", async () => {
    mockedAxios.put.mockResolvedValue({ data: mockUser });
    const user = userEvent.setup();
    renderWithQuery(<EditUserDialog user={mockUser} onClose={() => {}} />);

    await user.type(screen.getByLabelText("Password"), "newpassword12345");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith("/api/users/1", {
        name: "Admin User",
        email: "admin@example.com",
        password: "newpassword12345",
      });
    });
  });

  it("shows server error in the dialog", async () => {
    mockedAxios.put.mockRejectedValue({
      isAxiosError: true,
      response: { data: { error: "A user with this email already exists" } },
    });
    mockedAxios.isAxiosError.mockReturnValue(true);

    const user = userEvent.setup();
    renderWithQuery(<EditUserDialog user={mockUser} onClose={() => {}} />);

    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByText("A user with this email already exists")).toBeInTheDocument();
    });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
