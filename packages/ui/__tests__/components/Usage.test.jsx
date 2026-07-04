import { render, screen } from "@testing-library/react";
import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";
import Usage from "../../src/components/usage/Usage";
import { MOCK_USER_DATA } from "../../src/utils/Constants";

const localStorageStore = {};
const localStorageMock = {
  getItem: vi.fn((key) => localStorageStore[key] ?? null),
  setItem: vi.fn((key, value) => {
    localStorageStore[key] = String(value);
  }),
  clear: vi.fn(() => {
    Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k]);
  }),
  removeItem: vi.fn((key) => {
    delete localStorageStore[key];
  }),
};

beforeAll(() => {
  vi.stubGlobal("localStorage", localStorageMock);
});

afterAll(() => {
  vi.unstubAllGlobals();
});
const mockToastWarning = vi.fn();
const mockToastError = vi.fn();

vi.mock("../../src/hooks/useToast.js", () => ({
  useToast: () => ({
    warning: mockToastWarning,
    error: mockToastError,
  }),
}));
import { UserContext } from "../../src/contexts/Contexts";
import { ToastProvider } from "../../src/contexts/ToastContext";

describe("Usage Component", () => {
  const mockUserData = {
    userData: {
      ...MOCK_USER_DATA,
      subscription: {
        ...MOCK_USER_DATA.subscription,
        updated_at: "2024-01-01T00:00:00.000Z",
      },
    },
  };

  const renderWithProviders = (component, customUserData = mockUserData) => {
    return render(
      <UserContext.Provider value={customUserData}>
        <ToastProvider>{component}</ToastProvider>
      </UserContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("Should show correct usage count, usage limit", () => {
    renderWithProviders(
      <Usage
        usageCount={MOCK_USER_DATA.subscription.usage_count}
        usageLimit={MOCK_USER_DATA.subscription.usage_limit}
      />
    );

    const usageCountText = screen.getByText(
      MOCK_USER_DATA.subscription.usage_count
    );
    const usageLimitText = screen.getByText(
      MOCK_USER_DATA.subscription.usage_limit
    );
    expect(usageCountText).toBeInTheDocument();
    expect(usageLimitText).toBeInTheDocument();
  });

  it("Should render PieGraph with correct percentage", () => {
    const { container } = renderWithProviders(
      <Usage
        usageCount={MOCK_USER_DATA.subscription.usage_count}
        usageLimit={MOCK_USER_DATA.subscription.usage_limit}
      />
    );

    const pieGraph = container.querySelector("svg");
    const usedPercent =
      (MOCK_USER_DATA.subscription.usage_count /
        MOCK_USER_DATA.subscription.usage_limit) *
      100;
    const percentageText = screen.getByText(`${usedPercent}%`);
    expect(pieGraph).toBeInTheDocument();
    expect(percentageText).toBeInTheDocument();
  });

  describe("Toast Notifications Logic", () => {
    const LIMIT = 500;

    it("should not trigger any toast when usage is below 80%", () => {
      renderWithProviders(<Usage usageCount={350} usageLimit={LIMIT} />);
      expect(mockToastWarning).not.toHaveBeenCalled();
      expect(mockToastError).not.toHaveBeenCalled();
    });

    it("should trigger warning toast exactly once at 80%", () => {
      renderWithProviders(<Usage usageCount={400} usageLimit={LIMIT} />);
      expect(mockToastWarning).toHaveBeenCalledTimes(1);
      expect(mockToastWarning).toHaveBeenCalledWith(
        expect.stringContaining("80%")
      );
    });

    it("should trigger only the highest threshold warning (90%) and suppress lower ones", () => {
      renderWithProviders(<Usage usageCount={450} usageLimit={LIMIT} />);
      expect(mockToastWarning).toHaveBeenCalledTimes(1);
      expect(mockToastWarning).toHaveBeenCalledWith(
        expect.stringContaining("90%")
      );
    });

    it("should trigger error toast at 95% and suppress warnings", () => {
      renderWithProviders(<Usage usageCount={475} usageLimit={LIMIT} />);
      expect(mockToastError).toHaveBeenCalledTimes(1);
      expect(mockToastError).toHaveBeenCalledWith(
        expect.stringContaining("95%")
      );
      expect(mockToastWarning).not.toHaveBeenCalled();
    });

    it("should trigger error toast at 100% and suppress lower thresholds", () => {
      renderWithProviders(<Usage usageCount={500} usageLimit={LIMIT} />);
      expect(mockToastError).toHaveBeenCalledTimes(1);
      expect(mockToastError).toHaveBeenCalledWith(
        expect.stringContaining("100%")
      );
      expect(mockToastWarning).not.toHaveBeenCalled();
    });

    it("should handle sequential usage increases correctly (no duplicates)", () => {
      const { rerender } = renderWithProviders(
        <Usage usageCount={400} usageLimit={LIMIT} />
      );
      expect(mockToastWarning).toHaveBeenCalledTimes(1);
      expect(mockToastWarning).toHaveBeenCalledWith(
        expect.stringContaining("80%")
      );

      vi.clearAllMocks();

      rerender(
        <UserContext.Provider value={mockUserData}>
          <ToastProvider>
            <Usage usageCount={425} usageLimit={LIMIT} />
          </ToastProvider>
        </UserContext.Provider>
      );
      expect(mockToastWarning).not.toHaveBeenCalled();

      rerender(
        <UserContext.Provider value={mockUserData}>
          <ToastProvider>
            <Usage usageCount={480} usageLimit={LIMIT} />
          </ToastProvider>
        </UserContext.Provider>
      );
      expect(mockToastError).toHaveBeenCalledTimes(1);
      expect(mockToastError).toHaveBeenCalledWith(
        expect.stringContaining("96%")
      );
      expect(mockToastWarning).not.toHaveBeenCalled();
    });

    it("should show toast again if billing cycle changes", () => {
      renderWithProviders(<Usage usageCount={400} usageLimit={LIMIT} />);
      expect(mockToastWarning).toHaveBeenCalledTimes(1);

      vi.clearAllMocks();

      const newCycleUserData = {
        userData: {
          ...mockUserData.userData,
          subscription: {
            ...mockUserData.userData.subscription,
            updated_at: "2024-02-01T00:00:00.000Z",
          },
        },
      };

      renderWithProviders(
        <Usage usageCount={400} usageLimit={LIMIT} />,
        newCycleUserData
      );
      expect(mockToastWarning).toHaveBeenCalledTimes(1);
    });

    it.each([
      [400, "80%", mockToastWarning],
      [450, "90%", mockToastWarning],
      [475, "95%", mockToastError],
      [500, "100%", mockToastError],
    ])(
      "should not show toast again in the same cycle after page reload for usage %i (%s)",
      (usageCount, percentage, mockToastFn) => {
        // First render: Toast should be shown
        renderWithProviders(
          <Usage usageCount={usageCount} usageLimit={LIMIT} />
        );
        expect(mockToastFn).toHaveBeenCalledTimes(1);
        expect(mockToastFn).toHaveBeenCalledWith(
          expect.stringContaining(percentage)
        );

        vi.clearAllMocks();

        // Simulate page reload by re-rendering component without clearing localStorage
        // Since it's a new render call, but localStorage persists, it mimics a refresh
        renderWithProviders(
          <Usage usageCount={usageCount} usageLimit={LIMIT} />
        );

        // Assert: Toast should NOT be shown again
        expect(mockToastFn).not.toHaveBeenCalled();
      }
    );
  });
});
