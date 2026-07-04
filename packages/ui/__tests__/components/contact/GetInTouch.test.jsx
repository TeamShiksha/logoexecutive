import { render, screen, fireEvent } from "@testing-library/react";
import { expect, it, describe } from "vitest";
import GetInTouch from "../../../src/components/contact/GetInTouch";
import { BUTTON_TEXT } from "../../../src/utils/Constants";
import { ToastProvider } from "../../../src/contexts/ToastContext";

describe("GetInTouch Component", () => {
  it("renders the GetInTouch card with title and description", () => {
    render(<GetInTouch />);
    const title = screen.getByText("Still have questions?");
    expect(title).toBeInTheDocument();
    const description = screen.getByText(
      "Can't find the answer you're looking for? Please chat to our friendly team."
    );
    expect(description).toBeInTheDocument();
  });

  it("renders the 'Get in touch' button", () => {
    render(<GetInTouch />);
    const button = screen.getByText("Get in touch");
    expect(button).toBeInTheDocument();
  });

  it("opens the ContactForm modal when 'Get in touch' button is clicked", () => {
    render(
      <ToastProvider>
        <GetInTouch />
      </ToastProvider>
    );
    const button = screen.getByText("Get in touch");
    fireEvent.click(button);
    const modal = screen.getByText("Let's discuss your integration needs.");
    expect(modal).toBeInTheDocument();
  });

  it("closes the ContactForm modal when the close button is clicked", () => {
    render(
      <ToastProvider>
        <GetInTouch />
      </ToastProvider>
    );
    const button = screen.getByText("Get in touch");
    fireEvent.click(button);
    const modal = screen.getByText("Let's discuss your integration needs.");
    expect(modal).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: BUTTON_TEXT.cross }));
    const modalClosed = screen.queryByText(
      "Let's discuss your integration needs."
    );
    expect(modalClosed).not.toBeInTheDocument();
  });
});
