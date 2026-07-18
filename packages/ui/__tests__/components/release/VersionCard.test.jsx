import { expect, describe, it } from "vitest";
import { render, screen } from "@testing-library/react";
import VersionCard from "../../../src/components/release/VersionCard";

describe("VersionCard component", () => {
  // ─── Null guard ──────────────────────────────────────────────────────────────

  it("renders nothing when entry is null", () => {
    const { container } = render(<VersionCard entry={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when entry is undefined", () => {
    const { container } = render(<VersionCard entry={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  // ─── Full data (happy path) ───────────────────────────────────────────────────

  it("renders category badge, PR number, title, and description with full data", () => {
    const entry = {
      category: "Feature",
      prNumber: 101,
      title: "Sample Feature Title",
      description: "A short description of the feature.",
      contributor: {
        username: "test-user",
        avatarUrl: "https://example.com/test-user.png",
        profileUrl: "https://example.com/test-user",
      },
    };

    render(<VersionCard entry={entry} />);

    expect(screen.getByText("FEATURE")).toBeInTheDocument();
    expect(screen.getByText("#101")).toBeInTheDocument();
    expect(screen.getByText("Sample Feature Title")).toBeInTheDocument();
    expect(
      screen.getByText("A short description of the feature.")
    ).toBeInTheDocument();
    expect(screen.getByAltText("test-user")).toBeInTheDocument();
  });

  // ─── Missing prNumber ─────────────────────────────────────────────────────────

  it("does not render PR badge when prNumber is missing", () => {
    const entry = {
      category: "Bug Fix",
      title: "Sample Bug Fix Title",
      description: "A short description of the fix.",
    };

    render(<VersionCard entry={entry} />);

    expect(screen.queryByText(/^#/)).not.toBeInTheDocument();
    expect(screen.getByText("Sample Bug Fix Title")).toBeInTheDocument();
  });

  // ─── Missing title ────────────────────────────────────────────────────────────

  it("does not render title heading when title is missing", () => {
    const entry = {
      category: "Security",
      prNumber: 99,
      description: "A short security improvement description.",
    };

    render(<VersionCard entry={entry} />);

    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
    expect(
      screen.getByText("A short security improvement description.")
    ).toBeInTheDocument();
  });

  // ─── Missing description ──────────────────────────────────────────────────────

  it("does not render description paragraph when description is missing", () => {
    const entry = {
      category: "UI Update",
      prNumber: 50,
      title: "Sample UI Update Title",
    };

    render(<VersionCard entry={entry} />);

    expect(screen.getByText("Sample UI Update Title")).toBeInTheDocument();
    // Only the title <h3> exists; no <p> for description
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  // ─── Missing category falls back to "Update" ─────────────────────────────────

  it("renders 'UPDATE' badge when category is missing", () => {
    const entry = {
      prNumber: 10,
      title: "Generic Change",
      description: "Details about the generic change.",
    };

    render(<VersionCard entry={entry} />);

    expect(screen.getByText("UPDATE")).toBeInTheDocument();
  });

  // ─── Contributors section hidden when both fields are absent ─────────────────

  it("does not render avatar stack when neither contributors nor contributor is present", () => {
    const entry = {
      category: "Feature",
      prNumber: 1,
      title: "Entry With No Contributors",
      description: "This entry has no contributor data.",
    };

    const { container } = render(<VersionCard entry={entry} />);

    // No <img> elements should be present (avatar images)
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });

  // ─── Single contributor via `contributor` (singular) field ───────────────────

  it("renders avatar when only the singular `contributor` field is provided", () => {
    const entry = {
      category: "Feature",
      prNumber: 200,
      title: "Single Contributor Feature",
      description: "An entry with a single contributor.",
      contributor: {
        username: "single-contributor",
        avatarUrl: "https://example.com/single-contributor.png",
        profileUrl: "https://example.com/single-contributor",
      },
    };

    render(<VersionCard entry={entry} />);

    expect(screen.getByAltText("single-contributor")).toBeInTheDocument();
  });

  // ─── Multiple contributors via `contributors` (plural) field ─────────────────

  it("renders all avatars when the plural `contributors` array is provided", () => {
    const entry = {
      category: "Feature",
      prNumber: 300,
      title: "Team Feature",
      description: "An entry built by a team.",
      contributors: [
        {
          username: "contributor-alpha",
          avatarUrl: "https://example.com/contributor-alpha.png",
          profileUrl: "https://example.com/contributor-alpha",
        },
        {
          username: "contributor-beta",
          avatarUrl: "https://example.com/contributor-beta.png",
          profileUrl: "https://example.com/contributor-beta",
        },
      ],
    };

    render(<VersionCard entry={entry} />);

    expect(screen.getByAltText("contributor-alpha")).toBeInTheDocument();
    expect(screen.getByAltText("contributor-beta")).toBeInTheDocument();
  });

  // ─── Malformed contributor (no username) is filtered out ─────────────────────

  it("filters out contributor objects that have no username", () => {
    const entry = {
      category: "Bug Fix",
      prNumber: 77,
      title: "Partial Contributor Data Entry",
      description: "One valid contributor and one without a username.",
      contributors: [
        { avatarUrl: "https://example.com/anon.png" }, // no username → filtered
        {
          username: "valid-contributor",
          avatarUrl: "https://example.com/valid-contributor.png",
          profileUrl: "https://example.com/valid-contributor",
        },
      ],
    };

    render(<VersionCard entry={entry} />);

    // Only the valid contributor's avatar should appear
    expect(screen.getByAltText("valid-contributor")).toBeInTheDocument();
    expect(screen.queryByAltText("")).not.toBeInTheDocument();
  });

  // ─── All contributors invalid → no avatar section rendered ───────────────────

  it("does not render avatar section when all contributors have no username", () => {
    const entry = {
      category: "Bug Fix",
      prNumber: 88,
      title: "All Invalid Contributors Entry",
      description: "None of the contributors have a username.",
      contributors: [
        { avatarUrl: "https://example.com/anon1.png" },
        { avatarUrl: "https://example.com/anon2.png" },
      ],
    };

    const { container } = render(<VersionCard entry={entry} />);

    expect(container.querySelectorAll("img")).toHaveLength(0);
  });

  // ─── `contributors` plural takes precedence over `contributor` singular ───────

  it("prefers `contributors` array over the singular `contributor` field", () => {
    const entry = {
      category: "Feature",
      prNumber: 999,
      title: "Contributor Field Precedence Check",
      description:
        "Should render from the contributors array, not contributor.",
      contributor: {
        username: "singular-user",
        avatarUrl: "https://example.com/singular-user.png",
        profileUrl: "https://example.com/singular-user",
      },
      contributors: [
        {
          username: "plural-user",
          avatarUrl: "https://example.com/plural-user.png",
          profileUrl: "https://example.com/plural-user",
        },
      ],
    };

    render(<VersionCard entry={entry} />);

    // When `contributors` is present it is used; `contributor` (singular) is ignored
    expect(screen.getByAltText("plural-user")).toBeInTheDocument();
    expect(screen.queryByAltText("singular-user")).not.toBeInTheDocument();
  });

  // ─── Minimal entry (only category) renders without crashing ──────────────────

  it("renders without crashing when only category is provided", () => {
    const entry = { category: "Security" };

    const { container } = render(<VersionCard entry={entry} />);

    expect(container.firstChild).not.toBeNull();
    expect(screen.getByText("SECURITY")).toBeInTheDocument();
  });
});
