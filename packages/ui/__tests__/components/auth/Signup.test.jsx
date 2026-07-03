import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import SignUpForm from "../../../src/components/auth/Signup";
import { SIGNUP } from "../../../src/utils/Constants";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../../../src/contexts/Contexts";
import { ToastProvider } from "../../../src/contexts/ToastContext";
import { ThemeProvider } from "../../../src/contexts/ThemeContext";

const mockedMakeRequest = vi.fn();
vi.mock("../../../src/hooks/useApi", () => ({
  useApi: () => ({
    makeRequest: mockedMakeRequest,
  }),
}));

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

describe("SignUpForm UI and Functionality Tests", () => {
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
              <SignUpForm toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const title = screen.getByRole("heading", { name: SIGNUP.title });
    expect(title).toBeInTheDocument();
    for (const item of SIGNUP["fields"]) {
      const label = screen.getByLabelText(item.label);
      expect(label).toBeInTheDocument();
    }
    const footerText = screen.getByText(SIGNUP.signinToggleButtonText);
    expect(footerText).toBeInTheDocument();
  });

  it("switch to to sign-in form on click", () => {
    const toggleFormMock = vi.fn();
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignUpForm toggleForm={toggleFormMock} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const switchButton = screen.getByText(SIGNUP.signinToggleButtonText);
    fireEvent.click(switchButton);
    expect(toggleFormMock).toHaveBeenCalled();
  });

  it("removes non-letter characters from name input", () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignUpForm toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText(SIGNUP["fields"][0].label);
    fireEvent.change(nameInput, { target: { value: "JohnDoe" } });
    expect(nameInput.value).toBe("JohnDoe");
  });

  it("validates only when focused and blurred", async () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignUpForm toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
    const nameInput = screen.getByLabelText("Name");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    fireEvent.focus(nameInput);
    await waitFor(() => {
      const nameError = screen.getByText("Name is required");
      expect(nameError).toBeInTheDocument();
    });
    fireEvent.blur(nameInput);

    fireEvent.focus(emailInput);
    await waitFor(() => {
      const emailError = screen.getByText("Email is required");
      expect(emailError).toBeInTheDocument();
    });
    fireEvent.blur(emailInput);

    fireEvent.focus(passwordInput);

    await waitFor(() => {
      expect(screen.getByText("Password strength")).toBeInTheDocument();
    });

    fireEvent.blur(passwordInput);
  });

  it("renders an eye icon button for the password field", () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignUpForm toggleForm={vi.fn()} />
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
              <SignUpForm toggleForm={vi.fn()} />
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
              <SignUpForm toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const eyeButton = screen.getByRole("button", { name: /show password/i });
    expect(eyeButton.getAttribute("tabindex")).toBe("-1");
  });

  it("renders an eye icon button for the confirm password field", () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignUpForm toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    expect(confirmPasswordInput).toBeInTheDocument();

    const confirmPasswordEyeButton = screen.getByRole("button", {
      name: /show confirm password/i,
    });
    expect(confirmPasswordEyeButton).toBeInTheDocument();
  });

  it("toggles confirm password visibility when clicking the eye icon", () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignUpForm toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    const confirmPasswordEyeButton = screen.getByRole("button", {
      name: /show confirm password/i,
    });

    expect(confirmPasswordInput).toHaveAttribute("type", "password");
    expect(confirmPasswordEyeButton).toHaveAttribute(
      "aria-label",
      "Show confirm password"
    );

    fireEvent.click(confirmPasswordEyeButton);
    expect(confirmPasswordInput).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: /hide confirm password/i })
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /hide confirm password/i })
    );
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
    expect(
      screen.getByRole("button", { name: /show confirm password/i })
    ).toBeInTheDocument();
  });

  it("documents current keyboard focus behavior of the confirm password eye button (tabIndex)", () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignUpForm toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const confirmPasswordEyeButton = screen.getByRole("button", {
      name: /show confirm password/i,
    });
    expect(confirmPasswordEyeButton.getAttribute("tabindex")).toBe("-1");
  });

  it("does not reset form after failed submission", async () => {
    mockedMakeRequest.mockResolvedValue(false);
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignUpForm toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText("Name");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    const form = screen.getByTestId("signup-form");
    const signUpButton = within(form).getByRole("button", { name: /sign up/i });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "testuser@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password@123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Password@123" },
    });

    expect(signUpButton).toBeEnabled();

    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(mockedMakeRequest).toHaveBeenCalled();
      expect(signUpButton).toBeEnabled();
    });

    expect(nameInput.value).toBe("Test User");
    expect(emailInput.value).toBe("testuser@example.com");
    expect(passwordInput.value).toBe("Password@123");
    expect(confirmPasswordInput.value).toBe("Password@123");
  });

  it("connectivity test passed", async () => {
    const authContext = mockAuthContext(true);
    mockedMakeRequest.mockResolvedValue(true);

    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignUpForm toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText("Name");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    const form = screen.getByTestId("signup-form");
    const signUpButton = within(form).getByRole("button", { name: /sign up/i });

    expect(signUpButton).toBeDisabled();

    fireEvent.change(nameInput, { target: { value: "Test" } });
    fireEvent.change(emailInput, { target: { value: "test@gmail.com" } });
    fireEvent.change(passwordInput, { target: { value: "Test@1234" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "Test@1234" } });

    expect(signUpButton).not.toBeDisabled();
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(mockedMakeRequest).toHaveBeenCalled();
    });
  });

  it("connectivity test failed", async () => {
    mockedMakeRequest.mockResolvedValue(false);
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignUpForm toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText("Name");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    const form = screen.getByTestId("signup-form");
    const signUpButton = within(form).getByRole("button", { name: /sign up/i });

    expect(signUpButton).toBeDisabled();

    fireEvent.change(nameInput, { target: { value: "Test" } });
    fireEvent.change(emailInput, { target: { value: "test@gmail.com" } });
    fireEvent.change(passwordInput, { target: { value: "Test@1234" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "Test@1234" } });

    expect(signUpButton).not.toBeDisabled();
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(nameInput.value).toBe("Test");
      expect(emailInput.value).toBe("test@gmail.com");
      expect(passwordInput.value).toBe("Test@1234");
      expect(confirmPasswordInput.value).toBe("Test@1234");
    });

    await waitFor(() => {
      expect(mockedMakeRequest).toHaveBeenCalled();
    });
    expect(signUpButton).not.toBeDisabled();
  });

  const delayedResolve = () =>
    new Promise((resolve) => setTimeout(() => resolve(true), 1000));

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    mockedMakeRequest.mockImplementation(delayedResolve);
  });

  it("disables input fields and submit button when loading", async () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignUpForm toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText("Name");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    const form = screen.getByTestId("signup-form");
    const submitButton = within(form).getByRole("button", { name: /sign up/i });

    fireEvent.change(nameInput, { target: { value: "Test" } });
    fireEvent.change(emailInput, { target: { value: "test@gmail.com" } });
    fireEvent.change(passwordInput, { target: { value: "Test@1234" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "Test@1234" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(nameInput).toBeDisabled();
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(confirmPasswordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  it("shows password strength card when password is typed", async () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignUpForm toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText("Password");
    fireEvent.focus(passwordInput);
    fireEvent.change(passwordInput, { target: { value: "abc" } });

    await waitFor(() => {
      expect(screen.getByText("Password strength")).toBeInTheDocument();
    });
  });

  it("shows weak strength level for a weak password", async () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignUpForm toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText("Password");
    fireEvent.focus(passwordInput);
    fireEvent.change(passwordInput, { target: { value: "abc" } });

    await waitFor(() => {
      expect(screen.getByText("weak")).toBeInTheDocument();
    });
  });

  it("shows medium strength level for a medium password", async () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignUpForm toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText("Password");
    fireEvent.focus(passwordInput);
    fireEvent.change(passwordInput, { target: { value: "Abc1" } });

    await waitFor(() => {
      expect(screen.getByText("medium")).toBeInTheDocument();
    });
  });

  it("shows strong strength level for a strong password", async () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignUpForm toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText("Password");
    fireEvent.focus(passwordInput);
    fireEvent.change(passwordInput, { target: { value: "Abcdef1!" } });

    await waitFor(() => {
      expect(screen.getByText("strong")).toBeInTheDocument();
    });
  });

  it("shows needs text with unmet criteria", async () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignUpForm toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText("Password");
    fireEvent.focus(passwordInput);
    fireEvent.change(passwordInput, { target: { value: "abc" } });

    await waitFor(() => {
      expect(screen.getByText(/Needs:/)).toBeInTheDocument();
    });
  });

  it("hides strength card when all conditions are met", async () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ThemeProvider>
            <ToastProvider>
              <SignUpForm toggleForm={vi.fn()} />
            </ToastProvider>
          </ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText("Password");
    fireEvent.focus(passwordInput);
    fireEvent.change(passwordInput, { target: { value: "Abcdef1!" } });

    await waitFor(() => {
      const card = screen.getByText("Password strength").closest("div");
      expect(card).not.toHaveClass("strength-card-visible");
    });
  });
});

