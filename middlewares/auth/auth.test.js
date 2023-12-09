const request = require("supertest");
const auth = require("./auth");
const app = require("express")();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const User = require("../../models/Users");
const { Timestamp } = require("firebase-admin/firestore");
const expressBang = require("express-bang");

const mockFn = jest.fn();
const mockUser = new User({
  userId: "1",
  email: "john@email.com",
  firstName: "firstName",
  lastName: "lastName",
  updatedAt: Timestamp.now().toDate(),
  createdAt: Timestamp.now().toDate(),
});

describe("Auth middleware", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    process.env.JWT_SECRET = "mysecret";
    app.use(cookieParser());
    app.use(expressBang());
    app.get("/", auth, (req, res) => mockFn(req, res));
    app.get("/error", auth, (req, res) => mockFn());
  });

  it("Success - If user is signed in", async () => {
    mockFn.mockImplementation((req, res) => {
      return res.status(200).json(req.userData);
    });
    const mockJWT = mockUser.generateJWT();
    const response = await request(app)
      .get("/")
      .set("Cookie", `jwt=${mockJWT}`);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(JSON.stringify(response.body)).toEqual(
      JSON.stringify(mockUser.data),
    );
  });

  it("401 - If user is not signed in / JWT not present", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("User not signed in");
  });

  it("403 - if JWT is invalid", async () => {
    const mockJWT = jwt.sign({ data: "hello" }, process.env.JWT_SECRET);
    const response = await request(app)
      .get("/")
      .set("Cookie", `jwt=${mockJWT}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Invalid credentials");
    expect(response.body.error).toBe("Forbidden");
  });

  it("500 - For unexpected errors", async () => {
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw Error("test");
    });

    const mockJWT = mockUser.generateJWT();
    const response = await request(app)
      .get("/")
      .set("Cookie", `jwt=${mockJWT}`);

    expect(response.status).toBe(500);
    expect(response.success).toBeFalsy();
  });
});
