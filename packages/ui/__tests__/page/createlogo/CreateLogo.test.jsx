import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateLogo from "../../../src/page/createlogo/CreateLogo";
import { UserContext, AuthContext } from "../../../src/contexts/Contexts";

// Mock fabric
vi.mock("fabric", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Canvas: vi.fn().mockImplementation(() => ({
      setDimensions: vi.fn(),
      renderAll: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      dispose: vi.fn(),
      clear: vi.fn(),
      toJSON: vi.fn().mockReturnValue({ objects: [] }),
      loadFromJSON: vi.fn(),
      add: vi.fn(),
      remove: vi.fn(),
      getWidth: vi.fn().mockReturnValue(600),
      getHeight: vi.fn().mockReturnValue(400),
      getActiveObject: vi.fn().mockReturnValue(null),
      getActiveObjects: vi.fn().mockReturnValue([]),
      setActiveObject: vi.fn(),
      discardActiveObject: vi.fn(),
      requestRenderAll: vi.fn(),
      bringObjectToFront: vi.fn(),
      sendObjectToBack: vi.fn(),
      isDrawingMode: false,
      freeDrawingBrush: {
        color: "#000000",
        width: 5,
      },
    })),
    Textbox: vi.fn(),
    Rect: vi.fn(),
    Circle: vi.fn(),
    Triangle: vi.fn(),
    Line: vi.fn(),
    Image: {
      fromURL: vi.fn().mockResolvedValue({
        scaleToWidth: vi.fn(),
        set: vi.fn(),
      }),
    },
    PencilBrush: vi.fn(),
  };
});

// Mock LogoUploadForm
vi.mock("../../../src/components/logo/LogoUploadForm", () => ({
  default: ({ closeModal }) => (
    <div data-testid="logo-upload-form">
      <button onClick={closeModal}>Close Modal</button>
    </div>
  ),
}));

// Mock useToast hook
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

vi.mock("../../../src/hooks/useToast", () => ({
  useToast: () => mockToast,
}));

const mockOpenAuthModal = vi.fn();

// Mock useCanvasControls
vi.mock("../../../src/components/logo/useCanvasControls", () => ({
  useCanvasControls: () => {
    const mockFabricCanvas = {
      isDrawingMode: false,
      renderAll: vi.fn(),
      getActiveObject: vi.fn().mockReturnValue(null),
      getActiveObjects: vi.fn().mockReturnValue([]),
      setActiveObject: vi.fn(),
      discardActiveObject: vi.fn(),
      requestRenderAll: vi.fn(),
      bringObjectToFront: vi.fn(),
      sendObjectToBack: vi.fn(),
      add: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
      toJSON: vi.fn().mockReturnValue({}),
      loadFromJSON: vi.fn(),
      setDimensions: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      dispose: vi.fn(),
      getWidth: vi.fn().mockReturnValue(600),
      getHeight: vi.fn().mockReturnValue(400),
    };

    return {
      canvasRef: { current: null },
      fabricCanvasRef: { current: mockFabricCanvas },
      initializeCanvas: vi.fn().mockReturnValue(mockFabricCanvas),
      disposeCanvas: vi.fn(),
      saveHistory: vi.fn(),
      getActiveObject: vi.fn().mockReturnValue(null),
      getActiveText: vi.fn().mockReturnValue(null),
      addText: vi.fn(),
      addShape: vi.fn(),
      setupDrawing: vi.fn(),
      duplicateSelected: vi.fn(),
      deleteSelected: vi.fn(),
      bringToFront: vi.fn(),
      sendToBack: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      resetCanvas: vi.fn(),
    };
  },
}));

// Mock useFileOperations
vi.mock("../../../src/components/logo/useFileOperations", () => ({
  useFileOperations: () => ({
    handleImageUpload: vi.fn(),
    handleExport: vi.fn(),
    getCanvasDataUrl: vi.fn().mockReturnValue("data:image/png;base64,"),
  }),
}));

const renderCreateLogo = (role = "USER") =>
  render(
    <AuthContext.Provider value={{ isAuthenticated: role !== "GUEST" }}>
      {" "}
      {/* 👈 */}
      <UserContext.Provider value={{ userData: { role } }}>
        <CreateLogo openAuthModal={mockOpenAuthModal} />
      </UserContext.Provider>
    </AuthContext.Provider>
  );

