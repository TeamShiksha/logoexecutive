import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ApiKeyForm from "../../src/components/apikeyform/ApiKeyForm";
import { ToastProvider } from "../../src/contexts/ToastContext";
import { BUTTON_TEXT } from "../../src/utils/Constants";

const mockedMakeRequest = vi.fn();
const mockApiData = {
  data: {
    api_key: "TEST_API_KEY_123456789",
  },
};

vi.mock("../../src/hooks/useApi", () => ({
  useApi: () => ({
    makeRequest: mockedMakeRequest,
    data: mockApiData,
    loading: false,
    errorMsg: null,
  }),
}));

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
};

vi.mock("../../src/hooks/useToast", () => ({
  useToast: () => mockToast,
}));

vi.stubGlobal("navigator", {
  ...navigator,
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

const defaultProps = {
  isGuest: false,
  onKeyGenerated: vi.fn(),
};

const renderApiKeyForm = (props = {}) => {
  return render(
    <ToastProvider>
      <ApiKeyForm {...defaultProps} {...props} />
    </ToastProvider>
  );
};

describe("ApiKeyForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form elements correctly", () => {
    renderApiKeyForm();

    expect(screen.getByTestId("generate-key-btn")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: BUTTON_TEXT.generateKey })
    ).toBeInTheDocument();
  });

  it("allows user to input description", () => {
    renderApiKeyForm();

    const descriptionInput = screen.getByPlaceholderText(
      "e.g., Production API Key"
    );
    fireEvent.change(descriptionInput, { target: { value: "Test API Key" } });

    expect(descriptionInput.value).toBe("Test API Key");
  });

  it("disables generate button when user is guest", () => {
    renderApiKeyForm({ isGuest: true });

    const generateButton = screen.getByRole("button", {
      name: BUTTON_TEXT.generateKey,
    });
    expect(generateButton).toBeDisabled();
  });

  it("enables generate button when user is not guest and has description", () => {
    renderApiKeyForm({ isGuest: false });

    const descriptionInput = screen.getByPlaceholderText(
      "e.g., Production API Key"
    );
    fireEvent.change(descriptionInput, {
      target: { value: "Test Description" },
    });

    const generateButton = screen.getByRole("button", {
      name: BUTTON_TEXT.generateKey,
    });
    expect(generateButton).not.toBeDisabled();
  });

  it("disables generate button when description is empty", () => {
    renderApiKeyForm({ isGuest: false });

    const generateButton = screen.getByRole("button", {
      name: BUTTON_TEXT.generateKey,
    });
    expect(generateButton).toBeDisabled();
  });

  it("submits form with description when generate key is clicked", async () => {
    mockedMakeRequest.mockResolvedValue(true);
    renderApiKeyForm();

    const descriptionInput = screen.getByPlaceholderText(
      "e.g., Production API Key"
    );
    const generateButton = screen.getByRole("button", {
      name: BUTTON_TEXT.generateKey,
    });

    fireEvent.change(descriptionInput, {
      target: { value: "Production API Key" },
    });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockedMakeRequest).toHaveBeenCalled();
    });
  });

  it("shows success toast when API key is generated successfully", async () => {
    mockedMakeRequest.mockResolvedValue(true);
    renderApiKeyForm();

    const descriptionInput = screen.getByPlaceholderText(
      "e.g., Production API Key"
    );
    const generateButton = screen.getByRole("button", {
      name: BUTTON_TEXT.generateKey,
    });

    fireEvent.change(descriptionInput, { target: { value: "Test Key" } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        "API key generated successfully"
      );
    });
  });

  it("clears description input after successful key generation", async () => {
    mockedMakeRequest.mockResolvedValue(true);
    renderApiKeyForm();

    const descriptionInput = screen.getByPlaceholderText(
      "e.g., Production API Key"
    );
    const generateButton = screen.getByRole("button", {
      name: BUTTON_TEXT.generateKey,
    });

    fireEvent.change(descriptionInput, { target: { value: "Test Key" } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(descriptionInput.value).toBe("");
    });
  });

  it("shows modal with API key after successful generation", async () => {
    mockedMakeRequest.mockResolvedValue(true);
    renderApiKeyForm();

    const descriptionInput = screen.getByPlaceholderText(
      "e.g., Production API Key"
    );
    const generateButton = screen.getByRole("button", {
      name: BUTTON_TEXT.generateKey,
    });

    fireEvent.change(descriptionInput, { target: { value: "Test Key" } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText("Your API Key")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Please copy your API key now. You won't be able to see it again!"
        )
      ).toBeInTheDocument();
      expect(screen.getByText("TEST_API_KEY_123456789")).toBeInTheDocument();
    });
  });

  it("copies API key to clipboard when copy button is clicked", async () => {
    mockedMakeRequest.mockResolvedValue(true);
    renderApiKeyForm();

    const descriptionInput = screen.getByPlaceholderText(
      "e.g., Production API Key"
    );
    const generateButton = screen.getByRole("button", {
      name: BUTTON_TEXT.generateKey,
    });

    fireEvent.change(descriptionInput, { target: { value: "Test Key" } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      const copyButton = screen.getByAltText("Copy API key");
      fireEvent.click(copyButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "TEST_API_KEY_123456789"
      );
    });
  });

  it("calls onKeyGenerated when modal is closed", async () => {
    mockedMakeRequest.mockResolvedValue(true);
    const onKeyGeneratedMock = vi.fn();
    renderApiKeyForm({ onKeyGenerated: onKeyGeneratedMock });

    const descriptionInput = screen.getByPlaceholderText(
      "e.g., Production API Key"
    );
    const generateButton = screen.getByRole("button", {
      name: BUTTON_TEXT.generateKey,
    });

    fireEvent.change(descriptionInput, { target: { value: "Test Key" } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText("Your API Key")).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(onKeyGeneratedMock).toHaveBeenCalled();
    });
  });

  it("handles API key generation failure", async () => {
    mockedMakeRequest.mockResolvedValue(false);
    renderApiKeyForm();

    const descriptionInput = screen.getByPlaceholderText(
      "e.g., Production API Key"
    );
    const generateButton = screen.getByRole("button", {
      name: BUTTON_TEXT.generateKey,
    });

    fireEvent.change(descriptionInput, { target: { value: "Test Key" } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockedMakeRequest).toHaveBeenCalled();
      expect(screen.queryByText("Your API Key")).not.toBeInTheDocument();
    });
  });

  it("shows loading state when generating key", async () => {
    vi.mocked(vi.importActual("../../src/hooks/useApi")).useApi = () => ({
      makeRequest: mockedMakeRequest,
      data: mockApiData,
      loading: true,
      errorMsg: null,
    });

    renderApiKeyForm();

    const generateButton = screen.getByRole("button", { name: /Generate Key/ });
    expect(generateButton).toBeInTheDocument();
  });

  it("renders Publishable Key form titles and Allowed Origins input", () => {
    renderApiKeyForm({ keyType: "PUBLISHABLE" });

    expect(
      screen.getByRole("heading", { name: "Generate Publishable Key" })
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("e.g., Web App Publishable Key")
    ).toBeInTheDocument();
    expect(screen.getByText("Allowed Origins")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        "e.g., https://example.com or http://localhost:8080"
      )
    ).toBeInTheDocument();
  });

  it("disables generate button when publishable key description is provided but origin is empty", () => {
    renderApiKeyForm({ keyType: "PUBLISHABLE" });

    const descriptionInput = screen.getByPlaceholderText(
      "e.g., Web App Publishable Key"
    );
    fireEvent.change(descriptionInput, { target: { value: "My Client App" } });

    const generateBtn = screen.getByRole("button", {
      name: "Generate Publishable Key",
    });
    expect(generateBtn).toBeDisabled();
  });

  it("validates origin format when origin is entered in tag input", () => {
    renderApiKeyForm({ keyType: "PUBLISHABLE" });

    const descriptionInput = screen.getByPlaceholderText(
      "e.g., Web App Publishable Key"
    );
    fireEvent.change(descriptionInput, { target: { value: "My Client App" } });

    const generateBtn = screen.getByRole("button", {
      name: "Generate Publishable Key",
    });

    const originInput = screen.getByPlaceholderText(
      "e.g., https://example.com or http://localhost:8080"
    );
    fireEvent.change(originInput, { target: { value: "invalid-domain" } });

    expect(generateBtn).toBeDisabled();

    fireEvent.change(originInput, { target: { value: "https://example.com" } });
    expect(generateBtn).not.toBeDisabled();
  });

  it("allows adding origin tags via Enter key and removing origin pills via cross button", () => {
    renderApiKeyForm({ keyType: "PUBLISHABLE" });

    const originInput = screen.getByPlaceholderText(
      "e.g., https://example.com or http://localhost:8080"
    );
    fireEvent.change(originInput, { target: { value: "https://example.com" } });
    fireEvent.keyDown(originInput, { key: "Enter", code: "Enter" });

    expect(screen.getByText("https://example.com")).toBeInTheDocument();

    const removeBtn = screen.getByRole("button", {
      name: "Remove origin https://example.com",
    });
    fireEvent.click(removeBtn);

    expect(screen.queryByText("https://example.com")).not.toBeInTheDocument();
  });

  it("allows inline editing an origin pill tag when clicked", () => {
    renderApiKeyForm({ keyType: "PUBLISHABLE" });

    const originInput = screen.getByPlaceholderText(
      "e.g., https://example.com or http://localhost:8080"
    );
    fireEvent.change(originInput, { target: { value: "https://example.com" } });
    fireEvent.keyDown(originInput, { key: "Enter", code: "Enter" });

    const pillText = screen.getByText("https://example.com");
    fireEvent.click(pillText);

    const editInput = screen.getByDisplayValue("https://example.com");
    fireEvent.change(editInput, { target: { value: "https://updated.com" } });
    fireEvent.keyDown(editInput, { key: "Enter", code: "Enter" });

    expect(screen.getByText("https://updated.com")).toBeInTheDocument();
    expect(screen.queryByText("https://example.com")).not.toBeInTheDocument();
  });

  it("allows adding origin tags via Tab key without shifting focus away", () => {
    renderApiKeyForm({ keyType: "PUBLISHABLE" });

    const originInput = screen.getByPlaceholderText(
      "e.g., https://example.com or http://localhost:8080"
    );
    fireEvent.change(originInput, {
      target: { value: "https://tabexample.com" },
    });
    fireEvent.keyDown(originInput, { key: "Tab", code: "Tab" });

    expect(screen.getByText("https://tabexample.com")).toBeInTheDocument();
  });

  it("shows error when attempting to add a duplicate origin", () => {
    renderApiKeyForm({ keyType: "PUBLISHABLE" });

    const originInput = screen.getByPlaceholderText(
      "e.g., https://example.com or http://localhost:8080"
    );
    fireEvent.change(originInput, { target: { value: "https://example.com" } });
    fireEvent.keyDown(originInput, { key: "Enter", code: "Enter" });

    fireEvent.change(originInput, { target: { value: "https://example.com" } });
    fireEvent.keyDown(originInput, { key: "Enter", code: "Enter" });

    expect(screen.getAllByText("https://example.com")).toHaveLength(1);
    expect(mockToast.error).toHaveBeenCalledWith(
      "Duplicate origins are not allowed"
    );
  });
});
