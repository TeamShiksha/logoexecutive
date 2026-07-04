import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import NotFound from "../../src/page/notfound/NotFound";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { NOT_FOUND_PAGE } from "../../src/utils/Constants";

describe("NotFound component", () => {
  it("renders all expected text content", () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByText(NOT_FOUND_PAGE.TITLE)).toBeInTheDocument();
    expect(screen.getByText(NOT_FOUND_PAGE.MESSAGE)).toBeInTheDocument();
    expect(screen.getByText("Go back home")).toBeInTheDocument();
  });

  it("link element exists pointing to home", () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    const link = screen.getByRole("link", { name: /go back home/i });
    expect(link).toHaveAttribute("href", "/");
  });

  it("navigates to Home page on link click", () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    const link = screen.getByRole("link", { name: /go back home/i });
    fireEvent.click(link);
    expect(window.location.pathname).toBe("/");
  });
});