describe("CreateLogo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === "(min-width: 1025px)",
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("renders main toolbar actions", () => {
    renderCreateLogo();

    expect(screen.getByTitle("Toggle sidebar")).toBeInTheDocument();
    expect(screen.getByTitle("Duplicate (Ctrl+D)")).toBeInTheDocument();
    expect(screen.getByTitle("Delete (Del)")).toBeInTheDocument();
    expect(screen.getByTitle("Undo")).toBeInTheDocument();
    expect(screen.getByTitle("Redo")).toBeInTheDocument();
    expect(screen.getByText("RESET")).toBeInTheDocument();
    expect(screen.getByText("EXPORT")).toBeInTheDocument();
  });

  it("renders text controls", () => {
    renderCreateLogo();

    const textRailBtn = screen.getByTitle("Text");
    expect(textRailBtn).toBeInTheDocument();

    // Open panel
    fireEvent.click(textRailBtn);

    expect(screen.getByText(/Add Text/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Italic" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Underline" })
    ).toBeInTheDocument();
  });

  it("changes font family", async () => {
    renderCreateLogo();
    fireEvent.click(screen.getByTitle("Text"));

    const fontSelect = screen.getByDisplayValue("Arial");
    fireEvent.change(fontSelect, { target: { value: "Georgia" } });

    await waitFor(() => {
      expect(fontSelect).toHaveValue("Georgia");
    });
  });

  it("changes font size", async () => {
    renderCreateLogo();
    fireEvent.click(screen.getByTitle("Text"));

    const sizeSelect = screen.getByDisplayValue("32px");
    fireEvent.change(sizeSelect, { target: { value: "48" } });

    await waitFor(() => {
      expect(sizeSelect).toHaveValue("48");
    });
  });

  it("toggles bold, italic, underline buttons", () => {
    renderCreateLogo();
    fireEvent.click(screen.getByTitle("Text"));

    const bold = screen.getByRole("button", { name: "Bold" });
    const italic = screen.getByRole("button", { name: "Italic" });
    const underline = screen.getByRole("button", { name: "Underline" });

    fireEvent.click(bold);
    expect(bold.className).not.toBe("");

    fireEvent.click(italic);
    expect(italic.className).not.toBe("");

    fireEvent.click(underline);
    expect(underline.className).not.toBe("");
  });

  it("renders shape buttons", () => {
    renderCreateLogo();
    fireEvent.click(screen.getByTitle("Shapes"));

    expect(screen.getByTitle("Rect")).toBeInTheDocument();
    expect(screen.getByTitle("Circle")).toBeInTheDocument();
    expect(screen.getByTitle("Tri")).toBeInTheDocument();
    expect(screen.getByTitle("Line")).toBeInTheDocument();
  });

  it("toggles fill and outline", () => {
    renderCreateLogo();
    fireEvent.click(screen.getByTitle("Shapes"));

    const fillBtn = screen.getByRole("button", { name: "Fill" });
    const outlineBtn = screen.getByRole("button", { name: "Outline" });

    expect(fillBtn.className).not.toBe("");
    fireEvent.click(outlineBtn);
    expect(outlineBtn.className).not.toBe("");
  });

  it("enables drawing mode and updates brush size", () => {
    renderCreateLogo();
    fireEvent.click(screen.getByTitle("Draw"));

    const penTool = screen.getByText(/Enable Pen/i);
    fireEvent.click(penTool);

    expect(penTool.className).not.toBe("");

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "12" } });
    expect(slider).toHaveValue("12");
  });

  it("shows hidden image input and triggers it on upload click", () => {
    renderCreateLogo();

    const uploadBtn = screen.getByTitle("Import Image");

    const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click");

    fireEvent.click(uploadBtn);

    expect(clickSpy).toHaveBeenCalled();
  });

  it("prevents export for guest users", () => {
    renderCreateLogo("GUEST");

    const exportButton = screen.getByText("EXPORT");

    // The button should be disabled for guest users
    expect(exportButton).toBeDisabled();
  });

  it("prevents upload for guest users", () => {
    renderCreateLogo("GUEST");

    const uploadButton = screen.getByText("Upload");

    expect(uploadButton).toBeDisabled();
  });

  it("allows export for authenticated users", () => {
    renderCreateLogo("USER");

    const exportButton = screen.getByText("EXPORT");

    // The button should NOT be disabled for authenticated users
    expect(exportButton).not.toBeDisabled();
  });

  it("allows upload for authenticated users", () => {
    renderCreateLogo("USER");

    const uploadButton = screen.getByText("Upload");

    // The button should NOT be disabled for authenticated users
    expect(uploadButton).not.toBeDisabled();
  });

  it("changes export type", () => {
    renderCreateLogo();

    const select = screen.getByDisplayValue("PNG");
    fireEvent.change(select, { target: { value: "svg" } });

    expect(select).toHaveValue("svg");
  });

  it("clears canvas when reset is confirmed", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderCreateLogo();

    fireEvent.click(screen.getByText("RESET"));
    expect(mockToast.success).toHaveBeenCalledWith("Canvas cleared");
  });

  it("opens and closes LogoUploadForm modal when Upload button is clicked", async () => {
    renderCreateLogo();

    const uploadBtn = screen.getByRole("button", { name: "Upload" });
    fireEvent.click(uploadBtn);

    const modal = screen.getByTestId("logo-upload-form");
    expect(modal).toBeInTheDocument();

    const closeBtn = screen.getByText("Close Modal");
    fireEvent.click(closeBtn);

    expect(screen.queryByTestId("logo-upload-form")).not.toBeInTheDocument();
  });

  it("renders color picker", () => {
    renderCreateLogo();

    const colorPicker = screen.getByTitle("Color");
    expect(colorPicker).toBeInTheDocument();
    expect(colorPicker).toHaveAttribute("type", "color");
  });
});
