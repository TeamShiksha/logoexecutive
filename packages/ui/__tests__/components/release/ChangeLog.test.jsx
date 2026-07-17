import { expect, describe, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ChangeLog from "../../../src/components/release/ChangeLog";
import { RELEASE_DATA } from "../../../src/utils/Constants";

describe("ChangeLog component", () => {
  const defaultProps = {
    releaseData: RELEASE_DATA,
    selectedVersion: RELEASE_DATA[0].version,
    setSelectedVersion: vi.fn(),
    selectedRelease: RELEASE_DATA[0],
  };

  it("renders header and selected version date", () => {
    render(<ChangeLog {...defaultProps} />);

    expect(
      screen.getByRole("heading", { name: /changelog/i })
    ).toBeInTheDocument();

    const selectedReleaseDate = defaultProps.selectedRelease.releaseDate;

    const toggleBtn = screen.getByRole("button", {
      name: selectedReleaseDate,
    });

    expect(toggleBtn).toBeInTheDocument();
  });

  it("opens dropdown and lets user select another version", () => {
    const mockSetSelectedVersion = vi.fn();

    render(
      <ChangeLog
        {...defaultProps}
        setSelectedVersion={mockSetSelectedVersion}
      />
    );

    const selectedReleaseDate = defaultProps.selectedRelease.releaseDate;

    const toggleBtn = screen.getByRole("button", {
      name: selectedReleaseDate,
    });

    fireEvent.click(toggleBtn);

    const anotherRelease = RELEASE_DATA[1];

    const optionBtn = screen.getByRole("button", {
      name: new RegExp(anotherRelease.version, "i"),
    });

    fireEvent.click(optionBtn);

    expect(mockSetSelectedVersion).toHaveBeenCalledWith(anotherRelease.version);
  });
});
