const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const {
  emailRecordExists,
  fetchUsers,
  fetchUserByEmail,
  createUser,
  updatePasswordbyUser,
  fetchUserFromId,
  verifyUser,
  updateUser,
  deleteUserAccount,
} = require("../../../services");
const { Users } = require("../../../models");
const { mockUsers } = require("../../../utils/mocks/Users");
const { UserType } = require("../../../utils/constants");
require("dotenv").config();

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});


describe("emailRecordExists", () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await Users.deleteMany({});
  });

  test("should return true if email exists in user collection", async () => {
    await Users.create(mockUsers[0]);
    const exists = await emailRecordExists(mockUsers[0].email);
    expect(exists).toBe(true);
  });

  test("should return false if email does not exist in user collection", async () => {
    await Users.create(mockUsers[0]);
    const exists = await emailRecordExists("nonexistinguser@gmail.com");
    expect(exists).toBe(false);
  });

  test("should return false if the query result is empty", async () => {
    const exists = await emailRecordExists(mockUsers[2].email);
    expect(exists).toBe(false);
  });

  test("should throw an error if MongoDB operation fails", async () => {
    const errorMessage = "MongoDB operation failed";
    jest.spyOn(Users, "findOne").mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    await expect(emailRecordExists(mockUsers[0].email)).rejects.toThrow(errorMessage);
  });
});


describe("fetchUsers", () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await Users.deleteMany({});
  });

  test("should fetch all users from the user collection", async () => {
    await Users.insertMany(mockUsers);
    const result = await fetchUsers();

    expect(result.data.length).toBe(mockUsers.length);
    expect(result.data[0]).toBeInstanceOf(Users);
  });

  test("should handle empty user collection", async () => {
    const result = await fetchUsers();

    expect(result.data.length).toBe(0);
  });

  test("should fetch users from non-empty user collection", async () => {
    await Users.insertMany(mockUsers);
    const result = await fetchUsers();

    expect(result.data.length).toBe(mockUsers.length);
    for (let user = 0; user < mockUsers.length; user++) {
      expect(result.data[user].email).toBe(mockUsers[user].email);
    }
  });

  test("should throw an error if an error occurs while fetching users", async () => {
    const errorMessage = "MongoDB operation failed";
    jest.spyOn(Users, "find").mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    await expect(fetchUsers()).rejects.toThrow(errorMessage);
  });
});

describe("fetchUserByEmail", () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await Users.deleteMany({});
  });

  test("should fetch user by email from the user collection", async () => {
    const user = await Users.create(mockUsers[0]);
    const fetched_user = await fetchUserByEmail(mockUsers[0].email);
    // console.log(`fc ==> ${fetched_user._id}, ac==> ${user._id}`);
    expect(fetched_user).toBeInstanceOf(Users);
    expect(fetched_user._id).toStrictEqual(user._id);
  });

  test("should return null if user does not exist for the provided email", async () => {
    const user = await fetchUserByEmail(mockUsers[1].email);
    expect(user).toBeNull();
  });

  test("should throw an error if an error occurs while fetching user by email", async () => {
    const errorMessage = "MongoDB operation failed";
    jest.spyOn(Users, "findOne").mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    await expect(fetchUserByEmail(mockUsers[0].email)).rejects.toThrow(errorMessage);
  });
});

describe("createUser", () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await Users.deleteMany({});
  });

  test("should create a user in the database and return the created user object", async () => {
    const createdUser = await createUser(mockUsers[0]);

    expect(createdUser).toBeInstanceOf(Users);
    expect(createdUser.email).toBe(mockUsers[0].email);
  });

  // test("should return null if data is improper", async () => {
  //   jest.spyOn(Users.prototype, "save").mockImplementationOnce(() => null);
  //   const createdUser = await createUser({});

  //   expect(createdUser).toBeNull();
  // });

  it("should return null if data is improper", async () => {
    const mockUser = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      // password: bcrypt.hashSync("password123", 10),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userType: UserType.CUSTOMER,
      isVerified: false,
    }
    // jest.spyOn(Users, "NewUser").mockReturnValueOnce(mockUser);
    // jest.spyOn(UserCollection, "doc").mockReturnValueOnce({
    //   set: jest.fn().mockResolvedValueOnce(null),
    // });
    // delete mockUser.email;

    const createdUser = await createUser(mockUser);

    expect(createdUser).toBeNull();
  });

  test("should throw an error if MongoDB operation fails", async () => {
    jest.spyOn(Users.prototype, "save").mockImplementationOnce(() => {
      throw new Error("MongoDB operation failed");
    });

    await expect(createUser(mockUsers[0])).rejects.toThrow("MongoDB operation failed");
  });
});

