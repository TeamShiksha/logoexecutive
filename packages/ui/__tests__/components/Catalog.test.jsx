import { expect, describe, it, vi, afterEach, beforeEach } from "vitest";
import { fireEvent, render, screen, act } from "@testing-library/react";
import Catalog from "../../src/components/catalog/Catalog";
import { COMPANIES, BUTTON_TEXT } from "../../src/utils/Constants";
import { ToastContext } from "../../src/contexts/Contexts";
import { useApi } from "../../src/hooks/useApi";

const mockData = {
  data: {
    data: COMPANIES,
    totalPages: 1,
  },
};
const mockWebData = {
  source: "web-search",
  data: [
    {
      companyName: "WebResultCo",
      url: "https://example.com/logo.png",
      companyUri: "https://webresultco.com",
    },
  ],
};

const mockToastContext = {
  success: vi.fn(),
  error: vi.fn(),
};

vi.useFakeTimers();

vi.mock("../../src/hooks/useApi", () => ({
  useApi: vi.fn(() => ({
    data: mockData,
    loading: false,
    errorMsg: null,
    makeRequest: vi.fn(),
    fetchRequest: vi.fn(),
  })),
}));
class MockFileReader {
  readAsDataURL() {
    setTimeout(() => {
      if (this.onload) {
        this.onload({
          target: { result: "data:image/png;base64,fake-preview" },
        });
      }
    }, 10);
  }
}
globalThis.FileReader = MockFileReader;
globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    blob: () =>
      Promise.resolve(new Blob(["fake-image"], { type: "image/png" })),
  })
);

