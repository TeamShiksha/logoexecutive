const { emailRecordExists,
  fetchUsers,
  fetchUserByEmail,
  createUser,
  updatePasswordbyUser,
  fetchUserFromId,
  verifyUser,
  updateUser,
  deleteUserAccount, } = require("../../../services");
const { UserCollection, db, SubscriptionCollection, KeyCollection } = require("../../../utils/firestore");
const { Users } = require("../../../models");
const { mockUsers } = require("../../../utils/mocks/Users");
const { mockKeys } = require("../../../utils/mocks/Keys");
const { mockSubscriptions } = require("../../../utils/mocks/Subscriptions");
const bcrypt = require("bcrypt");

describe("emailRecordExists", () => {
  afterEach(() => {
    jest.restoreAllMocks(); 
  });

  test("should return true if email exists in user collection", async () => {
    await UserCollection.doc(mockUsers[0].userId).set(mockUsers[0]);
    const exists = await emailRecordExists(mockUsers[0].email);

    expect(exists).toBe(true);
  });

  test("should return false if email does not exist in user collection", async () => {
    await UserCollection.doc(mockUsers[0].userId).set(mockUsers[0]);
    const exists = await emailRecordExists("nonexsitinguser@gmail.com");

    expect(exists).toBe(false);
  });

  test("should return false if the query result is empty", async () => {
    jest.spyOn(UserCollection, "where").mockReturnValue({
      get: jest.fn().mockResolvedValue({ empty: true })
    });
    const exists = await emailRecordExists(mockUsers[2].email);

    expect(exists).toBe(false);
  });

  test("should throw an error if Firestore operation fails", async () => {
    const errorMessage = "Firestore operation failed";
    jest.spyOn(UserCollection, "where").mockReturnValue({
      get: jest.fn().mockRejectedValue(new Error(errorMessage))
    });

    await expect(emailRecordExists(mockUsers[0].email)).rejects.toThrow(errorMessage);
  });

});

describe("fetchUsers", () => {
  afterEach(() => {
    jest.clearAllMocks(); 
  });

  it("should fetch all users from the user collection", async () => {
    const batch = db.batch();
    mockUsers.forEach((user) => {
      const docRef = UserCollection.doc(user.userId);
      batch.set(docRef, user);
    });

    await batch.commit();
    const result = await fetchUsers();

    expect(result.data.length).toBe(mockUsers.length);
    expect(result.data[0]).toBeInstanceOf(Users);
  });

  it("should handle empty user collection", async () => {
    jest.spyOn(UserCollection, "get").mockResolvedValueOnce({ docs: [] });
    const result = await fetchUsers();

    expect(result.data.length).toBe(0);
  });

  it("should fetch users from non-empty user collection", async () => {
    const result = await fetchUsers();

    expect(result.data.length).toBe(mockUsers.length);
    for (let user = 0; user < mockUsers.length; user++) {
      expect(result.data[user].email).toBe(mockUsers[user].email);
    }
  });

  it("should throw an error if an error occurs while fetching users", async () => {
    const errorMessage = "Firestore operation failed";
    jest.spyOn(UserCollection, "get").mockRejectedValueOnce(new Error(errorMessage));

    await expect(fetchUsers()).rejects.toThrow(errorMessage);
  });

});

