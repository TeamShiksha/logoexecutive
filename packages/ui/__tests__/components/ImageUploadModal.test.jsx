import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ImageUploadModal from "../../src/components/catalog/ImageUploadModal";

const mockToast = { error: vi.fn(), success: vi.fn() };
vi.mock("../../src/hooks/useToast", () => ({
  useToast: () => mockToast,
}));
class MockFileReader {
  onload = null;

  readAsDataURL() {
    if (this.onload) {
      this.onload({ target: { result: "data:image/png;base64,TEST" } });
    }
  }
}
globalThis.FileReader = MockFileReader;

describe("ImageUploadModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns null when closed", () => {
    const { container } = render(
      <ImageUploadModal isOpen={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("shows file input when open and no initial file", () => {
    render(<ImageUploadModal isOpen={true} onClose={() => {}} />);
    const inputFile = document.querySelector('input[type="file"]');
    expect(inputFile).toBeTruthy();
    expect(inputFile).toHaveAttribute("accept", ".jpg,.jpeg,.png");
  });

  test("prefills preview and company URI when initialFile and initialCompanyUri provided", async () => {
    const file = new File(["(png)"], "logo.png", { type: "image/png" });
    render(
      <ImageUploadModal
        isOpen={true}
        onClose={() => {}}
        initialFile={file}
        initialCompanyUri="example.com"
      />
    );

    await waitFor(() => {
      expect(screen.getByAltText("Preview")).toBeInTheDocument();
    });

    const companyInput = screen.getByRole("textbox", { name: /Company URI/i });
    expect(companyInput).toHaveValue("example.com");
  });

  test("shows error toast for invalid file type", async () => {
    render(<ImageUploadModal isOpen={true} onClose={() => {}} />);

    const input = document.querySelector('input[type="file"]');
    const badFile = new File(["text"], "file.txt", { type: "text/plain" });

    fireEvent.change(input, { target: { files: [badFile] } });

    expect(mockToast.error).toHaveBeenCalled();
  });

  test("calls onUpload with file and companyUri for new upload", async () => {
    const onUpload = vi.fn();
    render(
      <ImageUploadModal isOpen={true} onClose={() => {}} onUpload={onUpload} />
    );

    const input = document.querySelector('input[type="file"]');
    const pngFile = new File(["(png)"], "logo.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [pngFile] } });

    await waitFor(() => {
      expect(screen.getByAltText("Preview")).toBeInTheDocument();
    });

    const companyInput = screen.getByRole("textbox", { name: /Company URI/i });
    fireEvent.change(companyInput, { target: { value: "mycompany.com" } });

    const uploadButton = screen.getByRole("button", { name: /upload/i });
    fireEvent.click(uploadButton);

    expect(onUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        file: expect.any(File),
        companyUri: "mycompany.com",
      })
    );
  });

  test("for update mode (isUpdate) upload works without companyUri", async () => {
    const onUpload = vi.fn();
    render(
      <ImageUploadModal
        isOpen={true}
        onClose={() => {}}
        isUpdate={true}
        onUpload={onUpload}
      />
    );

    const input = document.querySelector('input[type="file"]');
    const pngFile = new File(["(png)"], "logo.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [pngFile] } });

    await waitFor(() => {
      expect(screen.getByAltText("Preview")).toBeInTheDocument();
    });

    const uploadButton = screen.getByRole("button", { name: /replace logo/i });
    fireEvent.click(uploadButton);

    expect(onUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        file: expect.any(File),
      })
    );
  });
});
