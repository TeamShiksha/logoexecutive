import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import OperatorDashboard from "../../../src/components/operator/OperatorDashboard";
import { ToastProvider } from "../../../src/contexts/ToastContext";
import { instance as apiInstance } from "../../../src/api/api_instance";
import { BUTTON_TEXT, MODAL_MESSAGES } from "../../../src/utils/Constants";
import { useApi } from "../../../src/hooks/useApi";

vi.mock("../../../src/hooks/useApi", () => ({
  useApi: vi.fn(),
}));

vi.mock("../../../src/api/api_instance", () => ({
  instance: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock("../../../src/components/catalog/ImageUploadModal", () => ({
  __esModule: true,
  default: ({ isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="image-upload-modal">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

const headerStyles = {
  "page-header": "page-header",
  "title-section": "title-section",
  "dashboard-title": "dashboard-title",
  "dashboard-subtitle": "dashboard-subtitle",
  "header-right": "header-right",
  dropdown: "dropdown",
  "dropdown-wrapper": "dropdown-wrapper",
  "dropdown-menu": "dropdown-menu",
  "dropdown-item": "dropdown-item",
};

const baseProps = {
  selectedDashboard: "OPERATOR",
  dashboardDropdownOptions: ["OPERATOR", "USER"],
  isDropdownOpen: false,
  setIsDropdownOpen: vi.fn(),
  handleRoleSelect: vi.fn(),
  headerStyles,
};

const messagesResponse = {
  data: {
    results: [
      {
        _id: "1",
        message: "Test message",
        email: "test@example.com",
        status: "PENDING",
      },
    ],
    totalPages: 1,
  },
};

beforeEach(() => {
  vi.resetAllMocks();
  apiInstance.get.mockResolvedValue(messagesResponse);
  useApi.mockReturnValue({
    loading: false,
    makeRequest: vi.fn(),
    fetchRequest: vi.fn(),
    errorMsg: null,
  });
});

const renderOperator = () =>
  render(
    <ToastProvider>
      <OperatorDashboard {...baseProps} />
    </ToastProvider>
  );

describe("Operator Page", () => {
  it("renders operator dashboard header and controls", async () => {
    renderOperator();

    await waitFor(() => {
      expect(screen.getByText("Operator Dashboard")).toBeInTheDocument();
    });

    expect(screen.getByText("Monitor operations and manage system resources.")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Archived")).toBeInTheDocument();
  });

  it("renders and fetches messages by default", async () => {
    renderOperator();

    await waitFor(() => {
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  it("displays PENDING label in Active tab", async () => {
    renderOperator();

    await waitFor(() => {
      expect(screen.getByText("PENDING")).toBeInTheDocument();
    });
  });

  it("switches to archived tab and fetches data", async () => {
    apiInstance.get.mockResolvedValueOnce(messagesResponse);
    apiInstance.get.mockResolvedValueOnce({
      data: {
        results: [
          {
            _id: "2",
            message: "Archived",
            status: "RESOLVED",
          },
        ],
        totalPages: 1,
      },
    });

    renderOperator();

    fireEvent.click(screen.getByText("Archived"));

    await waitFor(() => {
      expect(screen.getByText("RESOLVED")).toBeInTheDocument();
    });
  });

  it("switches search type to requests", async () => {
    apiInstance.get.mockResolvedValueOnce(messagesResponse);
    apiInstance.get.mockResolvedValueOnce({
      data: {
        results: [
          {
            _id: "3",
            companyUrl: "https://example.com",
            status: "PENDING",
          },
        ],
        totalPages: 1,
      },
    });

    renderOperator();

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "requests" },
    });

    await waitFor(() => {
      expect(screen.getByText("https://example.com")).toBeInTheDocument();
    });
  });

  it("shows empty state for messages", async () => {
    apiInstance.get.mockResolvedValueOnce({
      data: {
        results: [],
        totalPages: 0,
      },
    });

    renderOperator();

    await waitFor(() => {
      expect(
        screen.getByText("No messages found for this filter.")
      ).toBeInTheDocument();
    });
  });

  it("opens respond modal and submits response", async () => {
    apiInstance.put.mockResolvedValue({});

    renderOperator();

    await waitFor(() => {
      fireEvent.click(screen.getByText("Respond"));
    });

    const textarea = screen.getByPlaceholderText(MODAL_MESSAGES.RESPOND);
    fireEvent.change(textarea, {
      target: { value: "This is a valid response text" },
    });

    const sendButton = screen.getByText(BUTTON_TEXT.sendResponse);

    await waitFor(() => {
      expect(sendButton).not.toBeDisabled();
    });

    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(apiInstance.put).toHaveBeenCalled();
    });
  });

  it("opens reject modal and submits rejection", async () => {
    apiInstance.put.mockResolvedValue({});

    renderOperator();

    await waitFor(() => {
      fireEvent.click(screen.getByText("Reject"));
    });

    const textarea = screen.getByPlaceholderText(MODAL_MESSAGES.REJECT);
    fireEvent.change(textarea, {
      target: { value: "This is a valid rejection text" },
    });

    const rejectButton = screen.getByText(BUTTON_TEXT.confirmRejection);

    await waitFor(() => {
      expect(rejectButton).not.toBeDisabled();
    });

    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(apiInstance.put).toHaveBeenCalled();
    });
  });

  it("renders Add Image button and opens upload modal", async () => {
    renderOperator();

    fireEvent.click(screen.getByText("Add Image"));

    await waitFor(() => {
      expect(screen.getByTestId("image-upload-modal")).toBeInTheDocument();
    });
  });

  it("closes image upload modal", async () => {
    renderOperator();

    fireEvent.click(screen.getByText("Add Image"));

    const modal = await screen.findByTestId("image-upload-modal");

    fireEvent.click(within(modal).getByText("Close"));

    await waitFor(() => {
      expect(
        screen.queryByTestId("image-upload-modal")
      ).not.toBeInTheDocument();
    });
  });

  it("fetches catalog items successfully when dropdown changes to logos", async () => {
    apiInstance.get.mockImplementation((url) => {
      if (url.includes("/create-logo-request")) {
        return Promise.resolve({
          data: {
            results: [
              {
                _id: "logo-1",
                company_name: "Acme",
                company_uri: "acme",
                companyUrl: "https://acme.com",
                extension: "png",
                status: "PENDING",
              },
            ],
            totalPages: 1,
          },
        });
      }
      return Promise.resolve(messagesResponse);
    });

    renderOperator();

    fireEvent.change(screen.getByTestId("testid-dropdown"), {
      target: { value: "logos" },
    });

    await waitFor(() => {
      expect(screen.getByText("https://acme.com")).toBeInTheDocument();
    });
  });

  it("shows pagination and navigates pages", async () => {
    apiInstance.get.mockResolvedValueOnce({
      data: {
        results: new Array(6).fill(null).map((_, i) => ({
          _id: String(i),
          message: `Msg ${i}`,
          status: "PENDING",
        })),
        totalPages: 2,
      },
    });

    renderOperator();

    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("»"));

    await waitFor(() => {
      expect(apiInstance.get).toHaveBeenCalled();
    });
  });

  it("shows loading state when submitting response", async () => {
    apiInstance.put.mockImplementation(
      () => new Promise((res) => setTimeout(res, 100))
    );

    renderOperator();

    await waitFor(() => {
      fireEvent.click(screen.getByText("Respond"));
    });

    const textarea = screen.getByPlaceholderText(MODAL_MESSAGES.RESPOND);
    fireEvent.change(textarea, { target: { value: "Loading test" } });

    fireEvent.click(screen.getByText(BUTTON_TEXT.sendResponse));

    expect(screen.getByText(BUTTON_TEXT.sendResponse)).toBeDisabled();
  });
});