describe("fetchUserByEmail", () => {
  afterEach(() => {
    jest.clearAllMocks(); 
  });

  it("should fetch user by email from the user collection", async () => {
    await UserCollection.doc(mockUsers[0].userId).set(mockUsers[0]);
    const user = await fetchUserByEmail(mockUsers[0].email);

    expect(user).toBeInstanceOf(Users);
    expect(user.userId).toBe(mockUsers[0].userId);
  });

  it("should return null if user does not exist for the provided email", async () => {
    const mockUserRef = { empty: true };
    jest.spyOn(UserCollection, "where").mockReturnValue({
      limit: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockUserRef),
      }),
    });
    const user = await fetchUserByEmail(mockUsers[1].email);

    expect(user).toBeNull();
  });

  test("should return false if the query result is empty", async () => {
    const mockUserRef = { empty: true };
    jest.spyOn(UserCollection, "where").mockReturnValueOnce({
      get: jest.fn().mockResolvedValueOnce(mockUserRef),
    });
    const exists = await emailRecordExists(mockUsers[2].email);

    expect(exists).toBe(false);
  });

  it("should throw an error if an error occurs while fetching user by email", async () => {
    const errorMessage = "Firestore operation failed";
    jest.spyOn(UserCollection, "where").mockReturnValueOnce({
      limit: jest.fn().mockReturnValueOnce({
        get: jest.fn().mockRejectedValueOnce(new Error(errorMessage))
      })
    });

    await expect(fetchUserByEmail(mockUsers[0].email)).rejects.toThrow(errorMessage);
  });
});

describe("createUser", () => {
  afterEach(() => {
    jest.restoreAllMocks(); 
  });

  it("should create a user in the database and return the created user object", async () => {
    const createdUser = await createUser(mockUsers[0]);

    expect(createdUser).toBeInstanceOf(Users);
    expect(createdUser.email).toBe(mockUsers[0].email);
  });

  it("should return null if data is improper", async () => {
    const mockUser = mockUsers[0];
    jest.spyOn(Users, "NewUser").mockReturnValueOnce(mockUser);
    jest.spyOn(UserCollection, "doc").mockReturnValueOnce({
      set: jest.fn().mockResolvedValueOnce(null),
    });
    delete mockUser.email;
    const createdUser = await createUser(mockUser);

    expect(createdUser).toBeNull();
  });

  it("should return null if data is improper", async () => {
    const createdUser = await createUser(mockUsers[0]);

    expect(createdUser).toBeNull();
  });

  it("should throw an error if Firestore operation fails", async () => {
    jest.spyOn(Users, "NewUser").mockReturnValueOnce(mockUsers[0]);
    jest.spyOn(UserCollection, "doc").mockImplementationOnce(() => {
      throw new Error("Firestore operation failed");
    });

    await expect(createUser(mockUsers[0])).rejects.toThrow("Firestore operation failed");
  });
});

describe("Users service", () => {
  it("should throw an error if bcrypt.hash throws an error", async () => {
    const mockUser = {
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      password: "password123",
    };
    jest.spyOn(bcrypt, "hash").mockImplementationOnce(() => {
      throw new Error("Hashing failed");
    });

    await expect(Users.NewUser(mockUser)).rejects.toThrow("Hashing failed");
  });
});

describe("updatePasswordbyUser", () => {
  afterEach(() => {
    jest.restoreAllMocks(); 
  });

  it("should update user password in the database", async () => {
    const mockUserRef = UserCollection.doc(mockUsers[0].userId);
    const updated = await updatePasswordbyUser({ userRef: mockUserRef }, "newhashedpassword");

    expect(updated).toBe(true);
  });

  it("should throw an error if an error occurs while updating user password", async () => {
    const errorMessage = "Firestore operation failed";
    const mockUserRef = { update: jest.fn().mockRejectedValueOnce(new Error(errorMessage)) };
    jest.spyOn(UserCollection, "doc").mockReturnValue(mockUserRef);

    await expect(updatePasswordbyUser({ userRef: mockUserRef }, "newhashedpassword")).rejects.toThrow(errorMessage);
  });

});

describe("fetchUserFromId", () => {
  afterEach(() => {
    jest.restoreAllMocks(); 
  });

  it("should fetch user by user ID from the user collection", async () => {
    const mockUserId = mockUsers[0].userId;
    const user = await fetchUserFromId(mockUserId);

    expect(user).toBeInstanceOf(Users);
    expect(user.userId).toBe(mockUserId);
  });

  it("should return null if user does not exist for the provided user ID", async () => {
    const user = await fetchUserFromId("nonexistentUserId");

    expect(user).toBeNull();
  });

  it("should throw an error if Firestore operation fails", async () => {
    jest.spyOn(UserCollection, "where").mockImplementationOnce(() => {
      throw new Error("Firestore operation failed");
    });

    await expect(fetchUserFromId("errorUserId")).rejects.toThrow("Firestore operation failed");
  });
});

