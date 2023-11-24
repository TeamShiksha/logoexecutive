const request = require("supertest");
const auth = require("./auth");
const app = require("express")();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const User = require("../../models/Users");
const { Timestamp } = require("firebase-admin/firestore");

const mockFn = jest.fn().mockImplementation((_, res) => {
  return res.end("success");
});
const mockUser = new User({
  id: "1",
  email: "john@email.com",
  firstName: "firstName",
  lastName: "lastName",
  updatedAt: Timestamp.now(),
  createdAt: Timestamp.now(),
});

describe("Auth middleware", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    process.env.JWT_SECRET = "mysecret";
    app.use(cookieParser());
    app.get("/", auth, mockFn);
  });

  it("should return error 401", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("User not signed in");
  });

  it("should trigger mockFn if jwt is present", async () => {
    const mockJWT = mockUser.generateJWT();
    const response = await request(app)
      .get("/")
      .set("Cookie", `jwt=${mockJWT}`);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
  });

  it("should return with 403 error if jwt is invalid", async () => {
    const mockJWT = jwt.sign({ data: "hello" }, process.env.JWT_SECRET);
    const response = await request(app)
      .get("/")
      .set("Cookie", `jwt=${mockJWT}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Invalid credentials");
    expect(response.body.error).toBe("Forbidden");
  });

  it("should return error 500 for unexpected errors", async () => {
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw Error("test");
    });

    const mockJWT = mockUser.generateJWT();
    const response = await request(app)
      .get("/")
      .set("Cookie", `jwt=${mockJWT}`);

    expect(response.status).toBe(500);
  });
});
