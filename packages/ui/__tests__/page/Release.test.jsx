import { expect, describe, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Release from "../../src/page/release/Release";

describe("Release page", () => {
  it("renders Hero and Changelog sections", () => {
    render(<Release />);

    const heroHeading = screen.getByRole("heading", {
      level: 1,
      name: /What's new at Openlogo/i,
    });
    expect(heroHeading).toBeInTheDocument();

    const changelogHeading = screen.getByRole("heading", {
      level: 2,
      name: "Changelog",
    });
    expect(changelogHeading).toBeInTheDocument();
  });
});
