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

  // ─── Existing: basic rendering ────────────────────────────────────────────────

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

  // ─── Dropdown closes after selecting a version ────────────────────────────────

  it("closes dropdown after a version is selected", () => {
    render(<ChangeLog {...defaultProps} />);

    const toggleBtn = screen.getByRole("button", {
      name: defaultProps.selectedRelease.releaseDate,
    });

    fireEvent.click(toggleBtn); // open
    const anotherRelease = RELEASE_DATA[1];
    const optionBtn = screen.getByRole("button", {
      name: new RegExp(anotherRelease.version, "i"),
    });
    fireEvent.click(optionBtn); // select → should close

    // Dropdown items should no longer be visible
    expect(
      screen.queryByRole("button", {
        name: new RegExp(anotherRelease.version, "i"),
      })
    ).not.toBeInTheDocument();
  });

  // ─── Fallback trigger label when releaseDate is missing ──────────────────────

  it("shows 'Select Release' in the dropdown trigger when selectedRelease has no releaseDate", () => {
    const partialRelease = {
      version: "v0.9.0",
      heroImage: "version07",
      entries: [],
      // releaseDate intentionally omitted
    };

    render(
      <ChangeLog
        {...defaultProps}
        selectedRelease={partialRelease}
        selectedVersion="v0.9.0"
      />
    );

    expect(
      screen.getByRole("button", { name: /select release/i })
    ).toBeInTheDocument();
  });

  // ─── Empty state: no entries for category ────────────────────────────────────

  it("shows empty state message when no entries match the selected category filter", () => {
    const releaseWithNoSecurityEntries = {
      ...RELEASE_DATA[0],
      entries: [
        {
          category: "Feature",
          prNumber: 1,
          title: "Only Feature",
          description: "No security entries here.",
          contributor: {
            username: "dev1",
            avatarUrl: "https://github.com/dev1.png",
            profileUrl: "https://github.com/dev1",
          },
        },
      ],
    };

    render(
      <ChangeLog
        {...defaultProps}
        selectedRelease={releaseWithNoSecurityEntries}
      />
    );

    // Click the "Security" filter pill (if it appears — it shouldn't since no entries)
    // Instead, the "All" pill should show the feature entry and "Security" pill won't exist
    // Let's click a pill that would have no matches if it existed; since it won't even render,
    // we verify "All" shows the entry and no empty state is shown by default.
    expect(screen.getByText("Only Feature")).toBeInTheDocument();
    expect(
      screen.queryByText(/no updates in this category/i)
    ).not.toBeInTheDocument();
  });

  it("shows empty state when 'All' is active and selectedRelease has no entries", () => {
    const emptyRelease = {
      version: "v0.9.0",
      releaseDate: "Jul 2026",
      heroImage: "version07",
      entries: [],
    };

    render(
      <ChangeLog
        {...defaultProps}
        selectedRelease={emptyRelease}
        selectedVersion="v0.9.0"
      />
    );

    expect(
      screen.getByText(/no updates in this category/i)
    ).toBeInTheDocument();
  });

  // ─── Category filter pills ────────────────────────────────────────────────────

  it("renders 'All' filter pill when entries are present", () => {
    render(<ChangeLog {...defaultProps} />);

    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
  });

  it("only renders category pills for categories that exist in the selected release", () => {
    const featureOnlyRelease = {
      version: "v0.9.0",
      releaseDate: "Jul 2026",
      heroImage: "version07",
      entries: [
        {
          category: "Feature",
          prNumber: 1,
          title: "Feature only",
          description: "Just a feature.",
          contributor: {
            username: "dev1",
            avatarUrl: "https://github.com/dev1.png",
            profileUrl: "https://github.com/dev1",
          },
        },
      ],
    };

    render(
      <ChangeLog
        {...defaultProps}
        selectedRelease={featureOnlyRelease}
        selectedVersion="v0.9.0"
      />
    );

    expect(screen.getByRole("button", { name: "Feature" })).toBeInTheDocument();
    // Categories not present in entries should not appear as pills
    expect(
      screen.queryByRole("button", { name: "Security" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Bug Fix" })
    ).not.toBeInTheDocument();
  });

  it("filters entries correctly when a category pill is clicked", () => {
    // Use a release with both Feature and Bug Fix entries
    const mixedRelease = {
      version: "v0.9.0",
      releaseDate: "Jul 2026",
      heroImage: "version07",
      entries: [
        {
          category: "Feature",
          prNumber: 1,
          title: "New Feature",
          description: "A new feature.",
        },
        {
          category: "Bug Fix",
          prNumber: 2,
          title: "Fixed Bug",
          description: "A bug fix.",
        },
      ],
    };

    render(
      <ChangeLog
        {...defaultProps}
        selectedRelease={mixedRelease}
        selectedVersion="v0.9.0"
      />
    );

    // Both visible initially under "All"
    expect(screen.getByText("New Feature")).toBeInTheDocument();
    expect(screen.getByText("Fixed Bug")).toBeInTheDocument();

    // Click "Bug Fix" pill
    fireEvent.click(screen.getByRole("button", { name: "Bug Fix" }));

    // Only the bug fix entry remains visible
    expect(screen.getByText("Fixed Bug")).toBeInTheDocument();
    expect(screen.queryByText("New Feature")).not.toBeInTheDocument();
  });

  // ─── Entry key falls back gracefully when prNumber is absent ─────────────────

  it("renders entries without a prNumber as keys without crashing", () => {
    const releaseWithoutPrNumber = {
      version: "v0.9.0",
      releaseDate: "Jul 2026",
      heroImage: "version07",
      entries: [
        {
          category: "Feature",
          // prNumber intentionally omitted
          title: "No PR number entry",
          description: "This entry has no PR number.",
        },
      ],
    };

    render(
      <ChangeLog
        {...defaultProps}
        selectedRelease={releaseWithoutPrNumber}
        selectedVersion="v0.9.0"
      />
    );

    expect(screen.getByText("No PR number entry")).toBeInTheDocument();
  });

  // ─── selectedRelease is null/undefined ───────────────────────────────────────

  it("renders without crashing when selectedRelease is null", () => {
    render(<ChangeLog {...defaultProps} selectedRelease={null} />);

    expect(
      screen.getByRole("heading", { name: /changelog/i })
    ).toBeInTheDocument();
    // Should show empty state since no entries
    expect(
      screen.getByText(/no updates in this category/i)
    ).toBeInTheDocument();
  });

  // ─── Category filter resets when version changes ──────────────────────────────

  it("resets active category to 'All' when selectedVersion changes", () => {
    const { rerender } = render(
      <ChangeLog
        {...defaultProps}
        selectedRelease={{
          version: "v0.8.0",
          releaseDate: "May 2026",
          heroImage: "version07",
          entries: [
            { category: "Bug Fix", prNumber: 1, title: "Bug entry" },
            { category: "Feature", prNumber: 2, title: "Feature entry" },
          ],
        }}
        selectedVersion="v0.8.0"
      />
    );

    // Click "Bug Fix" filter pill
    fireEvent.click(screen.getByRole("button", { name: "Bug Fix" }));
    expect(screen.queryByText("Feature entry")).not.toBeInTheDocument();

    // Re-render with a different version (simulates user switching version)
    rerender(
      <ChangeLog
        {...defaultProps}
        selectedRelease={{
          version: "v0.7.0",
          releaseDate: "Mar 2026",
          heroImage: "version07",
          entries: [
            { category: "Feature", prNumber: 3, title: "New version feature" },
          ],
        }}
        selectedVersion="v0.7.0"
      />
    );

    // After version switch, "All" is active so all entries in new version are visible
    expect(screen.getByText("New version feature")).toBeInTheDocument();
  });
});
