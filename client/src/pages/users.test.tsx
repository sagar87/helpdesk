import { screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { renderWithQuery } from "@/test/render";
import UsersPage from "./users";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const mockUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "ADMIN" as const,
    active: true,
    createdAt: "2026-01-15T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Agent User",
    email: "agent@example.com",
    role: "AGENT" as const,
    active: true,
    createdAt: "2026-02-20T00:00:00.000Z",
  },
  {
    id: "3",
    name: "Inactive Agent",
    email: "inactive@example.com",
    role: "AGENT" as const,
    active: false,
    createdAt: "2026-03-10T00:00:00.000Z",
  },
];

describe("UsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page heading", () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    renderWithQuery(<UsersPage />);
    expect(screen.getByRole("heading", { name: "Users" })).toBeInTheDocument();
    expect(screen.getByText("Manage team members and their roles.")).toBeInTheDocument();
  });

  it("shows skeleton rows while loading", () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    renderWithQuery(<UsersPage />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    // Skeleton table should have 5 placeholder rows
    const rows = screen.getAllByRole("row");
    // 1 header row + 5 skeleton rows
    expect(rows).toHaveLength(6);
  });

  it("renders users in a table after loading", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockUsers });
    renderWithQuery(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Admin User")).toBeInTheDocument();
    });

    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    expect(screen.getByText("agent@example.com")).toBeInTheDocument();
    expect(screen.getByText("inactive@example.com")).toBeInTheDocument();
    expect(screen.getByText("ADMIN")).toBeInTheDocument();
    expect(screen.getAllByText("AGENT")).toHaveLength(2);
  });

  it("shows Active and Inactive badges correctly", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockUsers });
    renderWithQuery(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Admin User")).toBeInTheDocument();
    });

    expect(screen.getAllByText("Active")).toHaveLength(2);
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("formats created dates", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockUsers });
    renderWithQuery(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Admin User")).toBeInTheDocument();
    });

    // Dates should be rendered via toLocaleDateString
    const dateCell = screen.getByText(
      new Date("2026-01-15T00:00:00.000Z").toLocaleDateString()
    );
    expect(dateCell).toBeInTheDocument();
  });

  it("shows an error message when the request fails", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));
    renderWithQuery(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Network Error")).toBeInTheDocument();
    });
  });

  it("renders an empty table when there are no users", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    renderWithQuery(<UsersPage />);

    await waitFor(() => {
      // Header row only, no data rows
      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(1);
    });
  });

  it("calls the correct API endpoint", () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    renderWithQuery(<UsersPage />);
    expect(mockedAxios.get).toHaveBeenCalledWith("/api/users");
  });

  it("renders the Create User button", () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    renderWithQuery(<UsersPage />);
    expect(screen.getByRole("button", { name: "Create User" })).toBeInTheDocument();
  });
});
