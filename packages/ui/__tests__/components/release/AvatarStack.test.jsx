import { expect, describe, it } from "vitest";
import { render, screen } from "@testing-library/react";
import AvatarStack from "../../../src/components/release/AvatarStack";

describe("AvatarStack component", () => {
  // ─── Returns null for empty/falsy users ──────────────────────────────────────

  it("renders nothing when users is an empty array", () => {
    const { container } = render(<AvatarStack users={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when users prop is not provided", () => {
    const { container } = render(<AvatarStack />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when users is null", () => {
    const { container } = render(<AvatarStack users={null} />);
    expect(container.firstChild).toBeNull();
  });

  // ─── Filters out entries without a username ───────────────────────────────────

  it("renders nothing when all users are missing a username", () => {
    const { container } = render(
      <AvatarStack
        users={[
          { avatarUrl: "https://example.com/a.png" },
          { avatarUrl: "https://example.com/b.png" },
        ]}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("only renders avatars for users that have a username", () => {
    const users = [
      { avatarUrl: "https://example.com/no-username.png" }, // invalid
      {
        username: "validuser",
        avatarUrl: "https://github.com/validuser.png",
        profileUrl: "https://github.com/validuser",
      },
    ];

    render(<AvatarStack users={users} />);

    expect(screen.getByAltText("validuser")).toBeInTheDocument();
    expect(screen.queryByAltText("")).not.toBeInTheDocument();
  });

  // ─── Single user (happy path) ─────────────────────────────────────────────────

  it("renders a single avatar correctly", () => {
    const users = [
      {
        username: "alice",
        avatarUrl: "https://github.com/alice.png",
        profileUrl: "https://github.com/alice",
      },
    ];

    render(<AvatarStack users={users} />);

    const img = screen.getByAltText("alice");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://github.com/alice.png");

    const link = img.closest("a");
    expect(link).toHaveAttribute("href", "https://github.com/alice");
  });

  // ─── Multiple users ───────────────────────────────────────────────────────────

  it("renders all avatars when multiple users are within maxCount", () => {
    const users = [
      {
        username: "alice",
        avatarUrl: "https://github.com/alice.png",
        profileUrl: "https://github.com/alice",
      },
      {
        username: "bob",
        avatarUrl: "https://github.com/bob.png",
        profileUrl: "https://github.com/bob",
      },
      {
        username: "carol",
        avatarUrl: "https://github.com/carol.png",
        profileUrl: "https://github.com/carol",
      },
    ];

    render(<AvatarStack users={users} />);

    expect(screen.getByAltText("alice")).toBeInTheDocument();
    expect(screen.getByAltText("bob")).toBeInTheDocument();
    expect(screen.getByAltText("carol")).toBeInTheDocument();
  });

  // ─── Excess count badge ───────────────────────────────────────────────────────

  it("shows excess count badge when users exceed maxCount", () => {
    const users = Array.from({ length: 8 }, (_, i) => ({
      username: `user${i}`,
      avatarUrl: `https://github.com/user${i}.png`,
      profileUrl: `https://github.com/user${i}`,
    }));

    render(<AvatarStack users={users} maxCount={5} />);

    // The first 5 are visible, the remaining 3 show as "+3"
    expect(screen.getByText("+3")).toBeInTheDocument();
  });

  it("does not show excess count badge when users are within maxCount", () => {
    const users = [
      {
        username: "alice",
        avatarUrl: "https://github.com/alice.png",
        profileUrl: "https://github.com/alice",
      },
      {
        username: "bob",
        avatarUrl: "https://github.com/bob.png",
        profileUrl: "https://github.com/bob",
      },
    ];

    render(<AvatarStack users={users} maxCount={5} />);

    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  // ─── Fallback avatarUrl generation ───────────────────────────────────────────

  it("generates a fallback avatarUrl from username when avatarUrl is missing", () => {
    const users = [
      {
        username: "no-avatar-user",
        profileUrl: "https://github.com/no-avatar-user",
        // no avatarUrl
      },
    ];

    render(<AvatarStack users={users} />);

    const img = screen.getByAltText("no-avatar-user");
    // Should fall back to unavatar.io
    expect(img).toHaveAttribute(
      "src",
      "https://unavatar.io/github/no-avatar-user"
    );
  });

  // ─── Fallback profileUrl generation ──────────────────────────────────────────

  it("generates a fallback profileUrl from username when profileUrl is missing", () => {
    const users = [
      {
        username: "no-profile-user",
        avatarUrl: "https://github.com/no-profile-user.png",
        // no profileUrl
      },
    ];

    render(<AvatarStack users={users} />);

    const link = screen.getByAltText("no-profile-user").closest("a");
    expect(link).toHaveAttribute("href", "https://github.com/no-profile-user");
  });

  // ─── Size prop applied ────────────────────────────────────────────────────────

  it("accepts the 'small' size prop without crashing", () => {
    const users = [
      {
        username: "sizetest",
        avatarUrl: "https://github.com/sizetest.png",
        profileUrl: "https://github.com/sizetest",
      },
    ];

    const { container } = render(<AvatarStack users={users} size="small" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("accepts the 'large' size prop without crashing", () => {
    const users = [
      {
        username: "sizetest",
        avatarUrl: "https://github.com/sizetest.png",
        profileUrl: "https://github.com/sizetest",
      },
    ];

    const { container } = render(<AvatarStack users={users} size="large" />);
    expect(container.firstChild).not.toBeNull();
  });
});
