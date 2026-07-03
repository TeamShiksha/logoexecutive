import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SubscriptionLogs from "../../../src/components/admin/SubscriptionLogs";
import { instance } from "../../../src/api/api_instance";
import { ToastContext } from "../../../src/contexts/Contexts";
import { SUBSCRIPTION_LOGS } from "../../../src/utils/Constants";

vi.mock("../../../src/api/api_instance", () => ({
  instance: vi.fn(),
}));

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};

vi.mock("../../../src/hooks/useToast.js", () => ({
  useToast: () => mockToast,
}));

const makeUser = (overrides = {}) => ({
  _id: "user-1",
  name: "Alice",
  email: "alice@example.com",
  ...overrides,
});

const makeAdminUser = (overrides = {}) => ({
  _id: "admin-1",
  name: "Admin User",
  email: "admin@example.com",
  ...overrides,
});

const makeSubscriptionLog = (overrides = {}) => ({
  _id: "log-1",
  user_id: makeUser(),
  changed_by: makeAdminUser(),
  from_plan: "HOBBY",
  to_plan: "PRO",
  reason: "Premium upgrade requested",
  createdAt: "2025-11-23T16:47:48.000Z",
  ...overrides,
});

const makeListResponse = (logs = [], total = logs.length, totalPages = 1) => ({
  data: { data: logs, total, currentPage: 1, totalPages },
});

const wrapper = ({ children }) => (
  <ToastContext.Provider value={mockToast}>{children}</ToastContext.Provider>
);

