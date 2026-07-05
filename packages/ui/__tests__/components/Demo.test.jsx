import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Demo from "../../src/components/demo/Demo.jsx";
import { ToastContext, AuthContext } from "../../src/contexts/Contexts.jsx";
import { BUTTON_TEXT, DEMO } from "../../src/utils/Constants.js";

const mockUseApi = vi.fn();

vi.mock("../../src/hooks/useApi", () => ({
  useApi: () => mockUseApi(),
}));

const mockAuthContext = (isAuthenticated) => ({
  isAuthenticated,
});

const mockToastContext = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  show: vi.fn(),
  clear: vi.fn(),
  clearToast: vi.fn(),
};

describe("Demo Component", () => {
  const mockOpenAuthModal = vi.fn();
  const searchPlaceholder = /type a brand name/i;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseApi.mockReturnValue({
      makeRequest: vi.fn(),
      data: [],
      loading: false,
      errorMsg: null,
    });
  });

  it("renders the Demo component correctly", () => {
    const authContext = mockAuthContext(true);
    render(
      <MemoryRouter>
        <AuthContext.Provider value={authContext}>
          <ToastContext.Provider value={mockToastContext}>
            <Demo openAuthModal={mockOpenAuthModal} />
          </ToastContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    );
    expect(
      screen.getByRole("heading", {
        name: /try it yourself\.\s*instant logo retrieval\./i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText(DEMO.summary)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(searchPlaceholder)).toBeInTheDocument();
    expect(screen.getByText("Google")).toBeInTheDocument();
  });

  it("displays up to 3 search results after fetching", async () => {
    const authContext = mockAuthContext(true);
    mockUseApi.mockReturnValue({
      makeRequest: vi.fn(),
      data: {
        data: [
          { companyName: "Aalto", image: "aalto-logo.svg" },
          { companyName: "Aareon", image: "aareon-logo.svg" },
          { companyName: "Aavid", image: "aavid-logo.svg" },
          { companyName: "Aastra", image: "aastra-logo.svg" },
        ],
      },
      loading: false,
      errorMsg: null,
    });

    render(
      <MemoryRouter>
        <AuthContext.Provider value={authContext}>
          <ToastContext.Provider value={mockToastContext}>
            <Demo openAuthModal={mockOpenAuthModal} />
          </ToastContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(searchPlaceholder), {
      target: { value: "aa" },
    });

    await waitFor(() => {
      expect(screen.getByText("Aalto")).toBeInTheDocument();
      expect(screen.getByText("Aareon")).toBeInTheDocument();
      expect(screen.getByText("Aavid")).toBeInTheDocument();
      expect(screen.queryByText("Aastra")).not.toBeInTheDocument();
    });
  });

  it("shows Loading spinner when loading is true", async () => {
    const authContext = mockAuthContext(true);
    mockUseApi.mockReturnValue({
      makeRequest: vi.fn(),
      data: [],
      loading: true,
      errorMsg: null,
    });
    render(
      <MemoryRouter>
        <AuthContext.Provider value={authContext}>
          <ToastContext.Provider value={mockToastContext}>
            <Demo openAuthModal={mockOpenAuthModal} />
          </ToastContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(searchPlaceholder), {
      target: { value: "nope" },
    });

    await waitFor(() => {
      const loadingSpinner = screen.getByTestId("spinner");
      expect(loadingSpinner).toBeInTheDocument();
    });
  });

  it("shows 'No results' and request button if search returns nothing", async () => {
    const authContext = mockAuthContext(true);
    render(
      <MemoryRouter>
        <AuthContext.Provider value={authContext}>
          <ToastContext.Provider value={mockToastContext}>
            <Demo openAuthModal={mockOpenAuthModal} />
          </ToastContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(searchPlaceholder), {
      target: { value: "nope" },
    });

    await waitFor(() => {
      expect(screen.getByText(/did not match any logo/i)).toBeInTheDocument();
      const resultContainer = screen
        .getByText(/did not match any logo/i)
        .closest('[class*="resultContainer"]');
      expect(resultContainer).toBeInTheDocument();
      expect(screen.getByText("Request Logo")).toBeInTheDocument();
    });
  });

  it("opens LogoRequestForm modal when request logo is clicked and user is authenticated", async () => {
    const authContext = mockAuthContext(true);
    render(
      <MemoryRouter>
        <AuthContext.Provider value={authContext}>
          <ToastContext.Provider value={mockToastContext}>
            <Demo openAuthModal={mockOpenAuthModal} />
          </ToastContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    );
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(searchPlaceholder), {
        target: { value: "nothing" },
      });
      fireEvent.click(
        screen.getByRole("button", { name: BUTTON_TEXT.requestLogo })
      );
    });
    await waitFor(() => {
      const logoRequestFormModal = screen.getAllByText("Request Logo");
      expect(logoRequestFormModal.length).toBe(2);
    });
  });

  it("opens auth modal when request logo is clicked and user is not authenticated", async () => {
    const authContext = mockAuthContext(false);
    render(
      <MemoryRouter>
        <AuthContext.Provider value={authContext}>
          <ToastContext.Provider value={mockToastContext}>
            <Demo openAuthModal={mockOpenAuthModal} />
          </ToastContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    );
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(searchPlaceholder), {
        target: { value: "nothing" },
      });
      fireEvent.click(
        screen.getByRole("button", { name: BUTTON_TEXT.requestLogo })
      );
    });
    await waitFor(() => {
      expect(mockOpenAuthModal).toHaveBeenCalled();
    });
  });

  it("closes the LogoRequestForm modal when the close button is clicked", async () => {
    const authContext = mockAuthContext(true);
    render(
      <MemoryRouter>
        <AuthContext.Provider value={authContext}>
          <ToastContext.Provider value={mockToastContext}>
            <Demo openAuthModal={mockOpenAuthModal} />
          </ToastContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    );
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(searchPlaceholder), {
        target: { value: "nothing" },
      });
      fireEvent.click(
        screen.getByRole("button", { name: BUTTON_TEXT.requestLogo })
      );
    });
    await waitFor(() => {
      const logoRequestFormModal = screen.getAllByText("Request Logo");
      expect(logoRequestFormModal.length).toBe(2);
    });

    fireEvent.click(screen.getByRole("button", { name: BUTTON_TEXT.cross }));
    const modalClosed = screen.getAllByText("Request Logo");
    expect(modalClosed.length).toBe(1);
  });
});
