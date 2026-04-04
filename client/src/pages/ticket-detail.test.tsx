import { screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import TicketDetailPage from "./ticket-detail";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const mockTicket = {
  id: "ticket-1",
  subject: "Cannot reset password",
  body: "I am unable to reset my password.",
  senderEmail: "customer@example.com",
  senderName: "Jane Doe",
  status: "OPEN" as const,
  category: "TECHNICAL_QUESTION" as const,
  aiSummary: null,
  assignedTo: null,
  createdAt: "2026-03-15T10:00:00.000Z",
  updatedAt: "2026-03-15T12:00:00.000Z",
  agent: null,
  messages: [
    {
      id: "msg-1",
      body: "I am unable to reset my password.",
      sender: "customer@example.com",
      isAi: false,
      createdAt: "2026-03-15T10:00:00.000Z",
    },
    {
      id: "msg-2",
      body: "I've looked into this and reset your password.",
      sender: "agent@helpdesk.com",
      isAi: false,
      createdAt: "2026-03-15T11:00:00.000Z",
    },
  ],
};

const mockAgents = [
  { id: "agent-1", name: "Alice Agent", email: "alice@helpdesk.com", role: "AGENT", active: true, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "agent-2", name: "Bob Agent", email: "bob@helpdesk.com", role: "AGENT", active: true, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "agent-3", name: "Inactive Agent", email: "inactive@helpdesk.com", role: "AGENT", active: false, createdAt: "2026-01-01T00:00:00.000Z" },
];

function renderTicketDetail(ticketId = "ticket-1") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/tickets/${ticketId}`]}>
        <Routes>
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function mockApiCalls(ticketData = mockTicket, agentsData = mockAgents) {
  mockedAxios.get.mockImplementation((url: string) => {
    if (url.startsWith("/api/tickets/")) return Promise.resolve({ data: ticketData });
    if (url === "/api/users") return Promise.resolve({ data: agentsData });
    return Promise.reject(new Error("Unknown URL"));
  });
}

describe("TicketDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.isAxiosError = vi.fn(() => false) as unknown as typeof axios.isAxiosError;
  });

  it("shows loading skeleton initially", () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    renderTicketDetail();
    // Skeletons are rendered during loading
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("fetches the ticket by ID from the URL", () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    renderTicketDetail("ticket-1");
    expect(mockedAxios.get).toHaveBeenCalledWith("/api/tickets/ticket-1");
  });

  it("renders ticket subject and sender info", async () => {
    mockApiCalls();
    renderTicketDetail();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Cannot reset password" })).toBeInTheDocument();
    });

    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
    // customer@example.com appears in both header and sidebar
    expect(screen.getAllByText(/customer@example.com/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders all messages in the thread", async () => {
    mockApiCalls();
    renderTicketDetail();

    await waitFor(() => {
      expect(screen.getByText("I am unable to reset my password.")).toBeInTheDocument();
    });

    expect(screen.getByText("I've looked into this and reset your password.")).toBeInTheDocument();
    // customer@example.com appears in message sender and sidebar
    expect(screen.getAllByText("customer@example.com").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("agent@helpdesk.com")).toBeInTheDocument();
  });

  it("renders AI messages with AI Assistant label", async () => {
    const ticketWithAi = {
      ...mockTicket,
      messages: [
        ...mockTicket.messages,
        { id: "msg-3", body: "AI generated response", sender: "ai", isAi: true, createdAt: "2026-03-15T12:00:00.000Z" },
      ],
    };
    mockApiCalls(ticketWithAi);
    renderTicketDetail();

    await waitFor(() => {
      expect(screen.getByText("AI Assistant")).toBeInTheDocument();
    });

    expect(screen.getByText("AI generated response")).toBeInTheDocument();
  });

  it("renders status badge", async () => {
    mockApiCalls();
    renderTicketDetail();

    await waitFor(() => {
      expect(screen.getByText("OPEN")).toBeInTheDocument();
    });
  });

  it("renders category label", async () => {
    mockApiCalls();
    renderTicketDetail();

    await waitFor(() => {
      expect(screen.getByText("Technical Question")).toBeInTheDocument();
    });
  });

  it("renders Uncategorized when category is null", async () => {
    mockApiCalls({ ...mockTicket, category: null });
    renderTicketDetail();

    await waitFor(() => {
      expect(screen.getByText("Uncategorized")).toBeInTheDocument();
    });
  });

  it("shows Unassigned in the assign dropdown when no agent", async () => {
    mockApiCalls();
    renderTicketDetail();

    await waitFor(() => {
      expect(screen.getByText("Unassigned")).toBeInTheDocument();
    });
  });

  it("shows assigned agent name in the dropdown", async () => {
    const assignedTicket = {
      ...mockTicket,
      assignedTo: "agent-1",
      agent: { id: "agent-1", name: "Alice Agent", email: "alice@helpdesk.com" },
    };
    mockApiCalls(assignedTicket);
    renderTicketDetail();

    await waitFor(() => {
      expect(screen.getByText("Alice Agent")).toBeInTheDocument();
    });
  });

  it("calls PATCH to assign an agent when selection changes", async () => {
    mockApiCalls();
    mockedAxios.patch.mockResolvedValue({
      data: { ...mockTicket, assignedTo: "agent-1", agent: { id: "agent-1", name: "Alice Agent", email: "alice@helpdesk.com" } },
    });

    renderTicketDetail();

    await waitFor(() => {
      expect(screen.getByText("Cannot reset password")).toBeInTheDocument();
    });

    // Open the Radix Select via keyboard (jsdom doesn't support pointer capture)
    const trigger = screen.getByRole("combobox", { name: /assigned to/i });
    fireEvent.keyDown(trigger, { key: "Enter" });

    const option = await screen.findByRole("option", { name: "Alice Agent" });
    fireEvent.click(option);

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        "/api/tickets/ticket-1/assign",
        { assignedTo: "agent-1" },
      );
    });
  });

  it("calls PATCH with null to unassign an agent", async () => {
    const assignedTicket = {
      ...mockTicket,
      assignedTo: "agent-1",
      agent: { id: "agent-1", name: "Alice Agent", email: "alice@helpdesk.com" },
    };
    mockApiCalls(assignedTicket);
    mockedAxios.patch.mockResolvedValue({
      data: { ...mockTicket, assignedTo: null, agent: null },
    });

    renderTicketDetail();

    await waitFor(() => {
      expect(screen.getByText("Cannot reset password")).toBeInTheDocument();
    });

    const trigger = screen.getByRole("combobox", { name: /assigned to/i });
    fireEvent.keyDown(trigger, { key: "Enter" });

    const option = await screen.findByRole("option", { name: "Unassigned" });
    fireEvent.click(option);

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        "/api/tickets/ticket-1/assign",
        { assignedTo: null },
      );
    });
  });

  it("only shows active agents in the dropdown", async () => {
    mockApiCalls();
    renderTicketDetail();

    await waitFor(() => {
      expect(screen.getByText("Cannot reset password")).toBeInTheDocument();
    });

    const trigger = screen.getByRole("combobox", { name: /assigned to/i });
    fireEvent.keyDown(trigger, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Alice Agent" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Bob Agent" })).toBeInTheDocument();
      expect(screen.queryByRole("option", { name: "Inactive Agent" })).not.toBeInTheDocument();
    });
  });

  it("renders AI summary card when present", async () => {
    mockApiCalls({ ...mockTicket, aiSummary: "Customer cannot reset password due to expired link." });
    renderTicketDetail();

    await waitFor(() => {
      expect(screen.getByText("Customer cannot reset password due to expired link.")).toBeInTheDocument();
    });
  });

  it("does not render AI summary card when null", async () => {
    mockApiCalls();
    renderTicketDetail();

    await waitFor(() => {
      expect(screen.getByText("Cannot reset password")).toBeInTheDocument();
    });

    expect(screen.queryByText("AI Summary")).not.toBeInTheDocument();
  });

  it("shows error message when ticket fetch fails", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));
    renderTicketDetail();

    await waitFor(() => {
      expect(screen.getByText("Network Error")).toBeInTheDocument();
    });
  });

  it("shows 'Ticket not found' for 404 errors", async () => {
    const error = new Error("Not Found");
    (error as unknown as { response: { status: number } }).response = { status: 404 };
    mockedAxios.get.mockRejectedValue(error);
    mockedAxios.isAxiosError = vi.fn(() => true) as unknown as typeof axios.isAxiosError;
    renderTicketDetail();

    await waitFor(() => {
      expect(screen.getByText("Ticket not found.")).toBeInTheDocument();
    });
  });

  it("renders a back to tickets link", async () => {
    mockApiCalls();
    renderTicketDetail();

    await waitFor(() => {
      expect(screen.getByText("Cannot reset password")).toBeInTheDocument();
    });

    expect(screen.getByText("Back to tickets")).toBeInTheDocument();
  });
});
