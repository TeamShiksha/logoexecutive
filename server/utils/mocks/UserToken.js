const { Timestamp } = require("firebase-admin/firestore");
const { UserTokenTypes } = require("../constants");

/** 
 * 0 - Verify Token
 * 1 - Verify Token (expired)
 * 2 - Forgot Token
 * 3 - Forgot Token (expired)
 **/
const mockUserTokens = [
  {
    userId: "0c1266ab-8ad2-4ab9-b56c-e1db6982f120",
    token: "bc65754f9175483ab9a186eee3161ae7",
    userTokenId: "28a49959-ca73-4dc3-a071-0e1d4b07cb89",
    type: UserTokenTypes.VERIFY,
    createdAt: Timestamp.fromDate(new Date()),
    expireAt: Timestamp.fromDate(new Date(Date.now() + (24 * 3600))),
  },
  {
    userId: "9a712ddd-7686-4b3a-9f03-1273ab115e87",
    token: "08ebea71113b4deda583d563dc640347",
    userTokenId: "8b8c15c8-5c9f-4f50-b287-d01e171ef8c6",
    type: UserTokenTypes.VERIFY,
    createdAt: Timestamp.fromDate(new Date()),
    expireAt: Timestamp.fromDate(new Date(Date.now() - 1)),
  },
  {
    userId: "f360d717-7482-4442-9a34-b457ba9cb6f9",
    token: "19d096ae0c5b4ce2b4efd2858c8bcdfd",
    userTokenId: "b38d15dc-1ef6-4f55-bae5-deb789d781b0",
    type: UserTokenTypes.VERIFY,
    createdAt: Timestamp.fromDate(new Date()),
    expireAt: Timestamp.fromDate(new Date(Date.now() + (24 * 3600))),
  },
  {
    userId: "c1cf1b43-2048-4fbf-89c0-63fdcf27fa52",
    token: "cf8aaabcead347baa35be08e8dd9963e",
    userTokenId: "d8d00b27-c9b2-4a0e-8684-56dc6b1211f6",
    type: UserTokenTypes.VERIFY,
    createdAt: Timestamp.fromDate(new Date()),
    expireAt: Timestamp.fromDate(new Date(Date.now() - 1)),
  }
];

module.exports = { mockUserTokens };
