import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UserSettings from "../../src/components/usersettings/UserSettings";
import { UserContext } from "../../src/contexts/Contexts";

vi.mock("../../src/components/profileinfo/ProfileInfo", () => ({
  default: () => <div data-testid="profile-info">Profile Info Component</div>,
}));

vi.mock("../../src/components/twofactorauth/TwoFactorAuth", () => ({
  default: () => (
    <div data-testid="two-factor-auth">Two Factor Auth Component</div>
  ),
}));

vi.mock("../../src/components/devicesession/DeviceSessionCard", () => ({
  default: ({ isGuest }) => (
    <div data-testid="device-session-card">
      Device Sessions {isGuest ? "Guest" : "User"}
    </div>
  ),
}));
const mockUserContext = {
  userData: {
    name: "Test User",
    email: "test@example.com",
    role: "USER",
  },
  loading: false,
  error: null,
  fetchUserData: vi.fn(),
  setUserData: vi.fn(),
  isGuest: false,
};

describe("UserSettings Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default profile tab active", () => {
    render(
      <UserContext.Provider value={mockUserContext}>
        <UserSettings />
      </UserContext.Provider>
    );

    expect(
      screen.getByRole("heading", { name: "Profile Info" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Manage your personal details and account security preferences."
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId("profile-info")).toBeInTheDocument();
  });

  it("renders all menu items", () => {
    render(
      <UserContext.Provider value={mockUserContext}>
        <UserSettings />
      </UserContext.Provider>
    );

    expect(
      screen.getByRole("button", { name: /Profile Info/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /2FA Settings/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sessions/i })
    ).toBeInTheDocument();
  });

  it("switches to 2FA tab when clicked", () => {
    render(
      <UserContext.Provider value={mockUserContext}>
        <UserSettings />
      </UserContext.Provider>
    );

    const twoFAButton = screen.getByRole("button", { name: /2FA Settings/i });
    fireEvent.click(twoFAButton);

    expect(screen.getByText("Security Settings")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Manage your account security and two-factor authentication."
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId("two-factor-auth")).toBeInTheDocument();
  });

  it("switches to Sessions tab and shows device session management", () => {
    render(
      <UserContext.Provider value={mockUserContext}>
        <UserSettings />
      </UserContext.Provider>
    );

    fireEvent.click(screen.getByRole("button", { name: /Sessions/i }));

    expect(
      screen.getByRole("heading", { name: /Active Sessions/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /View devices where you're signed in and revoke access you don't recognize/i
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId("device-session-card")).toHaveTextContent("User");
  });

  it("applies active class to selected tab", () => {
    render(
      <UserContext.Provider value={mockUserContext}>
        <UserSettings />
      </UserContext.Provider>
    );

    const profileButton = screen.getByRole("button", { name: /Profile Info/i });
    const twoFAButton = screen.getByRole("button", { name: /2FA Settings/i });

    expect(profileButton.className).toContain("navItemActive");
    expect(twoFAButton.className).not.toContain("navItemActive");

    fireEvent.click(twoFAButton);

    expect(profileButton.className).not.toContain("navItemActive");
    expect(twoFAButton.className).toContain("navItemActive");
  });

  it("switches between tabs correctly", () => {
    render(
      <UserContext.Provider value={mockUserContext}>
        <UserSettings />
      </UserContext.Provider>
    );

    expect(screen.getByTestId("profile-info")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /2FA Settings/i }));
    expect(screen.getByTestId("two-factor-auth")).toBeInTheDocument();
    expect(screen.queryByTestId("profile-info")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Sessions/i }));
    expect(screen.getByTestId("device-session-card")).toBeInTheDocument();
    expect(screen.queryByTestId("two-factor-auth")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Profile Info/i }));
    expect(screen.getByTestId("profile-info")).toBeInTheDocument();
    expect(screen.queryByTestId("device-session-card")).not.toBeInTheDocument();
  });
});
