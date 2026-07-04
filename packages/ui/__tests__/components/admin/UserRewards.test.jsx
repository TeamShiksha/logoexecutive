import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import UserRewards from "../../../src/components/admin/UserRewards";
import { instance } from "../../../src/api/api_instance";
import { ToastContext } from "../../../src/contexts/Contexts";
import { ADMIN_USER_REWARDS } from "../../../src/utils/Constants";

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
  _id: `user-${Math.random().toString(36).slice(2, 8)}`,
  name: "Alice",
  email: "alice@example.com",
  subscription: { type: "PRO" },
  reward_points_current: 150,
  ...overrides,
});

const makeTransaction = (overrides = {}) => ({
  _id: `tx-${Math.random().toString(36).slice(2, 8)}`,
  transaction_type: "MILESTONE_REWARD",
  points_awarded: 50,
  reason: "Milestone 10 reached",
  is_reversed: false,
  createdAt: "2025-11-23T16:47:48.000Z",
  ...overrides,
});

const makeListResponse = (users = [], totalPages = 1) => ({
  data: { data: users, totalPages },
});

const makeTransactionSearchResponse = (transactions = [], totalPages = 1) => ({
  data: { statusCode: 200, data: { data: transactions, totalPages } },
});

const wrapper = ({ children }) => (
  <ToastContext.Provider value={mockToast}>{children}</ToastContext.Provider>
);

