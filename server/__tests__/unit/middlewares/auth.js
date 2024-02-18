const request = require("supertest");
const app = require("express")();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("../../../middlewares/auth");
const { mockUsers } = require("../../../utils/mocks/Users");
const { Users } = require("../../../models");

const mockCtrl = jest.fn();

describe("Auth middleware", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  beforeAll(() => {
    process.env.JWT_SECRET = "mysecret";
    app.use(cookieParser());
    app.get("/", auth, (req, res) => mockCtrl(req, res));
  });

  it("Success - If user is signed in", async () => {
    mockCtrl.mockImplementation((req, res) => {
      return res.status(200).json(req.userData);
    });
    const mockUser = new Users(mockUsers[1]);
    const mockJWT = mockUser.generateJWT();
    const response = await request(app)
      .get("/")
      .set("Cookie", `jwt=${mockJWT}`);

    expect(mockCtrl).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser.data);
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

    const mockJWT = new Users(mockUsers[1]).generateJWT();
    const response = await request(app)
      .get("/")
      .set("Cookie", `jwt=${mockJWT}`);

    expect(response.status).toBe(500);
    expect(response.success).toBeFalsy();
  });
});
