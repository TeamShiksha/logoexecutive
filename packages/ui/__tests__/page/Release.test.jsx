import { expect, describe, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Release from "../../src/page/release/Release";
import { RELEASE_DATA } from "../../src/utils/Constants";

describe("Release page", () => {
  // ─── Smoke test ───────────────────────────────────────────────────────────

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

  // ─── Defaults to first release ────────────────────────────────────────────

  it("defaults to displaying the first release version on load", () => {
    render(<Release />);

    // The first release's date should appear in the dropdown trigger
    const firstReleaseDate = RELEASE_DATA[0].releaseDate;
    expect(
      screen.getByRole("button", { name: new RegExp(firstReleaseDate, "i") })
    ).toBeInTheDocument();
  });

  // ─── Contributors deduplication ───────────────────────────────────────────

  it("does not crash and renders at least one contributor avatar when entries have contributors", () => {
    render(<Release />);

    // At least some contributor avatars should be present on the page
    // (from either ReleaseHero or the VersionCards in ChangeLog).
    const allAvatars = screen.queryAllByRole("img");
    // More than just the hero mockup image should be present
    expect(allAvatars.length).toBeGreaterThan(1);
  });

  // ─── Renders without crashing ─────────────────────────────────────────────

  it("renders the full page without crashing", () => {
    const { container } = render(<Release />);
    expect(container.firstChild).not.toBeNull();
  });
});
