import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "../../../src/contexts/ToastContext.jsx";
import { AuthContext } from "../../../src/contexts/Contexts";
import Pin from "../../../src/components/pin/Pin";

const mockAuthContext = (isAuthenticated) => ({
  isAuthenticated,
  setIsAuthenticated: vi.fn(),
});

const mockedFetchRequest = vi.fn();
const mockedMakeRequest = vi.fn();
vi.mock("../../../src/hooks/useApi", () => ({
  useApi: () => ({
    makeRequest: mockedMakeRequest,
    fetchRequest: mockedFetchRequest,
    errorMsg: "Incorrect pin. Please try again..",
  }),
}));

const enterPin = (inputs, pin) => {
  pin.split("").forEach((digit, index) => {
    fireEvent.change(inputs[index], { target: { value: digit } });
  });
};

describe("Pin Component Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders pin input fields and verify button", () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ToastProvider>
            <Pin />
          </ToastProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const pinInputs = screen.getAllByRole("textbox");
    expect(pinInputs).toHaveLength(6);
    expect(screen.getByRole("button", { name: "Verify" })).toBeInTheDocument();
  });

  it("disables verify button when pin is not entered", () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ToastProvider>
            <Pin />
          </ToastProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const verifyButton = screen.getByRole("button", { name: "Verify" });
    expect(verifyButton).toBeDisabled();
  });

  it("enables verify button when pin is entered", () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ToastProvider>
            <Pin />
          </ToastProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const pinInputs = screen.getAllByRole("textbox");
    enterPin(pinInputs, "123456");

    const verifyButton = screen.getByRole("button", { name: "Verify" });
    expect(verifyButton).not.toBeDisabled();
  });

  it("should focus on next input when current input is filled", () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ToastProvider>
            <Pin />
          </ToastProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const pinInputs = screen.getAllByRole("textbox");
    fireEvent.change(pinInputs[0], { target: { value: "1" } });
    expect(pinInputs[1]).toHaveFocus();
  });

  it("should focus on previous input when backspace is pressed on empty field", () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ToastProvider>
            <Pin />
          </ToastProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const pinInputs = screen.getAllByRole("textbox");
    fireEvent.change(pinInputs[0], { target: { value: "1" } });
    // Focus moves to pinInputs[1] automatically
    // Now press backspace on empty pinInputs[1]
    fireEvent.keyDown(pinInputs[1], { key: "Backspace" });
    expect(pinInputs[0]).toHaveFocus();
  });

  it("should not allow non-numeric characters", () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ToastProvider>
            <Pin />
          </ToastProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const pinInputs = screen.getAllByRole("textbox");
    fireEvent.change(pinInputs[0], { target: { value: "a" } });
    expect(pinInputs[0].value).toBe("");
  });

  it("should call handleSubmit when verify button is clicked", async () => {
    mockedFetchRequest.mockResolvedValue({
      success: true,
      data: {},
      error: null,
    });

    const mockOnClose = vi.fn();
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ToastProvider>
            <Pin onClose={mockOnClose} />
          </ToastProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const pinInputs = screen.getAllByRole("textbox");
    enterPin(pinInputs, "123456");

    const verifyButton = screen.getByRole("button", { name: "Verify" });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(mockedFetchRequest).toHaveBeenCalledWith({
        data: { token: "123456" },
      });
    });
  });

  it("should show error message when pin is incorrect", async () => {
    mockedFetchRequest.mockResolvedValue({
      success: false,
      data: null,
      error: "Incorrect pin. Please try again..",
    });

    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ToastProvider>
            <Pin />
          </ToastProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const pinInputs = screen.getAllByRole("textbox");
    enterPin(pinInputs, "123456");

    const verifyButton = screen.getByRole("button", { name: "Verify" });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(
        screen.getByText("Incorrect pin. Please try again..")
      ).toBeInTheDocument();
    });
  });
});
