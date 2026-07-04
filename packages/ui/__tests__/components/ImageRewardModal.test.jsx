import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ImageRewardModal from "../../src/components/catalog/ImageRewardModal";
import { instance } from "../../src/api/api_instance";
import { ToastContext } from "../../src/contexts/Contexts";
import { IMAGE_REWARD_MODAL } from "../../src/utils/Constants";

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

const makeSummaryResponse = (overrides = {}) => ({
  data: {
    statusCode: 200,
    data: {
      uniqueProUsersCount: 3,
      totalPointsAwarded: 500,
      milestonesAchieved: [
        { name: "5 images", points: 100 },
        { name: "10 images", points: 200 },
      ],
      nextMilestone: "20 images",
      ...overrides,
    },
  },
});

const makeTransactionsResponse = (transactions = [], totalPages = 1) => ({
  data: {
    statusCode: 200,
    data: {
      data: transactions,
      totalPages,
    },
  },
});

const makeTransaction = (overrides = {}) => ({
  _id: `tx-${Math.random().toString(36).slice(2, 8)}`,
  transaction_type: "MILESTONE_REWARD",
  points_awarded: 50,
  reason: "Milestone 10 reached",
  user_id: { name: "Alice" },
  createdAt: "2025-11-23T16:47:48.000Z",
  ...overrides,
});

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  imageId: "img-1",
  imageName: "Test Image",
  userId: "user-1",
};

const wrapper = ({ children }) => (
  <ToastContext.Provider value={mockToast}>{children}</ToastContext.Provider>
);

