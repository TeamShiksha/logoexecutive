import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UserInfo from "../../src/components/userinfo/UserInfo";
import {
  MOCK_USER_DATA,
  USER_INFO_FIELDS,
  MESSAGES,
} from "../../src/utils/Constants";
import { ToastContext } from "../../src/contexts/Contexts";

const mockMakeRequest = vi.fn();
vi.mock("../../src/hooks/useApi.js", () => ({
  useApi: () => ({
    makeRequest: mockMakeRequest,
    errorMsg: "",
  }),
}));

const mockToastContext = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  show: vi.fn(),
  clear: vi.fn(),
  clearToast: vi.fn(),
};

describe("UserInfo Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form elements correctly", async () => {
    render(
      <ToastContext.Provider value={mockToastContext}>
        <UserInfo name={MOCK_USER_DATA.name} email={MOCK_USER_DATA.email} />
      </ToastContext.Provider>
    );

    const nameInput = screen.getByTestId("input-name");
    expect(nameInput.value).toBe(MOCK_USER_DATA.name);

    const emailInput = screen.getByTestId("input-email");
    expect(emailInput.value).toBe(MOCK_USER_DATA.email);
    expect(emailInput).toBeDisabled();

    const saveButton = screen.getByText("Save");
    expect(saveButton).toBeDisabled();
  });

  it("update name input value", () => {
    render(
      <ToastContext.Provider value={mockToastContext}>
        <UserInfo name={MOCK_USER_DATA.name} email={MOCK_USER_DATA.email} />
      </ToastContext.Provider>
    );

    const nameInput = screen.getByDisplayValue(MOCK_USER_DATA.name);
    fireEvent.change(nameInput, { target: { value: "New Name" } });
    expect(nameInput.value).toBe("New Name");
  });

  it("show error if name is empty & removes error if name is valid on submit", async () => {
    render(
      <ToastContext.Provider value={mockToastContext}>
        <UserInfo name={MOCK_USER_DATA.name} email={MOCK_USER_DATA.email} />
      </ToastContext.Provider>
    );

    const nameInput = screen.getByDisplayValue(MOCK_USER_DATA.name);
    fireEvent.change(nameInput, { target: { value: "" } });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      const nameErrorText = screen.getByText("Name is required");
      expect(nameErrorText).toBeInTheDocument();
    });

    fireEvent.change(nameInput, { target: { value: "New Name" } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      const nameErrorText = screen.queryByText("Name is required");
      expect(nameErrorText).not.toBeInTheDocument();
    });
  });

  it("enable Save button when name is changed", () => {
    render(
      <ToastContext.Provider value={mockToastContext}>
        <UserInfo name={MOCK_USER_DATA.name} email={MOCK_USER_DATA.email} />
      </ToastContext.Provider>
    );

    const nameInput = screen.getByDisplayValue(MOCK_USER_DATA.name);
    const saveButton = screen.getByText("Save");
    expect(saveButton).toBeDisabled();

    fireEvent.change(nameInput, { target: { value: "Another Name" } });
    expect(saveButton).not.toBeDisabled();
  });

  it("calls the update user API on form submission", async () => {
    render(
      <ToastContext.Provider value={mockToastContext}>
        <UserInfo
          name={MOCK_USER_DATA.name}
          email={MOCK_USER_DATA.email}
          isGuest={false}
        />
      </ToastContext.Provider>
    );

    const nameInput = screen.getByTestId("input-name");
    expect(nameInput.value).toBe(MOCK_USER_DATA.name);

    fireEvent.change(nameInput, { target: { value: "Updated Name" } });
    expect(nameInput.value).toBe("Updated Name");

    const saveButton = screen.getByText("Save");
    expect(saveButton).not.toBeDisabled();

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockMakeRequest).toBeCalled();
    });
  });

  it("renders all fields from USER_INFO_FIELDS constant", () => {
    render(
      <ToastContext.Provider value={mockToastContext}>
        <UserInfo name={MOCK_USER_DATA.name} email={MOCK_USER_DATA.email} />
      </ToastContext.Provider>
    );

    USER_INFO_FIELDS.forEach((field) => {
      const input = screen.getByLabelText(field.label);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", field.type);
      expect(input).toHaveAttribute("name", field.name);
    });
  });

  it("disables Save button for guest users", () => {
    render(
      <ToastContext.Provider value={mockToastContext}>
        <UserInfo
          name={MOCK_USER_DATA.name}
          email={MOCK_USER_DATA.email}
          isGuest={true}
        />
      </ToastContext.Provider>
    );

    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: "New Name" } });

    const saveButton = screen.getByText("Save");
    expect(saveButton).toBeDisabled();
  });

  it("shows success toast with correct message on successful update", async () => {
    mockMakeRequest.mockResolvedValueOnce(true);

    render(
      <ToastContext.Provider value={mockToastContext}>
        <UserInfo
          name={MOCK_USER_DATA.name}
          email={MOCK_USER_DATA.email}
          isGuest={false}
        />
      </ToastContext.Provider>
    );

    const nameInput = screen.getByLabelText("Username");
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockToastContext.success).toHaveBeenCalledWith(
        MESSAGES.USERNAME_UPDATE_SUCCESS
      );
    });
  });

  it("shows loading state while updating", async () => {
    mockMakeRequest.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
    );

    render(
      <ToastContext.Provider value={mockToastContext}>
        <UserInfo
          name={MOCK_USER_DATA.name}
          email={MOCK_USER_DATA.email}
          isGuest={false}
        />
      </ToastContext.Provider>
    );

    const nameInput = screen.getByLabelText("Username");
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    expect(saveButton).toBeDisabled();

    await waitFor(() => {
      expect(mockMakeRequest).toHaveBeenCalled();
    });
  });
});
