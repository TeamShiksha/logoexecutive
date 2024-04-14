const routeNotFound = require("../../../middlewares/routeNotFound");

describe("routeNotFound middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should respond with 404 status and correct JSON payload", () => {
    routeNotFound(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 404,
      message: "route not found",
      error: "not found",
    });
    expect(next).toHaveBeenCalled();
  });
});
