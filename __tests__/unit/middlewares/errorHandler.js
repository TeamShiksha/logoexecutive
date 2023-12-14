const { errorHandler } = require("../../../middlewares");
const request = require("supertest");
const { STATUS_CODES } = require("http");

const app = require("express")();

const mockMiddleware = (_req, _res, next) => {
  try {
    throw new Error("Unexpected Error");
  } catch(err) {
    next(err);
  }
};

describe("Error Handler Middleware", () => {
  beforeAll(() => {
    app.get("/errorRoute", mockMiddleware);
    app.use(errorHandler);
  });

  it("Return 500 response when called", async () => {
    const response = await request(app).get("/errorRoute");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Unexpected Error",
      statusCode: 500
    });
  });
});
