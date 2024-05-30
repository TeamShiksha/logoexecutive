const {
  createForgotToken,
  deleteUserToken,
  createVerifyToken,
  fetchTokenFromId,
  fetchTokenFromUserid,
} = require("../../../services");
const { UserToken } = require("../../../models");
const { UserTokenCollection } = require("../../../utils/firestore");
const { mockUserTokens } = require("../../../utils/mocks/UserToken");


describe("createForgotToken", () => {
  afterEach(() => {
    jest.restoreAllMocks(); 
  });

  test("should return a new instance of UserToken if the operation is successful.", async () => {
    const newUserForgotToken = await createForgotToken(
      mockUserTokens[2].userId
    );
    
    expect(newUserForgotToken).toBeInstanceOf(UserToken);
  });
  test("should return null if the Firestore operation fails or failure to create the token.", async () => {
    jest.spyOn(UserTokenCollection, "doc").mockReturnValue({
      set: jest.fn().mockResolvedValue(null),
    });
    const result = await createForgotToken("invalid-userid");

    expect(result).toBeNull();
  });
  test("should throw an error if there's any issue during the process of creating or saving the forgot token", async () => {
    jest.spyOn(UserTokenCollection, "doc").mockImplementationOnce(() => {
      throw new Error("Firestore operation failed");
    });
    await expect(createForgotToken("errorUserId")).rejects.toThrow(
      "Firestore operation failed"
    );
  });
});

describe("deleteUserToken function", () => {
  afterEach(() => {
    jest.restoreAllMocks(); 
  });

  test("should return true to indicate that the deletion operation was successful", async () => {
    const userToken = { userTokenRef: { delete: jest.fn() } };
    userToken.userTokenRef.delete.mockResolvedValueOnce(true);
    const result = await deleteUserToken(userToken);

    expect(result).toBe(true);
  });
  test("should return false to indicate the failure of the deletion operation", async () => {
    const deleteMock = jest.fn();
    deleteMock.mockResolvedValueOnce(false);
    const userToken = { userTokenRef: { delete: deleteMock } };
    const result = await deleteUserToken(userToken);

    expect(result).toBe(false);
  });
});

describe("createVerifyToken", () => {
  afterEach(() => {
    jest.restoreAllMocks(); 
  });

  test("should return an instance of UserToken representing the created token.", async () => {
    const newUserVerifyToken = await createVerifyToken(mockUserTokens[1].userId);

    expect(newUserVerifyToken).toBeInstanceOf(UserToken);
  });
  test("should return null if the function fails to create and save the verification token", async () => {
    jest.spyOn(UserTokenCollection, "doc").mockReturnValue({
      set: jest.fn().mockResolvedValue(null),
    });
    const result = await createVerifyToken("invalid-userid");

    expect(result).toBeNull();
  });
  test("should throw an error if Firestore operation fails", async () => {
    jest.spyOn(UserTokenCollection, "doc").mockImplementationOnce(() => {
      throw new Error("Firestore operation failed");
    });
    await expect(createVerifyToken("errorUserId")).rejects.toThrow(
      "Firestore operation failed"
    );
  });
});
describe("fetchTokenFromId", () => {
  afterEach(() => {
    jest.restoreAllMocks(); 
  });
  test("should returns an instance of UserToken representing the fetched token.", async () => {
    const token = await createForgotToken(
      mockUserTokens[2].userId
    );
    const userTokenDoc = await fetchTokenFromId(token.token);

    expect(userTokenDoc).toBeInstanceOf(UserToken);
  });
  test("should return null to indicate that no token was found.", async () => {
    const result = await fetchTokenFromId("invalid-token");

    expect(result).toBeNull();
  });
  test("should throw an error if Firestore operation fails", async () => {
    jest.spyOn(UserTokenCollection, "where").mockImplementationOnce(() => {
      throw new Error("Firestore operation failed");
    });

    await expect(fetchTokenFromId("errorUserId")).rejects.toThrow(
      "Firestore operation failed"
    );
  });
});

describe("fetchTokenFromUserid", () => {
  afterEach(() => {
    jest.restoreAllMocks(); 
  });

  test("it fetches and returns a user token document from Firestore for the provided userId", async () => {
    const mockToken = await UserToken.NewUserToken(mockUserTokens[0]);
    await UserTokenCollection.doc(mockToken.userId).set(mockToken);
    const user = await fetchTokenFromUserid(mockToken.userId);

    expect(user).toMatchObject(mockToken);
  });
  test("should throw an error if Firestore operation fails", async () => {
    jest.spyOn(UserTokenCollection, "where").mockImplementationOnce(() => {
      throw new Error("Firestore operation failed");
    });
    await expect(fetchTokenFromUserid("invalid-token")).rejects.toThrow(
      "Firestore operation failed"
    );
  });
});
