const { emailRecordExists,
  fetchUsers,
  fetchUserByEmail,
  createUser,
  updatePasswordbyUser,
  fetchUserFromId,
  verifyUser,
  updateUser,
  deleteUserAccount, } = require("../../../services");
const { UserCollection, db } = require("../../../utils/firestore");
const { Users } = require("../../../models");
const { mockUsers } = require("../../../utils/mocks/Users");

describe("emailRecordExists", () => {
  test("should return true if email exists in user collection", async () => {
    const user = await UserCollection.doc(mockUsers[0].userId).set(mockUsers[0]);
    const exists = await emailRecordExists(mockUsers[0].email);
    expect(exists).toBe(true);
  });

  test("should return false if email does not exist in user collection", async () => {
    const user = await UserCollection.doc(mockUsers[0].userId).set(mockUsers[0]);
    const exists = await emailRecordExists(mockUsers[1].email);
    expect(exists).toBe(false);
  });

  test("should return false if the query result is empty", async () => {
    jest.spyOn(UserCollection, "where").mockReturnValue({
      get: jest.fn().mockResolvedValue({ empty: true })
    });
    const exists = await emailRecordExists(mockUsers[2].email);
    expect(exists).toBe(false);
  });
});

describe("fetchUsers", () => {
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
    jest.spyOn(UserCollection, "get").mockResolvedValueOnce({ docs: mockUsers.map(user => ({ id: user.userId, data: () => user })) });

    const result = await fetchUsers();
    expect(result.data.length).toBe(mockUsers.length);
    for (let user = 0; user < mockUsers.length; user++) {
      expect(result.data[user].email).toBe(mockUsers[user].email);
    }
    // expect(result.data[0].email).toBe(mockUsers[0].email);
    // expect(result.data[1].email).toBe(mockUsers[1].email);
  });
});

describe("fetchUserByEmail", () => {
  it("should fetch user by email from the user collection", async () => {
    await UserCollection.doc(mockUsers[0].userId).set(mockUsers[0]);
    jest.spyOn(UserCollection, "where").mockReturnValue({
      limit: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ empty: false, docs: [{ data: () => mockUsers[0] }] }),
      }),
    });

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
});

describe("createUser", () => {
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

  it("should throw an error if Firestore operation fails", async () => {
    jest.spyOn(Users, "NewUser").mockReturnValueOnce(mockUsers[0]);
    jest.spyOn(UserCollection, "doc").mockImplementationOnce(() => {
      throw new Error("Firestore operation failed");
    });

    await expect(createUser(mockUsers[0])).rejects.toThrow("Firestore operation failed");
  });
});

describe("updatePasswordbyUser", () => {
  it("should update user password in the database", async () => {
    const mockUserRef = { update: jest.fn().mockResolvedValue(true) };
    jest.spyOn(UserCollection, "doc").mockReturnValue(mockUserRef);

    const updated = await updatePasswordbyUser({ userRef: mockUserRef }, "newhashedpassword");
    expect(updated).toBe(true);
  });
});

describe("fetchUserFromId", () => {
  it("should fetch user by user ID from the user collection", async () => {
    const mockUserId = mockUsers[0].userId;
    const mockUserSnapshot = {
      empty: false,
      docs: [{ data: () => ({ userId: mockUserId }) }],
    };
    jest.spyOn(UserCollection, "where").mockReturnValueOnce({
      limit: jest.fn().mockReturnValueOnce({
        get: jest.fn().mockResolvedValueOnce(mockUserSnapshot),
      }),
    });

    const user = await fetchUserFromId(mockUserId);
    expect(user).toBeInstanceOf(Users);
    expect(user.userId).toBe(mockUserId);
  });

  it("should return null if user does not exist for the provided user ID", async () => {
    const mockUserSnapshot = { empty: true };
    jest.spyOn(UserCollection, "where").mockReturnValueOnce({
      limit: jest.fn().mockReturnValueOnce({
        get: jest.fn().mockResolvedValueOnce(mockUserSnapshot),
      }),
    });

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
  it("should verify user in the database", async () => {
    const mockUserRef = { update: jest.fn().mockResolvedValueOnce(true) };
    jest.spyOn(UserCollection, "doc").mockReturnValueOnce(mockUserRef);

    const verified = await verifyUser({ userRef: mockUserRef });
    expect(verified).toBe(true);
  });

  it("should return false if verification fails", async () => {
    const mockUserRef = { update: jest.fn().mockResolvedValueOnce(false) };
    jest.spyOn(UserCollection, "doc").mockReturnValueOnce(mockUserRef);

    const verified = await verifyUser({ userRef: mockUserRef });
    expect(verified).toBe(false);
  });
});

describe("updateUser", () => {
  it("should update user profile in the database", async () => {
    const mockUserRef = { update: jest.fn().mockResolvedValueOnce(true) };
    jest.spyOn(UserCollection, "doc").mockReturnValueOnce(mockUserRef);

    const updated = await updateUser(["NewFirstName", "NewLastName"], { userRef: mockUserRef });
    expect(updated).toBe(true);
  });

  it("should return false if update fails", async () => {
    const mockUserRef = { update: jest.fn().mockResolvedValueOnce(false) };
    jest.spyOn(UserCollection, "doc").mockReturnValueOnce(mockUserRef);

    const updated = await updateUser(["NewFirstName", "NewLastName"], { userRef: mockUserRef });
    expect(updated).toBe(false);
  });
});

describe("deleteUserAccount", () => {
  it("should delete user account and related data from the database", async () => {
    const mockTransaction = {
      delete: jest.fn(),
    };
    jest.spyOn(db, "runTransaction").mockImplementationOnce(async (callback) => {
      await callback(mockTransaction);
    });
    await expect(deleteUserAccount(mockUsers[0].userId)).resolves.not.toThrow();

  });

  it("should throw an error if Firestore operation fails", async () => {
    jest.spyOn(db, "runTransaction").mockImplementationOnce(() => {
      throw new Error("Firestore transaction failed");
    });

    await expect(deleteUserAccount(mockUsers[0].userId)).rejects.toThrow("Firestore transaction failed");
  });
});

