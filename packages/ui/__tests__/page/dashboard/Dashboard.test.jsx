import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  UserContext,
  AuthContext,
  ToastContext,
} from "../../../src/contexts/Contexts";
import Dashboard from "../../../src/page/dashboard/Dashboard";
import { API_KEY_TABLE, MOCK_USER_DATA } from "../../../src/utils/Constants";
import Dropdown from "../../../src/components/common/dropdown/Dropdown";

/* ---------------- mocks ---------------- */

vi.mock("../../src/hooks/useApi.js", () => ({
  useApi: vi.fn(() => ({
    makeRequest: vi.fn(),
    errorMsg: null,
  })),
}));

const mockToastContext = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  show: vi.fn(),
  clear: vi.fn(),
  clearToast: vi.fn(),
  addToast: vi.fn(),
};

const mockUserContext = (userData, loading) => ({
  userData,
  loading,
  fetchUserData: vi.fn(),
  setUserData: vi.fn(),
});

const mockAuthContext = (isAuthenticated = true, logout = vi.fn()) => ({
  isAuthenticated,
  logout,
});

const renderDashboard = ({
  userContextValue,
  authContextValue = mockAuthContext(true),
  toastContextValue = mockToastContext,
} = {}) =>
  render(
    <ToastContext.Provider value={toastContextValue}>
      <AuthContext.Provider value={authContextValue}>
        <UserContext.Provider value={userContextValue}>
          <Dashboard />
        </UserContext.Provider>
      </AuthContext.Provider>
    </ToastContext.Provider>
  );

/* ---------------- Dropdown helpers ---------------- */

const renderDropdown = ({
  options = [],
  selectedOption = "",
  setSelectedOption = vi.fn(),
} = {}) => {
  render(
    <Dropdown
      options={options}
      selectedOption={selectedOption}
      setSelectedOption={setSelectedOption}
    />
  );
  return {
    dropdown: screen.getByTestId("testid-dropdown"),
    setSelectedOption,
  };
};

/* ---------------- Dashboard tests ---------------- */

