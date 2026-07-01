import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuthContext } from "../../../src/contexts/Contexts";
import SignIn from "../../../src/components/auth/Signin";
import { BUTTON_TEXT, MESSAGES, SIGNIN } from "../../../src/utils/Constants";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "../../../src/contexts/ToastContext.jsx";
import { ThemeProvider } from "../../../src/contexts/ThemeContext";

const mockAuthContext = (isAuthenticated) => ({
  isAuthenticated,
  setIsAuthenticated: vi.fn(),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
globalThis.localStorage = localStorageMock;

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useNavigate: () => mockNavigate,
}));

const mockedFetchRequest = vi.fn();
const mockedMakeRequest = vi.fn();
vi.mock("../../../src/hooks/useApi", () => ({
  useApi: () => ({
    makeRequest: mockedMakeRequest,
    fetchRequest: mockedFetchRequest,
    errorMsg: "Incorrect email or password.",
  }),
}));

describe("SignInForm UI and Functionality Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });
  it("renders all form elements correctly", () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignIn toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const title = screen.getByRole("heading", { name: SIGNIN.title });
    expect(title).toBeInTheDocument();
    for (const item of SIGNIN["fields"]) {
      const label = screen.getByLabelText(item.label);
      expect(label).toBeInTheDocument();
    }
    const forgotPassword = screen.getByText(BUTTON_TEXT.forgotPassword);
    expect(forgotPassword).toBeInTheDocument();
    const footerText = screen.getByText(SIGNIN.footerText);
    expect(footerText).toBeInTheDocument();
  });

  it("renders an eye icon button for the password field", () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignIn toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput).toBeInTheDocument();

    const eyeButton = screen.getByRole("button", { name: /show password/i });
    expect(eyeButton).toBeInTheDocument();
  });

  it("toggles password visibility when clicking the eye icon", () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignIn toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText("Password");
    const eyeButton = screen.getByRole("button", { name: /show password/i });

    expect(passwordInput).toHaveAttribute("type", "password");
    expect(eyeButton).toHaveAttribute("aria-label", "Show password");

    fireEvent.click(eyeButton);
    expect(passwordInput).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: /hide password/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /hide password/i }));
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(
      screen.getByRole("button", { name: /show password/i })
    ).toBeInTheDocument();
  });

  it("documents current keyboard focus behavior of the eye button (tabIndex)", () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignIn toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const eyeButton = screen.getByRole("button", { name: /show password/i });
    expect(eyeButton.getAttribute("tabindex")).toBe("-1");
  });

  it("Change form when clicked on text in footer", () => {
    const authContext = mockAuthContext(false);
    const toggleForm = vi.fn();
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignIn toggleForm={toggleForm} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const closeButton = screen.getByText(SIGNIN.signupToggleButtonText);
    fireEvent.click(closeButton);
    expect(toggleForm).toHaveBeenCalled();
  });

  it("validates email only when focused and blurred", async () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignIn toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
    const emailInput = screen.getByLabelText("Email");

    fireEvent.focus(emailInput);
    await waitFor(() => {
      const emailError = screen.getByText("Email is required");
      expect(emailError).toBeInTheDocument();
    });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      const emailError = screen.queryByText("Email is required");
      expect(emailError).not.toBeInTheDocument();
    });
  });

  it("connectivity test passed", async () => {
    const authContext = mockAuthContext(false);
    const oncloseMock = vi.fn();
    mockedFetchRequest.mockResolvedValue({
      success: true,
      data: { statusCode: 200 },
      error: null,
    });

    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignIn toggleForm={vi.fn()} onClose={oncloseMock} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "johndoe1@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: BUTTON_TEXT.signIn }));

    await waitFor(() => {
      expect(mockedFetchRequest).toHaveBeenCalled();
    });

    expect(oncloseMock).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("connectivity test failed", async () => {
    const authContext = mockAuthContext(false);
    const errorMsg = "Incorrect email or password.";
    mockedFetchRequest.mockResolvedValue({
      success: false,
      data: null,
      error: errorMsg,
    });

    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignIn toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: BUTTON_TEXT.signIn }));

    await waitFor(() => {
      expect(mockedFetchRequest).toHaveBeenCalled();
    });

    const errorMsgText = screen.getAllByText(errorMsg);
    errorMsgText.forEach((msg) => expect(msg).toBeInTheDocument());
  });

  const delayedResolve = () =>
    new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            success: true,
            data: { statusCode: 200 },
            error: null,
          }),
        1000
      )
    );
  let authContext;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    authContext = mockAuthContext(false);
    mockedFetchRequest.mockImplementation(delayedResolve);
  });

  it("disables input fields and submit button when loading", async () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignIn toggleForm={vi.fn()} onClose={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", {
      name: BUTTON_TEXT.signIn,
    });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      const spinner = screen.getByTestId("spinner");
      expect(spinner).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  it("does not show duplicate guest sign-in success toasts on rapid clicks", async () => {
    mockedMakeRequest.mockResolvedValue(true);

    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignIn toggleForm={vi.fn()} onClose={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const guestSignInButton = screen.getByText(SIGNIN.guestAccount);

    fireEvent.click(guestSignInButton);
    fireEvent.click(guestSignInButton);
    fireEvent.click(guestSignInButton);

    await waitFor(() => {
      expect(screen.getAllByText(MESSAGES.GUEST_SIGN_IN_SUCCESS)).toHaveLength(
        1
      );
    });
  });

  it("switches to forgot password mode when forgot password link is clicked", () => {
    const authContext = mockAuthContext(false);

    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignIn toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const forgotPasswordLink = screen.getByText(BUTTON_TEXT.forgotPassword);
    fireEvent.click(forgotPasswordLink);

    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();

    const submitButton = screen.getByRole("button", {
      name: BUTTON_TEXT.submit,
    });
    expect(submitButton).toBeInTheDocument();

    const backToSignInLink = screen.getByText("Back to Sign In");
    expect(backToSignInLink).toBeInTheDocument();
  });
  it("switches back to sign in mode when 'Back to Sign In' is clicked", async () => {
    const authContext = mockAuthContext(false);

    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignIn toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const forgotPasswordLink = screen.getByText(BUTTON_TEXT.forgotPassword);
    fireEvent.click(forgotPasswordLink);

    const backToSignInLink = screen.getByText("Back to Sign In");
    fireEvent.click(backToSignInLink);

    const passwordField = screen.getByLabelText("Password");
    expect(passwordField).toBeInTheDocument();

    const signInButton = screen.getByRole("button", {
      name: BUTTON_TEXT.signIn,
    });
    expect(signInButton).toBeInTheDocument();
  });

  it("validates email in forgot password mode", async () => {
    const authContext = mockAuthContext(false);

    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignIn toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
    const forgotPasswordLink = screen.getByText(BUTTON_TEXT.forgotPassword);
    fireEvent.click(forgotPasswordLink);

    const emailInput = screen.getByLabelText("Email");
    fireEvent.focus(emailInput);

    await waitFor(() => {
      const emailError = screen.getByText("Email is required");
      expect(emailError).toBeInTheDocument();
    });

    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
  });

  it("validates forgot password form prevents submission with invalid email", async () => {
    const authContext = mockAuthContext(false);

    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignIn toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
    const forgotPasswordLink = screen.getByText(BUTTON_TEXT.forgotPassword);
    fireEvent.click(forgotPasswordLink);

    const emailInput = screen.getByLabelText("Email");
    fireEvent.change(emailInput, { target: { value: "" } });
    fireEvent.focus(emailInput);
    fireEvent.blur(emailInput);

    const submitButton = screen.getByRole("button", {
      name: BUTTON_TEXT.submit,
    });
    expect(submitButton).toBeDisabled();
  });
});
