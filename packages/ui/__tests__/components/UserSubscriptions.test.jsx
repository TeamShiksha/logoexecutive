import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  within,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import UserSubscriptions from "../../src/components/admin/UserSubscriptions";
import { instance } from "../../src/api/api_instance";
import { ToastContext } from "../../src/contexts/Contexts";
import { USER_SUBSCRIPTIONS } from "../../src/utils/Constants";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("../../src/api/api_instance", () => ({
  instance: vi.fn(),
}));

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};

vi.mock("../../src/hooks/useToast.js", () => ({
  useToast: () => mockToast,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeUser = (overrides = {}) => ({
  _id: "user-1",
  name: "Alice",
  email: "alice@example.com",
  is_verified: true,
  is_deleted: false,
  created_at: "2025-11-23T16:47:48.000Z",
  subscription: {
    type: "HOBBY",
    is_active: true,
    usage_count: 42,
    usage_limit: 500,
  },
  ...overrides,
});

const makeListResponse = (
  users = [],
  total = users.length,
  totalPages = 1
) => ({
  data: { data: users, total, currentPage: 1, totalPages },
});

const wrapper = ({ children }) => (
  <ToastContext.Provider value={mockToast}>{children}</ToastContext.Provider>
);

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("UserSubscriptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default GET: empty list
    instance.mockResolvedValue(makeListResponse([]));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the panel with title and search input", async () => {
    render(<UserSubscriptions />, { wrapper });

    expect(screen.getByTestId("user-subscriptions-panel")).toBeInTheDocument();
    expect(screen.getByText(USER_SUBSCRIPTIONS.title)).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByText(USER_SUBSCRIPTIONS.emptyState)
      ).toBeInTheDocument()
    );
  });

  it("shows a loading spinner while fetching", async () => {
    // Never resolve so spinner stays visible throughout the test
    instance.mockReturnValue(new Promise(() => {}));
    render(<UserSubscriptions />, { wrapper });
    // loading is set inside the async useEffect, wait for the spinner to appear
    await waitFor(() =>
      expect(screen.getByTestId("spinner")).toBeInTheDocument()
    );
  });

  it("renders user rows after successful fetch", async () => {
    const users = [
      makeUser({ _id: "u1", name: "Alice", email: "alice@example.com" }),
      makeUser({
        _id: "u2",
        name: "Bob",
        email: "bob@example.com",
        is_verified: false,
        subscription: {
          type: "PRO",
          is_active: false,
          usage_count: 100,
          usage_limit: 10000,
        },
      }),
    ];
    instance.mockResolvedValueOnce(makeListResponse(users));

    render(<UserSubscriptions />, { wrapper });

    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    // Both plan badges present
    expect(
      screen.getByText(USER_SUBSCRIPTIONS.plans.HOBBY)
    ).toBeInTheDocument();
    expect(screen.getByText(USER_SUBSCRIPTIONS.plans.PRO)).toBeInTheDocument();
    // Joined date rendered
    expect(screen.getAllByText(/Joined/).length).toBeGreaterThanOrEqual(1);
    // Kebab buttons present (one per row)
    expect(screen.getAllByLabelText("Row actions").length).toBe(2);
  });

  it("shows empty state when no users are returned", async () => {
    instance.mockResolvedValueOnce(makeListResponse([]));
    render(<UserSubscriptions />, { wrapper });
    await waitFor(() =>
      expect(
        screen.getByText(USER_SUBSCRIPTIONS.emptyState)
      ).toBeInTheDocument()
    );
  });

  it("shows an error toast when the fetch fails", async () => {
    instance.mockRejectedValueOnce({
      response: { data: { message: "Unauthorized" } },
    });
    render(<UserSubscriptions />, { wrapper });
    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith("Unauthorized")
    );
  });

  // ── Pagination ─────────────────────────────────────────────────────────────

  it("does not render pagination when only one page", async () => {
    instance.mockResolvedValueOnce(makeListResponse([makeUser()], 1, 1));
    render(<UserSubscriptions />, { wrapper });
    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());
    expect(screen.queryByLabelText("Next page")).not.toBeInTheDocument();
  });

  it("renders pagination and navigates to next page", async () => {
    const page1Users = [makeUser({ _id: "u1", name: "Alice" })];
    const page2Users = [makeUser({ _id: "u2", name: "Bob" })];

    instance
      .mockResolvedValueOnce(makeListResponse(page1Users, 2, 2))
      .mockResolvedValueOnce(makeListResponse(page2Users, 2, 2));

    render(<UserSubscriptions />, { wrapper });

    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());
    expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Next page"));

    await waitFor(() => expect(screen.getByText("Bob")).toBeInTheDocument());
    expect(screen.getByText(/Page 2 of 2/)).toBeInTheDocument();
  });

  // ── Modal ──────────────────────────────────────────────────────────────────

  it("opens the modal with user info when Change Plan is clicked", async () => {
    const user = makeUser();
    instance.mockResolvedValueOnce(makeListResponse([user]));

    render(<UserSubscriptions />, { wrapper });
    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText("Row actions"));

    expect(
      screen.getByText(USER_SUBSCRIPTIONS.modal.title)
    ).toBeInTheDocument();
    // The modal renders "Name — email" in one paragraph; use within() + regex to scope to the dialog
    const dialog = screen.getByTestId("dialog");
    expect(within(dialog).getByText(/Alice/)).toBeInTheDocument();
  });

  it("closes the modal when Cancel is clicked", async () => {
    const user = makeUser();
    instance.mockResolvedValueOnce(makeListResponse([user]));

    render(<UserSubscriptions />, { wrapper });
    await waitFor(() =>
      expect(screen.getByLabelText("Row actions")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText("Row actions"));
    expect(
      screen.getByText(USER_SUBSCRIPTIONS.modal.title)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(
      screen.queryByText(USER_SUBSCRIPTIONS.modal.title)
    ).not.toBeInTheDocument();
  });

  it("disables the Confirm button when the selected plan is the user's current plan", async () => {
    const user = makeUser({
      subscription: {
        type: "HOBBY",
        is_active: true,
        usage_count: 0,
        usage_limit: 500,
      },
    });
    instance.mockResolvedValueOnce(makeListResponse([user]));

    render(<UserSubscriptions />, { wrapper });
    await waitFor(() =>
      expect(screen.getByLabelText("Row actions")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText("Row actions"));

    const confirmBtn = screen.getByText(USER_SUBSCRIPTIONS.modal.confirmButton);
    // HOBBY is pre-selected (current plan) → button must be disabled
    expect(confirmBtn).toBeDisabled();
  });

  it("enables Confirm when a different plan is selected", async () => {
    const user = makeUser();
    instance.mockResolvedValueOnce(makeListResponse([user]));

    render(<UserSubscriptions />, { wrapper });
    await waitFor(() =>
      expect(screen.getByLabelText("Row actions")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText("Row actions"));

    // Switch to PRO
    fireEvent.click(screen.getByText(USER_SUBSCRIPTIONS.plans.PRO));

    const confirmBtn = screen.getByText(USER_SUBSCRIPTIONS.modal.confirmButton);
    expect(confirmBtn).not.toBeDisabled();
  });

  // ── Optimistic update ──────────────────────────────────────────────────────

  it("optimistically updates the plan badge before the API responds", async () => {
    const user = makeUser({
      subscription: {
        type: "HOBBY",
        is_active: true,
        usage_count: 0,
        usage_limit: 500,
      },
    });
    instance.mockResolvedValueOnce(makeListResponse([user]));

    // PATCH never resolves → we can inspect state while in-flight
    let resolvePatch;
    instance.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePatch = resolve;
        })
    );

    render(<UserSubscriptions />, { wrapper });
    await waitFor(() =>
      expect(screen.getByLabelText("Row actions")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText("Row actions"));
    fireEvent.click(screen.getByText(USER_SUBSCRIPTIONS.plans.PRO));
    fireEvent.click(screen.getByText(USER_SUBSCRIPTIONS.modal.confirmButton));

    // Modal should be closed and badge should already show PRO
    await waitFor(() =>
      expect(
        screen.queryByText(USER_SUBSCRIPTIONS.modal.title)
      ).not.toBeInTheDocument()
    );
    expect(screen.getByText(USER_SUBSCRIPTIONS.plans.PRO)).toBeInTheDocument();

    // Resolve the patch so the promise doesn't linger
    act(() => resolvePatch({ data: {} }));
  });

  it("shows success toast after a successful plan change", async () => {
    const user = makeUser();
    instance.mockResolvedValueOnce(makeListResponse([user]));
    instance.mockResolvedValueOnce({ data: {} }); // PATCH succeeds

    render(<UserSubscriptions />, { wrapper });
    await waitFor(() =>
      expect(screen.getByLabelText("Row actions")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText("Row actions"));
    fireEvent.click(screen.getByText(USER_SUBSCRIPTIONS.plans.PRO));
    fireEvent.click(screen.getByText(USER_SUBSCRIPTIONS.modal.confirmButton));

    await waitFor(() =>
      expect(mockToast.success).toHaveBeenCalledWith(
        USER_SUBSCRIPTIONS.toasts.success
      )
    );
  });

  it("reverts the plan badge and shows error toast when PATCH fails", async () => {
    const user = makeUser({
      subscription: {
        type: "HOBBY",
        is_active: true,
        usage_count: 0,
        usage_limit: 500,
      },
    });
    instance.mockResolvedValueOnce(makeListResponse([user]));
    instance.mockRejectedValueOnce({
      response: { data: { message: "Server error" } },
    });

    render(<UserSubscriptions />, { wrapper });
    await waitFor(() =>
      expect(screen.getByLabelText("Row actions")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText("Row actions"));
    fireEvent.click(screen.getByText(USER_SUBSCRIPTIONS.plans.PRO));
    fireEvent.click(screen.getByText(USER_SUBSCRIPTIONS.modal.confirmButton));

    // Eventually the badge should revert to HOBBY
    await waitFor(() =>
      expect(
        screen.getByText(USER_SUBSCRIPTIONS.plans.HOBBY)
      ).toBeInTheDocument()
    );
    expect(mockToast.error).toHaveBeenCalledWith("Server error");
    // PRO badge should no longer appear
    expect(
      screen.queryByText(USER_SUBSCRIPTIONS.plans.PRO)
    ).not.toBeInTheDocument();
  });

  it("sends the optional reason in the PATCH payload", async () => {
    const user = makeUser();
    instance.mockResolvedValueOnce(makeListResponse([user]));
    instance.mockResolvedValueOnce({ data: {} });

    render(<UserSubscriptions />, { wrapper });
    await waitFor(() =>
      expect(screen.getByLabelText("Row actions")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText("Row actions"));
    fireEvent.click(screen.getByText(USER_SUBSCRIPTIONS.plans.PRO));

    const textarea = screen.getByPlaceholderText(
      USER_SUBSCRIPTIONS.modal.reasonPlaceholder
    );
    fireEvent.change(textarea, { target: { value: "Promotional upgrade" } });

    fireEvent.click(screen.getByText(USER_SUBSCRIPTIONS.modal.confirmButton));

    await waitFor(() =>
      expect(instance).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "PATCH",
          data: expect.objectContaining({ reason: "Promotional upgrade" }),
        })
      )
    );
  });

  it("omits reason from PATCH payload when the field is empty", async () => {
    const user = makeUser();
    instance.mockResolvedValueOnce(makeListResponse([user]));
    instance.mockResolvedValueOnce({ data: {} });

    render(<UserSubscriptions />, { wrapper });
    await waitFor(() =>
      expect(screen.getByLabelText("Row actions")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText("Row actions"));
    fireEvent.click(screen.getByText(USER_SUBSCRIPTIONS.plans.PRO));
    fireEvent.click(screen.getByText(USER_SUBSCRIPTIONS.modal.confirmButton));

    await waitFor(() =>
      expect(instance).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({ reason: expect.anything() }),
        })
      )
    );
  });
});