describe("Dashboard", () => {
  it("renders loading spinner when loading is true", () => {
    const userContext = mockUserContext(null, true);
    renderDashboard({ userContextValue: userContext });

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(userContext.fetchUserData).toHaveBeenCalled();
  });

  it("renders dashboard when loading is false", async () => {
    const userContext = mockUserContext(MOCK_USER_DATA, false);
    renderDashboard({ userContextValue: userContext });

    await waitFor(() => {
      expect(screen.getByTestId("testid-dashboard")).toBeInTheDocument();
    });

    expect(screen.getByText("Active API Keys")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("allows ADMIN to switch dashboards", async () => {
    const adminUserContext = mockUserContext(
      { ...MOCK_USER_DATA, role: "ADMIN" },
      false
    );

    renderDashboard({ userContextValue: adminUserContext });

    fireEvent.click(screen.getByText("USER"));
    fireEvent.click(screen.getByText("OPERATOR"));

    await waitFor(() => {
      expect(
        screen.getByTestId("testid-operator-dashboard")
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("OPERATOR"));
    fireEvent.click(screen.getByText("ADMIN"));

    await waitFor(() => {
      expect(screen.getByTestId("testid-admin-dashboard")).toBeInTheDocument();
    });
  });

  it("allows OPERATOR to switch dashboards", async () => {
    const operatorUserContext = mockUserContext(
      { ...MOCK_USER_DATA, role: "OPERATOR" },
      false
    );

    renderDashboard({ userContextValue: operatorUserContext });

    fireEvent.click(screen.getByText("USER"));
    fireEvent.click(screen.getByText("OPERATOR"));

    await waitFor(() => {
      expect(
        screen.getByTestId("testid-operator-dashboard")
      ).toBeInTheDocument();
    });
  });

  it("does not render dashboard dropdown for USER role", () => {
    const userContext = mockUserContext(
      { ...MOCK_USER_DATA, role: "USER" },
      false
    );

    renderDashboard({ userContextValue: userContext });

    expect(
      screen.queryByRole("button", { name: "USER" })
    ).not.toBeInTheDocument();

    expect(screen.getByTestId("testid-dashboard")).toBeInTheDocument();
  });

  it("applies warning class to expiring API keys", () => {
    const expiringKey = {
      ...MOCK_USER_DATA.keys[0],
      expires_at: new Date(Date.now() + 5 * 86400000).toISOString(),
    };

    const userContext = mockUserContext(
      { ...MOCK_USER_DATA, keys: [expiringKey] },
      false
    );

    renderDashboard({ userContextValue: userContext });

    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows[1].className).toContain("expiry-warning-row");
  });

  it("shows empty API key message when no keys exist", async () => {
    const userContext = mockUserContext({ ...MOCK_USER_DATA, keys: [] }, false);

    renderDashboard({ userContextValue: userContext });

    await waitFor(() => {
      expect(screen.getByText(API_KEY_TABLE.emptyMessage)).toBeInTheDocument();
    });
  });

  it("calls fetchUserData only once", () => {
    const userContext = mockUserContext(MOCK_USER_DATA, false);
    renderDashboard({ userContextValue: userContext });

    expect(userContext.fetchUserData).toHaveBeenCalledTimes(1);
  });
});

describe("Dashboard API Keys Count", () => {
  it("shows singular 'key' when only one key exists", async () => {
    const userContext = mockUserContext({
      ...MOCK_USER_DATA,
      keys: [MOCK_USER_DATA.keys[0]],
    });
    renderDashboard({ userContextValue: userContext });

    await waitFor(() => {
      expect(screen.getByText(/1 key found/i)).toBeInTheDocument();
    });
  });

  it("shows plural 'keys' when multiple keys exist", async () => {
    const userContext = mockUserContext(MOCK_USER_DATA);
    renderDashboard({ userContextValue: userContext });

    await waitFor(() => {
      expect(
        screen.getByText(new RegExp(`${MOCK_USER_DATA.keys.length} keys found`))
      ).toBeInTheDocument();
    });
  });

  it("shows 0 keys found when keys array is empty", async () => {
    const userContext = mockUserContext({ ...MOCK_USER_DATA, keys: [] });
    renderDashboard({ userContextValue: userContext });

    await waitFor(() => {
      expect(screen.getByText(/0 keys found/i)).toBeInTheDocument();
    });
  });
});

describe("Dashboard Guest Role", () => {
  it("sets isGuest true when user role is GUEST", async () => {
    const userContext = mockUserContext(
      { ...MOCK_USER_DATA, role: "GUEST" },
      false
    );
    renderDashboard({ userContextValue: userContext });

    await waitFor(() => {
      expect(screen.getByTestId("testid-dashboard")).toBeInTheDocument();
    });
  });

  it("does not show role dropdown for GUEST user", async () => {
    const userContext = mockUserContext(
      { ...MOCK_USER_DATA, role: "GUEST" },
      false
    );
    renderDashboard({ userContextValue: userContext });

    expect(screen.queryByTestId("testid-dropdown")).not.toBeInTheDocument();
  });
});

describe("Dashboard non-expiring API Keys", () => {
  it("does not apply warning class to keys expiring beyond 7 days", () => {
    const safeKey = {
      ...MOCK_USER_DATA.keys[0],
      expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    };

    const userContext = mockUserContext(
      { ...MOCK_USER_DATA, keys: [safeKey] },
      false
    );

    renderDashboard({ userContextValue: userContext });

    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows[1].className).not.toContain("expiry-warning-row");
  });

  it("applies warning class to key expiring exactly in 7 days", () => {
    const borderlineKey = {
      ...MOCK_USER_DATA.keys[0],
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    };

    const userContext = mockUserContext(
      { ...MOCK_USER_DATA, keys: [borderlineKey] },
      false
    );

    renderDashboard({ userContextValue: userContext });

    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows[1].className).toContain("expiry-warning-row");
  });
});

describe("Dashboard Modal Interactions", () => {
  it("closes modal when cancel button is clicked", async () => {
    const userContext = mockUserContext(MOCK_USER_DATA, false);
    renderDashboard({ userContextValue: userContext });

    const table = await screen.findByRole("table");
    const deleteButton = within(table).getAllByRole("button")[0];
    fireEvent.click(deleteButton);

    const dialog = await screen.findByTestId("dialog");
    const cancelButton = within(dialog).getByRole("button", { name: "Cancel" });

    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(
        screen.queryByTestId("delete-api-key-modal")
      ).not.toBeInTheDocument();
    });
  });

  it("clears the confirmation input when modal is reopened", async () => {
    const userContext = mockUserContext(MOCK_USER_DATA, false);
    renderDashboard({ userContextValue: userContext });

    const table = await screen.findByRole("table");
    const deleteButton = within(table).getAllByRole("button")[0];

    fireEvent.click(deleteButton);
    let dialog = await screen.findByTestId("dialog");

    fireEvent.change(within(dialog).getByTestId("api-key-confirm-input"), {
      target: { value: "some-text" },
    });

    const cancelButton = within(dialog).getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(
        screen.queryByTestId("delete-api-key-modal")
      ).not.toBeInTheDocument();
    });

    fireEvent.click(deleteButton);
    dialog = await screen.findByTestId("dialog");

    expect(within(dialog).getByTestId("api-key-confirm-input").value).toBe("");
  });
});

