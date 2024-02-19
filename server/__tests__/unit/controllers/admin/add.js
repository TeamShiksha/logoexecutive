const request = require("supertest");
const app = require("../../../../app");
const { STATUS_CODES } = require("http");
const { AdminService } = require("../../../../services");

jest.mock("../../../../services/AddAdmin", () => ({
  setUserAdmin: jest.fn()
}));

describe("setAdminController", () => {
  it("Should return 422 if given email is not valid", async () => {
    const mockEmail = "bill_gmail.com";

    const mockQuery = {"new_admin_email": mockEmail};
    const response = await request(app)
      .put("/api/admin/add")
      .send(mockQuery);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      "status": 422,
      "message": "Email must be a valid email address",
      "error": STATUS_CODES[422]
    });

  });

  it("Should return 404 if given email is not present", async () => {
    const mockEmail = "bill@gmail.com";

    const mockPayload = {"new_admin_email": mockEmail};
    const response = await request(app)
      .put("/api/admin/add")
      .send(mockPayload);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      "status": 404,
      "error": STATUS_CODES[404],
      "message": "User not found"
    });

  });

  it("Should return 200 if given user is already an admin", async () => {
    const mockMessage = "User bill@gmail.com is already an admin";
    const mockEmail = "bill@gmail.com";

    jest
      .spyOn(AdminService, "setUserAdmin")
      .mockImplementation(() => mockMessage);

    const mockPayload = {"new_admin_email": mockEmail};
    const response = await request(app)
      .put("/api/admin/add")
      .send(mockPayload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      "statusCode": 200,
      "message": mockMessage
    });

  });

  it("Should return 200 if user is set to admin", async () => {
    const mockMessage = "User bill@gmail.com is now an admin";
    const mockEmail = "bill@gmail.com";

    jest
      .spyOn(AdminService, "setUserAdmin")
      .mockImplementation(() => mockMessage);

    const mockPayload = {"new_admin_email": mockEmail};
    const response = await request(app)
      .put("/api/admin/add")
      .send(mockPayload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      "statusCode": 200,
      "message": mockMessage
    });

  });
});