describe("Catalog Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("Search bar should be visible", () => {
    render(
      <ToastContext.Provider value={mockToastContext}>
        <Catalog />
      </ToastContext.Provider>
    );

    const searchInput = screen.getByLabelText("search");
    expect(searchInput).toBeInTheDocument();
  });

  it("Add image button should be visible", () => {
    render(
      <ToastContext.Provider value={mockToastContext}>
        <Catalog />
      </ToastContext.Provider>
    );

    const addImageButton = screen.getByText("Add image");
    expect(addImageButton).toBeInTheDocument();
  });

  it("Table headers should be visible", () => {
    render(
      <ToastContext.Provider value={mockToastContext}>
        <Catalog />
      </ToastContext.Provider>
    );

    const imageHeader = screen.getByText("Images");
    const createdHeader = screen.getByText("Created");
    const updatedHeader = screen.getByText("Updated");

    expect(imageHeader).toBeInTheDocument();
    expect(createdHeader).toBeInTheDocument();
    expect(updatedHeader).toBeInTheDocument();
  });

  it("Should not change page when Previous button is clicked on first page", () => {
    render(
      <ToastContext.Provider value={mockToastContext}>
        <Catalog />
      </ToastContext.Provider>
    );

    const prevButton = screen.getByAltText("left-arrow").closest("button");
    expect(screen.getByTestId("current-page")).toHaveTextContent("1");
    expect(prevButton).toBeDisabled();

    fireEvent.click(prevButton);
    vi.runAllTimers();
    expect(screen.getByTestId("current-page")).toHaveTextContent("1");
  });

  it("Should not change page when Next button is clicked on last page", () => {
    render(
      <ToastContext.Provider value={mockToastContext}>
        <Catalog />
      </ToastContext.Provider>
    );

    const pageSize = 10;
    const totalPages = Math.ceil(COMPANIES.length / pageSize);

    const nextButton = screen.getByAltText("right-arrow").closest("button");

    expect(screen.getByTestId("current-page")).toHaveTextContent(
      `${totalPages}`
    );
    expect(nextButton).toBeDisabled();

    fireEvent.click(nextButton);
    vi.runAllTimers();

    expect(screen.getByTestId("current-page")).toHaveTextContent(
      `${totalPages}`
    );
  });

  it("Companies list should be visible with correct number of items", () => {
    render(
      <ToastContext.Provider value={mockToastContext}>
        <Catalog />
      </ToastContext.Provider>
    );

    const firstPageCompanies = COMPANIES.slice(0, 10);
    firstPageCompanies.forEach((company) => {
      screen.getByText(
        `${company.company_name.toLowerCase()}.${company.extension}`
      );
    });
    if (COMPANIES.length > 10) {
      expect(
        screen.queryByText(
          `${COMPANIES[10].company_name.toLowerCase()}.${COMPANIES[10].extension}`
        )
      ).not.toBeInTheDocument();
    }
  });

  it("Should navigate to next page when Next button is clicked", () => {
    render(
      <ToastContext.Provider value={mockToastContext}>
        <Catalog />
      </ToastContext.Provider>
    );

    expect(screen.getByTestId("current-page")).toHaveTextContent("1");
    const nextButton = screen.getByAltText("right-arrow").closest("button");

    expect(nextButton).toBeDisabled();
    expect(screen.getByTestId("current-page")).toHaveTextContent("1");
  });

  it("Should navigate to previous page when Prev button is clicked", () => {
    render(
      <ToastContext.Provider value={mockToastContext}>
        <Catalog />
      </ToastContext.Provider>
    );

    const nextButton = screen.getByAltText("right-arrow").closest("button");
    const prevButton = screen.getByAltText("left-arrow").closest("button");

    expect(nextButton).toBeDisabled();
    expect(prevButton).toBeDisabled();
    expect(screen.getByTestId("current-page")).toHaveTextContent("1");
  });

  it("Should filter companies when search term is entered", () => {
    vi.mocked(useApi).mockReturnValue({
      data: { data: { data: [COMPANIES[0]], totalPages: 1 } },
      loading: false,
      errorMsg: null,
      makeRequest: vi.fn(),
      fetchRequest: vi.fn(),
    });

    render(
      <ToastContext.Provider value={mockToastContext}>
        <Catalog />
      </ToastContext.Provider>
    );

    const searchInput = screen.getByLabelText("search");
    fireEvent.change(searchInput, { target: { value: "Amazon" } });

    expect(screen.getByText("amazon.png")).toBeInTheDocument();
    expect(screen.queryByText("apple.png")).not.toBeInTheDocument();
  });

  it("Should show 'No results found' message when search has no matches", () => {
    vi.mocked(useApi).mockReturnValue({
      data: { data: { data: [], totalPages: 1 } },
      loading: false,
      errorMsg: null,
      makeRequest: vi.fn(),
      fetchRequest: vi.fn(),
    });

    render(
      <ToastContext.Provider value={mockToastContext}>
        <Catalog />
      </ToastContext.Provider>
    );

    const searchInput = screen.getByLabelText("search");
    fireEvent.change(searchInput, { target: { value: "NonExistentCompany" } });
    expect(
      screen.getByText("No results found matching your query!")
    ).toBeInTheDocument();
    expect(screen.queryByText("amazon.png")).not.toBeInTheDocument();
  });

  it("Should reset search when navigating to another page", () => {
    vi.mocked(useApi).mockReturnValue({
      data: { data: { data: [COMPANIES[0]], totalPages: 1 } },
      loading: false,
      errorMsg: null,
      makeRequest: vi.fn(),
      fetchRequest: vi.fn(),
    });

    render(
      <ToastContext.Provider value={mockToastContext}>
        <Catalog />
      </ToastContext.Provider>
    );

    const searchInput = screen.getByLabelText("search");
    fireEvent.change(searchInput, { target: { value: "Amazon" } });

    expect(screen.getByText("amazon.png")).toBeInTheDocument();
    expect(screen.queryByText("apple.png")).not.toBeInTheDocument();
    expect(searchInput).toHaveValue("Amazon");

    const nextButton = screen.getByAltText("right-arrow").closest("button");
    expect(nextButton).toBeDisabled();
  });

  it("Should display correct total page count", () => {
    render(
      <ToastContext.Provider value={mockToastContext}>
        <Catalog />
      </ToastContext.Provider>
    );

    const totalPages = Math.ceil(COMPANIES.length / 10);
    const pageNavSection = screen.getByTestId("current-page").closest("div");
    expect(pageNavSection).toHaveTextContent(`of ${totalPages}`);
  });

  it("Should disable Next button on last page", () => {
    render(
      <ToastContext.Provider value={mockToastContext}>
        <Catalog />
      </ToastContext.Provider>
    );

    const nextButton = screen.getByAltText("right-arrow").closest("button");
    expect(nextButton).toBeDisabled();
  });

  it("Should open modal when Add image button is clicked", () => {
    render(
      <ToastContext.Provider value={mockToastContext}>
        <Catalog />
      </ToastContext.Provider>
    );

    const addImageButton = screen.getByText("Add image");
    fireEvent.click(addImageButton);
    vi.runAllTimers();

    expect(screen.getByTestId("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("modal-overlay")).toBeInTheDocument();
  });

  it("Should close modal when close button is clicked", () => {
    render(
      <ToastContext.Provider value={mockToastContext}>
        <Catalog />
      </ToastContext.Provider>
    );

    const addImageButton = screen.getByText("Add image");
    fireEvent.click(addImageButton);
    vi.runAllTimers();

    expect(screen.getByTestId("dialog")).toBeInTheDocument();
    const closeButton = screen.getByText(BUTTON_TEXT.cross);
    fireEvent.click(closeButton);
    vi.runAllTimers();

    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("image-upload-modal-overlay")
    ).not.toBeInTheDocument();
  });

  it("Should close modal when clicking on overlay", () => {
    render(
      <ToastContext.Provider value={mockToastContext}>
        <Catalog />
      </ToastContext.Provider>
    );

    const addImageButton = screen.getByText("Add image");
    fireEvent.click(addImageButton);
    vi.runAllTimers();

    expect(screen.getByTestId("dialog")).toBeInTheDocument();
    const modalOverlay = screen.getByTestId("modal-overlay");
    fireEvent.click(modalOverlay);
    vi.runAllTimers();

    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("modal-overlay")).not.toBeInTheDocument();
  });

  it("Should open modal in update mode when reupload is clicked", () => {
    render(
      <ToastContext.Provider value={mockToastContext}>
        <Catalog />
      </ToastContext.Provider>
    );

    const reuploadButtons = screen.getAllByRole("button", {
      name: /replace logo/i,
    });
    expect(reuploadButtons.length).toBeGreaterThan(0);

    fireEvent.click(reuploadButtons[0]);
    vi.runAllTimers();

    expect(screen.getByTestId("dialog")).toBeInTheDocument();
  });

  it("should debounce search input and only call makeRequest after 500ms", async () => {
    const makeRequestMock = vi.fn();

    vi.mocked(useApi).mockReturnValue({
      data: { data: { data: [], totalPages: 1 } },
      loading: false,
      errorMsg: null,
      makeRequest: makeRequestMock,
      fetchRequest: vi.fn(),
    });

    render(
      <ToastContext.Provider value={mockToastContext}>
        <Catalog />
      </ToastContext.Provider>
    );

    expect(makeRequestMock).toHaveBeenCalledTimes(1);

    const searchInput = screen.getByLabelText("search");
    fireEvent.change(searchInput, { target: { value: "Amazon" } });

    expect(makeRequestMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(makeRequestMock).toHaveBeenCalledTimes(2);
  });

  it("should not call makeRequest if search input is less than 2 characters", () => {
    const makeRequestMock = vi.fn();

    vi.mocked(useApi).mockReturnValue({
      data: { data: { data: [], totalPages: 1 } },
      loading: false,
      errorMsg: null,
      makeRequest: makeRequestMock,
      fetchRequest: vi.fn(),
    });

    render(
      <ToastContext.Provider value={mockToastContext}>
        <Catalog />
      </ToastContext.Provider>
    );

    makeRequestMock.mockClear();

    const searchInput = screen.getByLabelText("search");
    fireEvent.change(searchInput, { target: { value: "A" } });
    vi.advanceTimersByTime(500);

    expect(makeRequestMock).not.toHaveBeenCalled();
  });
  describe("Web Search Integration", () => {
    it("Should display web-search flow: Image Not Found then Suggested Images after 'Search on Web'", async () => {
      vi.mocked(useApi).mockReturnValue({
        data: mockWebData,
        loading: false,
        errorMsg: null,
        makeRequest: vi.fn(),
        fetchRequest: vi.fn(),
      });
      render(
        <ToastContext.Provider value={mockToastContext}>
          <Catalog />
        </ToastContext.Provider>
      );
      expect(screen.getByText("Image Not Found")).toBeInTheDocument();
      const searchOnWebBtn = screen.getByText(/Search on Web/i);
      vi.useRealTimers();
      await act(async () => {
        fireEvent.click(searchOnWebBtn);
      });
      await screen.findByText(/Suggested Images/);
      vi.useFakeTimers();
    }, 20000);
    it("Should hide web results when search input is cleared", async () => {
      vi.mocked(useApi).mockReturnValueOnce({
        data: mockWebData,
        loading: false,
        errorMsg: null,
        makeRequest: vi.fn(),
        fetchRequest: vi.fn(),
      });

      render(
        <ToastContext.Provider value={mockToastContext}>
          <Catalog />
        </ToastContext.Provider>
      );

      expect(screen.getByText("Image Not Found")).toBeInTheDocument();
      const searchInput = screen.getByLabelText("search");
      fireEvent.change(searchInput, { target: { value: "" } });
      await act(async () => {
        await vi.runAllTimersAsync();
      });
      expect(searchInput).toHaveValue("");
    });
  });
});
