const { setUserAdmin } = require("../../../services");
const { Users } = require("../../../models");
const { mockUsers } = require("../../../utils/mocks/Users");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

beforeAll(async () => {
  const mongoServer = await MongoMemoryServer.create();
  const mongo_uri = mongoServer.getUri();
  await mongoose.connect(mongo_uri);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("setUserAdmin", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return null if the user does not exist", async () => {
    jest.spyOn(Users, "findOne").mockResolvedValue(null);

    const result = await setUserAdmin("nonexistent@example.com");
    expect(result).toBeNull();
  });

  it("should return success and isNewAdmin false if the user is already an admin", async () => {
    const mockAdminUser = mockUsers[2];
    jest.spyOn(Users, "findOne").mockResolvedValue(mockAdminUser);
    jest.spyOn(Users.prototype, "save").mockResolvedValue(mockAdminUser);

    const result = await setUserAdmin(mockAdminUser.email);
    expect(result).toEqual({
      success: true,
      isNewAdmin: false,
    });
  });

  it("should update the user type to admin and return success and isNewAdmin true if the user is not an admin", async () => {
    const mockCustomerUser = mockUsers[0];
    jest.spyOn(Users, "findOne").mockResolvedValue(mockCustomerUser);
    jest.spyOn(Users.prototype, "save").mockImplementation(function() {
      this.userType = "ADMIN";
      return Promise.resolve(this);
    });

    const result = await setUserAdmin(mockCustomerUser.email);
    expect(result).toEqual({
      success: true,
      isNewAdmin: true,
    });
  });

  it("should throw an error if MongoDB operation fails", async () => {
    const errorMessage = "MongoDB operation failed";
    jest.spyOn(Users, "findOne").mockRejectedValue(new Error(errorMessage));

    await expect(setUserAdmin("user@example.com")).rejects.toThrow(errorMessage);
  });
});