describe("UserRewards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    instance.mockResolvedValue(makeListResponse([]));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("renders the panel with title and subtitle", async () => {
      render(<UserRewards />, { wrapper });

      expect(screen.getByTestId("user-rewards-panel")).toBeInTheDocument();
      expect(screen.getByText(ADMIN_USER_REWARDS.title)).toBeInTheDocument();
      expect(screen.getByText(ADMIN_USER_REWARDS.subtitle)).toBeInTheDocument();
    });

    it("renders the search input with placeholder", async () => {
      render(<UserRewards />, { wrapper });

      await waitFor(() => {
        expect(
          screen.getByLabelText(ADMIN_USER_REWARDS.searchPlaceholder)
        ).toBeInTheDocument();
      });
    });

    it("shows a loading spinner while fetching users", async () => {
      instance.mockReturnValue(new Promise(() => {}));
      render(<UserRewards />, { wrapper });

      await waitFor(() => {
        expect(screen.getByTestId("spinner")).toBeInTheDocument();
      });
    });

    it("shows empty state when no users are returned", async () => {
      instance.mockResolvedValueOnce(makeListResponse([]));
      render(<UserRewards />, { wrapper });

      await waitFor(() => {
        expect(
          screen.getByText(ADMIN_USER_REWARDS.emptyState)
        ).toBeInTheDocument();
      });
    });

    it("shows error toast when user fetch fails", async () => {
      instance.mockRejectedValueOnce({
        response: { data: { message: "Server error" } },
      });
      render(<UserRewards />, { wrapper });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Server error");
      });
    });

    it("renders all table headers", async () => {
      instance.mockResolvedValueOnce(makeListResponse([makeUser()]));
      render(<UserRewards />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText("User")).toBeInTheDocument();
        expect(screen.getByText("Plan")).toBeInTheDocument();
        expect(screen.getByText("Points")).toBeInTheDocument();
      });
    });

    it("renders user rows after successful fetch", async () => {
      const users = [
        makeUser({ _id: "u1", name: "Alice", email: "alice@test.com" }),
        makeUser({ _id: "u2", name: "Bob", email: "bob@test.com" }),
      ];
      instance.mockResolvedValueOnce(makeListResponse(users));

      render(<UserRewards />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("Bob")).toBeInTheDocument();
      });
    });

    it("renders plan badges correctly", async () => {
      const users = [
        makeUser({ _id: "u1", subscription: { type: "PRO" } }),
        makeUser({ _id: "u2", subscription: { type: "HOBBY" } }),
      ];
      instance.mockResolvedValueOnce(makeListResponse(users));

      render(<UserRewards />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText("PRO")).toBeInTheDocument();
        expect(screen.getByText("HOBBY")).toBeInTheDocument();
      });
    });

    it("renders view button for each user", async () => {
      const users = [
        makeUser({ _id: "u1", name: "Alice" }),
        makeUser({ _id: "u2", name: "Bob" }),
      ];
      instance.mockResolvedValueOnce(makeListResponse(users));

      render(<UserRewards />, { wrapper });

      await waitFor(() => {
        const viewButtons = screen.getAllByLabelText("View rewards");
        expect(viewButtons).toHaveLength(2);
      });
    });
  });

  describe("Pagination", () => {
    it("shows pagination when there are multiple pages", async () => {
      const users = Array.from({ length: 10 }, (_, i) =>
        makeUser({ _id: `u${i}`, name: `User ${i}` })
      );
      instance.mockResolvedValueOnce(makeListResponse(users, 3));

      render(<UserRewards />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
      });

      expect(screen.getByLabelText("Next page")).toBeInTheDocument();
      expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
    });

    it("does not show pagination for single page", async () => {
      instance.mockResolvedValueOnce(makeListResponse([makeUser()], 1));

      render(<UserRewards />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText("Alice")).toBeInTheDocument();
      });

      expect(screen.queryByText(/Page/)).not.toBeInTheDocument();
    });
  });

  describe("User Detail View", () => {
    it("navigates to detail view when view button is clicked", async () => {
      const user = makeUser({ _id: "u1", name: "Alice" });
      instance.mockResolvedValueOnce(makeListResponse([user]));
      instance.mockResolvedValueOnce(makeTransactionSearchResponse([]));

      render(<UserRewards />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText("Alice")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText("View rewards"));

      await waitFor(() => {
        expect(screen.getByText("Back to Users")).toBeInTheDocument();
        expect(screen.getByText("alice@example.com")).toBeInTheDocument();
      });
    });

    it("shows empty history when no transactions exist", async () => {
      const user = makeUser({ _id: "u1" });
      instance.mockResolvedValueOnce(makeListResponse([user]));
      instance.mockResolvedValueOnce(makeTransactionSearchResponse([]));

      render(<UserRewards />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText("Alice")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText("View rewards"));

      await waitFor(() => {
        expect(
          screen.getByText(ADMIN_USER_REWARDS.detail.emptyHistory)
        ).toBeInTheDocument();
      });
    });

    it("shows transaction history for the selected user", async () => {
      const user = makeUser({ _id: "u1" });
      const transactions = [
        makeTransaction({ _id: "tx1", points_awarded: 50 }),
        makeTransaction({
          _id: "tx2",
          transaction_type: "BONUS",
          points_awarded: 100,
        }),
      ];
      instance.mockResolvedValueOnce(makeListResponse([user]));
      instance.mockResolvedValueOnce(
        makeTransactionSearchResponse(transactions)
      );

      render(<UserRewards />, { wrapper });

      await waitFor(() =>
        expect(screen.getByText("Alice")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByLabelText("View rewards"));

      await waitFor(() => {
        const pointsCells = screen.getAllByText(/[+]\d+/);
        expect(pointsCells.length).toBeGreaterThanOrEqual(2);
        const bonusBadges = screen.getAllByText("Bonus");
        expect(bonusBadges.length).toBeGreaterThanOrEqual(1);
        const milestoneBadges = screen.getAllByText("Milestone");
        expect(milestoneBadges.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("returns to user list when Back to Users is clicked", async () => {
      const user = makeUser({ _id: "u1" });
      instance.mockResolvedValueOnce(makeListResponse([user]));
      instance.mockResolvedValueOnce(makeTransactionSearchResponse([]));

      render(<UserRewards />, { wrapper });

      await waitFor(() =>
        expect(screen.getByText("Alice")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByLabelText("View rewards"));

      await waitFor(() => {
        expect(screen.getByText("Back to Users")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Back to Users"));

      await waitFor(() => {
        expect(screen.getByTestId("user-rewards-panel")).toBeInTheDocument();
      });
    });

    it("shows error toast when transaction fetch fails", async () => {
      const user = makeUser({ _id: "u1" });
      instance.mockResolvedValueOnce(makeListResponse([user]));
      instance.mockRejectedValueOnce({
        response: { data: { message: "Failed" } },
      });

      render(<UserRewards />, { wrapper });

      await waitFor(() =>
        expect(screen.getByText("Alice")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByLabelText("View rewards"));

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          ADMIN_USER_REWARDS.toasts.loadError
        );
      });
    });
  });

  // Award Bonus Modal tests removed - functionality moved to ImageRewardModal

  describe("Reverse Transaction", () => {
    it("shows reverse button for non-reversed transactions", async () => {
      const user = makeUser({ _id: "u1" });
      const transactions = [
        makeTransaction({ _id: "tx1", is_reversed: false }),
      ];
      instance.mockResolvedValueOnce(makeListResponse([user]));
      instance.mockResolvedValueOnce(
        makeTransactionSearchResponse(transactions)
      );

      render(<UserRewards />, { wrapper });

      await waitFor(() =>
        expect(screen.getByText("Alice")).toBeInTheDocument()
      );
      fireEvent.click(screen.getByLabelText("View rewards"));

      await waitFor(() => {
        expect(
          screen.getByLabelText("Reverse transaction")
        ).toBeInTheDocument();
      });
    });

    it("does not show reverse button for reversed transactions", async () => {
      const user = makeUser({ _id: "u1" });
      const transactions = [makeTransaction({ _id: "tx1", is_reversed: true })];
      instance.mockResolvedValueOnce(makeListResponse([user]));
      instance.mockResolvedValueOnce(
        makeTransactionSearchResponse(transactions)
      );

      render(<UserRewards />, { wrapper });

      await waitFor(() =>
        expect(screen.getByText("Alice")).toBeInTheDocument()
      );
      fireEvent.click(screen.getByLabelText("View rewards"));

      await waitFor(() => {
        expect(
          screen.queryByLabelText("Reverse transaction")
        ).not.toBeInTheDocument();
      });
    });

    it("opens reverse modal when reverse button is clicked", async () => {
      const user = makeUser({ _id: "u1" });
      const transactions = [
        makeTransaction({ _id: "tx1", is_reversed: false }),
      ];
      instance.mockResolvedValueOnce(makeListResponse([user]));
      instance.mockResolvedValueOnce(
        makeTransactionSearchResponse(transactions)
      );

      render(<UserRewards />, { wrapper });

      await waitFor(() =>
        expect(screen.getByText("Alice")).toBeInTheDocument()
      );
      fireEvent.click(screen.getByLabelText("View rewards"));

      await waitFor(() => {
        fireEvent.click(screen.getByLabelText("Reverse transaction"));
      });

      expect(
        screen.getByRole("heading", {
          name: ADMIN_USER_REWARDS.reverseModal.title,
        })
      ).toBeInTheDocument();
    });

    it("closes reverse modal on Cancel", async () => {
      const user = makeUser({ _id: "u1" });
      const transactions = [
        makeTransaction({ _id: "tx1", is_reversed: false }),
      ];
      instance.mockResolvedValueOnce(makeListResponse([user]));
      instance.mockResolvedValueOnce(
        makeTransactionSearchResponse(transactions)
      );

      render(<UserRewards />, { wrapper });

      await waitFor(() =>
        expect(screen.getByText("Alice")).toBeInTheDocument()
      );
      fireEvent.click(screen.getByLabelText("View rewards"));

      await waitFor(() => {
        fireEvent.click(screen.getByLabelText("Reverse transaction"));
      });

      expect(
        screen.getByRole("heading", {
          name: ADMIN_USER_REWARDS.reverseModal.title,
        })
      ).toBeInTheDocument();

      fireEvent.click(
        screen.getByText(ADMIN_USER_REWARDS.reverseModal.cancelButton)
      );

      await waitFor(() => {
        expect(
          screen.queryByRole("heading", {
            name: ADMIN_USER_REWARDS.reverseModal.title,
          })
        ).not.toBeInTheDocument();
      });
    });

    it("validates reverse modal - reason required", async () => {
      const user = makeUser({ _id: "u1" });
      const transactions = [
        makeTransaction({ _id: "tx1", is_reversed: false }),
      ];
      instance.mockResolvedValueOnce(makeListResponse([user]));
      instance.mockResolvedValueOnce(
        makeTransactionSearchResponse(transactions)
      );

      render(<UserRewards />, { wrapper });

      await waitFor(() =>
        expect(screen.getByText("Alice")).toBeInTheDocument()
      );
      fireEvent.click(screen.getByLabelText("View rewards"));

      await waitFor(() => {
        fireEvent.click(screen.getByLabelText("Reverse transaction"));
      });

      await waitFor(() => {
        expect(
          screen.getByRole("heading", {
            name: ADMIN_USER_REWARDS.reverseModal.title,
          })
        ).toBeInTheDocument();
      });

      fireEvent.click(
        screen.getByRole("button", {
          name: ADMIN_USER_REWARDS.reverseModal.confirmButton,
        })
      );

      expect(mockToast.error).toHaveBeenCalledWith(
        ADMIN_USER_REWARDS.reverseModal.validation.reasonRequired
      );
    });

    it("reverses transaction successfully", async () => {
      const user = makeUser({ _id: "u1" });
      const transactions = [
        makeTransaction({ _id: "tx1", is_reversed: false, points_awarded: 50 }),
      ];
      instance.mockResolvedValueOnce(makeListResponse([user]));
      instance.mockResolvedValueOnce(
        makeTransactionSearchResponse(transactions)
      );
      instance.mockResolvedValueOnce({ data: { success: true } });
      instance.mockResolvedValueOnce(makeTransactionSearchResponse([]));

      render(<UserRewards />, { wrapper });

      await waitFor(() =>
        expect(screen.getByText("Alice")).toBeInTheDocument()
      );
      fireEvent.click(screen.getByLabelText("View rewards"));

      await waitFor(() => {
        fireEvent.click(screen.getByLabelText("Reverse transaction"));
      });

      await waitFor(() => {
        expect(
          screen.getByRole("heading", {
            name: ADMIN_USER_REWARDS.reverseModal.title,
          })
        ).toBeInTheDocument();
      });

      const reasonSelect = screen.getByRole("combobox", {
        name: ADMIN_USER_REWARDS.reverseModal.reasonLabel,
      });
      fireEvent.change(reasonSelect, {
        target: { value: "DUPLICATE_REMOVAL" },
      });

      fireEvent.click(
        screen.getByRole("button", {
          name: ADMIN_USER_REWARDS.reverseModal.confirmButton,
        })
      );

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          ADMIN_USER_REWARDS.reverseModal.success
        );
      });
    });

    it("shows error toast when reverse fails", async () => {
      const user = makeUser({ _id: "u1" });
      const transactions = [
        makeTransaction({ _id: "tx1", is_reversed: false, points_awarded: 50 }),
      ];
      instance.mockResolvedValueOnce(makeListResponse([user]));
      instance.mockResolvedValueOnce(
        makeTransactionSearchResponse(transactions)
      );
      instance.mockRejectedValueOnce({
        response: { data: { message: "Transaction already reversed" } },
      });

      render(<UserRewards />, { wrapper });

      await waitFor(() =>
        expect(screen.getByText("Alice")).toBeInTheDocument()
      );
      fireEvent.click(screen.getByLabelText("View rewards"));

      await waitFor(() => {
        fireEvent.click(screen.getByLabelText("Reverse transaction"));
      });

      await waitFor(() => {
        expect(
          screen.getByRole("heading", {
            name: ADMIN_USER_REWARDS.reverseModal.title,
          })
        ).toBeInTheDocument();
      });

      const reasonSelect2 = screen.getByRole("combobox", {
        name: ADMIN_USER_REWARDS.reverseModal.reasonLabel,
      });
      fireEvent.change(reasonSelect2, {
        target: { value: "DUPLICATE_REMOVAL" },
      });

      fireEvent.click(
        screen.getByRole("button", {
          name: ADMIN_USER_REWARDS.reverseModal.confirmButton,
        })
      );

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          "Transaction already reversed"
        );
      });
    });
  });
});
