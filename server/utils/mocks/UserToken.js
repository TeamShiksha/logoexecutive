const { UserTokenTypes } = require("../constants");

/** 
 * 0 - Verify Token
 * 1 - Verify Token (expired)
 * 2 - Forgot Token
 * 3 - Forgot Token (expired)
 **/
const mockUserTokens = [
  {
    user: "66347e81d8839ba6813e21fa",
    token: "bc65754f9175483ab9a186eee3161ae7",
    type: UserTokenTypes.VERIFY,
    createdAt: new Date(),
    expireAt: new Date(Date.now() + (24 * 3600)),
  },
  {
    user: "66347e81d8839ba6813e21fa",
    token: "08ebea71113b4deda583d563dc640347",
    userTokenId: "8b8c15c8-5c9f-4f50-b287-d01e171ef8c6",
    type: UserTokenTypes.VERIFY,
    createdAt: new Date(),
    expireAt: new Date(Date.now() - 1),
  },
  {
    user: "66347e81d8839ba6813e21fa",
    token: "19d096ae0c5b4ce2b4efd2858c8bcdfd",
    userTokenId: "b38d15dc-1ef6-4f55-bae5-deb789d781b0",
    type: UserTokenTypes.VERIFY,
    createdAt: new Date(),
    expireAt: new Date(Date.now() + (24 * 3600)),
  },
  {
    user: "66347e81d8839ba6813e21fa",
    token: "cf8aaabcead347baa35be08e8dd9963e",
    userTokenId: "d8d00b27-c9b2-4a0e-8684-56dc6b1211f6",
    type: UserTokenTypes.VERIFY,
    createdAt: new Date(),
    expireAt: new Date(Date.now() - 1),
  }
];

module.exports = { mockUserTokens };