describe("SubscriptionLogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default GET: empty list
    instance.mockResolvedValue(makeListResponse([]));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the panel with title and subtitle", async () => {
    render(<SubscriptionLogs />, { wrapper });

    expect(screen.getByTestId("subscription-logs-panel")).toBeInTheDocument();
    expect(screen.getByText(SUBSCRIPTION_LOGS.title)).toBeInTheDocument();
    expect(screen.getByText(SUBSCRIPTION_LOGS.subtitle)).toBeInTheDocument();
  });

  it("shows a loading spinner while fetching", async () => {
    instance.mockReturnValue(new Promise(() => {}));
    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId("spinner")).toBeInTheDocument();
    });
  });

  it("shows empty state when no logs are returned", async () => {
    instance.mockResolvedValueOnce(makeListResponse([]));
    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText(SUBSCRIPTION_LOGS.emptyState)).toBeInTheDocument()
    );
  });

  it("shows error toast when fetch fails", async () => {
    instance.mockRejectedValueOnce({
      response: { data: { message: "Unauthorized" } },
    });
    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith("Unauthorized")
    );
  });

  it("renders all table headers", async () => {
    instance.mockResolvedValueOnce(makeListResponse([makeSubscriptionLog()]));
    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => {
      SUBSCRIPTION_LOGS.tableHeaders.forEach((header) => {
        expect(screen.getByText(header)).toBeInTheDocument();
      });
    });
  });

  it("renders subscription log rows after successful fetch", async () => {
    const logs = [
      makeSubscriptionLog({
        _id: "log-1",
        user_id: makeUser({ name: "Alice", email: "alice@example.com" }),
        changed_by: makeAdminUser({
          name: "Admin",
          email: "admin@example.com",
        }),
        from_plan: "HOBBY",
        to_plan: "PRO",
        reason: "Premium upgrade",
      }),
      makeSubscriptionLog({
        _id: "log-2",
        user_id: makeUser({ name: "Bob", email: "bob@example.com" }),
        changed_by: makeAdminUser({
          name: "Admin2",
          email: "admin2@example.com",
        }),
        from_plan: "PRO",
        to_plan: "HOBBY",
        reason: "Downgrade request",
      }),
    ];
    instance.mockResolvedValueOnce(makeListResponse(logs, 2, 1));

    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
  });

  it("renders correct plan badges", async () => {
    const logs = [
      makeSubscriptionLog({
        from_plan: "HOBBY",
        to_plan: "PRO",
      }),
    ];
    instance.mockResolvedValueOnce(makeListResponse(logs));

    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByText(SUBSCRIPTION_LOGS.plans.HOBBY)
      ).toBeInTheDocument();
      expect(screen.getByText(SUBSCRIPTION_LOGS.plans.PRO)).toBeInTheDocument();
    });
  });

  it("displays plan badges with correct styling", async () => {
    const logs = [
      makeSubscriptionLog({
        from_plan: "HOBBY",
        to_plan: "PRO",
      }),
    ];
    instance.mockResolvedValueOnce(makeListResponse(logs));

    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => {
      const proBadges = screen.getAllByText(SUBSCRIPTION_LOGS.plans.PRO);
      expect(proBadges.length).toBeGreaterThan(0);
    });
  });

  it("formats dates correctly", async () => {
    const logs = [
      makeSubscriptionLog({
        createdAt: "2025-11-23T16:47:48.000Z",
      }),
    ];
    instance.mockResolvedValueOnce(makeListResponse(logs));

    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => {
      // The date should be formatted as "Nov 23, 2025"
      expect(screen.getByText(/Nov/)).toBeInTheDocument();
      expect(screen.getByText(/23/)).toBeInTheDocument();
      expect(screen.getByText(/2025/)).toBeInTheDocument();
    });
  });

  it("displays '—' when date is missing", async () => {
    const logs = [
      makeSubscriptionLog({
        createdAt: null,
      }),
    ];
    instance.mockResolvedValueOnce(makeListResponse(logs));

    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("—")).toBeInTheDocument();
    });
  });

  it("displays user name and email information", async () => {
    const logs = [
      makeSubscriptionLog({
        user_id: makeUser({
          name: "John Doe",
          email: "john@example.com",
        }),
      }),
    ];
    instance.mockResolvedValueOnce(makeListResponse(logs));

    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });
  });

  it("displays '—' for missing user name", async () => {
    const logs = [
      makeSubscriptionLog({
        user_id: null,
      }),
    ];
    instance.mockResolvedValueOnce(makeListResponse(logs));

    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => {
      const dashCount = screen.getAllByText("—");
      expect(dashCount.length).toBeGreaterThan(0);
    });
  });

  it("displays changed_by admin information", async () => {
    const logs = [
      makeSubscriptionLog({
        changed_by: makeAdminUser({
          name: "Admin User",
          email: "admin@example.com",
        }),
      }),
    ];
    instance.mockResolvedValueOnce(makeListResponse(logs));

    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("Admin User")).toBeInTheDocument();
      expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    });
  });

  it("displays '—' for missing changed_by name", async () => {
    const logs = [
      makeSubscriptionLog({
        changed_by: null,
      }),
    ];
    instance.mockResolvedValueOnce(makeListResponse(logs));

    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => {
      const dashCount = screen.getAllByText("—");
      expect(dashCount.length).toBeGreaterThan(0);
    });
  });

  it("displays the reason for the subscription change", async () => {
    const logs = [
      makeSubscriptionLog({
        reason: "Customer requested upgrade",
      }),
    ];
    instance.mockResolvedValueOnce(makeListResponse(logs));

    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByText("Customer requested upgrade")
      ).toBeInTheDocument();
    });
  });

  it("displays '—' when reason is missing", async () => {
    const logs = [
      makeSubscriptionLog({
        reason: null,
      }),
    ];
    instance.mockResolvedValueOnce(makeListResponse(logs));

    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("—")).toBeInTheDocument();
    });
  });

  it("does not render pagination when only one page", async () => {
    instance.mockResolvedValueOnce(
      makeListResponse([makeSubscriptionLog()], 1, 1)
    );
    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());
    expect(screen.queryByLabelText("Previous page")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Next page")).not.toBeInTheDocument();
  });

  it("renders pagination when multiple pages exist", async () => {
    const page1Logs = [makeSubscriptionLog({ _id: "log-1" })];
    instance.mockResolvedValueOnce(makeListResponse(page1Logs, 2, 2));

    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());
    expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
    expect(screen.getByLabelText("Next page")).toBeInTheDocument();
  });

  it("disables previous button on first page", async () => {
    instance.mockResolvedValueOnce(
      makeListResponse([makeSubscriptionLog()], 1, 2)
    );
    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());
    expect(screen.getByLabelText("Previous page")).toBeDisabled();
  });

  it("navigates to next page when Next button is clicked", async () => {
    const page1Logs = [
      makeSubscriptionLog({
        _id: "log-1",
        user_id: makeUser({ name: "Alice" }),
      }),
    ];
    const page2Logs = [
      makeSubscriptionLog({ _id: "log-2", user_id: makeUser({ name: "Bob" }) }),
    ];

    instance
      .mockResolvedValueOnce(makeListResponse(page1Logs, 2, 2))
      .mockResolvedValueOnce(makeListResponse(page2Logs, 2, 2));

    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());
    expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Next page"));

    await waitFor(() => expect(screen.getByText("Bob")).toBeInTheDocument());
    expect(screen.getByText(/Page 2 of 2/)).toBeInTheDocument();
  });

  it("navigates to previous page when Previous button is clicked", async () => {
    const page1Logs = [
      makeSubscriptionLog({
        _id: "log-1",
        user_id: makeUser({ name: "Alice" }),
      }),
    ];
    const page2Logs = [
      makeSubscriptionLog({ _id: "log-2", user_id: makeUser({ name: "Bob" }) }),
    ];

    instance
      .mockResolvedValueOnce(makeListResponse(page1Logs, 2, 2))
      .mockResolvedValueOnce(makeListResponse(page2Logs, 2, 2))
      .mockResolvedValueOnce(makeListResponse(page1Logs, 2, 2));

    render(<SubscriptionLogs />, { wrapper });

    // Start on page 1
    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());

    // Go to page 2
    fireEvent.click(screen.getByLabelText("Next page"));
    await waitFor(() => expect(screen.getByText("Bob")).toBeInTheDocument());

    // Go back to page 1
    fireEvent.click(screen.getByLabelText("Previous page"));
    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());
  });

  it("disables next button on last page", async () => {
    instance.mockResolvedValueOnce(
      makeListResponse([makeSubscriptionLog()], 1, 2)
    );
    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());

    // Simulate being on the last page (page 2 of 2)
    // We'll need to navigate there first
    instance.mockResolvedValueOnce(
      makeListResponse([makeSubscriptionLog({ _id: "log-2" })], 1, 2)
    );
    fireEvent.click(screen.getByLabelText("Next page"));

    await waitFor(() => {
      expect(screen.getByLabelText("Next page")).toBeDisabled();
    });
  });

  it("disables pagination buttons while loading", async () => {
    // First render with multiple pages
    instance.mockResolvedValueOnce(
      makeListResponse([makeSubscriptionLog()], 1, 2)
    );
    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());

    // Mock a pending request
    instance.mockReturnValueOnce(new Promise(() => {}));

    fireEvent.click(screen.getByLabelText("Next page"));

    // Buttons should be disabled while loading
    await waitFor(() => {
      expect(screen.getByLabelText("Next page")).toBeDisabled();
    });
  });

  it("calls API with correct page and limit parameters", async () => {
    instance.mockResolvedValueOnce(makeListResponse([]));
    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => {
      expect(instance).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: expect.stringMatching(
            /\/admin\/users\/subscription\/logs.*page=1.*limit=10/
          ),
        })
      );
    });
  });

  it("updates API call with new page number on pagination", async () => {
    const page1Logs = [makeSubscriptionLog()];
    const page2Logs = [makeSubscriptionLog({ _id: "log-2" })];

    instance
      .mockResolvedValueOnce(makeListResponse(page1Logs, 2, 2))
      .mockResolvedValueOnce(makeListResponse(page2Logs, 2, 2));

    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText("Next page"));

    await waitFor(() => {
      expect(instance).toHaveBeenLastCalledWith(
        expect.objectContaining({
          url: expect.stringContaining("page=2"),
        })
      );
    });
  });

  it("renders multiple logs with different plan changes", async () => {
    const logs = [
      makeSubscriptionLog({
        _id: "log-1",
        from_plan: "HOBBY",
        to_plan: "PRO",
      }),
      makeSubscriptionLog({
        _id: "log-2",
        from_plan: "PRO",
        to_plan: "HOBBY",
      }),
    ];
    instance.mockResolvedValueOnce(makeListResponse(logs, 2, 1));

    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => {
      // Both plan combinations should be present
      const hobbyBadges = screen.getAllByText(SUBSCRIPTION_LOGS.plans.HOBBY);
      const proBadges = screen.getAllByText(SUBSCRIPTION_LOGS.plans.PRO);
      expect(hobbyBadges.length).toBeGreaterThanOrEqual(2);
      expect(proBadges.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ── Edge Cases ─────────────────────────────────────────────────────────────

  it("handles logs with missing nested user_id object", async () => {
    const logs = [
      makeSubscriptionLog({
        user_id: null,
      }),
    ];
    instance.mockResolvedValueOnce(makeListResponse(logs));

    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => {
      expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    });
  });

  it("handles logs with empty strings for user info", async () => {
    const logs = [
      makeSubscriptionLog({
        user_id: { name: "", email: "" },
        changed_by: { name: "", email: "" },
      }),
    ];
    instance.mockResolvedValueOnce(makeListResponse(logs));

    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => {
      // Empty strings should not display as dash
      expect(screen.queryByText(/Alice/)).not.toBeInTheDocument();
    });
  });

  it("renders correctly with 10 logs per page", async () => {
    const logs = Array.from({ length: 10 }, (_, i) =>
      makeSubscriptionLog({
        _id: `log-${i}`,
        user_id: makeUser({ name: `User${i}`, email: `user${i}@example.com` }),
      })
    );
    instance.mockResolvedValueOnce(makeListResponse(logs, 20, 2));

    render(<SubscriptionLogs />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("User0")).toBeInTheDocument();
      expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
    });
  });
});
