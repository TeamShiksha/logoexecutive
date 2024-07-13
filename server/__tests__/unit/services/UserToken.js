const mongoose = require("mongoose");
const {
  createForgotToken,
  deleteUserToken,
  createVerifyToken,
  fetchTokenFromId,
  fetchTokenFromUserid,
} = require("../../../services");
const { UserToken } = require("../../../models");
const { mockUserTokens } = require("../../../utils/mocks/UserToken");
require("dotenv").config();

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("createForgotToken", () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await UserToken.deleteMany({});
  });

  test("should return a new instance of UserToken if the operation is successful", async () => {
    const newUserForgotToken = await createForgotToken(mockUserTokens[2].userId);
    expect(newUserForgotToken).toBeInstanceOf(UserToken);
  });

  test("should return null if the operation fails to create the token", async () => {
    jest.spyOn(UserToken.prototype, "save").mockImplementationOnce(() => null);
    const result = await createForgotToken("invalid-userid");
    expect(result).toBeNull();
  });

  test("should throw an error if there's any issue during the process of creating or saving the forgot token", async () => {
    jest.spyOn(UserToken.prototype, "save").mockImplementationOnce(() => {
      throw new Error("MongoDB operation failed");
    });
    await expect(createForgotToken("errorUserId")).rejects.toThrow("MongoDB operation failed");
  });
});

describe("deleteUserToken", () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await UserToken.deleteMany({});
  });

  test("should return true to indicate that the deletion operation was successful", async () => {
    const userToken = new UserToken(mockUserTokens[0]);
    await userToken.save();
    const result = await deleteUserToken(userToken);
    expect(result).toBe(true);
  });

  test("should return false to indicate the failure of the deletion operation", async () => {
    jest.spyOn(UserToken, "findByIdAndDelete").mockResolvedValueOnce(null);
    const userToken = new UserToken(mockUserTokens[0]);
    await userToken.save();
    const result = await deleteUserToken(userToken);
    expect(result).toBe(false);
  });
});

describe("createVerifyToken", () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await UserToken.deleteMany({});
  });

  test("should return an instance of UserToken representing the created token", async () => {
    const newUserVerifyToken = await createVerifyToken(mockUserTokens[1].userId);
    expect(newUserVerifyToken).toBeInstanceOf(UserToken);
  });

  test("should return null if the function fails to create and save the verification token", async () => {
    jest.spyOn(UserToken.prototype, "save").mockImplementationOnce(() => null);
    const result = await createVerifyToken("invalid-userid");
    expect(result).toBeNull();
  });

  test("should throw an error if MongoDB operation fails", async () => {
    jest.spyOn(UserToken.prototype, "save").mockImplementationOnce(() => {
      throw new Error("MongoDB operation failed");
    });
    await expect(createVerifyToken("errorUserId")).rejects.toThrow("MongoDB operation failed");
  });
});

describe("fetchTokenFromId", () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await UserToken.deleteMany({});
  });

  test("should return an instance of UserToken representing the fetched token", async () => {
    const token = await createForgotToken(mockUserTokens[2].userId);
    const userTokenDoc = await fetchTokenFromId(token.token);
    expect(userTokenDoc).toBeInstanceOf(UserToken);
  });

  test("should return null to indicate that no token was found", async () => {
    const result = await fetchTokenFromId("invalid-token");
    expect(result).toBeNull();
  });

  test("should throw an error if MongoDB operation fails", async () => {
    jest.spyOn(UserToken, "findOne").mockImplementationOnce(() => {
      throw new Error("MongoDB operation failed");
    });
    await expect(fetchTokenFromId("errorUserId")).rejects.toThrow("MongoDB operation failed");
  });
});

describe("fetchTokenFromUserid", () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await UserToken.deleteMany({});
  });

  test("should fetch and return a user token document from MongoDB for the provided userId", async () => {
    const mockToken = new UserToken(mockUserTokens[0]);
    await mockToken.save();
    const user = await fetchTokenFromUserid(mockToken.userId);
    expect(user).toMatchObject(mockToken.toObject());
  });

  test("should throw an error if MongoDB operation fails", async () => {
    jest.spyOn(UserToken, "findOne").mockImplementationOnce(() => {
      throw new Error("MongoDB operation failed");
    });
    await expect(fetchTokenFromUserid("invalid-userid")).rejects.toThrow("MongoDB operation failed");
  });
});