describe("Dropdown", () => {
  it("renders nothing when options are empty", () => {
    render(
      <Dropdown options={[]} selectedOption="" setSelectedOption={vi.fn()} />
    );
    expect(screen.getByTestId("testid-dropdown").children.length).toBe(0);
  });

  it("renders options when opened", () => {
    renderDropdown({ options: ["ADMIN", "USER"], selectedOption: "USER" });

    fireEvent.click(screen.getByText("USER"));

    expect(screen.getByText("ADMIN")).toBeInTheDocument();
    expect(screen.getByText("USER")).toBeInTheDocument();
  });

  it("is focusable", () => {
    const { dropdown } = renderDropdown({
      options: ["ADMIN", "USER"],
      selectedOption: "USER",
    });

    dropdown.focus();
    expect(dropdown).toHaveFocus();
  });

  it("does not crash if selectedOption is not in options", () => {
    expect(() => {
      renderDropdown({
        options: ["ADMIN", "USER"],
        selectedOption: "GUEST",
      });
    }).not.toThrow();
  });
  it("displays options in uppercase", () => {
    renderDropdown({ options: ["admin", "user"], selectedOption: "user" });
    const renderedOptions = screen.getAllByRole("option");
    expect(renderedOptions.map((opt) => opt.textContent)).toEqual([
      "ADMIN",
      "USER",
    ]);
  });

  it("sets selected option correctly", () => {
    const { dropdown } = renderDropdown({
      options: ["ADMIN", "USER"],
      selectedOption: "ADMIN",
    });
    expect(dropdown.value).toBe("ADMIN");
  });

  it("calls setSelectedOption on change", () => {
    const mockSet = vi.fn();
    const { dropdown } = renderDropdown({
      options: ["ADMIN", "USER"],
      selectedOption: "ADMIN",
      setSelectedOption: mockSet,
    });
    fireEvent.change(dropdown, { target: { value: "USER" } });
    expect(mockSet).toHaveBeenCalledWith("USER");
  });

  it("handles undefined options without crashing", () => {
    const { dropdown } = renderDropdown({
      options: undefined,
      selectedOption: "",
    });
    expect(dropdown.children.length).toBe(0);
  });

  it("renders options with special characters", () => {
    renderDropdown({ options: ["@dm!n", "us3r_1"], selectedOption: "us3r_1" });
    expect(screen.getAllByRole("option").map((o) => o.value)).toEqual([
      "@dm!n",
      "us3r_1",
    ]);
  });

  it("displays options in uppercase", () => {
    renderDropdown({ options: ["admin", "user"], selectedOption: "user" });
    const renderedOptions = screen.getAllByRole("option");
    expect(renderedOptions.map((opt) => opt.textContent)).toEqual([
      "ADMIN",
      "USER",
    ]);
  });

  it("sets selected option correctly", () => {
    const { dropdown } = renderDropdown({
      options: ["ADMIN", "USER"],
      selectedOption: "ADMIN",
    });
    expect(dropdown.value).toBe("ADMIN");
  });

  it("calls setSelectedOption on change", () => {
    const mockSet = vi.fn();
    const { dropdown } = renderDropdown({
      options: ["ADMIN", "USER"],
      selectedOption: "ADMIN",
      setSelectedOption: mockSet,
    });
    fireEvent.change(dropdown, { target: { value: "USER" } });
    expect(mockSet).toHaveBeenCalledWith("USER");
  });

  it("handles undefined options without crashing", () => {
    const { dropdown } = renderDropdown({
      options: undefined,
      selectedOption: "",
    });
    expect(dropdown.children.length).toBe(0);
  });

  it("renders options with special characters", () => {
    renderDropdown({ options: ["@dm!n", "us3r_1"], selectedOption: "us3r_1" });
    expect(screen.getAllByRole("option").map((o) => o.value)).toEqual([
      "@dm!n",
      "us3r_1",
    ]);
  });
});

