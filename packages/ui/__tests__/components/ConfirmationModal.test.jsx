import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ConfirmationModal from "../../src/components/confirm/ConfirmationModal";
import { CONFIRMATION_MODAL } from "../../src/utils/Constants";

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  children: "",
  isConfirmDisabled: false,
  isConfirmLoading: false,
  confirmButtonContent: "Delete",
  customHeading: "Confirm Deletion",
  customDescription: "Are you sure you want to delete this?",
};

describe("ConfirmationModal Component", () => {
  it("renders the API-key layout only when the API-key variant is selected", () => {
    render(<ConfirmationModal {...defaultProps} variant="api-key" />);

    expect(
      screen.getByTestId("api-key-confirmation-layout")
    ).toBeInTheDocument();
  });

  it("renders heading, description and buttons", () => {
    render(<ConfirmationModal {...defaultProps} />);

    const heading = screen.getByText(defaultProps.customHeading);
    expect(heading).toBeInTheDocument();
    expect(heading).toBeVisible();
    const description = screen.getByText(defaultProps.customDescription);
    expect(description).toBeInTheDocument();
    const cancelBtn = screen.getByText(CONFIRMATION_MODAL.secondaryButtonText);
    expect(cancelBtn).toBeInTheDocument();
    const confirmBtn = screen.getByText(defaultProps.confirmButtonContent);
    expect(confirmBtn).toBeInTheDocument();
  });

  it("renders default heading, description and buttons if optional props not passed", () => {
    render(
      <ConfirmationModal
        isOpen={defaultProps.isOpen}
        onClose={defaultProps.onClose}
        onConfirm={defaultProps.onConfirm}
      />
    );

    const heading = screen.getByText(CONFIRMATION_MODAL.heading);
    expect(heading).toBeInTheDocument();
    expect(heading).toBeVisible();
    const description = screen.getByText(CONFIRMATION_MODAL.description);
    expect(description).toBeInTheDocument();
    const cancelBtn = screen.getByText(CONFIRMATION_MODAL.secondaryButtonText);
    expect(cancelBtn).toBeInTheDocument();
    const confirmBtn = screen.getByText(CONFIRMATION_MODAL.primaryButtonText);
    expect(confirmBtn).toBeInTheDocument();
  });

  it("when cancel button is clicked, onClose function should be triggered", () => {
    render(<ConfirmationModal {...defaultProps} />);
    const cancelBtn = screen.getByText(CONFIRMATION_MODAL.secondaryButtonText);
    fireEvent.click(cancelBtn);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("when primary button is clicked, onConfirm function should be triggered", () => {
    render(<ConfirmationModal {...defaultProps} />);
    const confirmBtn = screen.getByText(defaultProps.confirmButtonContent);
    fireEvent.click(confirmBtn);
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it("when isConfirmDisabled is true, confirm button should be disabled", () => {
    render(<ConfirmationModal {...defaultProps} isConfirmDisabled />);
    const confirmBtn = screen.getByText("Delete");
    expect(confirmBtn).toBeDisabled();
  });

  it("when isConfirmLoading is true, confirm button should be disabled", () => {
    render(<ConfirmationModal {...defaultProps} isConfirmLoading />);
    const confirmBtn = screen.getByRole("button", { name: "" });
    expect(confirmBtn).toBeDisabled();
    const confirmText = screen.queryByText("Delete");
    expect(confirmText).not.toBeInTheDocument();
  });
});
