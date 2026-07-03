const app = require("../server");

describe("server", () => {
  it("trusts the Vercel proxy hop for client IP detection", () => {
    expect(app.get("trust proxy")).toBe(1);
  });
});