//new tests 2
describe("Dashboard Key Expiry Edge Cases", () => {
  it("applies warning class to key expiring in exactly 1 day", () => {
    const key = {
      ...MOCK_USER_DATA.keys[0],
      expires_at: new Date(Date.now() + 1 * 86400000).toISOString(),
    };
    const userContext = mockUserContext(
      { ...MOCK_USER_DATA, keys: [key] },
      false
    );
    renderDashboard({ userContextValue: userContext });

    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows[1].className).toContain("expiry-warning-row");
  });

  it("does not apply warning class to key expiring in 8 days", () => {
    const key = {
      ...MOCK_USER_DATA.keys[0],
      expires_at: new Date(Date.now() + 10 * 86400000).toISOString(),
    };
    const userContext = mockUserContext(
      { ...MOCK_USER_DATA, keys: [key] },
      false
    );
    renderDashboard({ userContextValue: userContext });

    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows[1].className).not.toContain("expiry-warning-row");
  });
});

/* ---------------- API Key Deletion ---------------- */

describe("API Key Deletion", () => {
  it("opens confirmation modal on delete click", async () => {
    const userContext = mockUserContext(MOCK_USER_DATA, false);
    renderDashboard({ userContextValue: userContext });

    // find table
    const table = await screen.findByRole("table");

    // find first button inside table (delete icon)
    const deleteButton = within(table).getAllByRole("button")[0];

    fireEvent.click(deleteButton);

    expect(
      await screen.findByTestId("delete-api-key-modal")
    ).toBeInTheDocument();
  });

  it("disables confirm button when key name does not match", async () => {
    const userContext = mockUserContext(MOCK_USER_DATA, false);
    renderDashboard({ userContextValue: userContext });

    const table = await screen.findByRole("table");
    const deleteButton = within(table).getAllByRole("button")[0];
    fireEvent.click(deleteButton);

    const dialog = await screen.findByTestId("dialog");

    fireEvent.change(within(dialog).getByTestId("api-key-confirm-input"), {
      target: { value: "Wrong_Key_Name" },
    });

    const confirmButton = within(dialog).getByRole("button", {
      name: "Delete",
    });

    expect(confirmButton).toBeDisabled();
  });

  it("enables confirm button when key name matches", async () => {
    const userContext = mockUserContext(MOCK_USER_DATA, false);
    renderDashboard({ userContextValue: userContext });

    const table = await screen.findByRole("table");
    const deleteButton = within(table).getAllByRole("button")[0];
    fireEvent.click(deleteButton);

    const dialog = await screen.findByTestId("dialog");

    const keyName = within(dialog)
      .getByText((_, el) => el?.tagName === "STRONG")
      .textContent.trim();

    fireEvent.change(within(dialog).getByTestId("api-key-confirm-input"), {
      target: { value: keyName },
    });

    const confirmButton = within(dialog).getByRole("button", {
      name: "Delete",
    });

    await waitFor(() => {
      expect(confirmButton).toBeEnabled();
    });
  });
});