describe("ImageRewardModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Modal Visibility", () => {
    it("renders nothing when closed", () => {
      render(<ImageRewardModal {...defaultProps} isOpen={false} />, {
        wrapper,
      });

      expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
    });

    it("renders the modal with title when open", async () => {
      instance.mockResolvedValueOnce(makeSummaryResponse());
      instance.mockResolvedValueOnce(makeTransactionsResponse());

      render(<ImageRewardModal {...defaultProps} />, { wrapper });

      await waitFor(() => {
        expect(screen.getByTestId("dialog")).toBeInTheDocument();
        expect(screen.getByText(IMAGE_REWARD_MODAL.title)).toBeInTheDocument();
      });
    });
  });

  describe("Summary Section", () => {
    it("shows loading spinner while fetching summary", async () => {
      instance.mockReturnValue(new Promise(() => {}));

      render(<ImageRewardModal {...defaultProps} />, { wrapper });

      await waitFor(() => {
        const spinners = screen.getAllByTestId("spinner");
        expect(spinners.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("renders summary stats after successful fetch", async () => {
      instance.mockResolvedValueOnce(makeSummaryResponse());
      instance.mockResolvedValueOnce(makeTransactionsResponse());

      render(<ImageRewardModal {...defaultProps} />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("500")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("20 images")).toBeInTheDocument();
      });

      expect(
        screen.getByText(IMAGE_REWARD_MODAL.summary.proUsers)
      ).toBeInTheDocument();
      expect(
        screen.getByText(IMAGE_REWARD_MODAL.summary.totalPoints)
      ).toBeInTheDocument();
      expect(
        screen.getByText(IMAGE_REWARD_MODAL.summary.milestones)
      ).toBeInTheDocument();
      expect(
        screen.getByText(IMAGE_REWARD_MODAL.summary.nextMilestone)
      ).toBeInTheDocument();
    });

    it("shows error toast when summary fetch fails", async () => {
      instance.mockRejectedValueOnce({
        response: { data: { message: "Server error" } },
      });
      instance.mockResolvedValueOnce(makeTransactionsResponse());

      render(<ImageRewardModal {...defaultProps} />, { wrapper });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          IMAGE_REWARD_MODAL.toasts.summaryError
        );
      });
    });
  });

  describe("Bonus Button", () => {
    it("shows Award Bonus button when userId is provided", async () => {
      instance.mockResolvedValueOnce(makeSummaryResponse());
      instance.mockResolvedValueOnce(makeTransactionsResponse());

      render(<ImageRewardModal {...defaultProps} />, { wrapper });

      await waitFor(() => {
        expect(
          screen.getByText(IMAGE_REWARD_MODAL.bonus.button)
        ).toBeInTheDocument();
      });
    });

    it("hides Award Bonus button when userId is null", async () => {
      instance.mockResolvedValueOnce(makeSummaryResponse());
      instance.mockResolvedValueOnce(makeTransactionsResponse());

      render(<ImageRewardModal {...defaultProps} userId={null} />, { wrapper });

      await waitFor(() => {
        expect(
          screen.queryByText(IMAGE_REWARD_MODAL.bonus.button)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Bonus Form Toggle", () => {
    it("shows bonus form fields when Award Bonus is clicked", async () => {
      instance.mockResolvedValueOnce(makeSummaryResponse());
      instance.mockResolvedValueOnce(makeTransactionsResponse());

      render(<ImageRewardModal {...defaultProps} />, { wrapper });

      await waitFor(() => {
        expect(
          screen.getByText(IMAGE_REWARD_MODAL.bonus.button)
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(IMAGE_REWARD_MODAL.bonus.button));

      expect(
        screen.getByRole("button", {
          name: IMAGE_REWARD_MODAL.bonus.confirmButton,
        })
      ).toBeInTheDocument();
      const cancelButtons = screen.getAllByRole("button", {
        name: IMAGE_REWARD_MODAL.bonus.cancelButton,
      });
      expect(cancelButtons.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByPlaceholderText("50")).toBeInTheDocument();
      expect(
        screen.getByLabelText(IMAGE_REWARD_MODAL.bonus.reasonLabel)
      ).toBeInTheDocument();
    });

    it("hides bonus form when Cancel is clicked", async () => {
      instance.mockResolvedValueOnce(makeSummaryResponse());
      instance.mockResolvedValueOnce(makeTransactionsResponse());

      render(<ImageRewardModal {...defaultProps} />, { wrapper });

      await waitFor(() => {
        expect(
          screen.getByText(IMAGE_REWARD_MODAL.bonus.button)
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(IMAGE_REWARD_MODAL.bonus.button));
      expect(
        screen.getByRole("button", {
          name: IMAGE_REWARD_MODAL.bonus.confirmButton,
        })
      ).toBeInTheDocument();

      const cancelButtons = screen.getAllByRole("button", {
        name: IMAGE_REWARD_MODAL.bonus.cancelButton,
      });
      fireEvent.click(cancelButtons[cancelButtons.length - 1]);

      await waitFor(() => {
        expect(
          screen.queryByText(IMAGE_REWARD_MODAL.bonus.confirmButton)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Bonus Form Validation", () => {
    it("validates that points are required", async () => {
      instance.mockResolvedValueOnce(makeSummaryResponse());
      instance.mockResolvedValueOnce(makeTransactionsResponse());

      render(<ImageRewardModal {...defaultProps} />, { wrapper });

      await waitFor(() => {
        expect(
          screen.getByText(IMAGE_REWARD_MODAL.bonus.button)
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(IMAGE_REWARD_MODAL.bonus.button));

      fireEvent.click(
        screen.getByRole("button", {
          name: IMAGE_REWARD_MODAL.bonus.confirmButton,
        })
      );

      expect(mockToast.error).toHaveBeenCalledWith(
        IMAGE_REWARD_MODAL.bonus.validation.pointsRequired
      );
    });

    it("validates that reason is required", async () => {
      instance.mockResolvedValueOnce(makeSummaryResponse());
      instance.mockResolvedValueOnce(makeTransactionsResponse());

      render(<ImageRewardModal {...defaultProps} />, { wrapper });

      await waitFor(() => {
        expect(
          screen.getByText(IMAGE_REWARD_MODAL.bonus.button)
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(IMAGE_REWARD_MODAL.bonus.button));

      const pointsInput = screen.getByPlaceholderText("50");
      fireEvent.change(pointsInput, { target: { value: "100" } });

      fireEvent.click(
        screen.getByRole("button", {
          name: IMAGE_REWARD_MODAL.bonus.confirmButton,
        })
      );

      expect(mockToast.error).toHaveBeenCalledWith(
        IMAGE_REWARD_MODAL.bonus.validation.reasonRequired
      );
    });
  });

  describe("Bonus Award Submission", () => {
    it("awards bonus successfully and refreshes data", async () => {
      instance.mockResolvedValueOnce(makeSummaryResponse());
      instance.mockResolvedValueOnce(makeTransactionsResponse());
      instance.mockResolvedValueOnce({ data: { success: true } });
      instance.mockResolvedValueOnce(makeSummaryResponse());
      instance.mockResolvedValueOnce(makeTransactionsResponse());

      render(<ImageRewardModal {...defaultProps} />, { wrapper });

      await waitFor(() => {
        expect(
          screen.getByText(IMAGE_REWARD_MODAL.bonus.button)
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(IMAGE_REWARD_MODAL.bonus.button));

      const pointsInput = screen.getByPlaceholderText("50");
      fireEvent.change(pointsInput, { target: { value: "100" } });

      const reasonSelect = screen.getByRole("combobox", {
        name: IMAGE_REWARD_MODAL.bonus.reasonLabel,
      });
      fireEvent.change(reasonSelect, { target: { value: "PROMOTION" } });

      fireEvent.click(
        screen.getByRole("button", {
          name: IMAGE_REWARD_MODAL.bonus.confirmButton,
        })
      );

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          IMAGE_REWARD_MODAL.bonus.success
        );
      });

      expect(
        screen.queryByText(IMAGE_REWARD_MODAL.bonus.confirmButton)
      ).not.toBeInTheDocument();
    });

    it("shows error toast when bonus award fails", async () => {
      instance.mockResolvedValueOnce(makeSummaryResponse());
      instance.mockResolvedValueOnce(makeTransactionsResponse());
      instance.mockRejectedValueOnce({
        response: { data: { message: "Server error" } },
      });

      render(<ImageRewardModal {...defaultProps} />, { wrapper });

      await waitFor(() => {
        expect(
          screen.getByText(IMAGE_REWARD_MODAL.bonus.button)
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(IMAGE_REWARD_MODAL.bonus.button));

      const pointsInput = screen.getByPlaceholderText("50");
      fireEvent.change(pointsInput, { target: { value: "100" } });

      const reasonSelect = screen.getByRole("combobox", {
        name: IMAGE_REWARD_MODAL.bonus.reasonLabel,
      });
      fireEvent.change(reasonSelect, { target: { value: "PROMOTION" } });

      fireEvent.click(
        screen.getByRole("button", {
          name: IMAGE_REWARD_MODAL.bonus.confirmButton,
        })
      );

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Server error");
      });
    });
  });

  describe("Transaction History", () => {
    it("renders transactions after successful fetch", async () => {
      const transactions = [
        makeTransaction({
          _id: "tx1",
          points_awarded: 50,
          transaction_type: "MILESTONE_REWARD",
        }),
        makeTransaction({
          _id: "tx2",
          points_awarded: 100,
          transaction_type: "BONUS",
          reason: "Promotion",
        }),
      ];
      instance.mockResolvedValueOnce(makeSummaryResponse());
      instance.mockResolvedValueOnce(makeTransactionsResponse(transactions));

      render(<ImageRewardModal {...defaultProps} />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText(/\+ ?50/)).toBeInTheDocument();
        expect(screen.getByText(/\+ ?100/)).toBeInTheDocument();
        expect(screen.getByText("Milestone")).toBeInTheDocument();
        expect(screen.getByText("Bonus")).toBeInTheDocument();
        expect(screen.getAllByText("Alice").length).toBeGreaterThanOrEqual(2);
      });
    });

    it("shows empty state when no transactions exist", async () => {
      instance.mockResolvedValueOnce(makeSummaryResponse());
      instance.mockResolvedValueOnce(makeTransactionsResponse([]));

      render(<ImageRewardModal {...defaultProps} />, { wrapper });

      await waitFor(() => {
        expect(
          screen.getByText(IMAGE_REWARD_MODAL.transactions.emptyState)
        ).toBeInTheDocument();
      });
    });

    it("shows error toast when transactions fetch fails", async () => {
      instance.mockResolvedValueOnce(makeSummaryResponse());
      instance.mockRejectedValueOnce({
        response: { data: { message: "Failed" } },
      });

      render(<ImageRewardModal {...defaultProps} />, { wrapper });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          IMAGE_REWARD_MODAL.toasts.transactionsError
        );
      });
    });
  });

  describe("Pagination", () => {
    it("shows pagination when there are multiple pages", async () => {
      const transactions = Array.from({ length: 10 }, (_, i) =>
        makeTransaction({ _id: `tx${i}` })
      );
      instance.mockResolvedValueOnce(makeSummaryResponse());
      instance.mockResolvedValueOnce(makeTransactionsResponse(transactions, 3));

      render(<ImageRewardModal {...defaultProps} />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
      });

      expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
      expect(screen.getByLabelText("Next page")).toBeInTheDocument();
    });

    it("does not show pagination for single page", async () => {
      instance.mockResolvedValueOnce(makeSummaryResponse());
      instance.mockResolvedValueOnce(makeTransactionsResponse([]));

      render(<ImageRewardModal {...defaultProps} />, { wrapper });

      await waitFor(() => {
        expect(
          screen.getByText(IMAGE_REWARD_MODAL.transactions.emptyState)
        ).toBeInTheDocument();
      });

      expect(screen.queryByText(/Page/)).not.toBeInTheDocument();
    });
  });
});
