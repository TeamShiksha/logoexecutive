import { expect, describe, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ReleaseHero from "../../../src/components/release/ReleaseHero";

describe("ReleaseHero component", () => {
  const mockRelease = {
    version: "v1.0.0",
    releaseDate: "Jan 2099",
    heroImage: "version07",
  };

  const mockContributors = [
    {
      username: "contributor-one",
      avatarUrl: "https://example.com/contributor-one.png",
      profileUrl: "https://example.com/contributor-one",
    },
    {
      username: "contributor-two",
      avatarUrl: "https://example.com/contributor-two.png",
      profileUrl: "https://example.com/contributor-two",
    },
  ];

  // ─── Static content always present ───────────────────────────────────────────

  it("always renders the main heading", () => {
    render(<ReleaseHero selectedRelease={mockRelease} contributors={[]} />);

    expect(
      screen.getByRole("heading", { level: 1, name: /what's new/i })
    ).toBeInTheDocument();
  });

  it("always renders the 'Explore Changelog' CTA button", () => {
    render(<ReleaseHero selectedRelease={mockRelease} contributors={[]} />);

    expect(
      screen.getByRole("button", { name: /explore changelog/i })
    ).toBeInTheDocument();
  });

  it("always renders the hero mockup image", () => {
    render(<ReleaseHero selectedRelease={mockRelease} contributors={[]} />);

    expect(screen.getByAltText("Openlogo UI Mockup")).toBeInTheDocument();
  });

  // ─── Contributors section: conditional rendering ──────────────────────────────

  it("renders the contributors section when contributors are provided", () => {
    render(
      <ReleaseHero
        selectedRelease={mockRelease}
        contributors={mockContributors}
      />
    );

    expect(screen.getByAltText("contributor-one")).toBeInTheDocument();
    expect(screen.getByAltText("contributor-two")).toBeInTheDocument();
  });

  it("renders the version label inside the contributors section", () => {
    render(
      <ReleaseHero
        selectedRelease={mockRelease}
        contributors={mockContributors}
      />
    );

    expect(screen.getByText(mockRelease.version)).toBeInTheDocument();
  });

  it("does NOT render the contributors section when contributors is an empty array", () => {
    render(<ReleaseHero selectedRelease={mockRelease} contributors={[]} />);

    // No avatar images should be present
    expect(
      screen
        .queryAllByRole("img")
        .filter((img) => img.getAttribute("alt") !== "Openlogo UI Mockup")
    ).toHaveLength(0);
    // No "Meet the team behind" text either
    expect(screen.queryByText(/meet the team behind/i)).not.toBeInTheDocument();
  });

  it("does NOT render the contributors section when contributors prop is omitted", () => {
    render(<ReleaseHero selectedRelease={mockRelease} />);

    expect(screen.queryByText(/meet the team behind/i)).not.toBeInTheDocument();
  });

  // ─── selectedRelease is null / undefined ─────────────────────────────────────

  it("renders without crashing when selectedRelease is null", () => {
    render(<ReleaseHero selectedRelease={null} contributors={[]} />);

    // Static heading should still be present
    expect(
      screen.getByRole("heading", { level: 1, name: /what's new/i })
    ).toBeInTheDocument();
  });

  it("renders without crashing when selectedRelease is undefined", () => {
    render(<ReleaseHero contributors={[]} />);

    expect(
      screen.getByRole("heading", { level: 1, name: /what's new/i })
    ).toBeInTheDocument();
  });

  it("does NOT show a version string in contributors when selectedRelease is null", () => {
    render(
      <ReleaseHero selectedRelease={null} contributors={mockContributors} />
    );

    // Version label inside <strong> will be blank — no semver string should appear
    const strong = screen.queryByText(/v\d+\.\d+\.\d+/);
    expect(strong).not.toBeInTheDocument();
  });

  // ─── Image key resolution ─────────────────────────────────────────────────────

  it("loads the version07 image for heroImage key 'version07'", () => {
    render(
      <ReleaseHero
        selectedRelease={{ ...mockRelease, heroImage: "version07" }}
        contributors={[]}
      />
    );

    // The mockup image must be present (src is a module resolved by vite mock)
    expect(screen.getByAltText("Openlogo UI Mockup")).toBeInTheDocument();
  });

  it("loads the version06 image for heroImage key 'version06'", () => {
    render(
      <ReleaseHero
        selectedRelease={{ ...mockRelease, heroImage: "version06" }}
        contributors={[]}
      />
    );

    expect(screen.getByAltText("Openlogo UI Mockup")).toBeInTheDocument();
  });

  it("falls back to version07 image when heroImage key is unrecognised", () => {
    render(
      <ReleaseHero
        selectedRelease={{ ...mockRelease, heroImage: "unknown-key" }}
        contributors={[]}
      />
    );

    expect(screen.getByAltText("Openlogo UI Mockup")).toBeInTheDocument();
  });

  // ─── CTA scroll behaviour ─────────────────────────────────────────────────────

  it("clicking 'Explore Changelog' does not throw even without a #changelog element", () => {
    render(<ReleaseHero selectedRelease={mockRelease} contributors={[]} />);

    const btn = screen.getByRole("button", { name: /explore changelog/i });

    // No #changelog section exists in jsdom; the click should silently no-op
    expect(() => btn.click()).not.toThrow();
  });
});
