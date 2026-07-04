import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import SettingCard from "../../src/components/settings/SettingCard";
import {
  SETTING,
  MOCK_USER_DATA,
  DELETE_ACCOUNT_MODAL,
} from "../../src/utils/Constants";
import {
  ToastContext,
  UserContext,
  AuthContext,
} from "../../src/contexts/Contexts";

const mockAuthContext = {
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
  setIsAuthenticated: vi.fn(),
};

const mockToastContext = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  show: vi.fn(),
  clear: vi.fn(),
  clearToast: vi.fn(),
};

const mockMakeRequest = vi.fn();

vi.mock("../../src/hooks/useApi", () => ({
  useApi: () => ({
    makeRequest: mockMakeRequest,
    errorMsg: "Something went wrong",
  }),
}));

const renderWithProviders = (isGuest = false) =>
  render(
    <AuthContext.Provider value={mockAuthContext}>
      <ToastContext.Provider value={mockToastContext}>
        <UserContext.Provider value={{ userData: MOCK_USER_DATA }}>
          <SettingCard isGuest={isGuest} />
        </UserContext.Provider>
      </ToastContext.Provider>
    </AuthContext.Provider>
  );

describe("SettingCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the SettingCard component with correct number of buttons", () => {
    renderWithProviders();
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(SETTING.length);
  });

  it("displays correct button titles and subtitles", () => {
    renderWithProviders();
    SETTING.forEach(({ subtitle, buttontitle }) => {
      const buttonElement = screen.getByText(buttontitle);
      const subtitleElement = screen.getByText(subtitle);

      expect(buttonElement).toBeInTheDocument();
      expect(subtitleElement).toBeInTheDocument();
    });
  });

  it("assigns correct button variants", () => {
    renderWithProviders();
    SETTING.forEach(({ buttontitle }) => {
      const button = screen.getByText(buttontitle);
      const isDeleteButton = buttontitle.toLowerCase().includes("delete");

      if (isDeleteButton) {
        expect(button).toHaveAttribute(
          "class",
          expect.stringContaining("danger")
        );
      } else {
        expect(button).toHaveAttribute(
          "class",
          expect.stringContaining("primary")
        );
      }
    });
  });
  it("disables buttons when isGuest is true", () => {
    renderWithProviders(true);
    SETTING.forEach((setting) => {
      expect(screen.getByText(setting.buttontitle)).toBeDisabled();
    });
  });
});

describe("Delete Account Confirmation Flow", () => {
  it("opens confirmation modal on delete button click", () => {
    renderWithProviders();
    const deleteBtn = screen.getByText(SETTING[1].buttontitle);
    fireEvent.click(deleteBtn);

    const deleteModalSubText = screen.getByText(DELETE_ACCOUNT_MODAL.subText);
    expect(deleteModalSubText).toBeInTheDocument();
  });

  it("disables confirm button if email does not match", () => {
    renderWithProviders();
    const deleteBtn = screen.getByText(SETTING[1].buttontitle);
    fireEvent.click(deleteBtn);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { value: "wrong@example.com" });

    const dialog = screen.getByTestId("dialog");
    const confirmButton = within(dialog).getByRole("button", {
      name: DELETE_ACCOUNT_MODAL.primaryButtonText,
    });
    expect(confirmButton).toBeDisabled();
  });

  it("enables confirm button if email matches", () => {
    renderWithProviders(false);
    const deleteBtn = screen.getByText(SETTING[1].buttontitle);
    fireEvent.click(deleteBtn);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: MOCK_USER_DATA.email } });

    const dialog = screen.getByTestId("dialog");
    const confirmButton = within(dialog).getByRole("button", {
      name: DELETE_ACCOUNT_MODAL.primaryButtonText,
    });
    expect(confirmButton).not.toBeDisabled();
  });

  it("calls API and closes modal on successful deletion", async () => {
    mockMakeRequest.mockResolvedValue(true);
    renderWithProviders();
    const deleteBtn = screen.getByText(SETTING[1].buttontitle);
    fireEvent.click(deleteBtn);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: MOCK_USER_DATA.email } });

    const dialog = screen.getByTestId("dialog");
    const confirmButton = within(dialog).getByRole("button", {
      name: DELETE_ACCOUNT_MODAL.primaryButtonText,
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockMakeRequest).toHaveBeenCalled();
      expect(mockToastContext.success).toHaveBeenCalled();
      const deleteModalDesc = screen.queryByText(DELETE_ACCOUNT_MODAL.subText);
      expect(deleteModalDesc).not.toBeInTheDocument();
    });
  });

  it("shows error toast on API failure", async () => {
    mockMakeRequest.mockResolvedValue(false);
    renderWithProviders();
    const deleteBtn = screen.getByText(SETTING[1].buttontitle);
    fireEvent.click(deleteBtn);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: MOCK_USER_DATA.email } });

    const dialog = screen.getByTestId("dialog");
    const confirmButton = within(dialog).getByRole("button", {
      name: DELETE_ACCOUNT_MODAL.primaryButtonText,
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockMakeRequest).toHaveBeenCalled();
      expect(mockToastContext.error).toHaveBeenCalled();
    });
  });
});
