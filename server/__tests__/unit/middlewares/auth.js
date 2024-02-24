const request = require("supertest");
const app = require("express")();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("../../../middlewares/auth");
const { mockUsers } = require("../../../utils/mocks/Users");
const { Users } = require("../../../models");
const { STATUS_CODES } = require("http");

const mockCtrl = jest.fn();

describe("Auth middleware", () => {
  const ENDPOINT = "/";
  const ADMIN_ENDPOINT = "/adminOnly";

  afterEach(() => {
    jest.clearAllMocks();
  });
  beforeAll(() => {
    process.env.JWT_SECRET = "mysecret";
    app.use(cookieParser());
    app.get(ENDPOINT, auth(), (req, res) => mockCtrl(req, res));
    app.get(ADMIN_ENDPOINT, auth({ adminOnly: true }), (req, res) => mockCtrl(req, res));
  });

  it("200 - If user is signed in (CUSTOMER)", async () => {
    mockCtrl.mockImplementation((req, res) => {
      return res.status(200).json(req.userData);
    });
    const mockUser = new Users(mockUsers[1]);
    const mockJWT = mockUser.generateJWT();
    const response = await request(app)
      .get(ENDPOINT)
      .set("Cookie", `jwt=${mockJWT}`);

    expect(mockCtrl).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser.data);
  });

  it("200 - If user is signed in (ADMIN)", async () => {
    mockCtrl.mockImplementation((req, res) => {
      return res.status(200).json(req.userData);
    });
    const mockUser = new Users(mockUsers[2]);
    const mockJWT = mockUser.generateJWT();
    const response = await request(app)
      .get(ADMIN_ENDPOINT)
      .set("Cookie", `jwt=${mockJWT}`);

    expect(mockCtrl).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser.data);
  });

  it("401 - If user is not signed in / JWT not present", async () => {
    const response = await request(app).get(ENDPOINT);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: STATUS_CODES[401],
      message: "User not signed in",
      statusCode: 401
    });
  });

  it("403 - if JWT is invalid", async () => {
    const mockJWT = jwt.sign({ data: "hello" }, process.env.JWT_SECRET);
    const response = await request(app)
      .get(ENDPOINT)
      .set("Cookie", `jwt=${mockJWT}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: STATUS_CODES[403],
      message: "Invalid credentials",
      statusCode: 403
    });
  });

  it("403 - The user is not admin", async () => {
    const mockJWT = jwt.sign({ data: mockUsers[1] }, process.env.JWT_SECRET);

    const response = await request(app).get(ADMIN_ENDPOINT).set("Cookie", `jwt=${mockJWT}`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: STATUS_CODES[401],
      message: "User not authorized",
      statusCode: 401
    });
  });

  it("500 - For unexpected errors", async () => {
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw Error("test");
    });

    const mockJWT = new Users(mockUsers[1]).generateJWT();
    const response = await request(app)
      .get(ENDPOINT)
      .set("Cookie", `jwt=${mockJWT}`);

    expect(response.status).toBe(500);
    expect(response.success).toBeFalsy();
  });
});
