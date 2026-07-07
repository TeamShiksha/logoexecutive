import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ToastProvider } from "../../../src/contexts/ToastContext";
import { useApi } from "../../../src/hooks/useApi";
import axios from "axios";
import LogoUploadForm from "../../../src/components/logo/LogoUploadForm";

vi.mock("axios", () => ({
  default: {
    put: vi.fn(),
  },
  put: vi.fn(),
}));
const mockedAxios = vi.mocked(axios, true);

vi.mock("../../../src/hooks/useApi", () => ({
  useApi: vi.fn(),
}));

describe("LogoUploadForm", () => {
  const mockCloseModal = vi.fn();
  const mockGetCanvasDataUrl = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useApi.mockReturnValue({
      fetchRequest: vi.fn(),
      makeRequest: vi.fn(),
      loading: false,
      errorMsg: null,
    });
  });

  it("renders the form correctly", () => {
    render(
      <ToastProvider>
        <LogoUploadForm
          closeModal={mockCloseModal}
          getCanvasDataUrl={mockGetCanvasDataUrl}
        />
      </ToastProvider>
    );
    expect(
      screen.getByRole("heading", { name: "Create New Logo" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Company Url")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create New Logo" })
    ).toBeInTheDocument();
  });

  it("validates companyUrl and enables the button", async () => {
    render(
      <ToastProvider>
        <LogoUploadForm
          closeModal={mockCloseModal}
          getCanvasDataUrl={mockGetCanvasDataUrl}
        />
      </ToastProvider>
    );
    const input = screen.getByLabelText("Company Url");
    const button = screen.getByRole("button", { name: "Create New Logo" });

    expect(button).toBeDisabled();

    fireEvent.change(input, { target: { value: "https://example.com" } });

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it("shows error for invalid URL", async () => {
    render(
      <ToastProvider>
        <LogoUploadForm
          closeModal={mockCloseModal}
          getCanvasDataUrl={mockGetCanvasDataUrl}
        />
      </ToastProvider>
    );
    const input = screen.getByLabelText("Company Url");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "invalid-url" } });

    await waitFor(() => {
      expect(screen.getByText("This is not a valid url")).toBeInTheDocument();
    });
  });

  it("handles the upload process correctly", async () => {
    const fetchRequest = vi.fn().mockResolvedValue({
      success: true,
      data: { data: { presignedUrl: "https://upload.com", key: "test-key" } },
    });
    const makeRequest = vi.fn().mockResolvedValue(true);
    useApi.mockImplementation(({ url }) => {
      if (url === "create-logo-request/signed-url") {
        return { fetchRequest, loading: false, errorMsg: null };
      }
      if (url === "create-logo-request/logo") {
        return {
          makeRequest,
          loading: false,
          errorMsg: null,
        };
      }
      return { loading: false };
    });

    mockGetCanvasDataUrl.mockReturnValue("data:image/png;base64,test");
    mockedAxios.put.mockResolvedValue({ status: 200 });

    // Mock fetch for dataURL to blob conversion
    global.fetch = vi.fn().mockResolvedValue({
      blob: () => Promise.resolve(new Blob(["test"], { type: "image/png" })),
    });

    render(
      <ToastProvider>
        <LogoUploadForm
          closeModal={mockCloseModal}
          getCanvasDataUrl={mockGetCanvasDataUrl}
        />
      </ToastProvider>
    );

    const input = screen.getByLabelText("Company Url");
    fireEvent.change(input, { target: { value: "https://example.com" } });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Create New Logo" })
      ).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Create New Logo" }));

    await waitFor(() => {
      expect(fetchRequest).toHaveBeenCalled();
      expect(mockedAxios.put).toHaveBeenCalledWith(
        "https://upload.com",
        expect.any(File),
        expect.anything()
      );
      expect(makeRequest).toHaveBeenCalled();
      expect(mockCloseModal).toHaveBeenCalled();
    });
  });
});