describe("verifyUser", () => {
  afterEach(() => {
    jest.restoreAllMocks(); 
  });

  it("should verify user in the database", async () => {
    const userRef = await UserCollection.doc(mockUsers[0].userId);
    const verified = await verifyUser({ userRef: userRef });

    expect(verified).toBe(true);
  });

  it("should return false if verification fails", async () => {
    const mockUserRef = { update: jest.fn().mockResolvedValueOnce(false) };
    jest.spyOn(UserCollection, "doc").mockReturnValueOnce(mockUserRef);
    const verified = await verifyUser({ userRef: mockUserRef });

    expect(verified).toBe(false);
  });

  it("should throw an error if an error occurs while verifying user", async () => {
    const errorMessage = "Firestore operation failed";
    const mockUserRef = { update: jest.fn().mockRejectedValueOnce(new Error(errorMessage)) };
    const user = { userRef: mockUserRef };

    await expect(verifyUser(user)).rejects.toThrow(errorMessage);
  });

});

describe("updateUser", () => {
  afterEach(() => {
    jest.restoreAllMocks(); 
  });

  it("should update user profile in the database", async () => {
    const mockUserRef = await UserCollection.doc(mockUsers[0].userId);
    const updated = await updateUser({firstName:"NewFirstName",lastName:"NewLastName"}, { userRef: mockUserRef });

    expect(updated).toBe(true);
  });

  it("should return false if update fails", async () => {
    const mockUserRef = { update: jest.fn().mockResolvedValueOnce(false) };
    const updated = await updateUser({firstName:"NewFirstName",lastName:"NewLastName"}, { userRef: mockUserRef });

    expect(updated).toBe(false);
  });

  it("should throw an error if an error occurs while updating user profile", async () => {
    const errorMessage = "Firestore operation failed";
    const mockUserRef = { update: jest.fn().mockRejectedValueOnce(new Error(errorMessage)) };
    const user = { userRef: mockUserRef };
    const updateProfile = ["John", "Doe"];

    await expect(updateUser(updateProfile, user)).rejects.toThrow(errorMessage);
  });

});

describe("deleteUserAccount", () => {
  afterEach(() => {
    jest.restoreAllMocks(); 
  });

  test("should delete key documents successfully", async () => {
    const userId = "0c1266ab-8ad2-4ab9-b56c-e1db6982f12";
    await KeyCollection.doc(mockKeys[0].keyId).set(mockKeys[0]);
    const keySnapshot = await KeyCollection.where("userId", "==", userId).get();
    await deleteUserAccount(userId);
    
    expect(keySnapshot.empty).toBe(true);
  });

  it("should delete user account and related data from multiple collections within a Firestore transaction", async () => {
    const userId = mockUsers[0].userId;
    await UserCollection.doc(mockUsers[0].userId).set(mockUsers[0]);
    await KeyCollection.doc(mockKeys[0].keyId).set(mockKeys[0]);
    await SubscriptionCollection.doc(mockSubscriptions[0].subscriptionId).set(mockSubscriptions[0]);
    await deleteUserAccount(userId);
    const userSnapshot = await UserCollection.where("userId", "==", userId).get();
    const subscriptionSnapshot = await SubscriptionCollection.where("userId", "==", userId).get();
    const keySnapshot = await KeyCollection.where("userId", "==", userId).get();

    expect(userSnapshot.empty).toBe(true);
    expect(subscriptionSnapshot.empty).toBe(true);
    expect(keySnapshot.empty).toBe(true);
  });

  it("should throw an error if Firestore operation fails", async () => {
    jest.spyOn(db, "runTransaction").mockImplementationOnce(() => {
      throw new Error("Firestore transaction failed");
    });

    await expect(deleteUserAccount(mockUsers[0].userId)).rejects.toThrow("Firestore transaction failed");
  });

});
