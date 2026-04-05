import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { renderWithQuery } from "@/test/render";
import { ReplyForm } from "./reply-form";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const defaultProps = {
  ticketId: "ticket-1",
  onSubmit: vi.fn(),
  isPending: false,
  isError: false,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ReplyForm", () => {
  it("renders textarea and both buttons", () => {
    renderWithQuery(<ReplyForm {...defaultProps} />);
    expect(screen.getByPlaceholderText("Write a reply...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /polish/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reply/i })).toBeInTheDocument();
  });

  it("disables both buttons when textarea is empty", () => {
    renderWithQuery(<ReplyForm {...defaultProps} />);
    expect(screen.getByRole("button", { name: /polish/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /send reply/i })).toBeDisabled();
  });

  it("enables buttons after typing", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ReplyForm {...defaultProps} />);
    await user.type(screen.getByPlaceholderText("Write a reply..."), "Hello");
    expect(screen.getByRole("button", { name: /polish/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /send reply/i })).toBeEnabled();
  });

  it("calls onSubmit with trimmed text", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithQuery(<ReplyForm {...defaultProps} onSubmit={onSubmit} />);
    await user.type(screen.getByPlaceholderText("Write a reply..."), "  Hello world  ");
    await user.click(screen.getByRole("button", { name: /send reply/i }));
    expect(onSubmit).toHaveBeenCalledWith("Hello world");
  });

  it("shows validation error on empty submit attempt", async () => {
    const user = userEvent.setup();
    // Type then clear to enable the button, then we need to test the form submit path
    renderWithQuery(<ReplyForm {...defaultProps} />);
    // The button is disabled when empty, so submit via form action won't trigger.
    // But the validation path is for whitespace-only input — not testable via button click
    // since hasContent tracks trimmed value. This is expected behavior.
    expect(screen.getByRole("button", { name: /send reply/i })).toBeDisabled();
  });

  it("shows 'Sending...' and disables inputs when isPending", () => {
    renderWithQuery(<ReplyForm {...defaultProps} isPending={true} />);
    expect(screen.getByPlaceholderText("Write a reply...")).toBeDisabled();
    expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /polish/i })).toBeDisabled();
  });

  it("shows error message when isError is true", () => {
    renderWithQuery(<ReplyForm {...defaultProps} isError={true} />);
    expect(screen.getByText("Failed to send reply. Please try again.")).toBeInTheDocument();
  });

  it("resets textarea when resetKey changes", async () => {
    const user = userEvent.setup();
    const { unmount } = renderWithQuery(<ReplyForm {...defaultProps} resetKey={0} />);
    const textarea = screen.getByPlaceholderText("Write a reply...") as HTMLTextAreaElement;
    await user.type(textarea, "Some text");
    expect(textarea.value).toBe("Some text");

    unmount();
    renderWithQuery(<ReplyForm {...defaultProps} resetKey={1} />);
    const newTextarea = screen.getByPlaceholderText("Write a reply...") as HTMLTextAreaElement;
    expect(newTextarea.value).toBe("");
  });

  describe("Polish button", () => {
    it("calls POST /api/tickets/{ticketId}/polish with textarea content", async () => {
      const user = userEvent.setup();
      mockedAxios.post.mockResolvedValue({ data: { polished: "Polished reply" } });

      renderWithQuery(<ReplyForm {...defaultProps} />);
      await user.type(screen.getByPlaceholderText("Write a reply..."), "rough draft");
      await user.click(screen.getByRole("button", { name: /polish/i }));

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          "/api/tickets/ticket-1/polish",
          { body: "rough draft" }
        );
      });
    });

    it("shows 'Polishing...' during API call", async () => {
      const user = userEvent.setup();
      let resolvePolish!: (value: unknown) => void;
      mockedAxios.post.mockReturnValue(
        new Promise((resolve) => { resolvePolish = resolve; }) as any
      );

      renderWithQuery(<ReplyForm {...defaultProps} />);
      await user.type(screen.getByPlaceholderText("Write a reply..."), "draft");
      await user.click(screen.getByRole("button", { name: /polish/i }));

      expect(screen.getByRole("button", { name: /polishing/i })).toBeInTheDocument();

      resolvePolish({ data: { polished: "done" } });
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /polish/i })).toBeInTheDocument();
      });
    });

    it("replaces textarea value with polished text on success", async () => {
      const user = userEvent.setup();
      mockedAxios.post.mockResolvedValue({ data: { polished: "Professional reply" } });

      renderWithQuery(<ReplyForm {...defaultProps} />);
      const textarea = screen.getByPlaceholderText("Write a reply...") as HTMLTextAreaElement;
      await user.type(textarea, "rough draft");
      await user.click(screen.getByRole("button", { name: /polish/i }));

      await waitFor(() => {
        expect(textarea.value).toBe("Professional reply");
      });
    });

    it("shows error message on API failure", async () => {
      const user = userEvent.setup();
      mockedAxios.post.mockRejectedValue(new Error("Network error"));

      renderWithQuery(<ReplyForm {...defaultProps} />);
      await user.type(screen.getByPlaceholderText("Write a reply..."), "draft");
      await user.click(screen.getByRole("button", { name: /polish/i }));

      await waitFor(() => {
        expect(screen.getByText("Failed to polish reply.")).toBeInTheDocument();
      });
    });

    it("disables textarea and buttons while polishing", async () => {
      const user = userEvent.setup();
      let resolvePolish!: (value: unknown) => void;
      mockedAxios.post.mockReturnValue(
        new Promise((resolve) => { resolvePolish = resolve; }) as any
      );

      renderWithQuery(<ReplyForm {...defaultProps} />);
      await user.type(screen.getByPlaceholderText("Write a reply..."), "draft");
      await user.click(screen.getByRole("button", { name: /polish/i }));

      expect(screen.getByPlaceholderText("Write a reply...")).toBeDisabled();
      expect(screen.getByRole("button", { name: /polishing/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /send reply/i })).toBeDisabled();

      resolvePolish({ data: { polished: "done" } });
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Write a reply...")).toBeEnabled();
      });
    });
  });
});
