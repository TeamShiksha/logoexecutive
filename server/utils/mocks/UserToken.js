const UserToken = require("../../models/UserToken");
const { UserTokenTypes } = require("../constants");
const { mockUsers } = require("./Users");

// 0 - Verify Token
// 1 - Verify Token (expired)
// 2 - Forgot Token
// 3 - Forgot Token (exprired)
const mockUserTokens = [
  UserToken.NewUserToken({
    type: UserTokenTypes.VERIFY,
    userId: mockUsers[0].userId,
  }),
  UserToken.NewUserToken({
    type: UserTokenTypes.VERIFY,
    userId: mockUsers[0].userId,
    expireAt: Date.now(), 
  }),
  UserToken.NewUserToken({
    type: UserTokenTypes.FORGOT,
    userId: mockUsers[0].userId,
  }),
  UserToken.NewUserToken({
    type: UserTokenTypes.FORGOT,
    userId: mockUsers[0].userId,
    expireAt: Date.now(), 
  })
];

module.exports = { mockUserTokens };