// describe("Users service", () => {
//   test("should throw an error if bcrypt.hash throws an error", async () => {
//     const mockUser = {
//       email: "test@example.com",
//       firstName: "Test",
//       lastName: "Users",
//       password: "password123",
//     };
//     jest.spyOn(bcrypt, "hash").mockImplementationOnce(() => {
//       throw new Error("Hashing failed");
//     });

//     await expect(Users.NewUser(mockUser)).rejects.toThrow("Hashing failed");
//   });
// });

describe("updatePasswordbyUser", () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await Users.deleteMany({});
  });

  test("should update user password in the database", async () => {
    const mockUser = new Users(mockUsers[0]);
    await mockUser.save();
    const updated = await updatePasswordbyUser(mockUser, "newhashedpassword");

    expect(updated).toBe(true);
  });

  test("should throw an error if an error occurs while updating user password", async () => {
    const errorMessage = "MongoDB operation failed";
    const mockUser = new Users(mockUsers[0]);
    // await mockUser.save();
    jest.spyOn(Users.prototype, "save").mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    await expect(updatePasswordbyUser(mockUser, "newhashedpassword")).rejects.toThrow(errorMessage);
  });
});

describe("fetchUserFromId", () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await Users.deleteMany({});
  });

  test("should fetch user by user ID from the user collection", async () => {
    const mockUser = new Users(mockUsers[0]);
    await mockUser.save();
    const user = await fetchUserFromId(mockUser._id);

    expect(user).toBeInstanceOf(Users);
    expect(user._id).toStrictEqual(mockUser._id);
  });

  test("should return null if user does not exist for the provided user ID", async () => {
    const user = await fetchUserFromId(new mongoose.Types.ObjectId());
    expect(user).toBeNull();
  });

  test("should throw an error if MongoDB operation fails", async () => {
    const errorMessage = "MongoDB operation failed";
    jest.spyOn(Users, "findById").mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });
    await expect(fetchUserFromId("errorUserId")).rejects.toThrow(errorMessage);
  });
});


describe("verifyUser", () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await Users.deleteMany({});
  });

  test("should verify user in the database", async () => {
    const mockUser = new Users(mockUsers[0]);
    const user = await mockUser.save();
    const verified = await verifyUser(user);
    expect(verified).toBe(true);
  });

  test("should throw an error if MongoDB operation fails", async () => {
    const errorMessage = "MongoDB operation failed";
    const mockUser = new Users(mockUsers[0]);
    // const user = await mockUser.save();
    jest.spyOn(Users.prototype, "save").mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    await expect(verifyUser(mockUser)).rejects.toThrow(errorMessage);
  });
});


describe("updateUser", () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await Users.deleteMany({});
  });

  test("should update user details in the database", async () => {
    const mockUser = new Users(mockUsers[0]);
    await mockUser.save();
    
    const updatedUserData = {
      firstName: "UpdatedFirstName",
      lastName: "UpdatedLastName",
    };

    const updatedUser = await updateUser(updatedUserData,mockUser);

    expect(updatedUser).toBeTruthy();
  });

  // test("should return null if user does not exist for the provided user ID", async () => {
  //   const updatedUserData = {
  //     firstName: "UpdatedFirstName",
  //     lastName: "UpdatedLastName",
  //   };

  //   const updatedUser = await updateUser(mongoose.Types.ObjectId(), updatedUserData);

  //   expect(updatedUser).toBeNull();
  // });

  test("should throw an error if MongoDB operation fails", async () => {
    const errorMessage = "MongoDB operation failed";
    jest.spyOn(Users.prototype, "save").mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });
    const updatedUserData = {
      firstName: "UpdatedFirstName",
      lastName: "UpdatedLastName",
    };
    await expect(updateUser(updatedUserData,new Users(mockUsers[0]))).rejects.toThrow(errorMessage);
  });
});


// describe("deleteUserAccount", () => {
//   afterEach(async () => {
//     jest.restoreAllMocks();
//     await Users.deleteMany({});
//   });

//   test("should delete user account from the database", async () => {
//     const mockUser = new Users(mockUsers[0]);
//     await mockUser.save();

//     const deletedUser = await deleteUserAccount(mockUser._id);

//     expect(deletedUser).toBeTruthy();

//     const userExists = await Users.findById(mockUser._id);
//     expect(userExists).toBeNull();
//   });

//   test("should return null if user does not exist for the provided user ID", async () => {
//     const deletedUser = await deleteUserAccount(mongoose.Types.ObjectId());

//     expect(deletedUser).toBeNull();
//   });

//   test("should throw an error if MongoDB operation fails", async () => {
//     const errorMessage = "MongoDB operation failed";
//     jest.spyOn(Users, "findByIdAndDelete").mockImplementationOnce(() => {
//       throw new Error(errorMessage);
//     });

//     await expect(deleteUserAccount(mockUsers[0]._id)).rejects.toThrow(errorMessage);
//   });
// });
