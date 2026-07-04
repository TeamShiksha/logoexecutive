import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import TwoFactorAuth from "../../../src/components/twofactorauth/TwoFactorAuth";
import { ToastProvider } from "../../../src/contexts/ToastContext.jsx";

// Mock the useApi hook
const mockFetchRequest = vi.fn();
vi.mock("../../../src/hooks/useApi", () => ({
  useApi: ({ url }) => ({
    fetchRequest: (...args) => mockFetchRequest(url, ...args),
    loading: false,
  }),
}));

// Mock the lucide-react icons
vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    ShieldCheck: () => <div data-testid="shield-icon" />,
    QrCode: () => <div data-testid="qr-icon" />,
  };
});

describe("TwoFactorAuth Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders initial state correctly when 2FA is disabled", async () => {
    mockFetchRequest.mockResolvedValueOnce({
      success: true,
      data: { isMfaEnabled: false },
    });

    render(
      <ToastProvider>
        <TwoFactorAuth />
      </ToastProvider>
    );

    expect(screen.getByText(/Two-Factor Authentication/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Secure your account/i)).toBeInTheDocument();
      expect(screen.getByText(/Not Configured/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Generate QR Code/i })
      ).toBeInTheDocument();
    });
  });

  it("transitions to setup mode when 'Generate QR Code' is clicked", async () => {
    mockFetchRequest.mockResolvedValueOnce({
      success: true,
      data: { isMfaEnabled: false },
    });

    mockFetchRequest.mockResolvedValueOnce({
      success: true,
      data: { data: { qrCode: "mock-qr-data-url" } },
    });

    render(
      <ToastProvider>
        <TwoFactorAuth />
      </ToastProvider>
    );

    const generateBtn = await screen.findByRole("button", {
      name: /Generate QR Code/i,
    });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Step 1: Scan QR Code/i)).toBeInTheDocument();
      expect(screen.getByAltText(/QR Code/i)).toHaveAttribute(
        "src",
        "mock-qr-data-url"
      );
      expect(screen.getByPlaceholderText("000000")).toBeInTheDocument();
    });

    expect(mockFetchRequest).toHaveBeenCalledWith("/auth/mfa/enable");
  });

  it("completes 2FA setup successfully", async () => {
    // 1. Initial Status (disabled)
    mockFetchRequest.mockResolvedValueOnce({
      success: true,
      data: { isMfaEnabled: false },
    });
    // 2. Click Generate QR
    mockFetchRequest.mockResolvedValueOnce({
      success: true,
      data: { data: { qrCode: "qr" } },
    });
    // 3. Click Verify
    mockFetchRequest.mockResolvedValueOnce({ success: true });

    render(
      <ToastProvider>
        <TwoFactorAuth />
      </ToastProvider>
    );

    const generateBtn = await screen.findByRole("button", {
      name: /Generate QR Code/i,
    });
    fireEvent.click(generateBtn);

    const pinInput = await screen.findByPlaceholderText("000000");
    fireEvent.change(pinInput, { target: { value: "123456" } });

    const finishBtn = screen.getByRole("button", {
      name: /Finish Configuration/i,
    });
    fireEvent.click(finishBtn);

    await waitFor(() => {
      expect(mockFetchRequest).toHaveBeenCalledWith("/auth/mfa/verify", {
        data: { token: "123456" },
      });
      expect(screen.getByText("2FA is Active")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
    });
  });

  it("cancels 2FA setup correctly", async () => {
    mockFetchRequest.mockResolvedValueOnce({
      success: true,
      data: { isMfaEnabled: false },
    });
    mockFetchRequest.mockResolvedValueOnce({
      success: true,
      data: { data: { qrCode: "qr" } },
    });
    mockFetchRequest.mockResolvedValueOnce({ success: true }); // Cancel request

    render(
      <ToastProvider>
        <TwoFactorAuth />
      </ToastProvider>
    );

    const generateBtn = await screen.findByRole("button", {
      name: /Generate QR Code/i,
    });
    fireEvent.click(generateBtn);

    const cancelBtn = await screen.findByRole("button", {
      name: /Cancel Setup/i,
    });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(mockFetchRequest).toHaveBeenCalledWith("/auth/mfa/cancel");
      expect(screen.getByText(/Secure your account/i)).toBeInTheDocument();
    });
  });

  it("disables 2FA successfully", async () => {
    // 1. Initial Status (enabled)
    mockFetchRequest.mockResolvedValueOnce({
      success: true,
      data: { isMfaEnabled: true },
    });
    // 2. Disable request
    mockFetchRequest.mockResolvedValueOnce({ success: true });

    render(
      <ToastProvider>
        <TwoFactorAuth />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/2FA is Active/i)).toBeInTheDocument();
    });

    const disableBtn = screen.getByRole("button", { name: /Disable 2FA/i });
    fireEvent.click(disableBtn);

    // Should show password input
    const passwordInput = screen.getByPlaceholderText(/Current Password/i);
    fireEvent.change(passwordInput, { target: { value: "mypassword" } });

    const confirmDisableBtn = screen.getByRole("button", { name: "Disable" });
    fireEvent.click(confirmDisableBtn);

    await waitFor(() => {
      expect(mockFetchRequest).toHaveBeenCalledWith("/auth/mfa/disable", {
        data: { password: "mypassword" },
      });
      expect(screen.getByText(/Secure your account/i)).toBeInTheDocument();
      expect(screen.getByText(/Not Configured/i)).toBeInTheDocument();
    });
  });
});
