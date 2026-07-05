import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import {
  AuthContext,
  ToastContext,
  UserContext,
} from "../../src/contexts/Contexts";
import { ThemeProvider } from "../../src/contexts/ThemeContext";
import Header from "../../src/components/header/Header";
import Home from "../../src/page/home/Home";
import {
  HEADER_ITEMS,
  HAMBURGER,
  CROSS,
  BUTTON_TEXT,
  BRANDING,
} from "../../src/utils/Constants";

const openCloseAuthModal = vi.fn();

const mockAuthContext = (isAuthenticated) => ({
  isAuthenticated,
});

const mockUserContext = (userData) => ({
  userData,
  setUserData: vi.fn(),
});

const mockUserData = {
  email: "test@example.com",
  name: "Test User",
};

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
globalThis.localStorage = localStorageMock;

describe("Header component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });
  it("Render header branding and navigate to home on click", () => {
    const authContext = mockAuthContext(true);
    const userContext = mockUserContext(mockUserData);
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthContext.Provider value={authContext}>
            <UserContext.Provider value={userContext}>
              <Header openAuthModal={openCloseAuthModal} />
            </UserContext.Provider>
          </AuthContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );

    const brandImages = screen.getAllByAltText(BRANDING.brandName);
    const brandName = screen.getByText(BRANDING.brandName);
    expect(brandImages[0]).toBeInTheDocument();
    expect(brandName).toBeInTheDocument();
    fireEvent.click(brandName);
    expect(window.location.pathname).toBe("/");
  });

  it("Render all header navigations", () => {
    const authContext = mockAuthContext(false);
    const userContext = mockUserContext(null);
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthContext.Provider value={authContext}>
            <UserContext.Provider value={userContext}>
              <Header openAuthModal={openCloseAuthModal} />
            </UserContext.Provider>
          </AuthContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );

    HEADER_ITEMS.forEach((item) => {
      const navItem = screen.getByText(item.title);
      expect(navItem).toBeInTheDocument();
    });
  });

  it("Header links should be clickable and navigate", () => {
    const authContext = mockAuthContext(false);
    render(
      <BrowserRouter>
        <ThemeProvider>
          <ToastContext.Provider value={mockAuthContext}>
            <AuthContext.Provider value={authContext}>
              <UserContext.Provider value={{ userData: null }}>
                <Header openAuthModal={openCloseAuthModal} />
                <Home openAuthModal={openCloseAuthModal} />
              </UserContext.Provider>
            </AuthContext.Provider>
          </ToastContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );

    const headerElement = screen.getByTestId("header");
    for (const item of HEADER_ITEMS) {
      const navLink = within(headerElement).getByText(item.title);
      expect(navLink).toBeInTheDocument();
      fireEvent.click(navLink);
      const [path, sectionId] = item.url.split("#");
      expect(window.location.pathname).toBe(path);
      if (sectionId) {
        const sectionElement = screen.getByTestId(sectionId);
        expect(sectionElement).toBeInTheDocument();
      }
    }
  });

  it("Hamburger visible before and after screen width change", () => {
    const authContext = mockAuthContext(false);
    const userContext = mockUserContext(null);
    window.innerWidth = 1200;
    window.dispatchEvent(new Event("resize"));
    const { unmount } = render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthContext.Provider value={authContext}>
            <UserContext.Provider value={userContext}>
              <Header openAuthModal={openCloseAuthModal} />
            </UserContext.Provider>
          </AuthContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );

    const mobileMenuButton = screen.queryByRole("button", {
      name: HAMBURGER.alt,
    });
    expect(mobileMenuButton).not.toBeInTheDocument();

    unmount();

    window.innerWidth = 1000;
    window.dispatchEvent(new Event("resize"));
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthContext.Provider value={authContext}>
            <UserContext.Provider value={userContext}>
              <Header openAuthModal={openCloseAuthModal} />
            </UserContext.Provider>
          </AuthContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );

    const afterResizeMobileMenuButton = screen.getByRole("button", {
      name: HAMBURGER.alt,
    });
    expect(afterResizeMobileMenuButton).toBeInTheDocument();
  });

  it("Mobile header toggle icon", () => {
    const authContext = mockAuthContext(false);
    const userContext = mockUserContext(null);
    window.innerWidth = 1000;
    window.dispatchEvent(new Event("resize"));
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthContext.Provider value={authContext}>
            <UserContext.Provider value={userContext}>
              <Header openAuthModal={openCloseAuthModal} />
            </UserContext.Provider>
          </AuthContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );

    const mobileMenuButton = screen.getByRole("button", {
      name: HAMBURGER.alt,
    });
    fireEvent.click(mobileMenuButton);
    const closeIcon = screen.getByRole("button", { name: CROSS.alt });
    expect(closeIcon).toBeInTheDocument();
    fireEvent.click(closeIcon);
    const afterClose = screen.queryByRole("button", { name: CROSS.alt });
    expect(afterClose).not.toBeInTheDocument();
  });

  it("Mobile header auto close if width > 1024", () => {
    const authContext = mockAuthContext(false);
    const userContext = mockUserContext(null);
    window.innerWidth = 700;
    window.dispatchEvent(new Event("resize"));
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthContext.Provider value={authContext}>
            <UserContext.Provider value={userContext}>
              <Header openAuthModal={openCloseAuthModal} />
            </UserContext.Provider>
          </AuthContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );

    const mobileMenuButton = screen.getByRole("button", {
      name: HAMBURGER.alt,
    });
    fireEvent.click(mobileMenuButton);
    window.innerWidth = 1200;
    window.dispatchEvent(new Event("resize"));
    const mobileMenuButtonAfter = screen.queryByRole("button", {
      name: HAMBURGER.alt,
    });
    expect(mobileMenuButtonAfter).not.toBeInTheDocument();
  });

  it("Open and close authModal", () => {
    const authContext = mockAuthContext(false);
    const userContext = mockUserContext(null);
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthContext.Provider value={authContext}>
            <UserContext.Provider value={userContext}>
              <Header openAuthModal={openCloseAuthModal} />
            </UserContext.Provider>
          </AuthContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );

    const getStartedButton = screen.getByText(BUTTON_TEXT.getStarted);
    fireEvent.click(getStartedButton);
    expect(openCloseAuthModal).toHaveBeenCalled();
  });

  it("Removes Get started button if user is logged in", () => {
    const authContext = mockAuthContext(true);
    const userContext = mockUserContext(mockUserData);
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthContext.Provider value={authContext}>
            <UserContext.Provider value={userContext}>
              <Header openAuthModal={openCloseAuthModal} />
            </UserContext.Provider>
          </AuthContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );

    const getStartedButtonText = screen.queryByText(BUTTON_TEXT.getStarted);
    expect(getStartedButtonText).not.toBeInTheDocument();
  });
});

it("Renders UserDropDown when user is authenticated", () => {
  const authContext = mockAuthContext(true);
  const userContext = mockUserContext(mockUserData);
  render(
    <BrowserRouter>
      <ThemeProvider>
        <AuthContext.Provider value={authContext}>
          <UserContext.Provider value={userContext}>
            <Header openAuthModal={openCloseAuthModal} />
          </UserContext.Provider>
        </AuthContext.Provider>
      </ThemeProvider>
    </BrowserRouter>
  );

  const userInitial = mockUserData.email[0].toUpperCase();
  const userButton = screen.getByRole("button", { name: userInitial });
  expect(userButton).toBeInTheDocument();

  fireEvent.click(userButton);
  const signoutButton = screen.getByText("Sign Out");
  expect(signoutButton).toBeInTheDocument();
});