it("renders the disclaimer with Terms and Privacy links", () => {
  const authContext = mockAuthContext(false);
  render(
    <BrowserRouter>
      <AuthContext.Provider value={authContext}>
        <ThemeProvider>
          <ToastProvider>
            <SignUpForm toggleForm={vi.fn()} onClose={vi.fn()} />
          </ToastProvider>
        </ThemeProvider>
      </AuthContext.Provider>
    </BrowserRouter>
  );

  const disclaimer = screen.getByText(/By Signing Up, you agree to our/i);
  expect(disclaimer).toBeInTheDocument();

  const termsLink = screen.getByText("Terms of Service");
  expect(termsLink).toBeInTheDocument();
  expect(
    termsLink.getAttribute("to") || termsLink.getAttribute("href")
  ).toContain("terms");

  const privacyLink = screen.getByText("Privacy Policy");
  expect(privacyLink).toBeInTheDocument();
  expect(
    privacyLink.getAttribute("to") || privacyLink.getAttribute("href")
  ).toContain("privacy");
});

it("navigates to Terms and Privacy sections on link click", () => {
  const onCloseMock = vi.fn();
  const authContext = mockAuthContext(false);
  render(
    <BrowserRouter>
      <AuthContext.Provider value={authContext}>
        <ThemeProvider>
          <ToastProvider>
            <SignUpForm toggleForm={vi.fn()} onClose={onCloseMock} />
          </ToastProvider>
        </ThemeProvider>
      </AuthContext.Provider>
    </BrowserRouter>
  );

  const termsLink = screen.getByText("Terms of Service");
  fireEvent.click(termsLink);
  expect(onCloseMock).toHaveBeenCalled();

  const privacyLink = screen.getByText("Privacy Policy");
  fireEvent.click(privacyLink);
  expect(onCloseMock).toHaveBeenCalled();
});
