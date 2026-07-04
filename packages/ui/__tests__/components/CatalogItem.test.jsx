import { expect, describe, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CatalogItem from "../../src/components/catalog/CatalogItem";
import { COMPANIES } from "../../src/utils/Constants";
import { formatDate } from "../../src/utils/Helpers";

describe("CatalogItem Component", () => {
  const mockCompany = COMPANIES[0];
  const mockOnUpdate = vi.fn();

  it("Should render company image name correctly", () => {
    render(<CatalogItem company={mockCompany} onUpdate={mockOnUpdate} />);

    const expectedText = `${mockCompany.company_name.toLowerCase()}.${mockCompany.extension}`;
    const companyImageElement = screen.getByText(expectedText);
    expect(companyImageElement).toBeInTheDocument();
  });

  it("Should render creation date correctly", () => {
    render(<CatalogItem company={mockCompany} onUpdate={mockOnUpdate} />);

    const expectedFormattedDate = formatDate(mockCompany.created_at);
    const createdDateElement = screen.getByText(expectedFormattedDate);
    expect(createdDateElement).toBeInTheDocument();
  });

  it("Should render update date correctly", () => {
    render(<CatalogItem company={mockCompany} onUpdate={mockOnUpdate} />);

    const expectedFormattedDate = formatDate(mockCompany.updated_at);
    const updatedDateElement = screen.getByText(expectedFormattedDate);
    expect(updatedDateElement).toBeInTheDocument();
  });

  it("Should render reupload button", () => {
    render(<CatalogItem company={mockCompany} onUpdate={mockOnUpdate} />);

    const reuploadButton = screen.getByText("Reupload");
    expect(reuploadButton).toBeInTheDocument();
  });

  it("Should pass correct props to Button component", () => {
    render(<CatalogItem company={mockCompany} onUpdate={mockOnUpdate} />);

    const button = screen.getByText("Reupload");
    expect(button).toHaveAttribute(
      "class",
      expect.stringContaining("reupload-btn")
    );
  });

  it("Should render <img> tag when imageUrl is provided", () => {
    const companyWithUrl = {
      ...mockCompany,
      imageUrl: "https://cdn.cloudfront.net/signed/path.png",
    };
    render(<CatalogItem company={companyWithUrl} onUpdate={mockOnUpdate} />);

    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", companyWithUrl.imageUrl);
    expect(img).toHaveAttribute("alt", companyWithUrl.company_name);
  });

  it("Should show fallback letter when no imageUrl is provided", () => {
    render(<CatalogItem company={mockCompany} onUpdate={mockOnUpdate} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(
      screen.getByText(mockCompany.company_name.charAt(0).toUpperCase())
    ).toBeInTheDocument();
  });

  it("Should switch to fallback when <img> encounters error", () => {
    const companyWithUrl = {
      ...mockCompany,
      imageUrl: "https://anything-doesnt-matter.png",
    };
    render(<CatalogItem company={companyWithUrl} onUpdate={mockOnUpdate} />);

    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();

    fireEvent.error(img);

    expect(
      screen.getByText(companyWithUrl.company_name.charAt(0).toUpperCase())
    ).toBeInTheDocument();
  });
});
