const { setUserAdmin } = require("../../../services");
const { UserCollection } = require("../../../utils/firestore");
const { mockUsers } = require("../../../utils/mocks/Users");

describe("setUserAdmin", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return null if the user does not exist", async () => {
    const result = await setUserAdmin("nonexistent@example.com");
    expect(result).toBeNull();
  });

  it("should return success and isNewAdmin false if the user is already an admin", async () => {
    const mockAdminUser = mockUsers[2];
    await UserCollection.doc(mockAdminUser.userId).set(mockAdminUser);
    const result = await setUserAdmin(mockAdminUser.email);
    expect(result).toEqual({
      success: true,
      isNewAdmin: false,
    });
  });

  it("should update the user type to admin and return success and isNewAdmin true if the user is not an admin", async () => {
    const mockCustomerUser = mockUsers[0];
    await UserCollection.doc(mockCustomerUser.userId).set(mockCustomerUser);
    const result = await setUserAdmin(mockCustomerUser.email);
    expect(result).toEqual({
      success: true,
      isNewAdmin: true,
    });
  });

  it("should throw an error if Firestore operation fails", async () => {
    const errorMessage = "Firestore operation failed";
    jest.spyOn(UserCollection, "where").mockReturnValue({
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockRejectedValue(new Error(errorMessage)),
    });

    await expect(setUserAdmin("user@example.com")).rejects.toThrow(errorMessage);
  });
});
